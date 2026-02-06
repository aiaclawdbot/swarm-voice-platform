'use client'

import { useState, useEffect, useCallback } from 'react'
import { agentsApi, Agent } from '@/lib/api/client'

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { agents } = await agentsApi.list()
      setAgents(agents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agents')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const createAgent = async (data: Parameters<typeof agentsApi.create>[0]) => {
    const result = await agentsApi.create(data)
    setAgents(prev => [...prev, result.agent])
    return result.agent
  }

  const createFromTemplate = async (data: Parameters<typeof agentsApi.createFromTemplate>[0]) => {
    const result = await agentsApi.createFromTemplate(data)
    setAgents(prev => [...prev, result.agent])
    return result
  }

  const updateAgent = async (id: string, data: Parameters<typeof agentsApi.update>[1]) => {
    const result = await agentsApi.update(id, data)
    setAgents(prev => prev.map(a => a.id === id ? result.agent : a))
    return result.agent
  }

  const deleteAgent = async (id: string) => {
    await agentsApi.delete(id)
    setAgents(prev => prev.filter(a => a.id !== id))
  }

  return {
    agents,
    loading,
    error,
    refresh: fetchAgents,
    createAgent,
    createFromTemplate,
    updateAgent,
    deleteAgent,
  }
}

export function useAgent(id: string) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgent = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const { agent } = await agentsApi.get(id)
      setAgent(agent)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agent')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchAgent()
  }, [fetchAgent])

  const update = async (data: Parameters<typeof agentsApi.update>[1]) => {
    const result = await agentsApi.update(id, data)
    setAgent(result.agent)
    return result.agent
  }

  const uploadKnowledge = async (content: string, title?: string) => {
    return agentsApi.uploadKnowledge(id, { content, title })
  }

  const testCall = async (phoneNumber: string) => {
    return agentsApi.testCall(id, phoneNumber)
  }

  return {
    agent,
    loading,
    error,
    refresh: fetchAgent,
    update,
    uploadKnowledge,
    testCall,
  }
}
