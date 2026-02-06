// SWARM Voice Platform - Type Definitions

// ============================================
// Core Types
// ============================================

export interface Organization {
  id: string
  name: string
  slug: string
  industry?: string
  timezone: string
  settings: Record<string, unknown>
  plan: 'starter' | 'growth' | 'scale' | 'enterprise'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  orgId: string
  role: 'owner' | 'admin' | 'member'
  settings: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

// ============================================
// Voice Types
// ============================================

export interface PhoneNumber {
  id: string
  orgId: string
  number: string
  twilioSid?: string
  friendlyName?: string
  status: 'active' | 'inactive'
  createdAt: Date
}

export interface Agent {
  id: string
  orgId: string
  name: string
  templateId?: string
  persona: string
  greeting: string
  voiceId: string
  voiceProvider: 'openai' | 'elevenlabs' | 'playht'
  model: string
  phoneNumberId?: string
  settings: AgentSettings
  status: 'active' | 'inactive' | 'draft'
  createdAt: Date
  updatedAt: Date
}

export interface AgentSettings {
  maxDurationSeconds?: number
  transferNumber?: string
  afterHoursMessage?: string
  urgencyKeywords?: string[]
  bookingEnabled?: boolean
  calendarId?: string
}

// ============================================
// Knowledge Base Types
// ============================================

export interface KnowledgeBase {
  id: string
  orgId: string
  agentId: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface KnowledgeDocument {
  id: string
  knowledgeBaseId: string
  title: string
  content: string
  sourceUrl?: string
  metadata: Record<string, unknown>
  createdAt: Date
}

// ============================================
// CRM Types
// ============================================

export interface Contact {
  id: string
  orgId: string
  phone?: string
  email?: string
  firstName?: string
  lastName?: string
  company?: string
  status: ContactStatus
  source: ContactSource
  metadata: Record<string, unknown>
  tags?: ContactTag[]
  createdAt: Date
  updatedAt: Date
}

export type ContactStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost'
export type ContactSource = 'inbound_call' | 'website' | 'manual' | 'import'

export interface ContactTag {
  id: string
  orgId: string
  name: string
  color: string
  createdAt: Date
}

export interface ContactNote {
  id: string
  contactId: string
  userId?: string
  content: string
  createdAt: Date
  user?: Pick<User, 'name' | 'avatarUrl'>
}

// ============================================
// Call & Message Types
// ============================================

export interface Call {
  id: string
  orgId: string
  agentId?: string
  contactId?: string
  phoneNumberId?: string
  direction: 'inbound' | 'outbound'
  callerNumber: string
  durationSeconds: number
  status: CallStatus
  recordingUrl?: string
  transcript?: string
  summary?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  intent?: string
  metadata: Record<string, unknown>
  vapiCallId?: string
  startedAt: Date
  endedAt?: Date
  createdAt: Date
}

export type CallStatus = 'completed' | 'missed' | 'voicemail' | 'transferred' | 'in_progress'

export interface Message {
  id: string
  orgId: string
  contactId?: string
  channel: 'sms' | 'email'
  direction: 'inbound' | 'outbound'
  fromAddress: string
  toAddress: string
  subject?: string
  body: string
  status: 'sent' | 'delivered' | 'failed' | 'received'
  twilioSid?: string
  metadata: Record<string, unknown>
  createdAt: Date
}

// ============================================
// Workflow Types
// ============================================

export interface Workflow {
  id: string
  orgId: string
  name: string
  description?: string
  triggerType: WorkflowTrigger
  triggerConfig: Record<string, unknown>
  status: 'active' | 'paused' | 'draft'
  actions?: WorkflowAction[]
  createdAt: Date
  updatedAt: Date
}

export type WorkflowTrigger = 
  | 'call_completed'
  | 'lead_captured'
  | 'missed_call'
  | 'appointment_booked'
  | 'manual'

export interface WorkflowAction {
  id: string
  workflowId: string
  actionType: WorkflowActionType
  actionConfig: WorkflowActionConfig
  position: number
  createdAt: Date
}

export type WorkflowActionType = 
  | 'send_sms'
  | 'send_email'
  | 'add_note'
  | 'update_contact'
  | 'notify_team'
  | 'webhook'
  | 'wait'

export interface WorkflowActionConfig {
  // send_sms / send_email
  template?: string
  subject?: string
  
  // add_note
  noteContent?: string
  
  // update_contact
  statusChange?: ContactStatus
  addTags?: string[]
  
  // notify_team
  notifyUserId?: string
  notifyChannel?: 'sms' | 'email' | 'slack'
  
  // webhook
  webhookUrl?: string
  webhookMethod?: 'GET' | 'POST'
  webhookHeaders?: Record<string, string>
  
  // wait
  waitSeconds?: number
}

export interface WorkflowRun {
  id: string
  workflowId: string
  contactId?: string
  triggerEvent: Record<string, unknown>
  status: 'running' | 'completed' | 'failed'
  currentAction: number
  error?: string
  startedAt: Date
  completedAt?: Date
}

// ============================================
// API Types
// ============================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================
// Dashboard Stats
// ============================================

export interface DashboardStats {
  totalCalls: number
  callsToday: number
  totalMinutes: number
  leadsCapture: number
  conversionRate: number
  avgCallDuration: number
  missedCalls: number
  activeAgents: number
}

// ============================================
// Template Types (from lib/templates.ts)
// ============================================

export interface AgentTemplate {
  id: string
  name: string
  industry: string
  description: string
  icon: string
  persona: string
  greeting: string
  suggestedVoice: string
  keyCapabilities: string[]
  sampleQuestions: string[]
  urgencyKeywords: string[]
  leadFields: string[]
}
