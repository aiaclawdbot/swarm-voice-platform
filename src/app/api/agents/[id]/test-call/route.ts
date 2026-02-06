import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

const VAPI_API_KEY = process.env.VAPI_API_KEY || ''

/**
 * POST /api/agents/[id]/test-call
 * Initiates a test call to verify agent configuration
 * 
 * Body: { phone_number: string } - The number to call for testing
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const body = await request.json()
    const { phone_number } = body

    if (!phone_number) {
      return NextResponse.json({ error: 'Phone number required for test call' }, { status: 400 })
    }

    // Get agent with vapi_assistant_id
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('id, name, vapi_assistant_id, phone_number_id, phone_number:phone_numbers(number, vapi_phone_id)')
      .eq('id', agentId)
      .eq('org_id', orgId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    if (!agent.vapi_assistant_id) {
      return NextResponse.json({ 
        error: 'Agent not configured with Vapi. Please complete agent setup first.' 
      }, { status: 400 })
    }

    // Check rate limiting - max 5 test calls per hour per org
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabaseAdmin
      .from('calls')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('direction', 'outbound')
      .gte('created_at', oneHourAgo)
      .like('metadata->>test_call', 'true')

    if ((count || 0) >= 5) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Maximum 5 test calls per hour.',
        retry_after: '1 hour'
      }, { status: 429 })
    }

    // Initiate outbound test call via Vapi
    const vapiResponse = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId: agent.vapi_assistant_id,
        customer: {
          number: phone_number,
        },
        // Use the agent's phone number if configured, otherwise Vapi default
        ...(agent.phone_number?.vapi_phone_id && {
          phoneNumberId: agent.phone_number.vapi_phone_id,
        }),
      }),
    })

    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text()
      console.error('Vapi test call error:', errorText)
      return NextResponse.json({ 
        error: 'Failed to initiate test call. Please check your configuration.' 
      }, { status: 500 })
    }

    const vapiCall = await vapiResponse.json()

    // Log the test call
    await supabaseAdmin.from('calls').insert({
      org_id: orgId,
      agent_id: agentId,
      direction: 'outbound',
      caller_number: agent.phone_number?.number || 'vapi-default',
      status: 'initiated',
      vapi_call_id: vapiCall.id,
      metadata: { test_call: true },
      started_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      call_id: vapiCall.id,
      message: `Test call initiated to ${phone_number}. You should receive a call within 30 seconds.`,
    })

  } catch (error) {
    console.error('Test call error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/agents/[id]/test-call
 * Get status of a test call
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const orgId = request.headers.get('x-org-id')
    const { searchParams } = new URL(request.url)
    const callId = searchParams.get('call_id')

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    if (!callId) {
      return NextResponse.json({ error: 'call_id query parameter required' }, { status: 400 })
    }

    // Get call status from database (updated by webhook)
    const { data: call, error } = await supabaseAdmin
      .from('calls')
      .select('status, duration_seconds, summary, transcript')
      .eq('vapi_call_id', callId)
      .eq('agent_id', agentId)
      .eq('org_id', orgId)
      .single()

    if (error || !call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 })
    }

    return NextResponse.json({
      call_id: callId,
      status: call.status,
      duration_seconds: call.duration_seconds,
      summary: call.summary,
      transcript: call.transcript,
    })

  } catch (error) {
    console.error('Test call status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
