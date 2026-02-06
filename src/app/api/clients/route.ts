import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/clients - List all clients
export async function GET() {
  const supabase = createClient()
  
  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      *,
      phone_numbers(count),
      agents(count),
      calls(count),
      leads(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform the counts - use any to handle complex Supabase nested types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformed = (clients || []).map((client: any) => ({
    ...client,
    phone_count: client.phone_numbers?.[0]?.count || 0,
    agent_count: client.agents?.[0]?.count || 0,
    call_count: client.calls?.[0]?.count || 0,
    lead_count: client.leads?.[0]?.count || 0,
  }))

  return NextResponse.json(transformed)
}

// POST /api/clients - Create new client
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const body = await request.json()

  const { name, company, email, phone, plan } = body

  if (!name || !company || !email) {
    return NextResponse.json(
      { error: 'Name, company, and email are required' },
      { status: 400 }
    )
  }

  const { data: client, error } = await supabase
    .from('clients')
    // @ts-expect-error - Supabase types are overly strict for insert
    .insert({
      name,
      company,
      email,
      phone,
      plan: plan || 'starter',
      status: 'onboarding',
      settings: {},
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(client, { status: 201 })
}
