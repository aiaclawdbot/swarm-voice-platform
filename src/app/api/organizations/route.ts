import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * POST /api/organizations
 * Create a new organization (during signup flow)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      industry,
      timezone = 'America/New_York',
      user_email,
      user_name,
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    if (!user_email) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Math.random().toString(36).substring(2, 8)

    // Create organization
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name,
        slug,
        industry,
        timezone,
        plan: 'trial',
        settings: {
          onboarding_completed: false,
        },
      })
      .select()
      .single()

    if (orgError) {
      console.error('Error creating organization:', orgError)
      return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
    }

    // Create user as owner
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email: user_email,
        name: user_name,
        org_id: org.id,
        role: 'owner',
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creating user:', userError)
      // Rollback org creation
      await supabaseAdmin.from('organizations').delete().eq('id', org.id)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    return NextResponse.json({
      organization: org,
      user,
      next_steps: [
        'Create your first agent from a template',
        'Provision a phone number',
        'Test your agent',
        'Go live!',
      ],
    }, { status: 201 })

  } catch (error) {
    console.error('Organization creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/organizations
 * Get current organization details
 */
export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const { data: org, error } = await supabaseAdmin
      .from('organizations')
      .select(`
        *,
        users:users(id, email, name, role),
        agents:agents(id, name, status),
        phone_numbers:phone_numbers(id, number, status)
      `)
      .eq('id', orgId)
      .single()

    if (error || !org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get usage for current billing period
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: usage } = await supabaseAdmin
      .from('usage_records')
      .select('record_type, quantity')
      .eq('org_id', orgId)
      .gte('recorded_at', startOfMonth.toISOString())

    const usageSummary = {
      call_minutes: 0,
      sms_sent: 0,
      sms_received: 0,
    }

    for (const record of usage || []) {
      if (record.record_type === 'call_minutes') {
        usageSummary.call_minutes += record.quantity
      } else if (record.record_type === 'sms_sent') {
        usageSummary.sms_sent += record.quantity
      } else if (record.record_type === 'sms_received') {
        usageSummary.sms_received += record.quantity
      }
    }

    return NextResponse.json({
      organization: org,
      usage: usageSummary,
    })

  } catch (error) {
    console.error('Organization GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/organizations
 * Update organization settings
 */
export async function PUT(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const body = await request.json()
    const allowedFields = ['name', 'industry', 'timezone', 'settings']
    
    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data: org, error } = await supabaseAdmin
      .from('organizations')
      .update(updates)
      .eq('id', orgId)
      .select()
      .single()

    if (error) {
      console.error('Error updating organization:', error)
      return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 })
    }

    return NextResponse.json({ organization: org })

  } catch (error) {
    console.error('Organization PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
