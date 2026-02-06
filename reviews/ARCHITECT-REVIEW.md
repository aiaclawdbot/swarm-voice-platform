# Chief Architect Review — SWARM Voice Platform

**Reviewer:** Chief Architect  
**PRD Version:** 2.0  
**Review Date:** 2026-02-06  
**Verdict:** ✅ APPROVED with Required Changes

---

## Executive Summary

The PRD demonstrates solid product thinking and a reasonable technology stack for an MVP. However, several architectural decisions will create pain at scale. This review identifies **4 critical issues**, **6 moderate concerns**, and provides concrete fixes for each.

**Bottom Line:** Ship the MVP as designed, but plan a "scale sprint" at 500 orgs to address the critical issues before they bite.

---

## 1. Stack Choices

### Verdict: ✅ GOOD — With Caveats

| Component | Rating | Assessment |
|-----------|--------|------------|
| Next.js 16 | ✅ | Excellent choice. SSR + API routes keep it simple. |
| Supabase | ✅ | Right choice for speed. Auth + RLS + pgvector in one. |
| Vapi | ⚠️ | Good DX, but single-vendor risk. Pricing can change. |
| Twilio | ✅ | Industry standard. No issues. |
| Vercel | ⚠️ | Great for now, but serverless has sharp edges. |

### Stack Risks & Mitigations

#### 1.1 Vapi Vendor Lock-in (MODERATE RISK)
**Problem:** All voice logic lives in Vapi. If they raise prices, have outages, or pivot, you're stuck.

**Mitigation (Post-MVP):**
```
Design an abstraction layer:
  VoiceProvider interface {
    createAssistant()
    updateAssistant()
    handleWebhook()
    getCallDetails()
  }
  
Implementations: VapiProvider, RetellProvider
```

This lets you swap providers in hours, not weeks. Build this at 500 orgs.

#### 1.2 Vercel Serverless Limits (MODERATE RISK)
**Problem:** 
- Function timeout: 60s (Pro), 300s (Enterprise)
- Cold starts on edge functions
- No WebSocket support in API routes

**Impact:** Long workflow executions could timeout. Webhook retries could overwhelm cold-starting functions.

**Mitigation:**
1. **Immediate:** Use `maxDuration` in API route config
2. **Post-MVP:** Move workflow execution to a proper queue (Inngest, Trigger.dev, or BullMQ on Railway)

```typescript
// Good for MVP
export const maxDuration = 60; // Vercel Pro

// Better (post-MVP): Offload to queue
await inngest.send({ name: "workflow/execute", data: { workflowId, event } });
```

#### 1.3 Next.js API Routes as Backend (ACCEPTABLE RISK)
**Concern:** Some would argue for a separate backend service.

**My Take:** For this stage, co-located API routes are **correct**. Splitting backend early adds deploy complexity, CORS headaches, and slows iteration. Revisit at 50K MRR if API latency becomes an issue.

---

## 2. Scalability Analysis

### Current Design Limits

| Orgs | Status | Bottleneck |
|------|--------|------------|
| 100 | ✅ Works | None expected |
| 1,000 | ⚠️ Stress | DB connections, webhook throughput |
| 10,000 | 🔴 Breaks | Everything below + cost explosion |

### 2.1 Database Connection Pooling (CRITICAL at 1K orgs)

**Problem:** Supabase free/Pro has connection limits. Vercel serverless spawns new connections per function invocation.

| Supabase Tier | Direct Connections | Pooler Connections |
|---------------|-------------------|-------------------|
| Free | 60 | 200 |
| Pro | 60 | 200 |
| Enterprise | Custom | Custom |

At 1,000 orgs with 10% concurrent activity = 100 concurrent requests. Each serverless function = 1+ connections. You WILL hit limits.

**Fix (Implement Now):**
```typescript
// Use Supabase connection pooler (Transaction mode)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: 'public',
    },
    // Use pooler URL, not direct
  }
);

// In .env
DATABASE_URL="postgresql://postgres.xyz:password@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Also:** Add connection timeout and retry logic:
```typescript
const { data, error } = await supabase
  .from('calls')
  .select('*')
  .timeout(5000)
  .abortSignal(AbortSignal.timeout(5000));
```

### 2.2 Webhook Throughput (CRITICAL at 1K orgs)

**Problem:** At 1,000 orgs, assuming 50 calls/org/day = 50,000 webhooks/day = ~35/minute sustained, with spikes to 200+/minute during business hours.

Vercel serverless can handle this, BUT:
- Cold starts add 100-500ms latency
- Vapi expects fast acknowledgment (< 5s)
- Database writes could queue up

**Fix:**
1. **Immediate:** Return 200 immediately, process async
```typescript
export async function POST(req: Request) {
  const payload = await req.json();
  
  // Acknowledge immediately
  // Process in background (edge function or queue)
  waitUntil(processWebhook(payload));
  
  return Response.json({ received: true });
}
```

2. **Post-MVP:** Use a proper queue (Inngest recommended for this use case)
```typescript
// Webhook handler
await inngest.send({ name: "vapi/call.ended", data: payload });
return Response.json({ received: true });

// Inngest function (runs separately, with retries)
inngest.createFunction(
  { id: "process-call-webhook" },
  { event: "vapi/call.ended" },
  async ({ event }) => {
    await createContact(event.data);
    await logCall(event.data);
    await triggerWorkflows(event.data);
  }
);
```

### 2.3 pgvector at Scale (MODERATE at 10K orgs)

**Problem:** At 10K orgs with average 50 knowledge chunks each = 500K vectors. pgvector can handle this, but query time degrades without proper indexing.

**Fix (Implement Now):**
```sql
-- Add HNSW index for fast approximate nearest neighbor
CREATE INDEX knowledge_chunks_embedding_idx 
ON knowledge_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Partition by org for faster queries
-- (Consider at 100K+ chunks)
```

**Query Pattern:**
```sql
-- Always filter by org_id FIRST, then vector search
SELECT * FROM knowledge_chunks
WHERE org_id = $1
ORDER BY embedding <=> $2
LIMIT 4;
```

### 2.4 Multi-Tenancy Architecture

**Current:** Single database, RLS-based isolation.

**Assessment:** ✅ Correct for this stage. Do NOT prematurely shard.

**When to Reconsider:**
- Single org consumes >20% of resources
- Compliance requires physical isolation (enterprise healthcare)
- >50K orgs (unlikely in 2 years)

---

## 3. Security Assessment

### 3.1 Row-Level Security (RLS)

**Status:** ⚠️ POLICIES NOT DEFINED IN PRD

This is a **critical gap**. The schema shows tables but no RLS policies.

**Required RLS Policies (Implement Immediately):**

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own org
CREATE POLICY "Users see own org" ON users
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

-- Contacts isolated by org
CREATE POLICY "Contacts by org" ON contacts
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

-- Calls isolated by org
CREATE POLICY "Calls by org" ON calls
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

-- etc. for all org_id tables
```

**Service Role Bypass:**
Webhooks use service role (bypasses RLS). This is correct, but ensure:
```typescript
// ALWAYS include org_id in webhook writes
await supabase.from('calls').insert({
  org_id: payload.metadata.org_id, // REQUIRED
  // ... other fields
});
```

### 3.2 PII Handling

**Current State:** "Phone/email encrypted, minimal retention"

**Gaps:**
1. No encryption implementation shown
2. No data retention policy enforcement
3. No PII access logging

**Recommended Implementation:**

```sql
-- Encrypted PII columns using pgcrypto
ALTER TABLE contacts 
ADD COLUMN phone_encrypted BYTEA,
ADD COLUMN email_encrypted BYTEA;

-- Encryption function
CREATE OR REPLACE FUNCTION encrypt_pii(plaintext TEXT)
RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(plaintext, current_setting('app.pii_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decryption (use sparingly, log access)
CREATE OR REPLACE FUNCTION decrypt_pii(ciphertext BYTEA)
RETURNS TEXT AS $$
BEGIN
  -- TODO: Log access to audit table
  RETURN pgp_sym_decrypt(ciphertext, current_setting('app.pii_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**For MVP:** At minimum, add:
1. Audit log table for PII access
2. Automatic purge job for old call recordings (90 days)
3. Data export endpoint for GDPR compliance

### 3.3 Authentication Gaps

**Issue:** No mention of:
- API key management for external integrations
- Rate limiting per org
- Webhook signature verification

**Fixes:**

```typescript
// Vapi webhook signature verification
export async function POST(req: Request) {
  const signature = req.headers.get('x-vapi-signature');
  const body = await req.text();
  
  if (!verifyVapiSignature(body, signature, process.env.VAPI_WEBHOOK_SECRET)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // Process...
}

// Rate limiting (using Vercel KV or Upstash)
const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min per org
});

const { success } = await ratelimit.limit(orgId);
if (!success) {
  return Response.json({ error: 'Rate limited' }, { status: 429 });
}
```

### 3.4 HIPAA Readiness

**Current:** "Retell fallback for HIPAA"

**Assessment:** Not sufficient. HIPAA requires:
- BAA with ALL vendors touching PHI (Supabase ✅, Vapi ❌, Vercel ✅)
- Audit logging of all PHI access
- Encryption at rest AND in transit (partial ✅)
- Access controls (RLS helps, but need role-based)

**Recommendation:** 
- Don't market HIPAA compliance until Phase 4
- When ready, use Retell (has BAA) + Supabase Enterprise + proper audit logging
- Budget $5-10K for compliance review

---

## 4. Integration Patterns

### 4.1 Vapi Webhook Design

**Current:** Single `/api/webhooks/vapi` endpoint.

**Concerns:**
1. No idempotency handling (webhook retries could create duplicate contacts)
2. No dead letter queue for failed processing
3. Processing and acknowledgment coupled

**Improved Pattern:**

```typescript
// /api/webhooks/vapi/route.ts

const PROCESSED_KEY_TTL = 86400; // 24h

export async function POST(req: Request) {
  const payload = await req.json();
  const idempotencyKey = `vapi:${payload.call.id}:${payload.type}`;
  
  // Check if already processed (idempotency)
  const alreadyProcessed = await kv.get(idempotencyKey);
  if (alreadyProcessed) {
    return Response.json({ status: 'already_processed' });
  }
  
  // Mark as processing
  await kv.set(idempotencyKey, 'processing', { ex: PROCESSED_KEY_TTL });
  
  try {
    // Acknowledge immediately, process async
    const processPromise = processVapiWebhook(payload);
    
    // Use Vercel's waitUntil for background processing
    waitUntil(processPromise.then(() => 
      kv.set(idempotencyKey, 'completed', { ex: PROCESSED_KEY_TTL })
    ));
    
    return Response.json({ received: true });
  } catch (error) {
    // Log to dead letter queue for manual review
    await supabase.from('webhook_failures').insert({
      source: 'vapi',
      payload,
      error: error.message,
    });
    
    // Still return 200 to prevent infinite retries
    return Response.json({ received: true, error: 'processing_failed' });
  }
}
```

### 4.2 Twilio SMS Webhooks

**Missing from PRD:** How do you handle:
- Delivery status callbacks?
- Inbound SMS replies?
- Opt-out (STOP) handling?

**Required:**
```typescript
// /api/webhooks/twilio/status/route.ts
export async function POST(req: Request) {
  const formData = await req.formData();
  const messageSid = formData.get('MessageSid');
  const status = formData.get('MessageStatus'); // sent, delivered, failed, undelivered
  
  await supabase.from('sms_messages')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('twilio_sid', messageSid);
  
  return new Response('OK');
}

// Handle STOP/opt-out (REQUIRED by law)
// /api/webhooks/twilio/incoming/route.ts
export async function POST(req: Request) {
  const formData = await req.formData();
  const body = formData.get('Body')?.toString().trim().toUpperCase();
  const from = formData.get('From');
  
  if (['STOP', 'UNSUBSCRIBE', 'CANCEL'].includes(body)) {
    await supabase.from('contacts')
      .update({ sms_opt_out: true })
      .eq('phone', from);
  }
  
  return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    headers: { 'Content-Type': 'text/xml' }
  });
}
```

### 4.3 Calendar Integration Pattern

**Current:** OAuth with Google, Calendly, Cal.com.

**Concern:** OAuth token refresh handling not specified. Tokens expire!

**Pattern:**
```typescript
// Store tokens securely
CREATE TABLE calendar_connections (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id),
  provider TEXT NOT NULL, -- 'google', 'calendly', 'calcom'
  access_token_encrypted BYTEA NOT NULL,
  refresh_token_encrypted BYTEA,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

// Token refresh middleware
async function getValidToken(connection: CalendarConnection) {
  if (connection.expires_at > new Date(Date.now() + 300000)) {
    return decrypt(connection.access_token_encrypted);
  }
  
  // Refresh token
  const newTokens = await refreshOAuthToken(connection);
  await saveTokens(connection.id, newTokens);
  return newTokens.access_token;
}
```

---

## 5. Database Schema Review

### 5.1 Missing Indexes (CRITICAL for Performance)

```sql
-- These are REQUIRED before launch

-- Foreign key indexes (Postgres doesn't auto-create these!)
CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_agents_org_id ON agents(org_id);
CREATE INDEX idx_contacts_org_id ON contacts(org_id);
CREATE INDEX idx_calls_org_id ON calls(org_id);
CREATE INDEX idx_calls_agent_id ON calls(agent_id);
CREATE INDEX idx_calls_contact_id ON calls(contact_id);
CREATE INDEX idx_knowledge_chunks_org_id ON knowledge_chunks(org_id);
CREATE INDEX idx_knowledge_chunks_agent_id ON knowledge_chunks(agent_id);
CREATE INDEX idx_workflows_org_id ON workflows(org_id);
CREATE INDEX idx_workflow_actions_workflow_id ON workflow_actions(workflow_id);

-- Query pattern indexes
CREATE INDEX idx_calls_started_at ON calls(org_id, started_at DESC);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_status ON contacts(org_id, status);
CREATE INDEX idx_contacts_updated_at ON contacts(org_id, updated_at DESC);

-- Full-text search on contacts (for search feature)
CREATE INDEX idx_contacts_fts ON contacts 
USING gin(to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(phone, '')));

-- Partial index for active workflows only
CREATE INDEX idx_workflows_active ON workflows(org_id) WHERE status = 'active';
```

### 5.2 Schema Normalization Issues

**Issue 1: `tags TEXT[]` on contacts**

Array columns are convenient but problematic:
- Can't enforce referential integrity
- Can't query efficiently across orgs
- No tag metadata (color, description)

**Fix:**
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#gray',
  UNIQUE(org_id, name)
);

CREATE TABLE contact_tags (
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, tag_id)
);
```

**Verdict:** Keep `TEXT[]` for MVP (simpler), but plan migration at 1000 orgs.

**Issue 2: `settings JSONB` on organizations and agents**

JSONB is flexible but:
- No schema validation
- Easy to bloat
- Hard to query across

**Recommendation:** Document the expected shape:
```typescript
// types/settings.ts
interface OrgSettings {
  timezone: string;
  businessHours: { day: number; open: string; close: string }[];
  defaultVoice: string;
  emergencyEmail?: string;
  emergencyPhone?: string;
}

interface AgentSettings {
  maxCallDuration: number;
  transferNumber?: string;
  afterHoursMessage?: string;
  bookingEnabled: boolean;
  calendarId?: string;
}
```

Add a JSON schema validation trigger if settings get complex.

### 5.3 Missing Tables

**1. SMS Messages (for delivery tracking)**
```sql
CREATE TABLE sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) NOT NULL,
  workflow_execution_id UUID REFERENCES workflow_executions(id),
  contact_id UUID REFERENCES contacts(id),
  twilio_sid TEXT,
  to_number TEXT NOT NULL,
  from_number TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'queued',
  error_code TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**2. Audit Log (for compliance)**
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL, -- 'contact.viewed', 'call.exported', etc.
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_log_org_created ON audit_log(org_id, created_at DESC);
```

**3. Usage Tracking (for billing)**
```sql
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  call_minutes INTEGER DEFAULT 0,
  sms_count INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, period_start)
);
```

---

## 6. Cost Model Analysis

### 6.1 Per-Customer Unit Economics

**Assumptions:**
- Average customer: 500 minutes/month (Starter plan)
- 60% of calls result in SMS follow-up
- Average call: 3 minutes
- ~167 calls/month per customer

| Cost Component | Per Unit | Monthly Usage | Monthly Cost |
|----------------|----------|---------------|--------------|
| Vapi | $0.05/min | 500 min | $25.00 |
| Twilio Voice | $0.0085/min | 500 min | $4.25 |
| Twilio SMS | $0.0079/msg | 100 msgs | $0.79 |
| Twilio Number | $1.15/mo | 1 number | $1.15 |
| OpenAI (LLM) | $0.15/1M tokens | ~500K tokens | $0.08 |
| OpenAI (Embeddings) | $0.02/1M tokens | ~50K tokens | $0.001 |
| Supabase (pro-rated) | $25/mo ÷ orgs | 1/100th | $0.25 |
| Vercel (pro-rated) | $20/mo ÷ orgs | 1/100th | $0.20 |
| **Total COGS** | | | **$31.72** |

**Starter Plan: $99/mo → Gross Margin: 68%** ✅ Healthy

### 6.2 Cost at Scale

| Orgs | Monthly Revenue | Monthly COGS | Gross Profit | GM% |
|------|-----------------|--------------|--------------|-----|
| 100 | $9,900 | $3,172 | $6,728 | 68% |
| 1,000 | $99,000 | $31,720 | $67,280 | 68% |
| 10,000 | $990,000 | $317,200 | $672,800 | 68% |

**Margin stays consistent** because primary costs (Vapi, Twilio) scale linearly with usage.

### 6.3 Cost Risks

**1. Vapi Price Increase**
Vapi is currently $0.05/min. If they raise to $0.08/min (60% increase):
- New COGS: $46.72/customer
- New margin: 53% ← Still viable but painful

**Mitigation:** Negotiate volume pricing at 500K min/mo, or switch to Retell ($0.07-0.10/min but you control more).

**2. LLM Cost Spike**
Currently negligible ($0.08/customer). Even 10x increase = $0.80. Not a concern.

**3. Support Costs (Hidden)**
Not in COGS. At 1% support ticket rate:
- 1,000 orgs = 10 tickets/month
- At $50/ticket = $500/month
- ~0.5% revenue impact

**4. Infrastructure Scaling Costs**
At 10K orgs, you'll need:
- Supabase Pro ($25/mo) → Enterprise (~$600/mo)
- Vercel Pro ($20/mo) → Enterprise (~$400/mo)
- Dedicated queue service (~$100/mo)

Total infrastructure: ~$1,100/mo vs current ~$45/mo

Impact: COGS increases by ~$0.10/customer. Negligible.

### 6.4 Pricing Recommendations

Current pricing is **underpriced** for the value delivered:

| Current | Recommended | Rationale |
|---------|-------------|-----------|
| $99 Starter | $149 Starter | Still 10x cheaper than answering service |
| $299 Pro | $399 Pro | Volume users can afford it |
| $599 Business | $799 Business | Enterprise buyers expect higher prices |

**Also Add:**
- Annual discount (20% off) to reduce churn and improve cash flow
- Setup fee ($99-199) to filter tire-kickers

---

## 7. Critical Issues Summary

### MUST FIX Before Launch

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 1 | No RLS policies defined | Data leakage between orgs | Add policies (see §3.1) |
| 2 | Missing database indexes | Slow queries at 100+ orgs | Add indexes (see §5.1) |
| 3 | No webhook idempotency | Duplicate contacts/actions | Add dedup logic (see §4.1) |
| 4 | No SMS opt-out handling | Legal compliance (TCPA) | Add STOP handler (see §4.2) |

### Should Fix Before 500 Orgs

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 5 | No connection pooling | DB connection exhaustion | Use Supabase pooler |
| 6 | No async webhook processing | Timeout under load | Add queue (Inngest) |
| 7 | No webhook signature verification | Security vulnerability | Verify signatures |
| 8 | No rate limiting | Abuse potential | Add per-org limits |
| 9 | No usage tracking table | Can't bill overages | Add usage_records table |
| 10 | No audit logging | Compliance gaps | Add audit_log table |

---

## 8. Recommended Architecture Changes

### Immediate (Week 1-2)

```
1. Add all RLS policies
2. Add all database indexes
3. Add webhook idempotency keys
4. Add SMS opt-out handling
5. Add webhook signature verification
```

### Pre-Scale (Before 500 Orgs)

```
1. Switch to Supabase connection pooler
2. Implement async webhook processing (Inngest)
3. Add rate limiting (Upstash)
4. Add usage_records table
5. Add audit_log table
6. Add VoiceProvider abstraction layer
```

### Architecture Evolution

```
Current (MVP):
  Next.js API Routes → Supabase → Vapi/Twilio
  
At 500 Orgs:
  Next.js API Routes → Queue (Inngest) → Workers → Supabase
                    ↘ Rate Limiter (Upstash)
                    
At 5000 Orgs:
  Next.js Frontend → API Gateway → Microservices → Supabase Cluster
                                 → Queue Cluster
                                 → Cache Layer (Redis)
```

---

## 9. Final Verdict

### Strengths
- ✅ Stack is appropriate for stage
- ✅ Cost model is healthy (68% gross margin)
- ✅ Multi-tenant design is correct (RLS, not sharding)
- ✅ Vapi/Twilio are solid choices
- ✅ Schema is reasonable (minor issues)

### Weaknesses
- ⚠️ RLS policies not defined (critical)
- ⚠️ Missing indexes (critical for performance)
- ⚠️ No webhook reliability patterns
- ⚠️ PII handling underspecified
- ⚠️ No observability/monitoring mentioned

### Recommendation

**APPROVE with conditions:**

1. **Before MVP launch:** Fix critical issues (RLS, indexes, idempotency, STOP handling)
2. **Before 500 orgs:** Implement scale improvements (pooling, queues, rate limits)
3. **Before 5000 orgs:** Re-architect for microservices (probably not needed for 2+ years)

The team has made pragmatic choices. Don't over-engineer now—but don't ignore the scale landmines either.

---

*Review completed: 2026-02-06*  
*Next review: Post-MVP launch*
