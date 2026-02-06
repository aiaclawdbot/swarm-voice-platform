import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * POST /api/webhooks/twilio
 * Handle incoming SMS messages and delivery status updates
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data (Twilio sends form-urlencoded)
    const formData = await request.formData()
    const data: Record<string, string> = {}
    for (const [key, value] of formData.entries()) {
      data[key] = value.toString()
    }

    const messageType = data.SmsStatus ? 'status' : 'incoming'

    if (messageType === 'status') {
      // Delivery status update
      return handleStatusUpdate(data)
    } else {
      // Incoming SMS
      return handleIncomingSMS(data)
    }

  } catch (error) {
    console.error('Twilio webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

/**
 * Handle delivery status updates
 */
async function handleStatusUpdate(data: Record<string, string>) {
  const { MessageSid, SmsStatus, ErrorCode } = data

  // Update message status in database
  await supabaseAdmin
    .from('messages')
    .update({
      status: SmsStatus.toLowerCase(),
      metadata: {
        error_code: ErrorCode || null,
        updated_at: new Date().toISOString(),
      },
    })
    .eq('twilio_sid', MessageSid)

  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    headers: { 'Content-Type': 'text/xml' },
  })
}

/**
 * Handle incoming SMS messages
 */
async function handleIncomingSMS(data: Record<string, string>) {
  const { From, To, Body, MessageSid } = data

  console.log('Incoming SMS:', { From, To, Body: Body?.substring(0, 50) })

  // Find the phone number and org
  const { data: phoneNumber } = await supabaseAdmin
    .from('phone_numbers')
    .select('id, org_id')
    .eq('number', To)
    .single()

  if (!phoneNumber) {
    console.error('Phone number not found:', To)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    })
  }

  const orgId = phoneNumber.org_id
  const normalizedFrom = From.replace(/\D/g, '')

  // Check for opt-out keywords (TCPA compliance)
  const optOutKeywords = ['stop', 'unsubscribe', 'cancel', 'end', 'quit']
  const isOptOut = optOutKeywords.some(kw => 
    Body.toLowerCase().trim() === kw
  )

  if (isOptOut) {
    // Handle opt-out
    await supabaseAdmin.from('sms_opt_outs').upsert({
      phone: normalizedFrom,
      org_id: orgId,
      reason: 'SMS reply: ' + Body.trim(),
    })

    // Update contact if exists
    await supabaseAdmin
      .from('contacts')
      .update({ 
        metadata: { sms_opted_out: true, opted_out_at: new Date().toISOString() }
      })
      .eq('org_id', orgId)
      .eq('phone', normalizedFrom)

    // Send confirmation (required by carriers)
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>You have been unsubscribed and will no longer receive messages from us. Reply START to resubscribe.</Message>
      </Response>`,
      { headers: { 'Content-Type': 'text/xml' } }
    )
  }

  // Check for opt-in (re-subscribe)
  if (Body.toLowerCase().trim() === 'start') {
    await supabaseAdmin
      .from('sms_opt_outs')
      .delete()
      .eq('phone', normalizedFrom)
      .eq('org_id', orgId)

    await supabaseAdmin
      .from('contacts')
      .update({ 
        metadata: { sms_opted_out: false }
      })
      .eq('org_id', orgId)
      .eq('phone', normalizedFrom)

    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>You have been resubscribed! Reply STOP to unsubscribe at any time.</Message>
      </Response>`,
      { headers: { 'Content-Type': 'text/xml' } }
    )
  }

  // Find or create contact
  let { data: contact } = await supabaseAdmin
    .from('contacts')
    .select('id')
    .eq('org_id', orgId)
    .eq('phone', normalizedFrom)
    .single()

  if (!contact) {
    const { data: newContact } = await supabaseAdmin
      .from('contacts')
      .insert({
        org_id: orgId,
        phone: normalizedFrom,
        status: 'new',
        source: 'sms_inbound',
      })
      .select('id')
      .single()
    contact = newContact
  }

  // Log the message
  await supabaseAdmin.from('messages').insert({
    org_id: orgId,
    contact_id: contact?.id,
    channel: 'sms',
    direction: 'inbound',
    from_address: From,
    to_address: To,
    body: Body,
    status: 'received',
    twilio_sid: MessageSid,
  })

  // Log usage
  await supabaseAdmin.from('usage_records').insert({
    org_id: orgId,
    record_type: 'sms_received',
    quantity: 1,
  })

  // No auto-reply for now - can be added via workflows
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    headers: { 'Content-Type': 'text/xml' },
  })
}
