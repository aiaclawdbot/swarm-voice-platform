'use client'

import { useDashboard } from '@/hooks/useDashboard'
import { useAgents } from '@/hooks/useAgents'

export default function DashboardPage() {
  const { metrics, recentCalls, loading, error } = useDashboard('7d')
  const { agents } = useAgents()

  // Format duration from seconds to mm:ss
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`
    return `${Math.floor(diffMins / 1440)} days ago`
  }

  const stats = [
    { 
      label: 'Total Calls', 
      value: metrics?.total_calls?.toLocaleString() || '0', 
      change: `${metrics?.answer_rate || 100}% answered`,
      up: true 
    },
    { 
      label: 'Calls Today', 
      value: recentCalls?.filter(c => {
        const today = new Date().toDateString()
        return new Date(c.created_at).toDateString() === today
      }).length.toString() || '0', 
      change: 'today',
      up: true 
    },
    { 
      label: 'Leads Captured', 
      value: metrics?.new_leads?.toLocaleString() || '0', 
      change: `${metrics?.capture_rate || 0}% capture rate`,
      up: true 
    },
    { 
      label: 'Avg Duration', 
      value: formatDuration(metrics?.avg_call_duration || 0), 
      change: `${(metrics?.total_minutes || 0).toFixed(1)} min total`,
      up: true 
    },
  ]

  const activeAgents = agents.filter(a => a.status === 'active')

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ff4444' }}>
        <p>Error loading dashboard: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{ marginTop: '16px', padding: '8px 16px', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
          Dashboard
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Overview of your voice agent performance
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: '#111',
              border: '1px solid #222',
              borderRadius: '12px',
              padding: '24px',
              opacity: loading ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
              {stat.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>
                {loading ? '...' : stat.value}
              </span>
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#00ff88',
              }}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent Calls */}
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #222',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>
              Recent Calls
            </h2>
            <a href="/dashboard/calls" style={{ fontSize: '13px', color: '#00ff88', textDecoration: 'none' }}>
              View all →
            </a>
          </div>
          <div>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                Loading calls...
              </div>
            ) : recentCalls.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                <p>No calls yet</p>
                <p style={{ fontSize: '13px', marginTop: '8px' }}>
                  Calls will appear here once your agent starts receiving them
                </p>
              </div>
            ) : (
              recentCalls.map((call, index) => (
                <div
                  key={call.id}
                  style={{
                    padding: '16px 24px',
                    borderBottom: index < recentCalls.length - 1 ? '1px solid #1a1a1a' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: call.status === 'completed' ? 'rgba(0, 255, 136, 0.1)' :
                      call.status === 'missed' ? 'rgba(255, 68, 68, 0.1)' : 'rgba(255, 200, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}>
                    {call.status === 'completed' ? '✓' : call.status === 'missed' ? '✗' : '📩'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                      {call.contact?.first_name 
                        ? `${call.contact.first_name} ${call.contact.last_name || ''}`
                        : call.caller_number || 'Unknown'}
                    </div>
                    <div style={{ color: '#666', fontSize: '12px', marginTop: '2px' }}>
                      {formatTimeAgo(call.created_at)} · {formatDuration(call.duration_seconds)}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: call.intent === 'emergency' ? 'rgba(255, 68, 68, 0.1)' :
                      call.intent === 'booking' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: call.intent === 'emergency' ? '#ff4444' :
                      call.intent === 'booking' ? '#00ff88' : '#888',
                    textTransform: 'capitalize',
                  }}>
                    {call.intent || '-'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '24px',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              Quick Actions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href="/dashboard/agents/new"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: '#00ff88',
                  color: '#000',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                <span>🤖</span> Create New Agent
              </a>
              <a
                href="/dashboard/contacts"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: '1px solid #333',
                }}
              >
                <span>👥</span> View Contacts
              </a>
              <a
                href="/dashboard/workflows/new"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: '1px solid #333',
                }}
              >
                <span>⚡</span> Create Workflow
              </a>
            </div>
          </div>

          {/* Active Agents */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '24px',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              Active Agents
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeAgents.length === 0 ? (
                <div style={{ color: '#666', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                  <p>No active agents yet</p>
                  <a 
                    href="/dashboard/agents/new" 
                    style={{ color: '#00ff88', textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}
                  >
                    Create your first agent →
                  </a>
                </div>
              ) : (
                activeAgents.map((agent) => (
                  <a
                    key={agent.id}
                    href={`/dashboard/agents/${agent.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: '#1a1a1a',
                      borderRadius: '8px',
                      textDecoration: 'none',
                    }}
                  >
                    <div>
                      <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                        {agent.name}
                      </div>
                      <div style={{ color: '#666', fontSize: '12px' }}>
                        {agent.phone_number?.number || 'No phone assigned'}
                      </div>
                    </div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#00ff88',
                    }} />
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Usage Summary */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '24px',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              This Month
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '13px' }}>
                <span>Minutes Used</span>
                <span style={{ color: '#fff' }}>{(metrics?.total_minutes || 0).toFixed(0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '13px' }}>
                <span>Total Calls</span>
                <span style={{ color: '#fff' }}>{metrics?.total_calls || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '13px' }}>
                <span>New Leads</span>
                <span style={{ color: '#00ff88' }}>{metrics?.new_leads || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
