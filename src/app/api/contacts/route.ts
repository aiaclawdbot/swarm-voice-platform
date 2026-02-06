import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

// GET /api/contacts - List contacts with filters
export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabaseAdmin
      .from('contacts')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    const { data: contacts, error, count } = await query

    if (error) {
      console.error('Error fetching contacts:', error)
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
    }

    return NextResponse.json({ 
      contacts,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Contacts GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/contacts - Create a new contact
export async function POST(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const body = await request.json()
    const {
      phone,
      email,
      first_name,
      last_name,
      company,
      status = 'new',
      source = 'manual',
      metadata = {},
    } = body

    if (!phone && !email) {
      return NextResponse.json({ error: 'Phone or email is required' }, { status: 400 })
    }

    // Check for existing contact with same phone/email
    if (phone) {
      const { data: existing } = await supabaseAdmin
        .from('contacts')
        .select('id')
        .eq('org_id', orgId)
        .eq('phone', phone)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'Contact with this phone already exists' }, { status: 409 })
      }
    }

    const { data: contact, error } = await supabaseAdmin
      .from('contacts')
      .insert({
        org_id: orgId,
        phone,
        email,
        first_name,
        last_name,
        company,
        status,
        source,
        metadata,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating contact:', error)
      return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
    }

    return NextResponse.json({ contact }, { status: 201 })
  } catch (error) {
    console.error('Contacts POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
