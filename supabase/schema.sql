-- SWARM Voice Platform Schema
-- Multi-tenant AI voice agent platform

-- Enable pgvector extension
create extension if not exists vector;

-- ============================================
-- CLIENTS
-- ============================================
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null,
  email text not null,
  phone text,
  status text not null default 'active' check (status in ('active', 'paused', 'churned', 'onboarding')),
  plan text not null default 'starter' check (plan in ('starter', 'pro', 'enterprise')),
  settings jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- PHONE NUMBERS
-- ============================================
create table phone_numbers (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  number text not null unique,
  twilio_sid text,
  friendly_name text,
  status text not null default 'active' check (status in ('active', 'inactive', 'pending')),
  capabilities jsonb default '{"voice": true, "sms": true}',
  created_at timestamptz default now()
);

-- ============================================
-- KNOWLEDGE BASES
-- ============================================
create table knowledge_bases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  knowledge_base_id uuid references knowledge_bases(id) on delete cascade,
  title text not null,
  content text not null,
  source_url text,
  metadata jsonb default '{}',
  embedding vector(1536),
  created_at timestamptz default now()
);

-- Index for similarity search
create index on knowledge_documents using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ============================================
-- AGENTS
-- ============================================
create table agents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  knowledge_base_id uuid references knowledge_bases(id),
  name text not null,
  persona text, -- System prompt / personality
  greeting text, -- Initial greeting
  voice_id text, -- ElevenLabs or provider voice ID
  model text default 'gpt-4o-mini',
  provider text default 'vapi' check (provider in ('vapi', 'retell', 'custom')),
  provider_agent_id text, -- External agent ID
  settings jsonb default '{}',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- CALLS
-- ============================================
create table calls (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  agent_id uuid references agents(id),
  phone_number_id uuid references phone_numbers(id),
  direction text not null check (direction in ('inbound', 'outbound')),
  caller_number text,
  callee_number text,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'failed', 'no_answer', 'busy')),
  duration_seconds integer,
  recording_url text,
  transcript text,
  summary text,
  outcome text check (outcome in ('lead_captured', 'appointment_booked', 'transferred', 'voicemail', 'hangup', 'other')),
  metadata jsonb default '{}',
  provider_call_id text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- LEADS
-- ============================================
create table leads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  call_id uuid references calls(id),
  name text,
  phone text,
  email text,
  company text,
  intent text, -- What they were calling about
  notes text,
  urgency text check (urgency in ('low', 'medium', 'high', 'emergency')),
  status text default 'new' check (status in ('new', 'notified', 'contacted', 'converted', 'lost')),
  notified_at timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table notifications (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  lead_id uuid references leads(id),
  call_id uuid references calls(id),
  type text not null check (type in ('sms', 'email', 'webhook')),
  recipient text not null,
  subject text,
  body text,
  status text default 'pending' check (status in ('pending', 'sent', 'failed')),
  sent_at timestamptz,
  error text,
  created_at timestamptz default now()
);

-- ============================================
-- USAGE & BILLING
-- ============================================
create table usage_records (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  total_calls integer default 0,
  total_minutes numeric(10,2) default 0,
  total_sms integer default 0,
  total_emails integer default 0,
  voice_cost numeric(10,4) default 0,
  sms_cost numeric(10,4) default 0,
  total_cost numeric(10,4) default 0,
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_calls_client on calls(client_id);
create index idx_calls_created on calls(created_at desc);
create index idx_leads_client on leads(client_id);
create index idx_leads_status on leads(status);
create index idx_phone_numbers_client on phone_numbers(client_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_updated_at before update on clients
  for each row execute function update_updated_at();

create trigger knowledge_bases_updated_at before update on knowledge_bases
  for each row execute function update_updated_at();

create trigger agents_updated_at before update on agents
  for each row execute function update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (for future client portal)
-- ============================================
alter table clients enable row level security;
alter table phone_numbers enable row level security;
alter table knowledge_bases enable row level security;
alter table knowledge_documents enable row level security;
alter table agents enable row level security;
alter table calls enable row level security;
alter table leads enable row level security;
alter table notifications enable row level security;
alter table usage_records enable row level security;
