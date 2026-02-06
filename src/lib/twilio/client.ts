/**
 * Twilio Client
 * Handles phone number provisioning and SMS sending
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || ''
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || ''
const TWILIO_BASE_URL = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}`

interface TwilioPhoneNumber {
  sid: string
  phoneNumber: string
  friendlyName: string
  capabilities: {
    voice: boolean
    sms: boolean
    mms: boolean
  }
}

interface TwilioAvailableNumber {
  phoneNumber: string
  friendlyName: string
  locality?: string
  region?: string
  capabilities: {
    voice: boolean
    SMS: boolean
    MMS: boolean
  }
}

interface TwilioMessage {
  sid: string
  status: string
  to: string
  from: string
  body: string
  dateCreated: string
}

async function twilioRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${TWILIO_BASE_URL}${endpoint}`
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Basic ${auth}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Twilio API error: ${response.status} - ${error}`)
  }

  return response.json()
}

/**
 * Search for available phone numbers
 */
export async function searchAvailableNumbers(params: {
  country?: string
  areaCode?: string
  contains?: string
  limit?: number
}): Promise<TwilioAvailableNumber[]> {
  const country = params.country || 'US'
  const searchParams = new URLSearchParams()
  
  if (params.areaCode) searchParams.set('AreaCode', params.areaCode)
  if (params.contains) searchParams.set('Contains', params.contains)
  searchParams.set('VoiceEnabled', 'true')
  searchParams.set('SmsEnabled', 'true')
  
  const query = searchParams.toString()
  const response = await twilioRequest<{ available_phone_numbers: TwilioAvailableNumber[] }>(
    `/AvailablePhoneNumbers/${country}/Local.json?${query}`
  )

  const limit = params.limit || 10
  return response.available_phone_numbers.slice(0, limit)
}

/**
 * Purchase a phone number
 */
export async function purchasePhoneNumber(phoneNumber: string): Promise<TwilioPhoneNumber> {
  const body = new URLSearchParams()
  body.set('PhoneNumber', phoneNumber)
  
  const response = await twilioRequest<{
    sid: string
    phone_number: string
    friendly_name: string
    capabilities: { voice: boolean; sms: boolean; mms: boolean }
  }>('/IncomingPhoneNumbers.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  return {
    sid: response.sid,
    phoneNumber: response.phone_number,
    friendlyName: response.friendly_name,
    capabilities: response.capabilities,
  }
}

/**
 * Configure a phone number's voice URL (for Vapi)
 */
export async function configurePhoneNumber(
  phoneSid: string,
  config: {
    voiceUrl?: string
    voiceMethod?: string
    smsUrl?: string
    smsMethod?: string
  }
): Promise<void> {
  const body = new URLSearchParams()
  
  if (config.voiceUrl) body.set('VoiceUrl', config.voiceUrl)
  if (config.voiceMethod) body.set('VoiceMethod', config.voiceMethod)
  if (config.smsUrl) body.set('SmsUrl', config.smsUrl)
  if (config.smsMethod) body.set('SmsMethod', config.smsMethod)

  await twilioRequest(`/IncomingPhoneNumbers/${phoneSid}.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })
}

/**
 * Release (delete) a phone number
 */
export async function releasePhoneNumber(phoneSid: string): Promise<void> {
  await twilioRequest(`/IncomingPhoneNumbers/${phoneSid}.json`, {
    method: 'DELETE',
  })
}

/**
 * Send an SMS message
 */
export async function sendSMS(params: {
  to: string
  from: string
  body: string
}): Promise<TwilioMessage> {
  const body = new URLSearchParams()
  body.set('To', params.to)
  body.set('From', params.from)
  body.set('Body', params.body)

  const response = await twilioRequest<{
    sid: string
    status: string
    to: string
    from: string
    body: string
    date_created: string
  }>('/Messages.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  return {
    sid: response.sid,
    status: response.status,
    to: response.to,
    from: response.from,
    body: response.body,
    dateCreated: response.date_created,
  }
}

/**
 * Get message status
 */
export async function getMessageStatus(messageSid: string): Promise<TwilioMessage> {
  const response = await twilioRequest<{
    sid: string
    status: string
    to: string
    from: string
    body: string
    date_created: string
  }>(`/Messages/${messageSid}.json`)

  return {
    sid: response.sid,
    status: response.status,
    to: response.to,
    from: response.from,
    body: response.body,
    dateCreated: response.date_created,
  }
}

export function getTwilioCredentials() {
  return {
    accountSid: TWILIO_ACCOUNT_SID,
    authToken: TWILIO_AUTH_TOKEN,
  }
}

export type { TwilioPhoneNumber, TwilioAvailableNumber, TwilioMessage }
