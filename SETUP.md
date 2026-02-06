# SWARM Voice Platform - Setup Guide

## 1. Supabase Database Setup

The schema needs to be applied to Supabase. 

### Option A: Via Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/rvnyntopwrciyrmsifgy/sql/new
2. Copy the contents of `supabase/schema-v2.sql`
3. Paste and click "Run"

### Option B: Via Supabase CLI
```bash
# Login first
supabase login

# Link project
supabase link --project-ref rvnyntopwrciyrmsifgy

# Push schema
supabase db push
```

## 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://rvnyntopwrciyrmsifgy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>

# Vapi (required for voice)
VAPI_API_KEY=<your vapi key>

# Twilio (required for phone numbers)
TWILIO_ACCOUNT_SID=<your sid>
TWILIO_AUTH_TOKEN=<your token>

# OpenAI (for embeddings)
OPENAI_API_KEY=<your key>

# Resend (for emails)
RESEND_API_KEY=<your key>

# App URL (for webhooks)
NEXT_PUBLIC_APP_URL=https://swarm-voice-platform.vercel.app
```

## 3. Vapi Setup

1. Create account at https://vapi.ai
2. Get API key from dashboard
3. Set webhook URL to: `https://swarm-voice-platform.vercel.app/api/webhooks/vapi`

## 4. Twilio Setup

1. Create account at https://twilio.com
2. Get Account SID and Auth Token
3. Purchase phone numbers for each organization

## 5. Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 6. Deploying

Already deployed to Vercel:
- Production: https://swarm-voice-platform.vercel.app
- Dashboard: https://vercel.com/aia1/swarm-voice-platform
