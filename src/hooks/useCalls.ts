'use client'

import { useState, useEffect, useCallback } from 'react'
import { callsApi, Call } from '@/lib/api/client'

export function useCalls(initialParams?: { agentId?: string; contactId?: string; status?: string }) {
  const [calls, setCalls] = useState<Call[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState(initialParams || {})

  const fetchCalls = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await callsApi.list(params)
      setCalls(data.calls)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch calls')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchCalls()
  }, [fetchCalls])

  const setFilter = (newParams: typeof params) => {
    setParams(newParams)
  }

  return {
    calls,
    total,
    loading,
    error,
    refresh: fetchCalls,
    setFilter,
  }
}
