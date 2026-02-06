'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string | null
  status: 'active' | 'paused' | 'churned' | 'onboarding'
  plan: 'starter' | 'pro' | 'enterprise'
  call_count: number
  lead_count: number
  created_at: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewClient, setShowNewClient] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    plan: 'starter'
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setShowNewClient(false)
        setFormData({ name: '', company: '', email: '', phone: '', plan: 'starter' })
        fetchClients()
      }
    } catch (error) {
      console.error('Failed to create client:', error)
    } finally {
      setSaving(false)
    }
  }

  const planPrices: Record<string, number> = {
    starter: 3000,
    pro: 5000,
    enterprise: 10000
  }

  const totalMRR = clients
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + (planPrices[c.plan] || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-zinc-400 mt-1">Manage client accounts and deployments</p>
        </div>
        <button
          onClick={() => setShowNewClient(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition-colors"
        >
          + New Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="text-2xl font-bold">{clients.length}</div>
          <div className="text-sm text-zinc-400">Total Clients</div>
        </div>
        <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="text-2xl font-bold text-emerald-500">
            {clients.filter(c => c.status === 'active').length}
          </div>
          <div className="text-sm text-zinc-400">Active</div>
        </div>
        <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="text-2xl font-bold text-amber-500">
            {clients.filter(c => c.status === 'onboarding').length}
          </div>
          <div className="text-sm text-zinc-400">Onboarding</div>
        </div>
        <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="text-2xl font-bold">${totalMRR.toLocaleString()}</div>
          <div className="text-sm text-zinc-400">MRR</div>
        </div>
      </div>

      {/* Client Table */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-zinc-400 mb-4">No clients yet</div>
            <button
              onClick={() => setShowNewClient(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg"
            >
              Add Your First Client
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-4 font-medium text-zinc-400">Client</th>
                <th className="text-left p-4 font-medium text-zinc-400">Status</th>
                <th className="text-left p-4 font-medium text-zinc-400">Plan</th>
                <th className="text-left p-4 font-medium text-zinc-400">Calls</th>
                <th className="text-left p-4 font-medium text-zinc-400">Leads</th>
                <th className="text-left p-4 font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="p-4">
                    <div className="font-medium">{client.company}</div>
                    <div className="text-sm text-zinc-400">{client.name} • {client.email}</div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="p-4">
                    <span className="capitalize">{client.plan}</span>
                    <span className="text-zinc-500 text-sm ml-1">
                      (${(planPrices[client.plan] || 0).toLocaleString()}/mo)
                    </span>
                  </td>
                  <td className="p-4">{client.call_count || 0}</td>
                  <td className="p-4">{client.lead_count || 0}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link 
                        href={`/ops/clients/${client.id}`}
                        className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-sm"
                      >
                        View
                      </Link>
                      <Link 
                        href={`/ops/clients/${client.id}/agent`}
                        className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded text-sm"
                      >
                        Configure Agent
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Client Modal */}
      {showNewClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Client</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.company}
                  onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 rounded-lg border border-zinc-700 focus:border-emerald-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 rounded-lg border border-zinc-700 focus:border-emerald-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 rounded-lg border border-zinc-700 focus:border-emerald-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 rounded-lg border border-zinc-700 focus:border-emerald-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Plan</label>
                <select 
                  value={formData.plan}
                  onChange={e => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 rounded-lg border border-zinc-700 focus:border-emerald-500 outline-none"
                >
                  <option value="starter">Starter ($3K/mo)</option>
                  <option value="pro">Pro ($5K/mo)</option>
                  <option value="enterprise">Enterprise ($10K/mo)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewClient(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Client'}
                </button>
              </div>
            </form>
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
