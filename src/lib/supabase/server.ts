import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Server-side client with service role (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Type definitions
export interface Organization {
  id: string
  name: string
  slug: string
  industry?: string
  timezone: string
  settings: Record<string, unknown>
  plan: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  org_id: string
  role: 'owner' | 'admin' | 'member'
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  org_id: string
  name: string
  template_id?: string
  persona?: string
  greeting?: string
  voice_id: string
  voice_provider: string
  model: string
  phone_number_id?: string
  vapi_assistant_id?: string
  settings: Record<string, unknown>
  status: 'active' | 'inactive' | 'draft'
  created_at: string
  updated_at: string
}

export interface PhoneNumber {
  id: string
  org_id: string
  number: string
  twilio_sid?: string
  vapi_phone_id?: string
  friendly_name?: string
  status: 'active' | 'inactive'
  created_at: string
}

export interface Contact {
  id: string
  org_id: string
  phone?: string
  email?: string
  first_name?: string
  last_name?: string
  company?: string
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost'
  source?: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Call {
  id: string
  org_id: string
  agent_id?: string
  contact_id?: string
  phone_number_id?: string
  direction: 'inbound' | 'outbound'
  caller_number?: string
  duration_seconds: number
  status?: string
  recording_url?: string
  transcript?: string
  summary?: string
  sentiment?: string
  intent?: string
  metadata: Record<string, unknown>
  vapi_call_id?: string
  started_at?: string
  ended_at?: string
  created_at: string
}

export interface Workflow {
  id: string
  org_id: string
  name: string
  description?: string
  trigger_type: 'call_completed' | 'lead_captured' | 'missed_call' | 'manual'
  trigger_config: Record<string, unknown>
  status: 'active' | 'paused' | 'draft'
  created_at: string
  updated_at: string
}

export interface WorkflowAction {
  id: string
  workflow_id: string
  action_type: 'send_sms' | 'send_email' | 'add_note' | 'update_contact' | 'webhook' | 'wait'
  action_config: Record<string, unknown>
  position: number
  created_at: string
}
