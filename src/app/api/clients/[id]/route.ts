import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/clients/[id] - Get single client with details
export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const supabase = createClient()

  const { data: client, error } = await supabase
    .from('clients')
    .select(`
      *,
      phone_numbers(*),
      agents(*),
      knowledge_bases(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get recent calls
  const { data: recentCalls } = await supabase
    .from('calls')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get recent leads
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get stats
  const { count: totalCalls } = await supabase
    .from('calls')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', id)

  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', id)

  return NextResponse.json({
    ...(client as Record<string, unknown>),
    recentCalls: recentCalls || [],
    recentLeads: recentLeads || [],
    stats: {
      totalCalls: totalCalls || 0,
      totalLeads: totalLeads || 0,
    }
  })
}

// PATCH /api/clients/[id] - Update client
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const supabase = createClient()
  const body = await request.json()

  const { name, company, email, phone, plan, status, settings } = body

  const updates: {
    name?: string
    company?: string
    email?: string
    phone?: string | null
    plan?: string
    status?: string
    settings?: Record<string, unknown>
  } = {}
  if (name !== undefined) updates.name = name
  if (company !== undefined) updates.company = company
  if (email !== undefined) updates.email = email
  if (phone !== undefined) updates.phone = phone
  if (plan !== undefined) updates.plan = plan
  if (status !== undefined) updates.status = status
  if (settings !== undefined) updates.settings = settings

  const { data: client, error } = await supabase
    .from('clients')
    // @ts-expect-error - Supabase types are overly strict
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(client)
}

// DELETE /api/clients/[id] - Delete client
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const supabase = createClient()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
