'use client'

import Link from 'next/link'
import { useAgents } from '@/hooks/useAgents'
import { TEMPLATES } from '@/lib/templates'

export default function AgentsPage() {
  const { agents, loading, error, deleteAgent } = useAgents()

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      try {
        await deleteAgent(id)
      } catch (err) {
        alert('Failed to delete agent')
      }
    }
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ff4444' }}>
        <p>Error loading agents: {error}</p>
      </div>
    )
  }

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

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
          Loading agents...
        </div>
      )}

      {/* Empty State */}
      {!loading && agents.length === 0 && (
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '12px',
          padding: '60px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
            No agents yet
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Create your first AI voice agent to start handling calls
          </p>
          <Link
            href="/dashboard/agents/new"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#00ff88',
              color: '#000',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Create Your First Agent
          </Link>
        </div>
      )}

      {/* Agents Grid */}
      {!loading && agents.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {agents.map((agent) => {
            const template = agent.template_id ? TEMPLATES[agent.template_id] : null
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
                      <span style={{ fontSize: '24px' }}>
                        {template?.industry?.includes('Dental') ? '🦷' : 
                         template?.industry?.includes('Plumbing') ? '🔧' :
                         template?.industry?.includes('Legal') ? '⚖️' : '🤖'}
                      </span>
                      <span style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>
                        {agent.name}
                      </span>
                    </div>
                    <div style={{ color: '#666', fontSize: '13px' }}>
                      {agent.phone_number?.number || 'No phone number assigned'}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backgroundColor: agent.status === 'active' ? 'rgba(0, 255, 136, 0.1)' : 
                      agent.status === 'draft' ? 'rgba(255, 200, 0, 0.1)' : '#1a1a1a',
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: agent.status === 'active' ? '#00ff88' : 
                        agent.status === 'draft' ? '#ffc800' : '#666',
                    }} />
                    <span style={{
                      color: agent.status === 'active' ? '#00ff88' : 
                        agent.status === 'draft' ? '#ffc800' : '#666',
                      fontSize: '12px',
                      fontWeight: '500',
                      textTransform: 'capitalize',
                    }}>
                      {agent.status}
                    </span>
                  </div>
                </div>

                {/* Template Badge */}
                {template && (
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#888',
                    marginBottom: '16px',
                  }}>
                    {template.name} Template
                  </div>
                )}

                {/* Vapi Status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                  padding: '8px 12px',
                  backgroundColor: '#0a0a0a',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}>
                  <span style={{ color: agent.vapi_assistant_id ? '#00ff88' : '#ff4444' }}>
                    {agent.vapi_assistant_id ? '✓' : '✗'}
                  </span>
                  <span style={{ color: '#666' }}>
                    {agent.vapi_assistant_id ? 'Connected to Vapi' : 'Not connected to Vapi'}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <Link
                    href={`/dashboard/agents/${agent.id}`}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: '13px',
                      textAlign: 'center',
                    }}
                  >
                    Configure
                  </Link>
                  {agent.status === 'draft' && (
                    <Link
                      href={`/dashboard/agents/${agent.id}/test`}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#00ff88',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#000',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: '600',
                        textAlign: 'center',
                      }}
                    >
                      Test Agent
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(agent.id, agent.name)}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: 'transparent',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#ff4444',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Templates Section */}
      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
          Available Templates
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {Object.values(TEMPLATES).map((template) => (
            <div
              key={template.id}
              style={{
                backgroundColor: '#111',
                border: '1px solid #222',
                borderRadius: '8px',
                padding: '16px',
                opacity: template.status === 'coming_soon' ? 0.5 : 1,
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                {template.industry?.includes('Dental') ? '🦷' : 
                 template.industry?.includes('Plumbing') || template.industry?.includes('Home') ? '🔧' :
                 template.industry?.includes('HVAC') ? '❄️' :
                 template.industry?.includes('Legal') ? '⚖️' :
                 template.industry?.includes('Med') ? '💆' : '🤖'}
              </div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                {template.name}
              </div>
              <div style={{ color: '#666', fontSize: '11px', marginBottom: '8px' }}>
                {template.industry}
              </div>
              {template.status === 'coming_soon' ? (
                <span style={{ fontSize: '11px', color: '#666' }}>Coming Soon</span>
              ) : (
                <Link
                  href={`/dashboard/agents/new?template=${template.id}`}
                  style={{ fontSize: '12px', color: '#00ff88', textDecoration: 'none' }}
                >
                  Use Template →
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
