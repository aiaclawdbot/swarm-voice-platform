import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { parseWebhookPayload } from '@/lib/vapi/client'

/**
 * POST /api/webhooks/vapi
 * Handles all Vapi webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = parseWebhookPayload(body)
    const { message } = payload

    console.log('Vapi webhook received:', message.type)

    // Idempotency check - prevent duplicate processing
    const eventId = (message.call as Record<string, unknown>)?.id as string || crypto.randomUUID()
    const eventType = message.type
    
    const isProcessed = await checkAndMarkProcessed(eventId, eventType)
    if (isProcessed) {
      console.log('Duplicate webhook, skipping:', eventId, eventType)
      return NextResponse.json({ status: 'duplicate' })
    }

    switch (message.type) {
      case 'assistant-request':
        // Vapi asking for assistant config - return knowledge base context
        return handleAssistantRequest(message)

      case 'end-of-call-report':
        // Call completed - save call data, create/update contact, trigger workflows
        return handleEndOfCall(message)

      case 'transcript':
        // Real-time transcript update - could be used for live monitoring
        return handleTranscript(message)

      case 'function-call':
        // Agent wants to call a function (book appointment, etc.)
        return handleFunctionCall(message)

      default:
        console.log('Unhandled webhook type:', message.type)
        return NextResponse.json({ status: 'ok' })
    }
  } catch (error) {
    console.error('Vapi webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

/**
 * Handle assistant-request - return context and functions
 */
async function handleAssistantRequest(message: Record<string, unknown>) {
  // For now, just acknowledge - can add knowledge base lookup here
  return NextResponse.json({ status: 'ok' })
}

/**
 * Handle end-of-call-report - the main event
 */
async function handleEndOfCall(message: Record<string, unknown>) {
  const call = message.call as Record<string, unknown> | undefined
  if (!call) {
    return NextResponse.json({ status: 'ok' })
  }

  const vapiCallId = call.id as string
  const assistantId = call.assistantId as string
  const customerNumber = (call.customer as Record<string, unknown>)?.number as string | undefined
  const status = call.status as string
  const startedAt = call.startedAt as string
  const endedAt = call.endedAt as string

  // Get transcript and summary from message
  const transcript = message.transcript as string
  const summary = (message.analysis as Record<string, unknown>)?.summary as string
  const recordingUrl = message.recordingUrl as string

  // Find the agent by vapi_assistant_id
  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('id, org_id, phone_number_id')
    .eq('vapi_assistant_id', assistantId)
    .single()

  if (!agent) {
    console.error('Agent not found for assistant:', assistantId)
    return NextResponse.json({ status: 'ok' })
  }

  const orgId = agent.org_id

  // Find or create contact
  let contactId: string | undefined

  if (customerNumber) {
    // Normalize phone number
    const normalizedPhone = customerNumber.replace(/\D/g, '')

    // Check if contact exists
    const { data: existingContact } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('org_id', orgId)
      .eq('phone', normalizedPhone)
      .single()

    if (existingContact) {
      contactId = existingContact.id
    } else {
      // Create new contact
      const { data: newContact } = await supabaseAdmin
        .from('contacts')
        .insert({
          org_id: orgId,
          phone: normalizedPhone,
          status: 'new',
          source: 'inbound_call',
        })
        .select('id')
        .single()

      contactId = newContact?.id

      // Trigger lead_captured workflow
      await triggerWorkflow(orgId, 'lead_captured', {
        contact_id: contactId,
        phone: normalizedPhone,
      })
    }
  }

  // Calculate duration
  const durationSeconds = startedAt && endedAt
    ? Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000)
    : 0

  // Analyze intent from transcript/summary
  const intent = analyzeIntent(transcript, summary)
  const sentiment = analyzeSentiment(transcript)

  // Insert call record
  const { data: callRecord, error } = await supabaseAdmin
    .from('calls')
    .insert({
      org_id: orgId,
      agent_id: agent.id,
      contact_id: contactId,
      phone_number_id: agent.phone_number_id,
      direction: 'inbound',
      caller_number: customerNumber,
      duration_seconds: durationSeconds,
      status: mapCallStatus(status),
      recording_url: recordingUrl,
      transcript,
      summary,
      sentiment,
      intent,
      vapi_call_id: vapiCallId,
      started_at: startedAt,
      ended_at: endedAt,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to insert call:', error)
  }

  // Trigger call_completed workflow
  await triggerWorkflow(orgId, 'call_completed', {
    call_id: callRecord?.id,
    contact_id: contactId,
    phone: customerNumber,
    duration: durationSeconds,
    intent,
    summary,
  })

  // Log usage for billing
  await supabaseAdmin.from('usage_records').insert({
    org_id: orgId,
    record_type: 'call_minutes',
    quantity: Math.ceil(durationSeconds / 60),
    metadata: { call_id: callRecord?.id },
  })

  return NextResponse.json({ status: 'ok' })
}

/**
 * Handle real-time transcript
 */
async function handleTranscript(message: Record<string, unknown>) {
  // Could implement live call monitoring here
  return NextResponse.json({ status: 'ok' })
}

/**
 * Handle function calls from the agent
 */
async function handleFunctionCall(message: Record<string, unknown>) {
  // Handle booking, info lookup, etc.
  // For MVP, just acknowledge
  return NextResponse.json({ status: 'ok' })
}

/**
 * Trigger a workflow based on event
 */
async function triggerWorkflow(
  orgId: string,
  triggerType: string,
  eventData: Record<string, unknown>
) {
  // Find matching active workflows
  const { data: workflows } = await supabaseAdmin
    .from('workflows')
    .select('id, trigger_config')
    .eq('org_id', orgId)
    .eq('trigger_type', triggerType)
    .eq('status', 'active')

  if (!workflows || workflows.length === 0) return

  // Create workflow runs
  for (const workflow of workflows) {
    await supabaseAdmin.from('workflow_runs').insert({
      workflow_id: workflow.id,
      contact_id: eventData.contact_id as string,
      trigger_event: eventData,
      status: 'running',
    })

    // TODO: Actually execute workflow actions (queue job)
    // For MVP, we'll process synchronously in a background task
  }
}

/**
 * Analyze intent from transcript
 */
function analyzeIntent(transcript?: string, summary?: string): string {
  const text = (transcript || '') + ' ' + (summary || '')
  const lower = text.toLowerCase()

  if (/emergency|urgent|flood|burst|leak|fire|pain|blood/i.test(lower)) {
    return 'emergency'
  }
  if (/appointment|schedule|book|available|when can/i.test(lower)) {
    return 'booking'
  }
  if (/price|cost|how much|quote|estimate/i.test(lower)) {
    return 'inquiry'
  }
  if (/cancel|reschedule|change|my appointment/i.test(lower)) {
    return 'status'
  }
  if (/complaint|unhappy|problem|issue|wrong|upset|frustrated/i.test(lower)) {
    return 'complaint'
  }

  return 'other'
}

/**
 * Analyze sentiment from transcript
 */
function analyzeSentiment(transcript?: string): string {
  if (!transcript) return 'neutral'
  const lower = transcript.toLowerCase()

  const positiveWords = ['thank', 'great', 'perfect', 'wonderful', 'excellent', 'appreciate', 'helpful']
  const negativeWords = ['angry', 'frustrated', 'upset', 'terrible', 'awful', 'horrible', 'disappointed']

  let positiveCount = 0
  let negativeCount = 0

  for (const word of positiveWords) {
    if (lower.includes(word)) positiveCount++
  }
  for (const word of negativeWords) {
    if (lower.includes(word)) negativeCount++
  }

  if (positiveCount > negativeCount + 1) return 'positive'
  if (negativeCount > positiveCount + 1) return 'negative'
  return 'neutral'
}

/**
 * Map Vapi call status to our status
 */
function mapCallStatus(vapiStatus?: string): string {
  switch (vapiStatus) {
    case 'ended':
      return 'completed'
    case 'busy':
    case 'no-answer':
      return 'missed'
    case 'failed':
      return 'failed'
    default:
      return 'completed'
  }
}

/**
 * Check if webhook event was already processed (idempotency)
 */
async function checkAndMarkProcessed(eventId: string, eventType: string): Promise<boolean> {
  // Try to insert - if it fails due to unique constraint, it's a duplicate
  const { error } = await supabaseAdmin
    .from('webhook_events')
    .insert({ event_id: eventId, event_type: eventType })
  
  // Unique violation = already processed
  if (error && error.code === '23505') {
    return true
  }
  
  return false
}
