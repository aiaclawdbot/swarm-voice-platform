# SWARM Voice Platform — Product Requirements Document

**Version:** 2.0  
**Date:** 2026-02-06  
**Author:** QC + Michael Walker  
**Status:** Final Draft

---

## 1. Executive Summary

### Problem Statement

Service businesses lose **35-50% of revenue opportunities** due to missed calls, slow response times, and after-hours dead ends:

- **67% of callers won't leave voicemail** — they call a competitor instead
- **78% of customers hire the first responder** — speed is everything
- **Average response time is 47 hours** — by then, the lead is cold
- **Front desk staff cost $3,500-5,000/month** — and still miss 30% of calls

For a typical dental practice, this translates to **$250K+ in lost annual revenue**. For a 10-location home services company, it's **$1M+**.

### Proposed Solution

A **self-serve AI voice platform** that lets service businesses deploy intelligent voice agents in under 15 minutes:

1. **Pick an industry template** (dental, plumbing, legal, etc.)
2. **Customize persona, greeting, and knowledge base**
3. **Connect calendar and workflows**
4. **Get a phone number and go live**

The AI agent handles calls 24/7 — qualifying leads, booking appointments, triaging emergencies, and triggering follow-up automations.

### Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to first live call | < 15 minutes | Onboarding funnel analytics |
| Call answer rate | 100% | Vapi dashboard |
| Lead capture rate | > 80% of qualified callers | Calls with contact created / total calls |
| Booking success rate | > 70% | Appointment requests → confirmed |
| Emergency detection accuracy | 100% | Zero missed emergencies (audit) |
| Customer activation (Day 1) | > 60% deploy agent | Product analytics |
| Monthly churn | < 8% | Stripe MRR tracking |
| NPS | > 40 | In-app survey |

---

## 2. User Experience & Functionality

### User Personas

#### Primary: Small Business Owner — "Sarah"

| Attribute | Details |
|-----------|---------|
| **Role** | Owner, 3-location dental practice |
| **Pain** | Loses 8-12 new patient calls/week to voicemail |
| **Current Spend** | $4,500/mo on front desk staff for phones |
| **Tech Savvy** | Uses Calendly, not technical enough to build AI |
| **Success** | Stop missing calls, book more patients, reduce staff burden |

#### Secondary: Operations Manager — "Marcus"

| Attribute | Details |
|-----------|---------|
| **Role** | Ops manager, regional plumbing company (50 techs) |
| **Pain** | After-hours emergencies go to voicemail, loses premium jobs |
| **Current Spend** | $2K/mo on answering service (poor quality) |
| **Tech Savvy** | Manages dispatch software, CRM basics |
| **Success** | Capture every emergency, triage by urgency, notify on-call tech |

#### Tertiary: Multi-Location Operator — "Jennifer"

| Attribute | Details |
|-----------|---------|
| **Role** | VP Operations, 15-location med spa chain |
| **Pain** | Inconsistent phone experience across locations |
| **Current Spend** | $60K/mo total on front desk across all locations |
| **Tech Savvy** | Enterprise software buyer |
| **Success** | Centralized management, consistent brand voice, analytics |

### User Stories & Acceptance Criteria

#### Onboarding

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| O1 | As a new user, I want to sign up and deploy my first agent in under 15 minutes | - Google/email signup < 30 sec<br>- Template selection (8+ industries)<br>- 4-step wizard<br>- Phone number auto-provisioned |
| O2 | As a business owner, I want to customize my agent to match my brand | - Editable greeting with live preview<br>- Persona prompt editor<br>- Voice selection with audio samples<br>- Company name auto-populated |
| O3 | As a user, I want to add my business knowledge | - FAQ paste or file upload<br>- Services/pricing entry<br>- Business hours config<br>- Transfer number for escalations |
| O4 | As a user, I want to connect my calendar | - Google Calendar OAuth<br>- Calendly integration<br>- Cal.com integration<br>- Custom availability rules |

#### Call Handling

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| C1 | As a caller, I want immediate, professional greeting | - Answer < 2 rings<br>- Natural voice (not robotic)<br>- Business name in greeting |
| C2 | As a business owner, I want emergencies prioritized | - Configurable urgency keywords<br>- Immediate SMS/email for emergencies<br>- Option to transfer to on-call number |
| C3 | As a caller, I want to book without waiting | - Real-time availability check<br>- Appointment created in connected calendar<br>- SMS confirmation to caller |
| C4 | As a business owner, I want the AI to answer FAQs accurately | - Knowledge base retrieval (RAG)<br>- Hallucination rate < 5%<br>- "I don't know" fallback for unknowns |

#### CRM & Contacts

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| R1 | As a user, I want caller info captured automatically | - Phone number extraction<br>- Name from conversation<br>- Call reason/intent classification<br>- Transcript and summary saved |
| R2 | As a user, I want to track lead status | - Status pipeline: New → Contacted → Qualified → Won/Lost<br>- Notes with timestamps<br>- Tag system |
| R3 | As a user, I want to search/filter contacts | - Full-text search<br>- Filter by status, date, tags<br>- CSV export |

#### Workflows & Automation

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| W1 | As a user, I want automatic follow-up after lead capture | - Trigger: call_completed with new lead<br>- Action: SMS with configurable template<br>- Delay options: immediate, 5 min, 1 hour |
| W2 | As a user, I want to recover missed calls | - Trigger: missed_call<br>- Action: "Sorry we missed you" SMS<br>- Include booking link |
| W3 | As a user, I want team notifications for urgent calls | - Trigger: urgency_detected<br>- Action: SMS/email to specified team member<br>- Include summary and callback number |

#### Analytics

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| A1 | As a user, I want to see call volume trends | - Daily/weekly/monthly counts<br>- Peak hours visualization<br>- Missed vs answered breakdown |
| A2 | As a user, I want to measure lead effectiveness | - Leads captured per period<br>- Conversion funnel<br>- Source attribution |
| A3 | As a user, I want to review calls | - Playable recordings<br>- Searchable transcripts<br>- Sentiment/intent labels |

### Non-Goals (v1.0)

| Feature | Reason for Exclusion |
|---------|----------------------|
| Outbound calling campaigns | Focus on inbound first; outbound is different product |
| Multi-language support | English only for MVP; localization adds complexity |
| Custom voice cloning | Regulatory and cost concerns; stock voices sufficient |
| On-premise deployment | Cloud-only reduces ops burden |
| White-label/reseller | Post-launch feature after product-market fit |
| Video/SMS conversations | Voice-first; messaging via workflows only |
| Native mobile app | Web-first, mobile-responsive |

---

## 3. AI System Requirements

### Voice AI Stack

| Component | Selection | Rationale |
|-----------|-----------|-----------|
| **Voice Provider** | Vapi (primary) | Best DX, $0.05/min, full-featured webhooks |
| **Fallback** | Retell | HIPAA compliant for healthcare verticals |
| **LLM** | GPT-4o-mini | Cost-effective ($0.15/1M tokens), fast |
| **TTS** | OpenAI voices | Natural-sounding (alloy, nova, shimmer) |
| **STT** | Deepgram (via Vapi) | Industry-leading accuracy |

### Knowledge Base Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    KNOWLEDGE PIPELINE                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User FAQ/Docs  ─→  Chunking  ─→  Embeddings  ─→  pgvector
│       │                                            │
│       └──────────────────────────────────────────────┘
│                                                         │
│  Caller Question  ─→  Embed  ─→  Similarity Search     │
│                                        │               │
│                              Top 4 chunks  ─→  LLM  ─→ Answer
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Configuration:**
- Chunk size: 500 tokens, 100 token overlap
- Embedding model: `text-embedding-3-small`
- Similarity threshold: 0.7 minimum
- Max context: 4 most relevant chunks

### Intent Classification

| Intent | Keywords/Patterns | Priority | Action |
|--------|-------------------|----------|--------|
| `emergency` | flood, burst, fire, gas leak, severe pain, blood | P0 | Immediate alert + optional transfer |
| `booking` | appointment, schedule, available, book, when can | P1 | Calendar lookup + booking flow |
| `inquiry` | price, cost, how much, do you, can you | P2 | Knowledge base retrieval |
| `status` | my appointment, when is, confirm, cancel | P2 | Lookup existing appointment |
| `complaint` | unhappy, problem, issue, wrong, upset | P1 | Empathy response + escalation |
| `other` | (fallback) | P3 | General assistance |

### Evaluation Strategy

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Intent accuracy | > 90% | Weekly sample review (50 calls) |
| Booking success | > 70% | Attempted → confirmed rate |
| Emergency detection | 100% | Audit all flagged + missed |
| Answer accuracy | > 90% | Spot check vs knowledge base |
| Hallucination rate | < 5% | Answers not supported by KB |
| Caller satisfaction | > 4.0/5 | Optional post-call survey |

### Testing Protocol

1. **Pre-launch:** 10 synthetic test calls per template
2. **Day 1:** Shadow mode (record but don't trigger workflows)
3. **Ongoing:** Weekly 5% random sample audit
4. **Escalation:** Any emergency detection failure triggers immediate review

---

## 4. Technical Specifications

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      SWARM VOICE PLATFORM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│   │ Next.js  │    │  Vapi    │    │ Supabase │    │  Twilio  │ │
│   │ Frontend │◄──►│  Voice   │◄──►│ Postgres │◄──►│   SMS    │ │
│   │   App    │    │  Engine  │    │ + pgvec  │    │  Calls   │ │
│   └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘ │
│        │               │               │               │        │
│        └───────────────┼───────────────┼───────────────┘        │
│                        │               │                         │
│                  ┌─────┴─────┐   ┌─────┴─────┐                  │
│                  │  Webhook  │   │ Workflow  │                  │
│                  │  Handler  │   │  Engine   │                  │
│                  └───────────┘   └───────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow: Inbound Call

```
1. Caller dials → Twilio → routes to Vapi
2. Vapi: STT → user utterance text
3. Vapi: Query our API → knowledge lookup (pgvector)
4. Vapi: LLM generates response with context
5. Vapi: TTS → audio back to caller
6. Call ends → Vapi sends webhook to our server
7. Webhook handler:
   - Create/update contact in CRM
   - Log call with transcript, summary, intent
   - Trigger matching workflows
```

### Data Flow: Workflow Execution

```
1. Trigger event fires (call_completed, missed_call, etc.)
2. Match against org's active workflows
3. Execute actions in sequence:
   - Respect configured delays
   - Template variable substitution
4. Log execution status
5. Retry on failure (3 attempts, exponential backoff)
```

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 16, Tailwind v4 | SSR, modern, fast |
| Backend | Next.js API Routes | Serverless, co-located |
| Database | Supabase PostgreSQL | Auth, RLS, realtime |
| Vector Store | pgvector (Supabase) | No separate service needed |
| Voice | Vapi | Best DX, fair pricing |
| Telephony | Twilio | Phone numbers, SMS |
| Email | Resend | Simple API, good deliverability |
| Payments | Stripe | Recurring billing, usage metering |
| Hosting | Vercel | Next.js native, edge functions |
| Auth | Supabase Auth | Integrated with DB, social logins |

### Database Schema (Core)

```sql
-- Multi-tenant Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'trial',
  stripe_customer_id TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  org_id UUID REFERENCES organizations(id) NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Voice Agents
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  template_id TEXT,
  persona TEXT,
  greeting TEXT,
  voice_id TEXT DEFAULT 'alloy',
  phone_number_id UUID REFERENCES phone_numbers(id),
  vapi_assistant_id TEXT,
  settings JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phone Numbers
CREATE TABLE phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) NOT NULL,
  number TEXT NOT NULL,
  twilio_sid TEXT,
  vapi_phone_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CRM Contacts
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) NOT NULL,
  phone TEXT,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  status TEXT DEFAULT 'new',
  source TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contact Notes
CREATE TABLE contact_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Calls
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) NOT NULL,
  agent_id UUID REFERENCES agents(id),
  contact_id UUID REFERENCES contacts(id),
  vapi_call_id TEXT,
  direction TEXT DEFAULT 'inbound',
  from_number TEXT,
  to_number TEXT,
  duration_seconds INTEGER,
  status TEXT,
  recording_url TEXT,
  transcript TEXT,
  summary TEXT,
  sentiment TEXT,
  intent TEXT,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Knowledge Base
CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) NOT NULL,
  agent_id UUID REFERENCES agents(id),
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workflows
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow Actions
CREATE TABLE workflow_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_config JSONB DEFAULT '{}',
  delay_seconds INTEGER DEFAULT 0,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow Executions (audit log)
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  trigger_event JSONB,
  status TEXT,
  error TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/[...supabase]` | * | Auth callbacks |
| `/api/agents` | GET, POST | List/create agents |
| `/api/agents/[id]` | GET, PUT, DELETE | Agent CRUD |
| `/api/agents/[id]/knowledge` | POST, DELETE | Upload/clear KB |
| `/api/contacts` | GET, POST | List/create contacts |
| `/api/contacts/[id]` | GET, PUT, DELETE | Contact CRUD |
| `/api/contacts/[id]/notes` | GET, POST | Contact notes |
| `/api/calls` | GET | List calls |
| `/api/calls/[id]` | GET | Call details |
| `/api/workflows` | GET, POST | List/create workflows |
| `/api/workflows/[id]` | GET, PUT, DELETE | Workflow CRUD |
| `/api/webhooks/vapi` | POST | Vapi call events |
| `/api/webhooks/twilio` | POST | Twilio SMS events |
| `/api/phone-numbers/provision` | POST | Provision new number |
| `/api/billing/checkout` | POST | Stripe checkout |
| `/api/billing/portal` | POST | Stripe customer portal |

### Integration Points

| Integration | Purpose | Auth Method |
|-------------|---------|-------------|
| Vapi | Voice AI | API key |
| Twilio | Phone numbers, SMS | API key + Auth token |
| Google Calendar | Appointment booking | OAuth 2.0 |
| Calendly | Appointment booking | OAuth 2.0 |
| Cal.com | Appointment booking | API key |
| Stripe | Billing | API key + webhooks |
| Resend | Email notifications | API key |

### Security & Privacy

| Requirement | Implementation |
|-------------|----------------|
| Data encryption at rest | Supabase default (AES-256) |
| Data encryption in transit | TLS 1.3 everywhere |
| Row-level security | Supabase RLS policies per org |
| PII handling | Phone/email encrypted, minimal retention |
| Call recordings | Stored in Vapi, 90-day default retention |
| HIPAA (future) | Retell fallback, BAA with Supabase |
| SOC 2 (future) | Vercel + Supabase both SOC 2 compliant |

---

## 5. Risks & Roadmap

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Vapi latency spikes | Medium | High | Implement Retell fallback, monitor p99 |
| LLM hallucinations | Medium | High | Strict prompting, KB-only mode, human review |
| Twilio number provisioning delays | Low | Medium | Pre-provision pool for instant activation |
| Calendar sync failures | Medium | Medium | Retry logic, manual booking fallback |
| Supabase outage | Low | Critical | Multi-region future, graceful degradation |
| Cost overrun (per-minute) | Medium | Medium | Usage alerts, rate limiting, tiered pricing |

### Phased Rollout

#### Phase 1: MVP (Week 1-2)
**Goal:** Working agent that takes calls

| Feature | Status |
|---------|--------|
| Supabase schema applied | 🔲 |
| Basic API routes (agents, calls, contacts) | 🔲 |
| Vapi integration (create assistant, handle webhook) | 🔲 |
| Twilio phone provisioning | 🔲 |
| Single template working end-to-end | 🔲 |

**Exit Criteria:** One real call answered by AI agent with contact created.

#### Phase 2: Core Features (Week 3-4)
**Goal:** Self-serve onboarding

| Feature | Status |
|---------|--------|
| Signup/auth flow | 🔲 |
| Agent creation wizard | ✅ (UI done) |
| All 8 templates working | 🔲 |
| Knowledge base upload | 🔲 |
| Basic analytics dashboard | 🔲 |

**Exit Criteria:** New user can sign up and deploy agent in < 15 minutes.

#### Phase 3: Automation (Week 5-6)
**Goal:** Workflows and follow-up

| Feature | Status |
|---------|--------|
| Workflow builder | ✅ (UI done) |
| Workflow execution engine | 🔲 |
| SMS actions (Twilio) | 🔲 |
| Email actions (Resend) | 🔲 |
| Calendar integrations | 🔲 |

**Exit Criteria:** Missed call triggers automatic SMS follow-up.

#### Phase 4: Polish & Launch (Week 7-8)
**Goal:** Production-ready

| Feature | Status |
|---------|--------|
| Stripe billing integration | 🔲 |
| Usage metering | 🔲 |
| Onboarding email sequence | 🔲 |
| Error handling & monitoring | 🔲 |
| Landing page with booking | 🔲 |

**Exit Criteria:** First 3 paying customers.

### Success Milestones

| Date | Milestone | Metric |
|------|-----------|--------|
| Week 2 | MVP Complete | 1 test call handled |
| Week 4 | Alpha | 5 friendly users deployed |
| Week 6 | Beta | 20 users, < 5% churn |
| Week 8 | Launch | 3 paying customers |
| Month 3 | PMF Signal | $15K MRR, NPS > 40 |

---

## Appendix A: Industry Templates

| Template | Vertical | Key Features |
|----------|----------|--------------|
| dental | Dental practices | Appointment booking, recall reminders, insurance questions |
| plumbing | Plumbing companies | Emergency triage, dispatch, pricing quotes |
| hvac | HVAC contractors | Seasonal urgency, maintenance scheduling |
| medspa | Med spas/aesthetics | Consultation booking, treatment info |
| legal | Law firms | Intake questions, consultation scheduling |
| realestate | Real estate | Property inquiries, showing scheduling |
| autorepair | Auto repair shops | Service quotes, appointment booking |
| insurance | Insurance agencies | Quote requests, policy questions |

---

## Appendix B: Pricing Model

| Tier | Price | Included | Overage |
|------|-------|----------|---------|
| **Starter** | $99/mo | 500 minutes, 1 agent, 1 number | $0.15/min |
| **Pro** | $299/mo | 2,000 minutes, 3 agents, 3 numbers | $0.12/min |
| **Business** | $599/mo | 5,000 minutes, 10 agents, 10 numbers | $0.10/min |
| **Enterprise** | Custom | Unlimited | Volume discount |

**Add-ons:**
- Additional phone number: $15/mo
- Additional agent: $29/mo
- HIPAA compliance: $200/mo (Retell backend)
- Custom voice: $500 one-time

---

## Appendix C: Competitive Positioning

| Competitor | Weakness | Our Advantage |
|------------|----------|---------------|
| 11x.ai | Predatory contracts, 0 meetings for many customers | Monthly billing, results guarantee |
| Bland.ai | DIY platform, no templates | Turnkey, industry-specific |
| Aircall/RingCentral | Infrastructure, not AI outcomes | We handle calls, not just route them |
| Human answering services | $1-2/min, inconsistent quality | 24/7 consistent, 5-10x cheaper |
| In-house staff | $4K+/mo, limited hours | Always on, never calls in sick |

---

*Document Owner: QC | Last Updated: 2026-02-06 | Next Review: Post-MVP*
