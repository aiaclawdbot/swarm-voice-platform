-- SWARM Voice Platform - Full Schema
-- Self-serve voice AI platform with CRM and workflow automation

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- ============================================
-- CORE: Users & Organizations
-- ============================================

create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  industry text, -- plumbing, dental, legal, etc.
  timezone text default 'America/New_York',
  settings jsonb default '{}',
  plan text default 'starter', -- starter, growth, scale, enterprise
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  avatar_url text,
  org_id uuid references organizations(id) on delete cascade,
  role text default 'member', -- owner, admin, member
  settings jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_users_org on users(org_id);
create index idx_users_email on users(email);

-- ============================================
-- VOICE: Agents & Phone Numbers
-- ============================================

create table phone_numbers (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  number text not null,
  twilio_sid text,
  friendly_name text,
  status text default 'active', -- active, inactive
  created_at timestamptz default now()
);

create index idx_phone_numbers_org on phone_numbers(org_id);

create table agents (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  name text not null,
  template_id text, -- references industry template
  persona text, -- system prompt
  greeting text,
  voice_id text default 'alloy',
  voice_provider text default 'openai', -- openai, elevenlabs, etc.
  model text default 'gpt-4o-mini',
  phone_number_id uuid references phone_numbers(id),
  settings jsonb default '{}', -- max_duration, transfer_number, etc.
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_agents_org on agents(org_id);

-- ============================================
-- KNOWLEDGE BASE
-- ============================================

create table knowledge_bases (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  agent_id uuid references agents(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table knowledge_documents (
  id uuid primary key default uuid_generate_v4(),
  knowledge_base_id uuid references knowledge_bases(id) on delete cascade,
  title text not null,
  content text,
  source_url text,
  embedding vector(1536),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index idx_knowledge_docs_kb on knowledge_documents(knowledge_base_id);
create index idx_knowledge_docs_embedding on knowledge_documents using ivfflat (embedding vector_cosine_ops);

-- ============================================
-- CRM: Contacts & Notes
-- ============================================

create table contacts (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  phone text,
  email text,
  first_name text,
  last_name text,
  company text,
  status text default 'new', -- new, contacted, qualified, won, lost
  source text, -- inbound_call, website, manual, import
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_contacts_org on contacts(org_id);
create index idx_contacts_phone on contacts(phone);
create index idx_contacts_email on contacts(email);
create index idx_contacts_status on contacts(org_id, status);

create table contact_tags (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  name text not null,
  color text default '#6366f1',
  created_at timestamptz default now()
);

create table contact_tag_assignments (
  contact_id uuid references contacts(id) on delete cascade,
  tag_id uuid references contact_tags(id) on delete cascade,
  primary key (contact_id, tag_id)
);

create table contact_notes (
  id uuid primary key default uuid_generate_v4(),
  contact_id uuid references contacts(id) on delete cascade,
  user_id uuid references users(id),
  content text not null,
  created_at timestamptz default now()
);

create index idx_contact_notes_contact on contact_notes(contact_id);

-- ============================================
-- CALLS & MESSAGES
-- ============================================

create table calls (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  agent_id uuid references agents(id),
  contact_id uuid references contacts(id),
  phone_number_id uuid references phone_numbers(id),
  direction text not null, -- inbound, outbound
  caller_number text,
  duration_seconds integer default 0,
  status text, -- completed, missed, voicemail, transferred
  recording_url text,
  transcript text,
  summary text, -- AI-generated summary
  sentiment text, -- positive, neutral, negative
  intent text, -- booking, inquiry, complaint, etc.
  metadata jsonb default '{}',
  vapi_call_id text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

create index idx_calls_org on calls(org_id);
create index idx_calls_contact on calls(contact_id);
create index idx_calls_agent on calls(agent_id);
create index idx_calls_created on calls(org_id, created_at desc);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  contact_id uuid references contacts(id),
  channel text not null, -- sms, email
  direction text not null, -- inbound, outbound
  from_address text,
  to_address text,
  subject text, -- for emails
  body text not null,
  status text default 'sent', -- sent, delivered, failed, received
  twilio_sid text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index idx_messages_org on messages(org_id);
create index idx_messages_contact on messages(contact_id);

-- ============================================
-- WORKFLOWS
-- ============================================

create table workflows (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  name text not null,
  description text,
  trigger_type text not null, -- call_completed, lead_captured, missed_call, manual
  trigger_config jsonb default '{}',
  status text default 'active', -- active, paused, draft
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_workflows_org on workflows(org_id);

create table workflow_actions (
  id uuid primary key default uuid_generate_v4(),
  workflow_id uuid references workflows(id) on delete cascade,
  action_type text not null, -- send_sms, send_email, add_note, update_contact, webhook, wait
  action_config jsonb not null, -- template, delay, url, etc.
  position integer default 0,
  created_at timestamptz default now()
);

create index idx_workflow_actions_workflow on workflow_actions(workflow_id);

create table workflow_runs (
  id uuid primary key default uuid_generate_v4(),
  workflow_id uuid references workflows(id) on delete cascade,
  contact_id uuid references contacts(id),
  trigger_event jsonb, -- the event that triggered this run
  status text default 'running', -- running, completed, failed
  current_action integer default 0,
  error text,
  started_at timestamptz default now(),
  completed_at timestamptz
);

create index idx_workflow_runs_workflow on workflow_runs(workflow_id);
create index idx_workflow_runs_status on workflow_runs(status);

-- ============================================
-- USAGE & BILLING
-- ============================================

create table usage_records (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  record_type text not null, -- call_minutes, sms_sent, sms_received
  quantity integer default 1,
  metadata jsonb default '{}',
  recorded_at timestamptz default now()
);

create index idx_usage_org_date on usage_records(org_id, recorded_at);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger organizations_updated_at before update on organizations
  for each row execute function update_updated_at();

create trigger users_updated_at before update on users
  for each row execute function update_updated_at();

create trigger agents_updated_at before update on agents
  for each row execute function update_updated_at();

create trigger contacts_updated_at before update on contacts
  for each row execute function update_updated_at();

create trigger workflows_updated_at before update on workflows
  for each row execute function update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table organizations enable row level security;
alter table users enable row level security;
alter table agents enable row level security;
alter table phone_numbers enable row level security;
alter table contacts enable row level security;
alter table contact_notes enable row level security;
alter table calls enable row level security;
alter table messages enable row level security;
alter table workflows enable row level security;
alter table workflow_actions enable row level security;

-- Policies will be added when auth is implemented
-- For now, service role bypasses RLS

-- ============================================
-- SEED DATA: Default workflow templates
-- ============================================

-- These will be inserted per-org on signup based on industry
