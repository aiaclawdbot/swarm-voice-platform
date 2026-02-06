# SWARM Voice Platform Context

**Last Updated:** 2026-02-06 03:10 GMT+1

## Project Overview
Multi-tenant AI voice platform for delivering managed AI voice agent services.

**Business Model:** $5K setup + $3K/mo managed service
**Live URL:** https://swarm-voice-platform.vercel.app

## Current State
- **Version:** v0.2 (market-ready UI)
- **Status:** Deployed to Vercel
- **Database:** Using Ontos Supabase project temporarily

## What's Built

### Pages
- `/` — Marketing landing page with stats, features, industry templates
- `/ops` — Dashboard with call/lead activity, stats, quick actions
- `/ops/clients` — Client list with CRUD, MRR tracking
- `/ops/clients/[id]` — Client detail with calls, leads, settings
- `/ops/clients/[id]/agent` — 4-step agent config wizard
- `/ops/templates` — Template browser with preview

### API Routes
- `GET/POST /api/clients` — List/create clients
- `GET/PATCH/DELETE /api/clients/[id]` — Client CRUD
- `GET/POST /api/clients/[id]/agents` — Agent management

### Template System (8 industries)
1. 🔧 Plumbing — Emergency dispatch, service scheduling
2. ❄️ HVAC — Temperature triage, maintenance
3. 🦷 Dental — New patient intake, emergencies
4. 💆 Med Spa — Consultation booking, treatment FAQs
5. ⚖️ Legal — Case intake qualification
6. 🏠 Real Estate — Lead qualification, showings
7. 🚗 Auto Repair — Service scheduling, status updates
8. 🛡️ Insurance — Quote intake, claims routing

Each template includes:
- Full persona/system prompt
- Greeting script
- Key capabilities
- Urgency detection keywords
- Lead field definitions
- Suggested voice

## Tech Stack
- Next.js 16 + Tailwind v4
- Supabase (PostgreSQL + pgvector)
- Ready for: Twilio, Vapi/Retell integration

## Next Steps
1. Run schema.sql in dedicated Supabase project
2. Add Twilio phone number provisioning
3. Integrate Vapi/Retell for voice
4. Add webhook endpoints for call events
5. Build notification system (SMS/email)

## Key Files
- `src/lib/templates.ts` — All 8 industry templates
- `src/lib/supabase.ts` — Database client
- `supabase/schema.sql` — Database schema (not yet applied)
- `.env.local` — Environment variables
