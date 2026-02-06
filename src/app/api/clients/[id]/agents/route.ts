import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/clients/[id]/agents - List client's agents
export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const supabase = createClient()

  const { data: agents, error } = await supabase
    .from('agents')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(agents)
}

// POST /api/clients/[id]/agents - Create new agent
export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const supabase = createClient()
  const body = await request.json()

  const { name, persona, greeting, voice_id, model, provider } = body

  const { data: agent, error } = await supabase
    .from('agents')
    // @ts-expect-error - Supabase types are overly strict for insert
    .insert({
      client_id: id,
      name: name || 'AI Assistant',
      persona,
      greeting,
      voice_id: voice_id || 'alloy',
      model: model || 'gpt-4o-mini',
      provider: provider || 'vapi',
      settings: {},
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(agent, { status: 201 })
}
