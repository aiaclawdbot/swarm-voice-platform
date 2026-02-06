/**
 * React hooks for workflow data
 */

import { useState, useEffect, useCallback } from 'react'
import { workflowsApi, type Workflow, getOrgId } from '@/lib/api/client'

export function useWorkflows() {
  const orgId = getOrgId()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!orgId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await workflowsApi.list()
      setWorkflows(data.workflows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflows')
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createWorkflow = async (workflow: Partial<Workflow>) => {
    try {
      const result = await workflowsApi.create(workflow)
      setWorkflows(prev => [...prev, result.workflow])
      return result.workflow
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create workflow')
    }
  }

  const updateWorkflow = async (id: string, updates: Partial<Workflow>) => {
    try {
      const result = await workflowsApi.update(id, updates)
      setWorkflows(prev => prev.map(w => w.id === id ? result.workflow : w))
      return result.workflow
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update workflow')
    }
  }

  const deleteWorkflow = async (id: string) => {
    try {
      await workflowsApi.delete(id)
      setWorkflows(prev => prev.filter(w => w.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete workflow')
    }
  }

  const toggleWorkflow = async (id: string, isActive: boolean) => {
    return updateWorkflow(id, { status: isActive ? 'active' : 'paused' })
  }

  return {
    workflows,
    loading,
    error,
    refresh,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflow,
  }
}

export function useWorkflow(id: string | null) {
  const orgId = getOrgId()
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !orgId) {
      setWorkflow(null)
      setLoading(false)
      return
    }

    const fetchWorkflow = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const data = await workflowsApi.get(id)
        setWorkflow(data.workflow)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch workflow')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflow()
  }, [id, orgId])

  return { workflow, loading, error }
}
