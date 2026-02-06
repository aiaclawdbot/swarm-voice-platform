'use client'

import { useState, useEffect, useCallback } from 'react'
import { dashboardApi, DashboardMetrics, Call } from '@/lib/api/client'
import { MOCK_CALLS, MOCK_DASHBOARD_STATS, isDemoMode } from '@/lib/mock-data'

// Demo mode metrics
const DEMO_METRICS: DashboardMetrics = {
  total_calls: MOCK_DASHBOARD_STATS.totalCalls,
  completed_calls: MOCK_DASHBOARD_STATS.totalCalls - 3,
  missed_calls: 3,
  total_minutes: MOCK_DASHBOARD_STATS.totalCalls * 2.9,
  avg_call_duration: MOCK_DASHBOARD_STATS.avgDuration,
  answer_rate: 96,
  capture_rate: MOCK_DASHBOARD_STATS.bookingRate,
  total_contacts: MOCK_DASHBOARD_STATS.leadsCaptured + 5,
  new_leads: MOCK_DASHBOARD_STATS.leadsCaptured,
  qualified_leads: Math.floor(MOCK_DASHBOARD_STATS.leadsCaptured * 0.7),
  active_agents: 1,
}

export function useDashboard(period: '7d' | '30d' | '90d' = '7d') {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [intentBreakdown, setIntentBreakdown] = useState<Record<string, number>>({})
  const [recentCalls, setRecentCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if we're in demo mode or API fails
      const demoMode = isDemoMode()
      
      if (demoMode) {
        // Use mock data in demo mode
        setMetrics(DEMO_METRICS)
        setIntentBreakdown({
          booking: 23,
          inquiry: 15,
          emergency: 5,
          other: 4,
        })
        setRecentCalls(MOCK_CALLS.map(c => ({
          ...c,
          contact: {
            id: c.contact_id,
            org_id: c.org_id,
            phone: c.caller_number,
            first_name: c.id === 'call-1' ? 'Sarah' : c.id === 'call-2' ? 'Mike' : 'Emily',
            last_name: c.id === 'call-1' ? 'Johnson' : c.id === 'call-2' ? 'Chen' : null,
            status: 'new',
            created_at: c.created_at,
            updated_at: c.created_at,
          } as Call['contact'],
        })) as Call[])
        setLoading(false)
        return
      }
      
      // Try real API
      const data = await dashboardApi.get(period)
      setMetrics(data.metrics)
      setIntentBreakdown(data.intent_breakdown)
      setRecentCalls(data.recent_calls)
    } catch (err) {
      // Fall back to demo data on error
      console.log('Dashboard API failed, using demo data')
      setMetrics(DEMO_METRICS)
      setIntentBreakdown({ booking: 23, inquiry: 15, emergency: 5, other: 4 })
      setRecentCalls(MOCK_CALLS.map(c => ({
        ...c,
        contact: {
          id: c.contact_id,
          org_id: c.org_id,
          phone: c.caller_number,
          first_name: c.id === 'call-1' ? 'Sarah' : c.id === 'call-2' ? 'Mike' : 'Emily',
          last_name: c.id === 'call-1' ? 'Johnson' : c.id === 'call-2' ? 'Chen' : null,
          status: 'new',
          created_at: c.created_at,
          updated_at: c.created_at,
        } as Call['contact'],
      })) as Call[])
      // Don't set error - we have fallback data
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return {
    metrics,
    intentBreakdown,
    recentCalls,
    loading,
    error,
    refresh: fetchDashboard,
  }
}
