'use client'

import { useState, useEffect, useCallback } from 'react'
import { callsApi, Call } from '@/lib/api/client'
import { MOCK_CALLS, isDemoMode } from '@/lib/mock-data'

// Convert mock calls to full Call type
const getMockCalls = (): Call[] => {
  return MOCK_CALLS.map(c => ({
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
    },
    agent: {
      id: c.agent_id,
      name: 'Dental Reception AI',
    },
  })) as unknown as Call[]
}

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
      
      // Check if in demo mode
      if (isDemoMode()) {
        const mockCalls = getMockCalls()
        setCalls(mockCalls)
        setTotal(mockCalls.length)
        setLoading(false)
        return
      }
      
      const data = await callsApi.list(params)
      setCalls(data.calls)
      setTotal(data.total)
    } catch (err) {
      // Fall back to mock data
      console.log('Calls API failed, using demo data')
      const mockCalls = getMockCalls()
      setCalls(mockCalls)
      setTotal(mockCalls.length)
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
