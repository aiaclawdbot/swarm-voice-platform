'use client'

import Link from 'next/link'
import { AGENT_TEMPLATES } from '@/lib/templates'

interface Agent {
  id: string
  name: string
  templateId: string
  phoneNumber: string
  status: 'active' | 'inactive' | 'draft'
  callsToday: number
  leadsToday: number
}

const mockAgents: Agent[] = [
  { id: '1', name: 'Main Line Agent', templateId: 'plumbing', phoneNumber: '+1 (555) 123-4567', status: 'active', callsToday: 34, leadsToday: 12 },
  { id: '2', name: 'After Hours', templateId: 'plumbing', phoneNumber: '+1 (555) 123-4568', status: 'active', callsToday: 18, leadsToday: 6 },
]

export default function AgentsPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
            Voice Agents
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Configure your AI voice agents
          </p>
        </div>
        <Link
          href="/dashboard/agents/new"
          style={{
            padding: '10px 20px',
            backgroundColor: '#00ff88',
            border: 'none',
            borderRadius: '8px',
            color: '#000',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          + Create Agent
        </Link>
      </div>

      {/* Active Agents */}
      {mockAgents.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
            Your Agents
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {mockAgents.map((agent) => {
              const template = AGENT_TEMPLATES.find(t => t.id === agent.templateId)
              return (
                <div
                  key={agent.id}
                  style={{
                    backgroundColor: '#111',
                    border: '1px solid #222',
                    borderRadius: '12px',
                    padding: '24px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '24px' }}>{template?.icon || '🤖'}</span>
                        <span style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>
                          {agent.name}
                        </span>
                      </div>
                      <div style={{ color: '#666', fontSize: '13px' }}>
                        {agent.phoneNumber}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor: agent.status === 'active' ? 'rgba(0, 255, 136, 0.1)' : '#1a1a1a',
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: agent.status === 'active' ? '#00ff88' : '#666',
                      }} />
                      <span style={{
                        color: agent.status === 'active' ? '#00ff88' : '#666',
                        fontSize: '12px',
                        fontWeight: '500',
                        textTransform: 'capitalize',
                      }}>
                        {agent.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                    <div>
                      <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Calls Today</div>
                      <div style={{ color: '#fff', fontSize: '20px', fontWeight: '600' }}>{agent.callsToday}</div>
                    </div>
                    <div>
                      <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Leads Today</div>
                      <div style={{ color: '#00ff88', fontSize: '20px', fontWeight: '600' }}>{agent.leadsToday}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Link
                      href={`/dashboard/agents/${agent.id}`}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '13px',
                        textAlign: 'center',
                        textDecoration: 'none',
                      }}
                    >
                      Configure
                    </Link>
                    <button
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: 'transparent',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#888',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      View Calls
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Templates */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>
          Start from a Template
        </h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          Pre-configured agents for your industry
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {AGENT_TEMPLATES.map((template) => (
            <Link
              key={template.id}
              href={`/dashboard/agents/new?template=${template.id}`}
              style={{
                padding: '24px',
                backgroundColor: '#111',
                border: '1px solid #222',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'border-color 0.15s ease',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{template.icon}</div>
              <div style={{ color: '#fff', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>
                {template.name}
              </div>
              <div style={{ color: '#666', fontSize: '12px', lineHeight: '1.5' }}>
                {template.description}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
