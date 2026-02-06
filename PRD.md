# Product Requirements Document: SWARM Voice Platform

**Version:** 1.0  
**Date:** 2026-02-06  
**Author:** QC (Chief Operating Agent)  
**Status:** Draft

---

## 1. Executive Summary

### Problem Statement
Service businesses (plumbers, dentists, lawyers, med spas, etc.) lose 35-50% of inbound calls to voicemail, missed calls, and after-hours dead ends. 67% of callers won't leave a voicemail, and 78% hire the first business that responds. This translates to $100K-$500K in lost annual revenue for a typical SMB.

### Proposed Solution
A self-serve AI voice platform that lets service businesses deploy intelligent voice agents in minutes. Start with an industry template, customize the persona and workflows, and go live with a phone number that handles calls 24/7 — booking appointments, triaging emergencies, capturing leads, and triggering follow-up automations.

### Success Criteria
| Metric | Target | Timeframe |
|--------|--------|-----------|
| Time to first call handled | < 15 minutes | At signup |
| Call answer rate | 100% (vs. industry avg 52%) | Ongoing |
| Lead capture rate | > 80% of qualified callers | Ongoing |
| Customer activation | 70% deploy agent within 24h | Day 1 |
| Monthly churn | < 5% | Month 3+ |
| NPS | > 50 | Month 3+ |

---

## 2. User Experience & Functionality

### User Personas

**Primary: Small Business Owner (Sarah)**
- Owns a 3-location dental practice
- Spends $4,500/month on front desk staff for phones
- Loses 8-12 new patient calls per week to voicemail
- Tech-savvy enough to use Calendly, not enough to build AI
- Needs: Simple setup, reliable 24/7 coverage, appointment booking

**Secondary: Office Manager (Marcus)**
- Manages operations for a plumbing company
- Handles dispatch and scheduling
- Frustrated by after-hours emergency calls going to voicemail
- Needs: Emergency triage, lead capture, team notifications

**Tertiary: Multi-Location Operator (Jennifer)**
- Manages 15 med spa locations
- Needs consistent brand voice across all locations
- Wants centralized analytics and management
- Needs: Multi-agent management, white-label options, API access

### User Stories

#### Onboarding & Setup
| Story | Acceptance Criteria |
|-------|---------------------|
| As a new user, I want to sign up and deploy my first agent in under 15 minutes | - Email/Google signup < 30 seconds<br>- Template selection shows 8+ industries<br>- Wizard completes in 4 steps<br>- Phone number provisioned automatically |
| As a business owner, I want to customize my agent's personality to match my brand | - Editable greeting script with preview<br>- Persona prompt with character limit guidance<br>- Voice selection with audio samples<br>- Company name auto-populated throughout |
| As a user, I want to add my business knowledge so the agent answers accurately | - FAQ upload (paste or file)<br>- Service/pricing information entry<br>- Business hours configuration<br>- Transfer number for escalations |

#### Call Handling
| Story | Acceptance Criteria |
|-------|---------------------|
| As a caller, I want my call answered immediately with a professional greeting | - Answer within 2 rings<br>- Natural-sounding voice (not robotic)<br>- Personalized with business name |
| As a business owner, I want emergency calls prioritized and routed appropriately | - Configurable urgency keywords<br>- Immediate SMS/email alerts for emergencies<br>- Option to transfer to on-call number |
| As a caller, I want to book an appointment without waiting | - Calendar integration (Google, Calendly, Cal.com)<br>- Real-time availability check<br>- Confirmation SMS sent to caller |

#### CRM & Contacts
| Story | Acceptance Criteria |
|-------|---------------------|
| As a user, I want all caller information captured automatically | - Phone number, name extraction<br>- Call reason/intent classification<br>- Transcript and summary saved<br>- Contact created or updated in CRM |
| As a user, I want to add notes and track lead status | - Note input with timestamp<br>- Status pipeline (new → contacted → qualified → won/lost)<br>- Tag system for organization |
| As a user, I want to search and filter my contacts | - Full-text search across all fields<br>- Filter by status, date, tags<br>- Export to CSV |

#### Workflows & Automation
| Story | Acceptance Criteria |
|-------|---------------------|
| As a user, I want automatic follow-up when a lead is captured | - Trigger: call_completed with lead captured<br>- Action: send SMS with template<br>- Configurable delay (immediate, 5 min, 1 hour) |
| As a user, I want to recover missed call opportunities | - Trigger: missed_call or voicemail<br>- Action: send "Sorry we missed you" SMS<br>- Include callback link or booking link |
| As a user, I want my team notified of important calls | - Trigger: urgency keywords detected<br>- Action: SMS/email to specified team member<br>- Include call summary and callback number |

#### Analytics & Reporting
| Story | Acceptance Criteria |
|-------|---------------------|
| As a user, I want to see my call volume and trends | - Daily/weekly/monthly call counts<br>- Peak hours visualization<br>- Missed vs. answered breakdown |
| As a user, I want to measure my lead capture effectiveness | - Leads captured per period<br>- Conversion rate (calls → leads)<br>- Source attribution |
| As a user, I want to review call recordings and transcripts | - Playable recordings in browser<br>- Searchable transcripts<br>- Sentiment and intent labels |

### Non-Goals (v1.0)

- **Outbound calling campaigns** — Focus on inbound first
- **Multi-language support** — English only for MVP
- **Custom voice cloning** — Use stock TTS voices
- **On-premise deployment** — Cloud-only
- **White-label/reseller features** — Post-launch
- **Video/SMS conversations** — Voice and workflows only
- **Native mobile app** — Web-first, mobile-responsive

---

## 3. AI System Requirements

### Voice AI Engine

**Provider Options:**
| Provider | Latency | Cost | Features | Recommendation |
|----------|---------|------|----------|----------------|
| Vapi | ~500ms | $0.05/min | Full-featured, webhooks, easy integration | **Primary** |
| Retell | ~400ms | $0.05-0.08/min | HIPAA compliant, good voices | Secondary |
| Bland.ai | ~600ms | $0.07/min | Simple API | Backup |

**Selected Stack:**
- **Voice Provider:** Vapi (primary) with Retell fallback
- **LLM:** GPT-4o-mini (cost-effective, fast)
- **TTS:** OpenAI voices (alloy, nova, onyx, shimmer, echo)
- **STT:** Vapi's built-in Deepgram integration

### Knowledge Base / RAG

**Architecture:**
```
User FAQ/Docs → Chunking → Embeddings → pgvector (Supabase)
                                              ↓
Caller Question → Embedding → Similarity Search → Context → LLM → Answer
```

**Requirements:**
- Chunk size: 500 tokens with 100 token overlap
- Embedding model: text-embedding-3-small
- Similarity threshold: 0.7 minimum
- Max context: 4 most relevant chunks

### Intent Classification

**Core Intents:**
| Intent | Keywords/Patterns | Priority |
|--------|-------------------|----------|
| emergency | flood, burst, fire, gas, pain, blood | P0 |
| booking | appointment, schedule, available, book | P1 |
| inquiry | price, cost, how much, do you, can you | P2 |
| status | my appointment, when is, confirm | P2 |
| complaint | unhappy, problem, issue, wrong | P1 |
| other | fallback | P3 |

### Evaluation Strategy

**Quality Metrics:**
| Metric | Target | Measurement |
|--------|--------|-------------|
| Intent accuracy | > 90% | Weekly sample review (50 calls) |
| Booking success rate | > 75% | Attempted bookings → confirmed |
| Emergency detection | 100% | Zero missed emergencies |
| Caller satisfaction | > 4.0/5 | Post-call SMS survey (optional) |
| Hallucination rate | < 5% | Answers not in knowledge base |

**Testing Protocol:**
1. Synthetic test calls before launch (10 scenarios per template)
2. Shadow mode first 24 hours (record but don't act on workflows)
3. Weekly call quality audits (random 5% sample)

---

## 4. Technical Specifications

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        SWARM Voice Platform                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Next.js │    │  Vapi    │    │ Supabase │    │  Twilio  │  │
│  │ Frontend │◄──►│  Voice   │◄──►│ Database │◄──►│   SMS    │  │
│  │   App    │    │  Engine  │    │ + Vector │    │  Email   │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       │               │               │               │         │
│       └───────────────┼───────────────┼───────────────┘         │
│                       │               │                          │
│                 ┌─────┴─────┐   ┌─────┴─────┐                   │
│                 │  Webhooks │   │  Workflow │                   │
│                 │  Handler  │   │  Engine   │                   │
│                 └───────────┘   └───────────┘                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

**Inbound Call:**
```
1. Call → Twilio → Vapi
2. Vapi → STT → User utterance
3. Vapi → Knowledge lookup (Supabase pgvector)
4. Vapi → LLM → Response
5. Vapi → TTS → Audio to caller
6. Call ends → Webhook to our server
7. Webhook → Create/update contact, log call, trigger workflows
```

**Workflow Execution:**
```
1. Trigger event (call_completed, lead_captured, missed_call)
2. Match against active workflows
3. Execute actions in sequence (with delays if configured)
4. Log execution status
5. Retry on failure (3 attempts, exponential backoff)
```

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 16, Tailwind v4 | SSR, fast, modern |
| Backend | Next.js API Routes | Serverless, co-located |
| Database | Supabase PostgreSQL | Auth, RLS, realtime |
| Vector Store | pgvector (Supabase) | No separate service |
| Voice | Vapi | Best DX, fair pricing |
| Telephony | Twilio | Phone numbers, SMS |
| Email | Resend | Simple API, good deliverability |
| Payments | Stripe | Standard, recurring billing |
| Hosting | Vercel | Next.js native, edge functions |
| Auth | Supabase Auth | Integrated with DB |

### Database Schema (Core Tables)

```sql
-- Organizations (multi-tenant)
organizations (id, name, slug, plan, stripe_customer_id, settings)

-- Users
users (id, org_id, email, name, role)

-- Voice Agents
agents (id, org_id, name, template_id, persona, greeting, voice_id, phone_number_id, settings, status)

-- Phone Numbers
phone_numbers (id, org_id, number, twilio_sid, status)

-- CRM
contacts (id, org_id, phone, email, first_name, last_name, status, source, metadata)
contact_notes (id, contact_id, user_id, content, created_at)

-- Calls
calls (id, org_id, agent_id, contact_id, direction, duration_seconds, status, recording_url, transcript, summary, sentiment, intent)

-- Workflows
workflows (id, org_id, name, trigger_type, trigger_config, status)
workflow_actions (id, workflow_id, action_type, action_config, position)
workflow_runs (id, workflow_id, contact_id, status, started_at, completed_at)

-- Messages
messages (id, org_id, contact_id, channel, direction, body, status)
```

### API Endpoints

**Auth:**
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`

**Agents:**
- `GET /api/agents` — List all agents
- `POST /api/agents` — Create agent
- `GET /api/agents/:id` — Get agent details
- `PUT /api/agents/:id` — Update agent
- `DELETE /api/agents/:id` — Delete agent

**Contacts:**
- `GET /api/contacts` — List/search contacts
- `POST /api/contacts` — Create contact
- `GET /api/contacts/:id` — Get contact with history
- `PUT /api/contacts/:id` — Update contact
- `POST /api/contacts/:id/notes` — Add note

**Calls:**
- `GET /api/calls` — List calls with filters
- `GET /api/calls/:id` — Get call details
- `GET /api/calls/:id/recording` — Stream recording
- `GET /api/calls/:id/transcript` — Get transcript

**Workflows:**
- `GET /api/workflows` — List workflows
- `POST /api/workflows` — Create workflow
- `PUT /api/workflows/:id` — Update workflow
- `POST /api/workflows/:id/test` — Test workflow

**Webhooks (Internal):**
- `POST /api/webhooks/vapi` — Vapi call events
- `POST /api/webhooks/twilio` — Twilio SMS events

### Integration Points

**Vapi Integration:**
- Webhook URL: `https://app.swarmvoice.ai/api/webhooks/vapi`
- Events: call.started, call.ended, transcript.updated
- Auth: HMAC signature verification

**Twilio Integration:**
- Phone number provisioning via API
- SMS sending for workflows
- Webhook for inbound SMS

**Calendar Integration (Phase 2):**
- Google Calendar OAuth
- Cal.com API
- Calendly API

### Security & Privacy

**Data Protection:**
- All data encrypted at rest (Supabase default)
- TLS 1.3 for all connections
- Call recordings encrypted, access-logged

**Authentication:**
- Supabase Auth (email/password, Google OAuth)
- Session tokens with 7-day expiry
- Row-level security on all tables

**Compliance Considerations:**
- HIPAA: Vapi and Retell both offer BAAs (important for medical/dental)
- TCPA: SMS opt-in tracking, quiet hours enforcement
- GDPR: Data export, deletion capabilities

**PII Handling:**
- Phone numbers: stored, used for contact matching
- Call recordings: 90-day retention default, configurable
- Transcripts: stored indefinitely, searchable
- No credit card data stored (Stripe handles)

---

## 5. Risks & Roadmap

### Phased Rollout

**Phase 1: MVP (Week 1-2)**
- User auth and onboarding
- Agent creation wizard with 8 templates
- Vapi integration for call handling
- Basic CRM (contacts, notes, call history)
- Simple dashboard with stats
- Manual phone number assignment

**Phase 2: Automation (Week 3-4)**
- Workflow builder UI
- SMS follow-up actions
- Email notifications
- Missed call recovery automation
- Knowledge base upload

**Phase 3: Polish (Week 5-6)**
- Self-serve phone number provisioning
- Calendar integrations
- Advanced analytics
- Mobile-responsive refinements
- Onboarding email sequence

**Phase 4: Scale (Month 2-3)**
- Multi-agent management
- Team seats and permissions
- API access for power users
- Zapier/Make integrations
- Usage-based billing implementation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Vapi latency spikes | Medium | High | Implement Retell fallback, monitor latency |
| LLM hallucinations | Medium | High | Strong system prompts, knowledge grounding, human review |
| Twilio number shortage | Low | Medium | Pre-provision numbers, multi-region |
| Supabase rate limits | Low | Medium | Connection pooling, caching |
| Voice quality complaints | Medium | Medium | Multiple voice options, quality testing |

### Cost Projections

**Per-Customer Unit Economics (Pro Plan @ $249/mo):**
| Cost Item | Estimate | Notes |
|-----------|----------|-------|
| Vapi (2,000 min) | $100 | $0.05/min |
| Twilio number | $2 | Monthly |
| Twilio SMS (100) | $1 | $0.0075/segment |
| Supabase (allocated) | $5 | Shared infrastructure |
| Vercel (allocated) | $3 | Shared infrastructure |
| **Total COGS** | **$111** | |
| **Gross Margin** | **$138 (55%)** | |

### Success Milestones

| Milestone | Target Date | Criteria |
|-----------|-------------|----------|
| MVP Live | Week 2 | First external user handles a call |
| 10 Beta Users | Week 4 | Active, providing feedback |
| First Paid Customer | Week 6 | $249/mo collected |
| $5K MRR | Month 2 | ~20 paying customers |
| $15K MRR | Month 3 | ~60 paying customers |

---

## 6. Open Questions

1. **Pricing tiers:** Is $99/$249/$499 the right split? Need usage data to validate.
2. **HIPAA certification:** Do we pursue BAA with Vapi/Retell for healthcare vertical?
3. **White-label:** Timeline for agency/reseller features?
4. **Outbound:** When do we add outbound calling campaigns?
5. **Mobile app:** Native iOS/Android or PWA-only?

---

## Appendix A: Industry Templates

| Template | Key Capabilities | Urgency Keywords |
|----------|------------------|------------------|
| Plumbing | Emergency dispatch, scheduling | flood, burst, leak, sewage |
| HVAC | Seasonal triage, maintenance | no heat, no AC, freezing |
| Dental | New patient intake, insurance | pain, emergency, broken |
| Med Spa | Consultation booking | event, wedding, special |
| Legal | Case intake, qualification | arrested, accident, deadline |
| Real Estate | Lead qualification, showings | pre-approved, relocating |
| Auto Repair | Service scheduling, status | broke down, won't start |
| Insurance | Quote intake, claims | accident, claim, damage |

---

## Appendix B: Competitor Comparison

| Feature | SWARM | Smith.ai | Ruby | Bland.ai |
|---------|-------|----------|------|----------|
| AI-powered | ✅ Full | ❌ Human | ❌ Human | ✅ Full |
| Self-serve setup | ✅ | ❌ | ❌ | ✅ |
| Workflow automation | ✅ | ❌ | ❌ | ❌ |
| Built-in CRM | ✅ | ❌ | ❌ | ❌ |
| Industry templates | ✅ 8 | ❌ | ❌ | ❌ |
| Starting price | $99/mo | $255/mo | $199/mo | Pay-per-use |

---

*Document ends. Ready for review and iteration.*
