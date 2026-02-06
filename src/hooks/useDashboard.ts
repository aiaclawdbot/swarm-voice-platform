'use client'

import { useState, useEffect, useCallback } from 'react'
import { dashboardApi, DashboardMetrics, Call } from '@/lib/api/client'

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
      const data = await dashboardApi.get(period)
      setMetrics(data.metrics)
      setIntentBreakdown(data.intent_breakdown)
      setRecentCalls(data.recent_calls)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard')
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
