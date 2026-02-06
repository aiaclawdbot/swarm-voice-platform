/**
 * Vapi Voice AI Client
 * Handles assistant creation, phone number linking, and call management
 */

const VAPI_API_KEY = process.env.VAPI_API_KEY || ''
const VAPI_BASE_URL = 'https://api.vapi.ai'

interface VapiAssistantConfig {
  name: string
  model: {
    provider: string
    model: string
    systemPrompt: string
    temperature?: number
  }
  voice: {
    provider: string
    voiceId: string
  }
  firstMessage?: string
  serverUrl?: string
  serverUrlSecret?: string
}

interface VapiAssistant {
  id: string
  name: string
  model: unknown
  voice: unknown
  createdAt: string
}

interface VapiPhoneNumber {
  id: string
  number: string
  twilioAccountSid: string
  twilioAuthToken: string
  assistantId?: string
}

interface VapiCall {
  id: string
  assistantId: string
  phoneNumberId?: string
  status: string
  transcript?: string
  summary?: string
  recordingUrl?: string
  startedAt?: string
  endedAt?: string
  cost?: number
}

async function vapiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${VAPI_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${VAPI_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Vapi API error: ${response.status} - ${error}`)
  }

  return response.json()
}

/**
 * Create a new Vapi assistant for a voice agent
 */
export async function createAssistant(config: {
  name: string
  persona: string
  greeting: string
  voice: string
  model?: string
  webhookUrl?: string
}): Promise<VapiAssistant> {
  const assistantConfig: VapiAssistantConfig = {
    name: config.name,
    model: {
      provider: 'openai',
      model: config.model || 'gpt-4o-mini',
      systemPrompt: config.persona,
      temperature: 0.7,
    },
    voice: {
      provider: 'openai',
      voiceId: config.voice || 'alloy',
    },
    firstMessage: config.greeting,
  }

  // Add webhook URL if provided
  if (config.webhookUrl) {
    assistantConfig.serverUrl = config.webhookUrl
  }

  return vapiRequest<VapiAssistant>('/assistant', {
    method: 'POST',
    body: JSON.stringify(assistantConfig),
  })
}

/**
 * Update an existing Vapi assistant
 */
export async function updateAssistant(
  assistantId: string,
  updates: Partial<VapiAssistantConfig>
): Promise<VapiAssistant> {
  return vapiRequest<VapiAssistant>(`/assistant/${assistantId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

/**
 * Delete a Vapi assistant
 */
export async function deleteAssistant(assistantId: string): Promise<void> {
  await vapiRequest(`/assistant/${assistantId}`, {
    method: 'DELETE',
  })
}

/**
 * Get a Vapi assistant by ID
 */
export async function getAssistant(assistantId: string): Promise<VapiAssistant> {
  return vapiRequest<VapiAssistant>(`/assistant/${assistantId}`)
}

/**
 * Import a phone number to Vapi (from Twilio)
 */
export async function importPhoneNumber(config: {
  number: string
  twilioAccountSid: string
  twilioAuthToken: string
  assistantId?: string
}): Promise<VapiPhoneNumber> {
  return vapiRequest<VapiPhoneNumber>('/phone-number', {
    method: 'POST',
    body: JSON.stringify({
      provider: 'twilio',
      number: config.number,
      twilioAccountSid: config.twilioAccountSid,
      twilioAuthToken: config.twilioAuthToken,
      assistantId: config.assistantId,
    }),
  })
}

/**
 * Update phone number to assign/change assistant
 */
export async function updatePhoneNumber(
  phoneNumberId: string,
  assistantId: string
): Promise<VapiPhoneNumber> {
  return vapiRequest<VapiPhoneNumber>(`/phone-number/${phoneNumberId}`, {
    method: 'PATCH',
    body: JSON.stringify({ assistantId }),
  })
}

/**
 * Get call details
 */
export async function getCall(callId: string): Promise<VapiCall> {
  return vapiRequest<VapiCall>(`/call/${callId}`)
}

/**
 * List calls with filters
 */
export async function listCalls(params?: {
  assistantId?: string
  limit?: number
}): Promise<VapiCall[]> {
  const searchParams = new URLSearchParams()
  if (params?.assistantId) searchParams.set('assistantId', params.assistantId)
  if (params?.limit) searchParams.set('limit', params.limit.toString())

  const query = searchParams.toString()
  return vapiRequest<VapiCall[]>(`/call${query ? `?${query}` : ''}`)
}

/**
 * Parse Vapi webhook payload
 */
export interface VapiWebhookPayload {
  message: {
    type: 'assistant-request' | 'function-call' | 'end-of-call-report' | 'transcript' | 'hang' | 'speech-update'
    call?: {
      id: string
      assistantId?: string
      phoneNumberId?: string
      customer?: {
        number?: string
      }
      status?: string
      startedAt?: string
      endedAt?: string
    }
    transcript?: string
    summary?: string
    recordingUrl?: string
    messages?: Array<{
      role: string
      message: string
    }>
    analysis?: {
      summary?: string
      successEvaluation?: string
    }
  }
}

export function parseWebhookPayload(body: unknown): VapiWebhookPayload {
  return body as VapiWebhookPayload
}

export type { VapiAssistant, VapiPhoneNumber, VapiCall }
