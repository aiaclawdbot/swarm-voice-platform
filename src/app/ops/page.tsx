'use client'

import Link from 'next/link'

export default function OpsDashboard() {
  const stats = {
    totalClients: 12,
    activeAgents: 24,
    callsToday: 847,
    leadsToday: 156,
    avgCallDuration: '2:34',
    leadCaptureRate: '18.4%',
    totalCallsMonth: 12847,
    mrr: 36000,
  }

  const recentCalls = [
    { id: 1, number: '+1 (555) 123-4567', client: 'Acme Plumbing', time: '2 min ago', outcome: 'lead_captured', duration: '3:24' },
    { id: 2, number: '+1 (555) 234-5678', client: 'Bright Smile Dental', time: '5 min ago', outcome: 'appointment', duration: '2:15' },
    { id: 3, number: '+1 (555) 345-6789', client: 'Summit HVAC', time: '8 min ago', outcome: 'lead_captured', duration: '4:02' },
    { id: 4, number: '+1 (555) 456-7890', client: 'Elite Med Spa', time: '12 min ago', outcome: 'transferred', duration: '1:45' },
    { id: 5, number: '+1 (555) 567-8901', client: 'Acme Plumbing', time: '15 min ago', outcome: 'voicemail', duration: '0:32' },
  ]

  const recentLeads = [
    { id: 1, name: 'John Smith', client: 'Acme Plumbing', intent: 'Emergency - burst pipe', urgency: 'high', time: '2 min ago' },
    { id: 2, name: 'Sarah Johnson', client: 'Bright Smile Dental', intent: 'New patient - cleaning', urgency: 'medium', time: '5 min ago' },
    { id: 3, name: 'Mike Chen', client: 'Summit HVAC', intent: 'AC not cooling', urgency: 'high', time: '8 min ago' },
    { id: 4, name: 'Lisa Rodriguez', client: 'Elite Med Spa', intent: 'Botox consultation', urgency: 'low', time: '12 min ago' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Welcome back. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/ops/clients"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
          >
            + New Client
          </Link>
        </div>
      </div>
      
      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          label="Calls Today" 
          value={stats.callsToday.toLocaleString()} 
          change="+12%"
          positive 
        />
        <StatCard 
          label="Leads Captured" 
          value={stats.leadsToday.toLocaleString()} 
          change="+8%"
          positive 
        />
        <StatCard 
          label="Avg Duration" 
          value={stats.avgCallDuration} 
          change="+0:12"
          positive 
        />
        <StatCard 
          label="Capture Rate" 
          value={stats.leadCaptureRate} 
          change="+2.1%"
          positive 
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
          <div className="text-sm text-zinc-400 mb-1">Active Clients</div>
          <div className="text-3xl font-bold">{stats.totalClients}</div>
        </div>
        <div className="col-span-1 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
          <div className="text-sm text-zinc-400 mb-1">Voice Agents</div>
          <div className="text-3xl font-bold">{stats.activeAgents}</div>
        </div>
        <div className="col-span-1 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
          <div className="text-sm text-zinc-400 mb-1">Calls This Month</div>
          <div className="text-3xl font-bold">{stats.totalCallsMonth.toLocaleString()}</div>
        </div>
        <div className="col-span-1 p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
          <div className="text-sm text-emerald-400 mb-1">Monthly Revenue</div>
          <div className="text-3xl font-bold text-emerald-400">${stats.mrr.toLocaleString()}</div>
        </div>
      </div>
      
      {/* Activity Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Calls */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="font-semibold">Recent Calls</h2>
            <Link href="/ops/calls" className="text-sm text-emerald-500 hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-zinc-800">
            {recentCalls.map((call) => (
              <div key={call.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{call.number}</div>
                    <div className="text-xs text-zinc-500">{call.client} • {call.duration}</div>
                  </div>
                </div>
                <div className="text-right">
                  <OutcomeBadge outcome={call.outcome} />
                  <div className="text-xs text-zinc-500 mt-1">{call.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Leads */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="font-semibold">Recent Leads</h2>
            <Link href="/ops/leads" className="text-sm text-emerald-500 hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-zinc-800">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{lead.name}</div>
                    <div className="text-xs text-zinc-500">{lead.client}</div>
                  </div>
                </div>
                <div className="text-right">
                  <UrgencyBadge urgency={lead.urgency} />
                  <div className="text-xs text-zinc-500 mt-1 max-w-32 truncate">{lead.intent}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-4">
          <Link href="/ops/clients" className="p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-center transition-colors">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm font-medium">Add Client</div>
          </Link>
          <Link href="/ops/templates" className="p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-center transition-colors">
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm font-medium">Templates</div>
          </Link>
          <Link href="/ops/calls" className="p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-center transition-colors">
            <div className="text-2xl mb-2">📞</div>
            <div className="text-sm font-medium">Call History</div>
          </Link>
          <Link href="/ops/analytics" className="p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-center transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">Analytics</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {change}
        </span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  )
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const styles: Record<string, string> = {
    lead_captured: 'bg-emerald-500/10 text-emerald-400',
    appointment: 'bg-blue-500/10 text-blue-400',
    transferred: 'bg-purple-500/10 text-purple-400',
    voicemail: 'bg-amber-500/10 text-amber-400',
  }
  const labels: Record<string, string> = {
    lead_captured: 'Lead',
    appointment: 'Booked',
    transferred: 'Transfer',
    voicemail: 'VM',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${styles[outcome] || 'bg-zinc-500/10 text-zinc-400'}`}>
      {labels[outcome] || outcome}
    </span>
  )
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const styles: Record<string, string> = {
    high: 'bg-red-500/10 text-red-400',
    medium: 'bg-amber-500/10 text-amber-400',
    low: 'bg-zinc-500/10 text-zinc-400',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded capitalize ${styles[urgency] || styles.low}`}>
      {urgency}
    </span>
  )
}
