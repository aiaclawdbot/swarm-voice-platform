/**
 * Workflow Execution Engine
 * Processes workflow runs and executes actions in sequence
 */

import { supabaseAdmin } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/twilio/client'

interface WorkflowAction {
  id: string
  workflow_id: string
  action_type: string
  action_config: Record<string, unknown>
  position: number
}

interface WorkflowRun {
  id: string
  workflow_id: string
  contact_id: string
  trigger_event: Record<string, unknown>
  status: string
  current_action: number
}

/**
 * Process a single workflow run
 */
export async function processWorkflowRun(runId: string): Promise<void> {
  // Get the run with workflow and contact
  const { data: run, error: runError } = await supabaseAdmin
    .from('workflow_runs')
    .select(`
      *,
      workflow:workflows(*),
      contact:contacts(*)
    `)
    .eq('id', runId)
    .single()

  if (runError || !run) {
    console.error('Workflow run not found:', runId)
    return
  }

  if (run.status !== 'running') {
    return // Already completed or failed
  }

  // Get workflow actions ordered by position
  const { data: actions, error: actionsError } = await supabaseAdmin
    .from('workflow_actions')
    .select('*')
    .eq('workflow_id', run.workflow_id)
    .order('position', { ascending: true })

  if (actionsError || !actions) {
    await markRunFailed(runId, 'Failed to fetch actions')
    return
  }

  // Execute actions starting from current position
  for (let i = run.current_action; i < actions.length; i++) {
    const action = actions[i]

    try {
      await executeAction(action, run, run.contact)

      // Update current action position
      await supabaseAdmin
        .from('workflow_runs')
        .update({ current_action: i + 1 })
        .eq('id', runId)

    } catch (error) {
      console.error(`Action ${action.id} failed:`, error)
      await markRunFailed(runId, `Action ${action.action_type} failed: ${error}`)
      return
    }
  }

  // All actions completed
  await supabaseAdmin
    .from('workflow_runs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', runId)
}

/**
 * Execute a single workflow action
 */
async function executeAction(
  action: WorkflowAction,
  run: WorkflowRun & { workflow: Record<string, unknown> },
  contact: Record<string, unknown>
): Promise<void> {
  const config = action.action_config

  switch (action.action_type) {
    case 'wait':
      // Delay execution (in a real system, this would re-queue the job)
      const delaySeconds = config.delay_seconds as number || 0
      if (delaySeconds > 0 && delaySeconds <= 60) {
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000))
      }
      // For longer delays, would need a job queue
      break

    case 'send_sms':
      await executeSendSMS(config, contact, run.trigger_event)
      break

    case 'send_email':
      await executeSendEmail(config, contact, run.trigger_event)
      break

    case 'add_note':
      await executeAddNote(config, contact, run.trigger_event)
      break

    case 'update_contact':
      await executeUpdateContact(config, contact)
      break

    case 'webhook':
      await executeWebhook(config, contact, run.trigger_event)
      break

    default:
      console.warn(`Unknown action type: ${action.action_type}`)
  }
}

/**
 * Send SMS action
 */
async function executeSendSMS(
  config: Record<string, unknown>,
  contact: Record<string, unknown>,
  event: Record<string, unknown>
): Promise<void> {
  const phone = contact.phone as string
  const fromNumber = config.from_number as string
  let template = config.template as string

  if (!phone || !fromNumber || !template) {
    throw new Error('Missing required SMS config: phone, from_number, or template')
  }

  // Replace template variables
  template = replaceTemplateVars(template, contact, event)

  // Get org for logging
  const orgId = contact.org_id as string

  // Send the SMS
  const message = await sendSMS({
    to: phone,
    from: fromNumber,
    body: template,
  })

  // Log the message
  await supabaseAdmin.from('messages').insert({
    org_id: orgId,
    contact_id: contact.id as string,
    channel: 'sms',
    direction: 'outbound',
    from_address: fromNumber,
    to_address: phone,
    body: template,
    status: message.status,
    twilio_sid: message.sid,
    metadata: { workflow_triggered: true },
  })

  // Log usage
  await supabaseAdmin.from('usage_records').insert({
    org_id: orgId,
    record_type: 'sms_sent',
    quantity: 1,
  })
}

/**
 * Send email action (placeholder - integrate with Resend)
 */
async function executeSendEmail(
  config: Record<string, unknown>,
  contact: Record<string, unknown>,
  event: Record<string, unknown>
): Promise<void> {
  const email = contact.email as string
  if (!email) {
    throw new Error('Contact has no email address')
  }

  // TODO: Integrate with Resend
  console.log('Email action executed (not implemented):', {
    to: email,
    subject: config.subject,
    body: config.template,
  })
}

/**
 * Add note to contact
 */
async function executeAddNote(
  config: Record<string, unknown>,
  contact: Record<string, unknown>,
  event: Record<string, unknown>
): Promise<void> {
  let content = config.content as string
  content = replaceTemplateVars(content, contact, event)

  await supabaseAdmin.from('contact_notes').insert({
    contact_id: contact.id as string,
    content,
  })
}

/**
 * Update contact fields
 */
async function executeUpdateContact(
  config: Record<string, unknown>,
  contact: Record<string, unknown>
): Promise<void> {
  const updates: Record<string, unknown> = {}

  if (config.status) updates.status = config.status
  if (config.tags) updates.tags = config.tags
  if (config.metadata) {
    updates.metadata = {
      ...(contact.metadata as Record<string, unknown> || {}),
      ...(config.metadata as Record<string, unknown>),
    }
  }

  if (Object.keys(updates).length > 0) {
    await supabaseAdmin
      .from('contacts')
      .update(updates)
      .eq('id', contact.id as string)
  }
}

/**
 * Call external webhook
 */
async function executeWebhook(
  config: Record<string, unknown>,
  contact: Record<string, unknown>,
  event: Record<string, unknown>
): Promise<void> {
  const url = config.url as string
  if (!url) {
    throw new Error('Webhook URL is required')
  }

  const payload = {
    contact,
    event,
    timestamp: new Date().toISOString(),
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.headers as Record<string, string> || {}),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status}`)
  }
}

/**
 * Replace template variables with actual values
 */
function replaceTemplateVars(
  template: string,
  contact: Record<string, unknown>,
  event: Record<string, unknown>
): string {
  return template
    .replace(/\{\{first_name\}\}/g, (contact.first_name as string) || 'there')
    .replace(/\{\{last_name\}\}/g, (contact.last_name as string) || '')
    .replace(/\{\{phone\}\}/g, (contact.phone as string) || '')
    .replace(/\{\{email\}\}/g, (contact.email as string) || '')
    .replace(/\{\{company\}\}/g, (contact.company as string) || '')
    .replace(/\{\{call_summary\}\}/g, (event.summary as string) || '')
    .replace(/\{\{call_duration\}\}/g, String(event.duration || 0))
    .replace(/\{\{intent\}\}/g, (event.intent as string) || '')
}

/**
 * Mark a workflow run as failed
 */
async function markRunFailed(runId: string, error: string): Promise<void> {
  await supabaseAdmin
    .from('workflow_runs')
    .update({
      status: 'failed',
      error,
      completed_at: new Date().toISOString(),
    })
    .eq('id', runId)
}

/**
 * Process all pending workflow runs
 * Called from a background job or cron
 */
export async function processPendingRuns(): Promise<number> {
  const { data: runs, error } = await supabaseAdmin
    .from('workflow_runs')
    .select('id')
    .eq('status', 'running')
    .limit(10)

  if (error || !runs) {
    console.error('Failed to fetch pending runs:', error)
    return 0
  }

  for (const run of runs) {
    await processWorkflowRun(run.id)
  }

  return runs.length
}
