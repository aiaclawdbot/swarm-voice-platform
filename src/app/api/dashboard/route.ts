import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * GET /api/dashboard
 * Get dashboard metrics for the organization
 */
export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d

    // Calculate date range
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    // Parallel queries for dashboard metrics
    const [
      callsResult,
      contactsResult,
      agentsResult,
      recentCallsResult,
      intentBreakdownResult,
    ] = await Promise.all([
      // Total calls in period
      supabaseAdmin
        .from('calls')
        .select('id, duration_seconds, status, intent', { count: 'exact' })
        .eq('org_id', orgId)
        .gte('created_at', startDate),

      // Total contacts
      supabaseAdmin
        .from('contacts')
        .select('id, status', { count: 'exact' })
        .eq('org_id', orgId),

      // Active agents
      supabaseAdmin
        .from('agents')
        .select('id, status', { count: 'exact' })
        .eq('org_id', orgId)
        .eq('status', 'active'),

      // Recent calls for activity feed
      supabaseAdmin
        .from('calls')
        .select(`
          id, 
          direction,
          duration_seconds,
          status,
          intent,
          summary,
          created_at,
          contact:contacts(first_name, last_name, phone)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(10),

      // Intent breakdown
      supabaseAdmin
        .from('calls')
        .select('intent')
        .eq('org_id', orgId)
        .gte('created_at', startDate)
        .not('intent', 'is', null),
    ])

    // Calculate metrics
    const calls = callsResult.data || []
    const totalCalls = callsResult.count || 0
    const completedCalls = calls.filter(c => c.status === 'completed').length
    const missedCalls = calls.filter(c => c.status === 'missed').length
    const totalMinutes = calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / 60

    const contacts = contactsResult.data || []
    const totalContacts = contactsResult.count || 0
    const newLeads = contacts.filter(c => c.status === 'new').length
    const qualifiedLeads = contacts.filter(c => c.status === 'qualified').length

    const activeAgents = agentsResult.count || 0

    // Intent breakdown
    const intentCounts: Record<string, number> = {}
    for (const call of intentBreakdownResult.data || []) {
      const intent = call.intent || 'other'
      intentCounts[intent] = (intentCounts[intent] || 0) + 1
    }

    // Answer rate calculation
    const answerRate = totalCalls > 0 
      ? Math.round((completedCalls / totalCalls) * 100) 
      : 100

    // Lead capture rate (calls that resulted in new contact)
    const callsWithContact = calls.filter(c => c.status === 'completed').length
    const captureRate = completedCalls > 0
      ? Math.round((callsWithContact / completedCalls) * 100)
      : 0

    return NextResponse.json({
      period,
      metrics: {
        total_calls: totalCalls,
        completed_calls: completedCalls,
        missed_calls: missedCalls,
        total_minutes: Math.round(totalMinutes * 10) / 10,
        avg_call_duration: totalCalls > 0 ? Math.round(totalMinutes / totalCalls * 60) : 0,
        answer_rate: answerRate,
        capture_rate: captureRate,
        total_contacts: totalContacts,
        new_leads: newLeads,
        qualified_leads: qualifiedLeads,
        active_agents: activeAgents,
      },
      intent_breakdown: intentCounts,
      recent_calls: recentCallsResult.data || [],
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
