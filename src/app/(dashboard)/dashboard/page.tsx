export default function DashboardPage() {
  const stats = [
    { label: 'Total Calls', value: '1,284', change: '+12%', up: true },
    { label: 'Calls Today', value: '47', change: '+8%', up: true },
    { label: 'Leads Captured', value: '312', change: '+23%', up: true },
    { label: 'Avg Duration', value: '3:42', change: '-5%', up: false },
  ]

  const recentCalls = [
    { id: 1, caller: '+1 (555) 123-4567', duration: '4:32', status: 'completed', time: '2 min ago', intent: 'Booking' },
    { id: 2, caller: '+1 (555) 234-5678', duration: '2:15', status: 'completed', time: '15 min ago', intent: 'Inquiry' },
    { id: 3, caller: '+1 (555) 345-6789', duration: '0:00', status: 'missed', time: '32 min ago', intent: '-' },
    { id: 4, caller: '+1 (555) 456-7890', duration: '6:18', status: 'completed', time: '1 hr ago', intent: 'Emergency' },
    { id: 5, caller: '+1 (555) 567-8901', duration: '1:45', status: 'voicemail', time: '2 hr ago', intent: '-' },
  ]

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
            }}
          >
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
              {stat.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>
                {stat.value}
              </span>
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: stat.up ? '#00ff88' : '#ff4444',
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
            {recentCalls.map((call, index) => (
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
                    {call.caller}
                  </div>
                  <div style={{ color: '#666', fontSize: '12px', marginTop: '2px' }}>
                    {call.time} · {call.duration}
                  </div>
                </div>
                <div style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: call.intent === 'Emergency' ? 'rgba(255, 68, 68, 0.1)' :
                    call.intent === 'Booking' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  color: call.intent === 'Emergency' ? '#ff4444' :
                    call.intent === 'Booking' ? '#00ff88' : '#888',
                }}>
                  {call.intent}
                </div>
              </div>
            ))}
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
                href="/dashboard/contacts/import"
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
                <span>📥</span> Import Contacts
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
              {[
                { name: 'Main Line Agent', calls: 34, status: 'active' },
                { name: 'After Hours', calls: 12, status: 'active' },
              ].map((agent) => (
                <div
                  key={agent.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '8px',
                  }}
                >
                  <div>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                      {agent.name}
                    </div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      {agent.calls} calls today
                    </div>
                  </div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#00ff88',
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
