import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { searchAvailableNumbers, purchasePhoneNumber, getTwilioCredentials } from '@/lib/twilio/client'
import { importPhoneNumber } from '@/lib/vapi/client'

// GET /api/phone-numbers - List org's phone numbers
export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const { data: phoneNumbers, error } = await supabaseAdmin
      .from('phone_numbers')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching phone numbers:', error)
      return NextResponse.json({ error: 'Failed to fetch phone numbers' }, { status: 500 })
    }

    return NextResponse.json({ phoneNumbers })
  } catch (error) {
    console.error('Phone numbers GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/phone-numbers - Provision a new phone number
export async function POST(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const body = await request.json()
    const { areaCode, agentId } = body

    // Search for available numbers
    const availableNumbers = await searchAvailableNumbers({
      areaCode,
      limit: 1,
    })

    if (!availableNumbers || availableNumbers.length === 0) {
      return NextResponse.json({ error: 'No available numbers found' }, { status: 404 })
    }

    const numberToPurchase = availableNumbers[0].phoneNumber

    // Purchase the number from Twilio
    const twilioNumber = await purchasePhoneNumber(numberToPurchase)

    // Get agent's vapi_assistant_id if linking to agent
    let vapiAssistantId: string | undefined
    if (agentId) {
      const { data: agent } = await supabaseAdmin
        .from('agents')
        .select('vapi_assistant_id')
        .eq('id', agentId)
        .eq('org_id', orgId)
        .single()
      
      vapiAssistantId = agent?.vapi_assistant_id
    }

    // Import to Vapi
    const { accountSid, authToken } = getTwilioCredentials()
    let vapiPhoneId: string | undefined

    try {
      const vapiPhone = await importPhoneNumber({
        number: twilioNumber.phoneNumber,
        twilioAccountSid: accountSid,
        twilioAuthToken: authToken,
        assistantId: vapiAssistantId,
      })
      vapiPhoneId = vapiPhone.id
    } catch (vapiError) {
      console.error('Vapi phone import failed:', vapiError)
      // Continue without Vapi - can be linked later
    }

    // Save to database
    const { data: phoneNumber, error } = await supabaseAdmin
      .from('phone_numbers')
      .insert({
        org_id: orgId,
        number: twilioNumber.phoneNumber,
        twilio_sid: twilioNumber.sid,
        vapi_phone_id: vapiPhoneId,
        friendly_name: twilioNumber.friendlyName,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving phone number:', error)
      return NextResponse.json({ error: 'Failed to save phone number' }, { status: 500 })
    }

    // Link to agent if specified
    if (agentId) {
      await supabaseAdmin
        .from('agents')
        .update({ phone_number_id: phoneNumber.id })
        .eq('id', agentId)
        .eq('org_id', orgId)
    }

    return NextResponse.json({ phoneNumber }, { status: 201 })
  } catch (error) {
    console.error('Phone numbers POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
