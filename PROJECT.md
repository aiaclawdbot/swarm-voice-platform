# SWARM Voice Platform

## Vision
**Self-serve AI voice platform for service businesses** — simple to start, powerful to customize.

**Target:** End users (plumbers, dentists, lawyers, med spas, etc.) who want AI voice agents without technical complexity.

**Philosophy:** Get started in 5 minutes with a template. Customize workflows, CRM, and automations as you grow.

## Core Features

### 1. Voice Agent Builder
- Industry templates (plumbing, HVAC, dental, legal, real estate, etc.)
- Custom persona & greeting editor
- Knowledge base upload (FAQs, services, pricing)
- Voice selection (multiple TTS options)
- Call routing rules

### 2. Workflow Automation
- **Triggers:** Call completed, lead captured, appointment booked, missed call
- **Actions:**
  - Send SMS to caller
  - Send email to caller
  - Add note to contact
  - Update contact status
  - Notify team member
  - Webhook to external system
- Visual workflow builder (drag & drop)
- Pre-built workflow templates per industry

### 3. Light CRM
- Contact management
- Contact notes & history
- Call history per contact
- Lead status tracking (new → contacted → qualified → won/lost)
- Tag system
- Search & filter

### 4. Communication Center
- SMS conversations (two-way)
- Email templates
- Call recordings & transcripts
- Unified inbox view

### 5. Analytics
- Call volume & duration
- Lead capture rate
- Response time metrics
- Workflow performance
- Revenue attribution (optional)

### 6. Integrations
- Twilio (voice & SMS)
- SendGrid/Resend (email)
- Google Calendar (appointments)
- Zapier/Make (connect anything)
- Webhooks (custom integrations)

## Tech Stack
- **Frontend:** Next.js 16 + Tailwind v4
- **Backend:** Next.js API routes + Supabase
- **Database:** Supabase PostgreSQL + pgvector
- **Voice:** Vapi or Retell
- **SMS:** Twilio
- **Email:** Resend
- **Auth:** Supabase Auth
- **Payments:** Stripe

## Data Models

### Core
- `users` — Platform users (business owners/teams)
- `organizations` — Business accounts (multi-user support)
- `agents` — Voice agent configurations
- `phone_numbers` — Provisioned Twilio numbers

### CRM
- `contacts` — Callers/leads with full profile
- `contact_notes` — Notes attached to contacts
- `contact_tags` — Tag system for organization
- `calls` — Call records with transcripts
- `messages` — SMS & email history

### Workflows
- `workflows` — Workflow definitions
- `workflow_triggers` — Event triggers
- `workflow_actions` — Actions to execute
- `workflow_runs` — Execution history

### Knowledge
- `knowledge_bases` — Per-agent knowledge stores
- `knowledge_documents` — Documents with embeddings

## Pricing (Planned)
- **Starter:** $99/mo — 1 agent, 500 minutes, basic CRM
- **Growth:** $249/mo — 3 agents, 2,000 minutes, workflows
- **Scale:** $499/mo — Unlimited agents, 5,000 minutes, full automation
- **Enterprise:** Custom — Volume pricing, dedicated support

## Roadmap

### Phase 1: Foundation (Week 1)
- [x] Project setup
- [x] Database schema
- [x] Industry templates
- [x] Landing page
- [ ] User auth (Supabase)
- [ ] Organization setup flow
- [ ] Agent configuration wizard
- [ ] Phone number provisioning

### Phase 2: Core Product (Week 2)
- [ ] Vapi/Retell integration
- [ ] Call handling & logging
- [ ] Basic CRM (contacts, notes)
- [ ] SMS notifications
- [ ] Call transcript viewer

### Phase 3: Workflows (Week 3)
- [ ] Workflow builder UI
- [ ] Trigger system
- [ ] Action execution engine
- [ ] Pre-built workflow templates

### Phase 4: Polish (Week 4)
- [ ] Analytics dashboard
- [ ] Settings & billing
- [ ] Onboarding flow
- [ ] Documentation

---
*Updated: 2026-02-06*
*Pivot: From ops-only to self-serve end-user product*
