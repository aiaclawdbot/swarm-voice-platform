import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, Agent } from '@/lib/supabase/server'
import { createAssistant } from '@/lib/vapi/client'

// GET /api/agents - List agents for an organization
export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const { data: agents, error } = await supabaseAdmin
      .from('agents')
      .select(`
        *,
        phone_number:phone_numbers(id, number, friendly_name)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching agents:', error)
      return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
    }

    return NextResponse.json({ agents })
  } catch (error) {
    console.error('Agents GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      template_id,
      persona,
      greeting,
      voice_id = 'alloy',
      voice_provider = 'openai',
      model = 'gpt-4o-mini',
      settings = {},
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Agent name is required' }, { status: 400 })
    }

    // Create Vapi assistant
    const webhookUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/vapi`
      : undefined

    let vapiAssistantId: string | undefined

    try {
      const assistant = await createAssistant({
        name,
        persona: persona || `You are a helpful assistant for ${name}.`,
        greeting: greeting || `Hello! Thank you for calling. How can I help you today?`,
        voice: voice_id,
        model,
        webhookUrl,
      })
      vapiAssistantId = assistant.id
    } catch (vapiError) {
      console.error('Vapi assistant creation failed:', vapiError)
      // Continue without Vapi assistant - can be linked later
    }

    // Insert agent into database
    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .insert({
        org_id: orgId,
        name,
        template_id,
        persona,
        greeting,
        voice_id,
        voice_provider,
        model,
        vapi_assistant_id: vapiAssistantId,
        settings,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating agent:', error)
      return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
    }

    return NextResponse.json({ agent }, { status: 201 })
  } catch (error) {
    console.error('Agents POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
