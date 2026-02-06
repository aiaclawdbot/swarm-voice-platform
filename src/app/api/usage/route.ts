import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * GET /api/usage
 * Get usage details for billing
 */
export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'current' // current, last, custom
    const startDateParam = searchParams.get('start')
    const endDateParam = searchParams.get('end')

    // Calculate date range
    let startDate: Date
    let endDate: Date = new Date()

    if (period === 'current') {
      startDate = new Date()
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
    } else if (period === 'last') {
      startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date()
      endDate.setDate(0) // Last day of previous month
      endDate.setHours(23, 59, 59, 999)
    } else if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam)
      endDate = new Date(endDateParam)
    } else {
      startDate = new Date()
      startDate.setDate(1)
    }

    // Get organization for plan limits
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('plan')
      .eq('id', orgId)
      .single()

    // Plan limits
    const planLimits: Record<string, { minutes: number; agents: number; numbers: number }> = {
      trial: { minutes: 100, agents: 1, numbers: 1 },
      starter: { minutes: 500, agents: 1, numbers: 1 },
      pro: { minutes: 2000, agents: 3, numbers: 3 },
      business: { minutes: 5000, agents: 10, numbers: 10 },
      enterprise: { minutes: Infinity, agents: Infinity, numbers: Infinity },
    }

    const limits = planLimits[org?.plan || 'trial']

    // Get usage records
    const { data: records } = await supabaseAdmin
      .from('usage_records')
      .select('record_type, quantity, recorded_at')
      .eq('org_id', orgId)
      .gte('recorded_at', startDate.toISOString())
      .lte('recorded_at', endDate.toISOString())
      .order('recorded_at', { ascending: true })

    // Aggregate usage
    const usage = {
      call_minutes: 0,
      sms_sent: 0,
      sms_received: 0,
    }

    const dailyUsage: Record<string, typeof usage> = {}

    for (const record of records || []) {
      const day = record.recorded_at.split('T')[0]
      
      if (!dailyUsage[day]) {
        dailyUsage[day] = { call_minutes: 0, sms_sent: 0, sms_received: 0 }
      }

      if (record.record_type === 'call_minutes') {
        usage.call_minutes += record.quantity
        dailyUsage[day].call_minutes += record.quantity
      } else if (record.record_type === 'sms_sent') {
        usage.sms_sent += record.quantity
        dailyUsage[day].sms_sent += record.quantity
      } else if (record.record_type === 'sms_received') {
        usage.sms_received += record.quantity
        dailyUsage[day].sms_received += record.quantity
      }
    }

    // Calculate costs (for display)
    const rates = {
      call_minute: 0.05, // $0.05/min
      sms_sent: 0.01,    // $0.01/SMS
      sms_received: 0.01,
    }

    const costs = {
      calls: Math.round(usage.call_minutes * rates.call_minute * 100) / 100,
      sms: Math.round((usage.sms_sent + usage.sms_received) * rates.sms_sent * 100) / 100,
    }

    // Overage calculation
    const overageMinutes = Math.max(0, usage.call_minutes - limits.minutes)
    const overageRate = {
      trial: 0.15,
      starter: 0.15,
      pro: 0.12,
      business: 0.10,
      enterprise: 0.08,
    }[org?.plan || 'trial']

    const overageCost = Math.round(overageMinutes * (overageRate || 0.15) * 100) / 100

    return NextResponse.json({
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      plan: org?.plan || 'trial',
      limits: {
        minutes: limits.minutes,
        agents: limits.agents,
        numbers: limits.numbers,
      },
      usage: {
        call_minutes: usage.call_minutes,
        sms_sent: usage.sms_sent,
        sms_received: usage.sms_received,
        minutes_remaining: Math.max(0, limits.minutes - usage.call_minutes),
        percent_used: limits.minutes > 0 ? Math.round((usage.call_minutes / limits.minutes) * 100) : 0,
      },
      costs: {
        base: costs.calls + costs.sms,
        overage: overageCost,
        total: costs.calls + costs.sms + overageCost,
      },
      daily_breakdown: Object.entries(dailyUsage).map(([date, data]) => ({
        date,
        ...data,
      })),
    })

  } catch (error) {
    console.error('Usage GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
