'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { setOrgId, getOrgId, organizationApi, Organization } from '@/lib/api/client'

interface OrgContextType {
  organization: Organization | null
  loading: boolean
  error: string | null
  setOrganization: (org: Organization) => void
  refresh: () => Promise<void>
  createOrg: (data: Parameters<typeof organizationApi.create>[0]) => Promise<Organization>
}

export const OrgContext = createContext<OrgContextType | undefined>(undefined)

export function OrgProvider({ children }: { children: ReactNode }) {
  const [organization, setOrganizationState] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrg = async () => {
    const orgId = getOrgId()
    if (!orgId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await organizationApi.get()
      setOrganizationState(data.organization)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organization')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrg()
  }, [])

  const setOrganization = (org: Organization) => {
    setOrgId(org.id)
    setOrganizationState(org)
  }

  const createOrg = async (data: Parameters<typeof organizationApi.create>[0]) => {
    const result = await organizationApi.create(data)
    setOrganization(result.organization)
    return result.organization
  }

  return (
    <OrgContext.Provider
      value={{
        organization,
        loading,
        error,
        setOrganization,
        refresh: fetchOrg,
        createOrg,
      }}
    >
      {children}
    </OrgContext.Provider>
  )
}

export function useOrg() {
  const context = useContext(OrgContext)
  if (context === undefined) {
    throw new Error('useOrg must be used within an OrgProvider')
  }
  return context
}
