import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

// GET /api/contacts/[id] - Get a single contact with history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Get contact with related data
    const { data: contact, error } = await supabaseAdmin
      .from('contacts')
      .select(`
        *,
        notes:contact_notes(id, content, created_at, user:users(name)),
        calls:calls(id, direction, duration_seconds, status, intent, summary, created_at),
        messages:messages(id, channel, direction, body, status, created_at)
      `)
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (error || !contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Sort activity by date
    const activity = [
      ...(contact.calls || []).map((c: Record<string, unknown>) => ({ ...c, type: 'call' })),
      ...(contact.messages || []).map((m: Record<string, unknown>) => ({ ...m, type: 'message' })),
      ...(contact.notes || []).map((n: Record<string, unknown>) => ({ ...n, type: 'note' })),
    ].sort((a, b) => 
      new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
    )

    return NextResponse.json({ 
      contact: {
        ...contact,
        calls: undefined,
        messages: undefined,
        notes: undefined,
      },
      activity,
    })

  } catch (error) {
    console.error('Contact GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/contacts/[id] - Update a contact
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const body = await request.json()
    const allowedFields = ['phone', 'email', 'first_name', 'last_name', 'company', 'status', 'metadata']
    
    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data: contact, error } = await supabaseAdmin
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      console.error('Error updating contact:', error)
      return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
    }

    return NextResponse.json({ contact })

  } catch (error) {
    console.error('Contact PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/contacts/[id] - Delete a contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) {
      console.error('Error deleting contact:', error)
      return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Contact DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
