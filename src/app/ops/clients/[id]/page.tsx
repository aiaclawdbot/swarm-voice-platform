'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string | null
  status: 'active' | 'paused' | 'churned' | 'onboarding'
  plan: 'starter' | 'pro' | 'enterprise'
  settings: Record<string, unknown>
  created_at: string
  phone_numbers: PhoneNumber[]
  agents: Agent[]
  knowledge_bases: KnowledgeBase[]
  recentCalls: Call[]
  recentLeads: Lead[]
  stats: {
    totalCalls: number
    totalLeads: number
  }
}

interface PhoneNumber {
  id: string
  number: string
  status: string
}

interface Agent {
  id: string
  name: string
  is_active: boolean
}

interface KnowledgeBase {
  id: string
  name: string
}

interface Call {
  id: string
  caller_number: string
  duration_seconds: number
  outcome: string
  created_at: string
}

interface Lead {
  id: string
  name: string
  phone: string
  intent: string
  status: string
  created_at: string
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'calls' | 'leads' | 'settings'>('overview')

  useEffect(() => {
    fetchClient()
  }, [id])

  async function fetchClient() {
    try {
      const res = await fetch(`/api/clients/${id}`)
      if (res.ok) {
        const data = await res.json()
        setClient(data)
      }
    } catch (error) {
      console.error('Failed to fetch client:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(status: string) {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        fetchClient()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading client...</div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-zinc-400 mb-4">Client not found</div>
        <Link href="/ops/clients" className="text-emerald-500 hover:underline">
          Back to Clients
        </Link>
      </div>
    )
  }

  const planPrices: Record<string, number> = {
    starter: 3000,
    pro: 5000,
    enterprise: 10000
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/ops/clients" className="text-zinc-400 hover:text-white">
              ← Clients
            </Link>
          </div>
          <h1 className="text-3xl font-bold mt-2">{client.company}</h1>
          <p className="text-zinc-400">{client.name} • {client.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={client.status} />
          <select
            value={client.status}
            onChange={e => updateStatus(e.target.value)}
            className="px-3 py-2 bg-zinc-800 rounded-lg border border-zinc-700 text-sm"
          >
            <option value="onboarding">Onboarding</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="churned">Churned</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="text-2xl font-bold capitalize">{client.plan}</div>
          <div className="text-sm text-zinc-400">${planPrices[client.plan]?.toLocaleString()}/mo</div>
        </div>
        <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="text-2xl font-bold">{client.phone_numbers?.length || 0}</div>
          <div className="text-sm text-zinc-400">Phone Numbers</div>
        </div>
        <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="text-2xl font-bold">{client.agents?.length || 0}</div>
          <div className="text-sm text-zinc-400">Agents</div>
        </div>
        <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="text-2xl font-bold">{client.stats?.totalCalls || 0}</div>
          <div className="text-sm text-zinc-400">Total Calls</div>
        </div>
        <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="text-2xl font-bold text-emerald-500">{client.stats?.totalLeads || 0}</div>
          <div className="text-sm text-zinc-400">Leads Captured</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link
          href={`/ops/clients/${id}/agent`}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium"
        >
          Configure Agent
        </Link>
        <Link
          href={`/ops/clients/${id}/knowledge`}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
        >
          Knowledge Base
        </Link>
        <Link
          href={`/ops/clients/${id}/phone`}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
        >
          Phone Numbers
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800">
        <div className="flex gap-6">
          {(['overview', 'calls', 'leads', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 capitalize ${
                activeTab === tab
                  ? 'text-emerald-500 border-b-2 border-emerald-500'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Recent Calls */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <h3 className="font-semibold mb-4">Recent Calls</h3>
            {client.recentCalls?.length > 0 ? (
              <div className="space-y-3">
                {client.recentCalls.map(call => (
                  <div key={call.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div>{call.caller_number || 'Unknown'}</div>
                      <div className="text-zinc-500">{formatDuration(call.duration_seconds)}</div>
                    </div>
                    <div className="text-right">
                      <OutcomeBadge outcome={call.outcome} />
                      <div className="text-zinc-500 text-xs mt-1">
                        {new Date(call.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-zinc-500 text-sm">No calls yet</div>
            )}
          </div>

          {/* Recent Leads */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <h3 className="font-semibold mb-4">Recent Leads</h3>
            {client.recentLeads?.length > 0 ? (
              <div className="space-y-3">
                {client.recentLeads.map(lead => (
                  <div key={lead.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div>{lead.name || 'Unknown'}</div>
                      <div className="text-zinc-500">{lead.phone}</div>
                    </div>
                    <div className="text-right">
                      <LeadStatusBadge status={lead.status} />
                      <div className="text-zinc-500 text-xs mt-1">{lead.intent}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-zinc-500 text-sm">No leads yet</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'calls' && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="text-zinc-400">Full call history coming soon...</div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="text-zinc-400">Full lead management coming soon...</div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <h3 className="font-semibold mb-4">Client Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Notification Email</label>
              <input
                type="email"
                defaultValue={client.email}
                className="w-full max-w-md px-3 py-2 bg-zinc-800 rounded-lg border border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">SMS Notification Number</label>
              <input
                type="tel"
                defaultValue={client.phone || ''}
                className="w-full max-w-md px-3 py-2 bg-zinc-800 rounded-lg border border-zinc-700"
              />
            </div>
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg">
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400',
    onboarding: 'bg-amber-500/20 text-amber-400',
    paused: 'bg-zinc-500/20 text-zinc-400',
    churned: 'bg-red-500/20 text-red-400',
  }
  return (
    <span className={`px-2 py-1 rounded text-xs capitalize ${styles[status] || styles.paused}`}>
      {status}
    </span>
  )
}

function OutcomeBadge({ outcome }: { outcome: string | null }) {
  const styles: Record<string, string> = {
    lead_captured: 'bg-emerald-500/20 text-emerald-400',
    appointment_booked: 'bg-blue-500/20 text-blue-400',
    transferred: 'bg-purple-500/20 text-purple-400',
    voicemail: 'bg-amber-500/20 text-amber-400',
    hangup: 'bg-zinc-500/20 text-zinc-400',
  }
  const labels: Record<string, string> = {
    lead_captured: 'Lead',
    appointment_booked: 'Booked',
    transferred: 'Transfer',
    voicemail: 'VM',
    hangup: 'Hangup',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs ${styles[outcome || ''] || 'bg-zinc-500/20 text-zinc-400'}`}>
      {labels[outcome || ''] || outcome || 'Unknown'}
    </span>
  )
}

function LeadStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-400',
    notified: 'bg-amber-500/20 text-amber-400',
    contacted: 'bg-purple-500/20 text-purple-400',
    converted: 'bg-emerald-500/20 text-emerald-400',
    lost: 'bg-red-500/20 text-red-400',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs capitalize ${styles[status] || 'bg-zinc-500/20 text-zinc-400'}`}>
      {status}
    </span>
  )
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
