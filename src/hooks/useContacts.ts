'use client'

import { useState, useEffect, useCallback } from 'react'
import { contactsApi, Contact } from '@/lib/api/client'

export function useContacts(initialParams?: { status?: string; search?: string }) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState(initialParams || {})

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await contactsApi.list(params)
      setContacts(data.contacts)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const createContact = async (data: Parameters<typeof contactsApi.create>[0]) => {
    const result = await contactsApi.create(data)
    setContacts(prev => [result.contact, ...prev])
    setTotal(prev => prev + 1)
    return result.contact
  }

  const updateContact = async (id: string, data: Parameters<typeof contactsApi.update>[1]) => {
    const result = await contactsApi.update(id, data)
    setContacts(prev => prev.map(c => c.id === id ? result.contact : c))
    return result.contact
  }

  const deleteContact = async (id: string) => {
    await contactsApi.delete(id)
    setContacts(prev => prev.filter(c => c.id !== id))
    setTotal(prev => prev - 1)
  }

  const setFilter = (newParams: typeof params) => {
    setParams(newParams)
  }

  return {
    contacts,
    total,
    loading,
    error,
    refresh: fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    setFilter,
  }
}

export function useContact(id: string) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [activity, setActivity] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContact = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const data = await contactsApi.get(id)
      setContact(data.contact)
      setActivity(data.activity)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contact')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchContact()
  }, [fetchContact])

  const update = async (data: Parameters<typeof contactsApi.update>[1]) => {
    const result = await contactsApi.update(id, data)
    setContact(result.contact)
    return result.contact
  }

  return {
    contact,
    activity,
    loading,
    error,
    refresh: fetchContact,
    update,
  }
}
