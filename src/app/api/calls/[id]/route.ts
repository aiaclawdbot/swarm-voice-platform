import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = supabaseAdmin
    
    // Get the call with related data
    const { data: call, error } = await supabase
      .from('calls')
      .select(`
        *,
        contact:contacts(*),
        agent:agents(id, name)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Failed to fetch call:', error)
      return NextResponse.json({ error: 'Call not found' }, { status: 404 })
    }
    
    return NextResponse.json({ call })
  } catch (error) {
    console.error('Unexpected error in GET /api/calls/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
