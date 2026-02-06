import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string; agentId: string }> }

// GET /api/clients/[id]/agents/[agentId] - Get single agent
export async function GET(request: NextRequest, context: RouteContext) {
  const { id, agentId } = await context.params
  const supabase = createClient()

  const { data: agent, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .eq('client_id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(agent)
}

// PATCH /api/clients/[id]/agents/[agentId] - Update agent
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id, agentId } = await context.params
  const supabase = createClient()
  const body = await request.json()

  const { name, persona, greeting, voice_id, model, provider, is_active, settings } = body

  const updates: {
    name?: string
    persona?: string | null
    greeting?: string | null
    voice_id?: string | null
    model?: string
    provider?: string
    is_active?: boolean
    settings?: Record<string, unknown>
  } = {}
  if (name !== undefined) updates.name = name
  if (persona !== undefined) updates.persona = persona
  if (greeting !== undefined) updates.greeting = greeting
  if (voice_id !== undefined) updates.voice_id = voice_id
  if (model !== undefined) updates.model = model
  if (provider !== undefined) updates.provider = provider
  if (is_active !== undefined) updates.is_active = is_active
  if (settings !== undefined) updates.settings = settings

  const { data: agent, error } = await supabase
    .from('agents')
    // @ts-expect-error - Supabase types are overly strict
    .update(updates)
    .eq('id', agentId)
    .eq('client_id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(agent)
}

// DELETE /api/clients/[id]/agents/[agentId] - Delete agent
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id, agentId } = await context.params
  const supabase = createClient()

  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', agentId)
    .eq('client_id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
