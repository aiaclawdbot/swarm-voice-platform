-- Migration: Add RLS policies and missing indexes
-- Critical fixes from Architect review

-- ============================================
-- RLS POLICIES
-- ============================================

-- Organizations: Users can only see their own org
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (
    id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Owners can update organization"
  ON organizations FOR UPDATE
  USING (
    id IN (SELECT org_id FROM users WHERE id = auth.uid() AND role = 'owner')
  );

-- Users: Can only see users in same org
CREATE POLICY "Users can view org members"
  ON users FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Agents: Org-scoped access
CREATE POLICY "Org members can view agents"
  ON agents FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Org admins can manage agents"
  ON agents FOR ALL
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Phone Numbers: Org-scoped
CREATE POLICY "Org members can view phone numbers"
  ON phone_numbers FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Org admins can manage phone numbers"
  ON phone_numbers FOR ALL
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Contacts: Org-scoped
CREATE POLICY "Org members can view contacts"
  ON contacts FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Org members can manage contacts"
  ON contacts FOR ALL
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

-- Calls: Org-scoped (read-only for most)
CREATE POLICY "Org members can view calls"
  ON calls FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

-- Messages: Org-scoped
CREATE POLICY "Org members can view messages"
  ON messages FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

-- Workflows: Org-scoped
CREATE POLICY "Org members can view workflows"
  ON workflows FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Org admins can manage workflows"
  ON workflows FOR ALL
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- ============================================
-- MISSING INDEXES (Performance critical)
-- ============================================

-- Calls: High-volume queries
CREATE INDEX IF NOT EXISTS idx_calls_vapi_call_id ON calls(vapi_call_id);
CREATE INDEX IF NOT EXISTS idx_calls_org_created_desc ON calls(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_contact_created ON calls(contact_id, created_at DESC);

-- Contacts: Search and lookup
CREATE INDEX IF NOT EXISTS idx_contacts_org_status ON contacts(org_id, status);
CREATE INDEX IF NOT EXISTS idx_contacts_org_created_desc ON contacts(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_phone_org ON contacts(phone, org_id);

-- Messages: Lookup
CREATE INDEX IF NOT EXISTS idx_messages_contact_created ON messages(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_twilio_sid ON messages(twilio_sid);

-- Workflow runs: Status queries
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status_started ON workflow_runs(status, started_at);

-- Agents: Vapi lookup (critical for webhooks)
CREATE INDEX IF NOT EXISTS idx_agents_vapi_assistant_id ON agents(vapi_assistant_id);

-- Usage records: Billing queries
CREATE INDEX IF NOT EXISTS idx_usage_org_type_recorded ON usage_records(org_id, record_type, recorded_at);

-- ============================================
-- WEBHOOK IDEMPOTENCY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, event_type)
);

CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);

-- Auto-cleanup old events (keep 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS void AS $$
BEGIN
  DELETE FROM webhook_events WHERE processed_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SMS OPT-OUT TABLE (TCPA Compliance)
-- ============================================

CREATE TABLE IF NOT EXISTS sms_opt_outs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  opted_out_at TIMESTAMPTZ DEFAULT now(),
  reason TEXT,
  UNIQUE(phone, org_id)
);

CREATE INDEX idx_sms_opt_outs_phone ON sms_opt_outs(phone);

-- ============================================
-- AUDIT LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_log_org_created ON audit_log(org_id, created_at DESC);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
