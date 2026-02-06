/**
 * Mock Data for Demo Mode
 * Used when database is not connected or for testing
 */

export const MOCK_AGENTS = [
  {
    id: 'agent-1',
    org_id: 'demo-org',
    name: 'Dental Reception AI',
    template_id: 'dental',
    persona: 'You are a friendly dental receptionist...',
    greeting: 'Thank you for calling Bright Smile Dental! How can I help you today?',
    voice_id: 'nova',
    voice_provider: 'openai',
    model: 'gpt-4o-mini',
    vapi_assistant_id: 'demo-vapi-123',
    phone_number: {
      id: 'pn-1',
      number: '+1 (555) 123-4567',
      friendly_name: 'Main Line',
    },
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const MOCK_CONTACTS = [
  {
    id: 'contact-1',
    org_id: 'demo-org',
    phone: '+15551234567',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@email.com',
    status: 'qualified',
    source: 'inbound_call',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'contact-2',
    org_id: 'demo-org',
    phone: '+15559876543',
    first_name: 'Mike',
    last_name: 'Chen',
    email: null,
    status: 'new',
    source: 'inbound_call',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'contact-3',
    org_id: 'demo-org',
    phone: '+15555555555',
    first_name: 'Emily',
    last_name: null,
    email: 'emily@example.com',
    status: 'contacted',
    source: 'inbound_call',
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
]

export const MOCK_CALLS = [
  {
    id: 'call-1',
    org_id: 'demo-org',
    agent_id: 'agent-1',
    contact_id: 'contact-1',
    direction: 'inbound',
    caller_number: '+15551234567',
    duration_seconds: 245,
    status: 'completed',
    transcript: 'Caller: Hi, I\'d like to schedule a cleaning.\nAgent: Of course! I\'d be happy to help you schedule a cleaning. What days work best for you?\nCaller: Tuesdays are usually good.\nAgent: Perfect. We have availability next Tuesday at 10am or 2pm. Which would you prefer?\nCaller: 2pm works great.\nAgent: Wonderful! I\'ve scheduled your cleaning for Tuesday at 2pm. Can I confirm your name?\nCaller: Sarah Johnson.\nAgent: Thank you, Sarah! You\'re all set for Tuesday at 2pm. We\'ll send you a reminder the day before.',
    summary: 'Caller scheduled a dental cleaning appointment for Tuesday at 2pm.',
    sentiment: 'positive',
    intent: 'booking',
    started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 245000).toISOString(),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'call-2',
    org_id: 'demo-org',
    agent_id: 'agent-1',
    contact_id: 'contact-2',
    direction: 'inbound',
    caller_number: '+15559876543',
    duration_seconds: 180,
    status: 'completed',
    transcript: 'Caller: Do you accept Delta Dental insurance?\nAgent: Yes, we do accept Delta Dental! We work with most major insurance providers.\nCaller: Great. How much is a basic cleaning with insurance?\nAgent: With Delta Dental, a routine cleaning is typically covered at 100% after your deductible. Would you like to schedule an appointment?\nCaller: Let me check my calendar and call back.\nAgent: Of course! We\'re here whenever you\'re ready.',
    summary: 'Caller inquired about Delta Dental insurance coverage. Interested but will call back.',
    sentiment: 'neutral',
    intent: 'inquiry',
    started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 30 * 60 * 1000 + 180000).toISOString(),
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'call-3',
    org_id: 'demo-org',
    agent_id: 'agent-1',
    contact_id: 'contact-3',
    direction: 'inbound',
    caller_number: '+15555555555',
    duration_seconds: 95,
    status: 'completed',
    transcript: 'Caller: I have a really bad toothache, it\'s been throbbing all night.\nAgent: I\'m sorry to hear that. A severe toothache needs attention right away. We reserve emergency slots daily. Can you come in today?\nCaller: Yes, please! As soon as possible.\nAgent: I have an opening at 11am this morning. Can I get your name and a callback number?\nCaller: Emily, and you can reach me at this number.\nAgent: Emily, you\'re booked for 11am emergency appointment. Please come in 15 minutes early.',
    summary: 'URGENT: Caller has severe toothache. Booked emergency appointment for 11am today.',
    sentiment: 'negative',
    intent: 'emergency',
    started_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 5 * 60 * 1000 + 95000).toISOString(),
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
]

export const MOCK_WORKFLOWS = [
  {
    id: 'workflow-1',
    org_id: 'demo-org',
    name: 'New Lead Follow-up',
    description: 'Send SMS 5 minutes after new lead captured',
    trigger_type: 'lead_captured',
    trigger_config: {},
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'workflow-2',
    org_id: 'demo-org',
    name: 'Missed Call Recovery',
    description: 'Send SMS when call is missed',
    trigger_type: 'missed_call',
    trigger_config: {},
    status: 'active',
    created_at: new Date().toISOString(),
  },
]

export const MOCK_DASHBOARD_STATS = {
  totalCalls: 47,
  totalCallsChange: 12,
  avgDuration: 173,
  avgDurationChange: -8,
  leadsCaptured: 32,
  leadsCapturedChange: 5,
  bookingRate: 68,
  bookingRateChange: 3,
  callsByHour: [
    { hour: '8am', count: 2 },
    { hour: '9am', count: 5 },
    { hour: '10am', count: 8 },
    { hour: '11am', count: 6 },
    { hour: '12pm', count: 3 },
    { hour: '1pm', count: 4 },
    { hour: '2pm', count: 7 },
    { hour: '3pm', count: 6 },
    { hour: '4pm', count: 4 },
    { hour: '5pm', count: 2 },
  ],
  recentCalls: MOCK_CALLS,
  topIntents: [
    { intent: 'booking', count: 23, percentage: 49 },
    { intent: 'inquiry', count: 15, percentage: 32 },
    { intent: 'emergency', count: 5, percentage: 11 },
    { intent: 'other', count: 4, percentage: 8 },
  ],
}

// Check if we're in demo mode
export function isDemoMode(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('swarm_demo_auth') === 'true'
  }
  return false
}

export function getDemoOrgId(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('swarm_demo_org')
  }
  return null
}
