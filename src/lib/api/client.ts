/**
 * API Client for SWARM Voice Platform
 * Provides typed methods for all API endpoints
 */

// Base configuration
const API_BASE = '/api'

// For MVP, we'll use a hardcoded org ID (would come from auth in production)
let currentOrgId: string | null = null

export function setOrgId(orgId: string) {
  currentOrgId = orgId
  if (typeof window !== 'undefined') {
    localStorage.setItem('swarm_org_id', orgId)
  }
}

export function getOrgId(): string | null {
  if (currentOrgId) return currentOrgId
  if (typeof window !== 'undefined') {
    return localStorage.getItem('swarm_org_id')
  }
  return null
}

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const orgId = getOrgId()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  
  if (orgId) {
    headers['x-org-id'] = orgId
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `API error: ${response.status}`)
  }

  return response.json()
}

// ============================================
// Organization API
// ============================================

export interface Organization {
  id: string
  name: string
  slug: string
  industry?: string
  timezone: string
  plan: string
  settings: Record<string, unknown>
}

export const organizationApi = {
  create: (data: { 
    name: string
    industry?: string
    timezone?: string
    user_email: string
    user_name?: string 
  }) => apiFetch<{ organization: Organization }>('/organizations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  get: () => apiFetch<{ organization: Organization; usage: Record<string, number> }>('/organizations'),

  update: (data: Partial<Organization>) => apiFetch<{ organization: Organization }>('/organizations', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
}

// ============================================
// Agents API
// ============================================

export interface Agent {
  id: string
  name: string
  template_id?: string
  persona?: string
  greeting?: string
  voice_id: string
  voice_provider: string
  model: string
  phone_number_id?: string
  vapi_assistant_id?: string
  status: 'active' | 'inactive' | 'draft'
  phone_number?: {
    id: string
    number: string
    friendly_name?: string
  }
}

export const agentsApi = {
  list: () => apiFetch<{ agents: Agent[] }>('/agents'),

  get: (id: string) => apiFetch<{ agent: Agent }>(`/agents/${id}`),

  create: (data: Partial<Agent>) => apiFetch<{ agent: Agent }>('/agents', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  createFromTemplate: (data: { 
    template_id: string
    company_name: string
    customizations?: Record<string, unknown>
  }) => apiFetch<{ agent: Agent; message: string; next_steps: string[] }>('/agents/from-template', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id: string, data: Partial<Agent>) => apiFetch<{ agent: Agent }>(`/agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id: string) => apiFetch<{ success: boolean }>(`/agents/${id}`, {
    method: 'DELETE',
  }),

  uploadKnowledge: (id: string, data: { content: string; title?: string }) => 
    apiFetch<{ success: boolean; chunks_created: number }>(`/agents/${id}/knowledge`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  testCall: (id: string, phoneNumber: string) => 
    apiFetch<{ success: boolean; call_id: string; message: string }>(`/agents/${id}/test-call`, {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber }),
    }),

  getTestCallStatus: (id: string, callId: string) =>
    apiFetch<{ status: string; duration_seconds?: number; summary?: string }>(`/agents/${id}/test-call?call_id=${callId}`),
}

// ============================================
// Contacts API
// ============================================

export interface Contact {
  id: string
  phone?: string
  email?: string
  first_name?: string
  last_name?: string
  company?: string
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost'
  source?: string
  created_at: string
}

export const contactsApi = {
  list: (params?: { status?: string; search?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.search) searchParams.set('search', params.search)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    const query = searchParams.toString()
    return apiFetch<{ contacts: Contact[]; total: number }>(`/contacts${query ? `?${query}` : ''}`)
  },

  get: (id: string) => apiFetch<{ contact: Contact; activity: Array<Record<string, unknown>> }>(`/contacts/${id}`),

  create: (data: Partial<Contact>) => apiFetch<{ contact: Contact }>('/contacts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id: string, data: Partial<Contact>) => apiFetch<{ contact: Contact }>(`/contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id: string) => apiFetch<{ success: boolean }>(`/contacts/${id}`, {
    method: 'DELETE',
  }),
}

// ============================================
// Calls API
// ============================================

export interface Call {
  id: string
  direction: 'inbound' | 'outbound'
  caller_number?: string
  duration_seconds: number
  status?: string
  intent?: string
  sentiment?: string
  summary?: string
  transcript?: string
  recording_url?: string
  created_at: string
  agent?: { id: string; name: string }
  contact?: { id: string; first_name?: string; last_name?: string; phone?: string }
}

export const callsApi = {
  list: (params?: { agentId?: string; contactId?: string; status?: string; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.agentId) searchParams.set('agentId', params.agentId)
    if (params?.contactId) searchParams.set('contactId', params.contactId)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    const query = searchParams.toString()
    return apiFetch<{ calls: Call[]; total: number }>(`/calls${query ? `?${query}` : ''}`)
  },
  
  get: (id: string) => apiFetch<{ call: Call }>(`/calls/${id}`),
}

// ============================================
// Phone Numbers API
// ============================================

export interface PhoneNumber {
  id: string
  number: string
  friendly_name?: string
  status: 'active' | 'inactive'
}

export const phoneNumbersApi = {
  list: () => apiFetch<{ phoneNumbers: PhoneNumber[] }>('/phone-numbers'),

  searchAvailable: (params?: { areaCode?: string; contains?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.areaCode) searchParams.set('areaCode', params.areaCode)
    if (params?.contains) searchParams.set('contains', params.contains)
    const query = searchParams.toString()
    return apiFetch<{ numbers: Array<{ number: string; friendly_name: string; locality?: string }> }>(
      `/phone-numbers/available${query ? `?${query}` : ''}`
    )
  },

  provision: (data: { areaCode?: string; agentId?: string }) => 
    apiFetch<{ phoneNumber: PhoneNumber }>('/phone-numbers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ============================================
// Workflows API
// ============================================

export interface Workflow {
  id: string
  name: string
  description?: string
  trigger_type: 'call_completed' | 'lead_captured' | 'missed_call' | 'manual'
  trigger_config: Record<string, unknown>
  status: 'active' | 'paused' | 'draft'
  actions?: WorkflowAction[]
}

export interface WorkflowAction {
  id: string
  action_type: 'send_sms' | 'send_email' | 'add_note' | 'update_contact' | 'webhook' | 'wait'
  action_config: Record<string, unknown>
  position: number
}

export const workflowsApi = {
  list: () => apiFetch<{ workflows: Workflow[] }>('/workflows'),

  get: (id: string) => apiFetch<{ workflow: Workflow }>(`/workflows/${id}`),

  create: (data: Partial<Workflow> & { actions?: Partial<WorkflowAction>[] }) => 
    apiFetch<{ workflow: Workflow }>('/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Workflow> & { actions?: Partial<WorkflowAction>[] }) => 
    apiFetch<{ workflow: Workflow }>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) => apiFetch<{ success: boolean }>(`/workflows/${id}`, {
    method: 'DELETE',
  }),
}

// ============================================
// Dashboard API
// ============================================

export interface DashboardMetrics {
  total_calls: number
  completed_calls: number
  missed_calls: number
  total_minutes: number
  avg_call_duration: number
  answer_rate: number
  capture_rate: number
  total_contacts: number
  new_leads: number
  qualified_leads: number
  active_agents: number
}

export const dashboardApi = {
  get: (period: '7d' | '30d' | '90d' = '7d') => 
    apiFetch<{ 
      metrics: DashboardMetrics
      intent_breakdown: Record<string, number>
      recent_calls: Call[]
    }>(`/dashboard?period=${period}`),
}

// ============================================
// Usage API
// ============================================

export const usageApi = {
  get: (period: 'current' | 'last' = 'current') =>
    apiFetch<{
      plan: string
      limits: { minutes: number; agents: number; numbers: number }
      usage: { 
        call_minutes: number
        sms_sent: number
        sms_received: number
        minutes_remaining: number
        percent_used: number
      }
      costs: { base: number; overage: number; total: number }
    }>(`/usage?period=${period}`),
}
