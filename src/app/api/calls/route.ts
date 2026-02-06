import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

// GET /api/calls - List calls with filters
export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    const contactId = searchParams.get('contactId')
    const status = searchParams.get('status')
    const intent = searchParams.get('intent')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabaseAdmin
      .from('calls')
      .select(`
        *,
        agent:agents(id, name),
        contact:contacts(id, first_name, last_name, phone)
      `, { count: 'exact' })
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (agentId) {
      query = query.eq('agent_id', agentId)
    }
    if (contactId) {
      query = query.eq('contact_id', contactId)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (intent) {
      query = query.eq('intent', intent)
    }

    const { data: calls, error, count } = await query

    if (error) {
      console.error('Error fetching calls:', error)
      return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 })
    }

    return NextResponse.json({
      calls,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Calls GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
