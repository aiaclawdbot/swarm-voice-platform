# SWARM Voice Platform — PRD v3.0

**Version:** 3.0  
**Date:** 2026-02-06  
**Author:** QC + Michael Walker  
**Status:** Implementation Ready

---

## 1. Introduction

### What We're Building
A **self-serve AI voice platform** that lets service businesses deploy intelligent voice agents in under 15 minutes. No code. No setup calls. No onboarding friction.

### Why It Matters
Service businesses lose 35-50% of revenue due to:
- **67% of callers** won't leave voicemail — they call a competitor
- **78% hire the first responder** — speed is everything
- **Average response time is 47 hours** — lead is dead
- **Front desk costs $3,500-5,000/mo** — still misses 30% of calls

For a typical dental practice: **$250K+ lost annually**. For a 10-location home services company: **$1M+**.

### The Solution
1. Pick an industry template (dental, plumbing, legal, etc.)
2. Customize persona, greeting, knowledge base
3. Connect calendar and workflows
4. Get a phone number → **go live**

AI agent handles calls 24/7 — qualifying leads, booking appointments, triaging emergencies, triggering automations.

---

## 2. Goals

### Business Goals
| Goal | Target | Timeline |
|------|--------|----------|
| First 3 paying customers | $297+ each | Week 8 |
| Monthly churn | < 8% | Month 3 |
| Revenue (Month 3) | $15K MRR | Q1 |

### Product Goals
| Goal | Metric | Target |
|------|--------|--------|
| Time to first live call | Onboarding duration | < 15 minutes |
| Call answer rate | System uptime | 100% |
| Lead capture rate | Contacts created / calls | > 80% |
| Booking success rate | Appointments / requests | > 70% |
| Emergency detection | Missed emergencies | 0 |
| Customer activation (Day 1) | Deploy agent | > 60% |
| NPS | User survey | > 40 |

### Non-Goals (v1.0)
| Feature | Reason |
|---------|--------|
| Outbound calling campaigns | Focus on inbound first |
| Multi-language support | English only for MVP |
| Custom voice cloning | Regulatory + cost |
| On-premise deployment | Cloud-only |
| White-label/reseller | Post-PMF |
| Video/SMS conversations | Voice-first |
| Native mobile app | Web-first, responsive |

---

## 3. User Stories

### Persona 1: Sarah (Small Business Owner)
**Profile:** Owner, 3-location dental practice  
**Pain:** Loses 8-12 new patient calls/week to voicemail  
**Budget:** $4,500/mo on front desk staff for phones  
**Tech Level:** Uses Calendly, not technical

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| S1 | As Sarah, I want to sign up and deploy my first agent in 15 min | Google OAuth < 30s, 4-step wizard, auto-provisioned number |
| S2 | As Sarah, I want my agent to sound professional and match my brand | Editable greeting with preview, voice samples, business name auto-populated |
| S3 | As Sarah, I want callers to book appointments without human help | Calendar integration, real-time availability, SMS confirmation |
| S4 | As Sarah, I want to see who called and why | Call log with transcript, contact auto-created, intent tags |
| S5 | As Sarah, I want missed calls to get automatic follow-up | Workflow triggers on missed_call, sends SMS with booking link |

### Persona 2: Marcus (Operations Manager)
**Profile:** Ops manager, regional plumbing company (50 techs)  
**Pain:** After-hours emergencies go to voicemail, loses premium jobs  
**Budget:** $2K/mo on answering service (poor quality)  
**Tech Level:** Manages dispatch software, basic CRM

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| M1 | As Marcus, I want emergencies detected and escalated instantly | Urgency keywords trigger immediate SMS/email to on-call |
| M2 | As Marcus, I want leads categorized by urgency | High/medium/low/emergency tags on contacts |
| M3 | As Marcus, I want to see call analytics | Daily/weekly counts, peak hours, outcome breakdown |
| M4 | As Marcus, I want different routing by time of day | Business hours → appointment, after hours → emergency triage |

### Persona 3: Jennifer (Multi-Location Operator)
**Profile:** VP Operations, 15-location med spa chain  
**Pain:** Inconsistent phone experience across locations  
**Budget:** $60K/mo total on front desk  
**Tech Level:** Enterprise software buyer

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| J1 | As Jennifer, I want centralized management of all agents | Org dashboard with all locations |
| J2 | As Jennifer, I want consistent brand voice everywhere | Master template with location overrides |
| J3 | As Jennifer, I want aggregate analytics | Roll-up metrics across all agents |

---

## 4. Functional Requirements

### 4.1 Authentication & Onboarding
```
User arrives → Google/Email signup → Create org → Select industry template 
→ 4-step wizard → Phone number provisioned → Agent live
```

| Requirement | Details |
|-------------|---------|
| Auth provider | Supabase Auth (Google OAuth + email/password) |
| Org creation | Auto-create on signup, slug from company name |
| Industry select | 8 templates: dental, plumbing, hvac, medspa, legal, realestate, autorepair, insurance |
| Wizard steps | 1. Business info, 2. Persona/greeting, 3. Knowledge, 4. Phone number |
| Phone provisioning | Twilio API → auto-assign available local number |

### 4.2 Agent Configuration

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| name | text | "[Template] Agent" | User-editable |
| template_id | enum | — | Required |
| persona | text | Template default | System prompt |
| greeting | text | Template default | First message |
| voice_id | enum | alloy | openai voices: alloy, echo, fable, onyx, nova, shimmer |
| model | enum | gpt-4o-mini | Future: gpt-4o for enterprise |
| transfer_number | text | null | Fallback for emergencies |
| max_duration | int | 300 | Seconds, prevent runaway calls |
| business_hours | jsonb | 24/7 | Optional schedule |

### 4.3 Knowledge Base

| Operation | Flow |
|-----------|------|
| **Create** | User pastes FAQ or uploads file → chunk (500 tokens, 100 overlap) → embed (text-embedding-3-small) → store in pgvector |
| **Query** | Caller question → embed → similarity search (threshold 0.7, top 4 chunks) → inject into LLM context |
| **Update** | Replace all chunks for agent |
| **Delete** | Cascade delete on agent delete |

### 4.4 Call Handling

**Inbound Flow:**
```
1. Caller dials → Twilio routes to Vapi
2. Vapi: STT → user text
3. Vapi: Request our API for knowledge context
4. Vapi: LLM generates response
5. Vapi: TTS → audio to caller
6. Call ends → webhook to our server
7. Webhook handler:
   - Upsert contact (phone → lookup or create)
   - Log call with transcript, summary, intent, sentiment
   - Trigger matching workflows
```

**Intent Classification:**
| Intent | Keywords | Priority | Action |
|--------|----------|----------|--------|
| emergency | flood, burst, fire, gas leak, severe pain, blood | P0 | Alert + transfer option |
| booking | appointment, schedule, available, book, when can | P1 | Calendar lookup |
| inquiry | price, cost, how much, do you | P2 | Knowledge retrieval |
| status | my appointment, confirm, cancel | P2 | Appointment lookup |
| complaint | unhappy, problem, issue, wrong | P1 | Empathy + escalation |
| other | (fallback) | P3 | General assistance |

### 4.5 CRM (Contacts)

| Field | Type | Notes |
|-------|------|-------|
| phone | text | Primary identifier |
| email | text | Optional |
| first_name | text | Extracted from conversation |
| last_name | text | Extracted from conversation |
| company | text | Optional |
| status | enum | new, contacted, qualified, won, lost |
| source | enum | inbound_call, website, manual, import |
| tags | array | User-defined |
| metadata | jsonb | Flexible extension |

**Features:**
- Auto-create contact on first call
- Merge if phone matches existing
- Contact timeline (calls, messages, notes)
- Tag system with colors
- Search by name, phone, email
- Export to CSV

### 4.6 Workflows

**Trigger Types:**
| Trigger | Fires When |
|---------|-----------|
| call_completed | Any call ends |
| lead_captured | Contact created/updated with new intent |
| missed_call | Call not answered or < 10s |
| emergency_detected | Urgency = emergency |
| booking_requested | Intent = booking |
| manual | User clicks "Run" |

**Action Types:**
| Action | Config |
|--------|--------|
| send_sms | to, template, delay_seconds |
| send_email | to, subject, template, delay_seconds |
| add_note | content |
| update_contact | fields to update |
| webhook | url, method, payload |
| wait | delay_seconds |

**Execution:**
- Sequential action execution
- Respect delays (async queue)
- Variable substitution: `{{contact.first_name}}`, `{{call.summary}}`
- 3 retry attempts with exponential backoff
- Audit log all executions

### 4.7 Analytics Dashboard

| Metric | Visualization | Timeframes |
|--------|---------------|------------|
| Total calls | Big number + trend | Today, 7d, 30d, All |
| Avg call duration | Big number | Same |
| Lead capture rate | Percentage | Same |
| Calls by hour | Bar chart | 7d, 30d |
| Calls by outcome | Pie chart | 7d, 30d |
| Top intents | Bar chart | 7d, 30d |
| Sentiment breakdown | Pie chart | 7d, 30d |

### 4.8 Billing

| Tier | Price | Minutes | Agents | Numbers | Overage |
|------|-------|---------|--------|---------|---------|
| Starter | $99/mo | 500 | 1 | 1 | $0.15/min |
| Pro | $299/mo | 2,000 | 3 | 3 | $0.12/min |
| Business | $599/mo | 5,000 | 10 | 10 | $0.10/min |
| Enterprise | Custom | Unlimited | Unlimited | Unlimited | Volume |

**Add-ons:**
- Additional phone number: $15/mo
- Additional agent: $29/mo
- HIPAA compliance (Retell): $200/mo

---

## 5. Design Considerations

### 5.1 Design System
| Element | Specification |
|---------|---------------|
| Primary color | #0a0a0a (near black) |
| Accent color | #00ff88 (electric green) |
| Error color | #ef4444 |
| Warning color | #f59e0b |
| Font (headings) | JetBrains Mono |
| Font (body) | Inter |
| Border radius | 8px (cards), 6px (buttons) |
| Spacing scale | 4px base (4, 8, 12, 16, 24, 32, 48, 64) |

### 5.2 Page Structure

```
/                     Landing page (marketing)
/login                Auth page
/signup               Onboarding wizard
/dashboard            Main dashboard (overview)
/dashboard/agents     Agent list + management
/dashboard/agents/new Agent creation wizard
/dashboard/agents/:id Agent detail + edit
/dashboard/calls      Call log
/dashboard/calls/:id  Call detail + transcript
/dashboard/contacts   Contact list
/dashboard/contacts/:id Contact detail + timeline
/dashboard/workflows  Workflow list
/dashboard/workflows/new Workflow builder
/dashboard/analytics  Analytics dashboard
/dashboard/settings   Org settings, billing
```

### 5.3 Key UI Components

| Component | Description |
|-----------|-------------|
| AgentWizard | 4-step form with progress indicator |
| VoiceSelector | Dropdown with audio preview buttons |
| KnowledgeUploader | Paste/file upload with preview |
| CallList | Sortable table with status badges |
| CallDetail | Transcript with timestamps, summary card |
| ContactCard | Mini profile with recent activity |
| WorkflowBuilder | Visual trigger → action chain |
| AnalyticsCard | Metric + sparkline + comparison |

### 5.4 Mobile Considerations
- Dashboard must be fully responsive
- Call list: stack layout on mobile
- Wizard: single column on mobile
- Touch targets: minimum 44px
- No hover-dependent interactions

---

## 6. Technical Specifications

### 6.1 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SWARM VOICE PLATFORM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│   │ Next.js  │    │   Vapi   │    │ Supabase │    │  Twilio  │ │
│   │   16     │◄──►│  Voice   │◄──►│ Postgres │◄──►│SMS/Voice │ │
│   │  + API   │    │  Engine  │    │ + pgvec  │    │          │ │
│   └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘ │
│        │               │               │               │        │
│        └───────────────┴───────────────┴───────────────┘        │
│                                                                  │
│                     ┌─────────────────────┐                     │
│                     │   Workflow Engine   │                     │
│                     │   (Async Queue)     │                     │
│                     └─────────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 16, Tailwind v4, shadcn/ui | SSR, modern, component library |
| Backend | Next.js API Routes | Serverless, co-located |
| Database | Supabase PostgreSQL | Auth, RLS, realtime |
| Vector | pgvector (Supabase) | No extra service |
| Voice | Vapi ($0.05/min) | Best DX, full webhooks |
| Telephony | Twilio | Numbers, SMS |
| Email | Resend | Simple, good deliverability |
| Payments | Stripe | Subscriptions, metering |
| Hosting | Vercel | Next.js native, edge |
| Auth | Supabase Auth | Integrated, social logins |

### 6.3 Database Schema
See `supabase/schema-v2.sql` (applied)

**Core Tables:**
- organizations, users
- agents, phone_numbers, knowledge_bases, knowledge_documents
- contacts, contact_notes, contact_tags
- calls, messages
- workflows, workflow_actions, workflow_runs
- usage_records

### 6.4 API Routes

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/callback` | GET | — | OAuth callback |
| `/api/agents` | GET, POST | ✓ | List/create agents |
| `/api/agents/[id]` | GET, PUT, DELETE | ✓ | Agent CRUD |
| `/api/agents/[id]/knowledge` | POST, DELETE | ✓ | KB management |
| `/api/contacts` | GET, POST | ✓ | List/create contacts |
| `/api/contacts/[id]` | GET, PUT, DELETE | ✓ | Contact CRUD |
| `/api/contacts/[id]/notes` | GET, POST | ✓ | Notes |
| `/api/calls` | GET | ✓ | List calls |
| `/api/calls/[id]` | GET | ✓ | Call detail |
| `/api/workflows` | GET, POST | ✓ | List/create workflows |
| `/api/workflows/[id]` | GET, PUT, DELETE | ✓ | Workflow CRUD |
| `/api/workflows/[id]/run` | POST | ✓ | Manual trigger |
| `/api/phone-numbers/provision` | POST | ✓ | Get new number |
| `/api/billing/checkout` | POST | ✓ | Stripe checkout |
| `/api/billing/portal` | POST | ✓ | Customer portal |
| `/api/webhooks/vapi` | POST | — | Call events |
| `/api/webhooks/twilio` | POST | — | SMS events |
| `/api/webhooks/stripe` | POST | — | Billing events |

### 6.5 External Integrations

| Service | Purpose | Auth |
|---------|---------|------|
| Vapi | Voice AI | API key |
| Twilio | Phone numbers, SMS | API key + token |
| Google Calendar | Booking | OAuth 2.0 |
| Calendly | Booking | OAuth 2.0 |
| Cal.com | Booking | API key |
| Stripe | Billing | API key + webhooks |
| Resend | Email | API key |
| OpenAI | Embeddings | API key |

### 6.6 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Vapi
VAPI_API_KEY=
VAPI_WEBHOOK_SECRET=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# OpenAI
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## 7. Implementation Tasks

### Phase 1: Core Infrastructure (Week 1)
| Task | Priority | Estimate | Dependencies |
|------|----------|----------|--------------|
| T1.1 Apply schema-v2.sql to Supabase | P0 | 1h | — |
| T1.2 Set up Supabase Auth with Google OAuth | P0 | 2h | T1.1 |
| T1.3 Create auth middleware for API routes | P0 | 2h | T1.2 |
| T1.4 Build org context provider | P1 | 2h | T1.2 |
| T1.5 Implement `/api/agents` CRUD | P0 | 3h | T1.3 |
| T1.6 Implement `/api/contacts` CRUD | P0 | 3h | T1.3 |
| T1.7 Implement `/api/calls` read-only | P0 | 2h | T1.3 |

**Exit Criteria:** User can sign up, create org, and basic CRUD works.

### Phase 2: Voice Integration (Week 2)
| Task | Priority | Estimate | Dependencies |
|------|----------|----------|--------------|
| T2.1 Vapi account setup + assistant creation | P0 | 2h | — |
| T2.2 Twilio account setup + number pool | P0 | 2h | — |
| T2.3 Build phone provisioning API | P0 | 3h | T2.2 |
| T2.4 Build Vapi webhook handler | P0 | 4h | T2.1 |
| T2.5 Implement call logging from webhook | P0 | 2h | T2.4, T1.7 |
| T2.6 Implement contact upsert on call | P0 | 2h | T2.5, T1.6 |
| T2.7 Test end-to-end: call → log → contact | P0 | 2h | T2.6 |

**Exit Criteria:** One real call answered by AI, logged with contact created.

### Phase 3: Onboarding Wizard (Week 3)
| Task | Priority | Estimate | Dependencies |
|------|----------|----------|--------------|
| T3.1 Build signup flow with industry select | P0 | 3h | T1.2 |
| T3.2 Build 4-step agent wizard component | P0 | 4h | — |
| T3.3 Implement template presets (8 industries) | P0 | 4h | T3.2 |
| T3.4 Build voice selector with audio preview | P1 | 2h | T3.2 |
| T3.5 Build knowledge paste/upload component | P0 | 3h | T3.2 |
| T3.6 Implement embedding pipeline | P0 | 3h | T3.5 |
| T3.7 Wire wizard to Vapi + Twilio provisioning | P0 | 3h | T3.2, T2.3 |

**Exit Criteria:** New user can sign up and deploy agent in < 15 minutes.

### Phase 4: CRM & Dashboard (Week 4)
| Task | Priority | Estimate | Dependencies |
|------|----------|----------|--------------|
| T4.1 Build contact list page with search/filter | P0 | 4h | T1.6 |
| T4.2 Build contact detail with timeline | P0 | 3h | T4.1 |
| T4.3 Build contact notes CRUD | P1 | 2h | T4.2 |
| T4.4 Build call list page with filters | P0 | 3h | T1.7 |
| T4.5 Build call detail with transcript view | P0 | 3h | T4.4 |
| T4.6 Build dashboard overview page | P1 | 4h | T4.4 |
| T4.7 Implement tag system | P2 | 3h | T4.1 |

**Exit Criteria:** Full CRM view with calls and contacts linked.

### Phase 5: Workflows (Week 5)
| Task | Priority | Estimate | Dependencies |
|------|----------|----------|--------------|
| T5.1 Implement workflow CRUD API | P0 | 3h | T1.3 |
| T5.2 Build workflow list page | P0 | 2h | T5.1 |
| T5.3 Build workflow builder UI | P0 | 6h | T5.1 |
| T5.4 Implement workflow execution engine | P0 | 6h | T5.1 |
| T5.5 Wire Vapi webhook to trigger workflows | P0 | 3h | T5.4, T2.4 |
| T5.6 Implement SMS action (Twilio) | P0 | 2h | T5.4 |
| T5.7 Implement email action (Resend) | P1 | 2h | T5.4 |
| T5.8 Implement execution audit log | P1 | 2h | T5.4 |

**Exit Criteria:** Missed call → automatic SMS follow-up working.

### Phase 6: Analytics & Billing (Week 6-7)
| Task | Priority | Estimate | Dependencies |
|------|----------|----------|--------------|
| T6.1 Build analytics API endpoints | P1 | 4h | T1.7 |
| T6.2 Build analytics dashboard page | P1 | 6h | T6.1 |
| T6.3 Implement usage tracking | P0 | 3h | T2.4 |
| T6.4 Stripe integration: checkout | P0 | 4h | — |
| T6.5 Stripe integration: webhooks | P0 | 3h | T6.4 |
| T6.6 Stripe integration: customer portal | P1 | 2h | T6.4 |
| T6.7 Build settings/billing page | P1 | 3h | T6.6 |
| T6.8 Implement tier limits enforcement | P0 | 3h | T6.3 |

**Exit Criteria:** User can subscribe, usage is tracked, limits enforced.

### Phase 7: Polish & Launch (Week 8)
| Task | Priority | Estimate | Dependencies |
|------|----------|----------|--------------|
| T7.1 Error handling audit + improvements | P0 | 4h | All |
| T7.2 Loading states + skeleton screens | P1 | 3h | All |
| T7.3 Mobile responsive audit | P0 | 4h | All |
| T7.4 Onboarding email sequence (Resend) | P1 | 3h | T5.7 |
| T7.5 Landing page final polish | P1 | 4h | — |
| T7.6 Documentation + help content | P2 | 4h | — |
| T7.7 Monitoring + alerting setup | P1 | 3h | — |
| T7.8 Production environment setup | P0 | 3h | — |

**Exit Criteria:** Production-ready for first 3 customers.

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Vapi latency spikes | Medium | High | Implement Retell fallback, monitor p99 |
| LLM hallucinations | Medium | High | Strict prompting, KB-only mode, confidence thresholds |
| Twilio number delays | Low | Medium | Pre-provision pool of 10 numbers |
| Calendar sync failures | Medium | Medium | Retry logic, manual booking fallback |
| Supabase outage | Low | Critical | Graceful degradation, status monitoring |
| Cost overrun | Medium | Medium | Usage alerts, rate limiting, hard caps |
| Low conversion | Medium | High | A/B test onboarding, user interviews |

---

## 9. Open Questions

| # | Question | Owner | Status | Notes |
|---|----------|-------|--------|-------|
| Q1 | Which Vapi plan? Pro ($49/mo) vs Business ($249/mo)? | Michael | Open | Pro has 1000 min/mo, may hit limits |
| Q2 | Twilio number strategy: local vs toll-free? | QC | Open | Local = trust, toll-free = simpler |
| Q3 | Calendar priority: Google first, or Calendly? | Michael | Open | Google = more users, Calendly = simpler |
| Q4 | HIPAA compliance timeline? | Michael | Open | Retell + Supabase BAA = $200/mo extra |
| Q5 | Trial period: 7 days or 14 days? | Michael | Open | 7 = urgency, 14 = more testing |
| Q6 | Free tier: yes/no? | Michael | Open | Risk: abuse. Benefit: adoption |
| Q7 | Domain: swarmvoice.ai? voiceswarm.ai? | Michael | Open | Need to check availability |
| Q8 | Refund policy: 30-day money back? | Michael | Open | Reduces friction, some abuse risk |

---

## 10. Success Metrics

### Week 2 (MVP)
- [ ] 1 real call handled end-to-end
- [ ] Call logged with transcript
- [ ] Contact auto-created

### Week 4 (Alpha)
- [ ] 5 friendly users deployed
- [ ] < 15 min signup-to-live
- [ ] Zero critical bugs

### Week 6 (Beta)
- [ ] 20 users active
- [ ] < 8% churn
- [ ] Workflows executing

### Week 8 (Launch)
- [ ] 3 paying customers ($297+)
- [ ] NPS > 40
- [ ] < 5% error rate

### Month 3 (PMF Signal)
- [ ] $15K MRR
- [ ] < 5% monthly churn
- [ ] Organic signups > paid

---

## Appendix A: Industry Templates

| ID | Industry | Persona Focus | Key Intents | Emergency Keywords |
|----|----------|---------------|-------------|-------------------|
| dental | Dental | Warm, reassuring | booking, insurance, emergency | severe pain, swelling, bleeding |
| plumbing | Plumbing | Professional, efficient | booking, quote, emergency | flood, burst, leak, no water |
| hvac | HVAC | Knowledgeable, helpful | booking, quote, maintenance | no heat, no AC, gas smell |
| medspa | Med Spa | Luxurious, consultative | booking, consultation, pricing | allergic reaction |
| legal | Legal | Professional, discrete | consultation, case status | urgent filing, court date |
| realestate | Real Estate | Enthusiastic, responsive | showing, pricing, availability | — |
| autorepair | Auto Repair | Trustworthy, direct | booking, quote, status | stranded, won't start |
| insurance | Insurance | Helpful, knowledgeable | quote, claim, policy | accident, damage |

---

## Appendix B: Competitive Positioning

| Competitor | Weakness | Our Advantage |
|------------|----------|---------------|
| 11x.ai | Predatory contracts, 0 meetings for many | Monthly, results-focused |
| Bland.ai | DIY platform, no templates | Turnkey, industry-specific |
| Aircall/RingCentral | Infrastructure, not AI | We handle calls, not route |
| Human answering | $1-2/min, inconsistent | 24/7 consistent, 5-10x cheaper |
| In-house staff | $4K+/mo, limited hours | Always on, never sick |

---

*Document Owner: QC | Created: 2026-02-06 | Ready for Implementation*
