'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAgent } from '@/hooks/useAgents'

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const agentId = params.id as string
  const { agent, loading, error, update, uploadKnowledge, testCall } = useAgent(agentId)

  const [isEditing, setIsEditing] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testStatus, setTestStatus] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    greeting: '',
    persona: '',
    voice_id: 'alloy',
  })

  // Initialize form data when agent loads
  if (agent && !formData.name && agent.name) {
    setFormData({
      name: agent.name,
      greeting: agent.greeting || '',
      persona: agent.persona || '',
      voice_id: agent.voice_id || 'alloy',
    })
  }

  const handleSave = async () => {
    try {
      await update(formData)
      setIsEditing(false)
    } catch (err) {
      alert('Failed to save changes')
    }
  }

  const handleTestCall = async () => {
    if (!testPhone) {
      alert('Please enter a phone number')
      return
    }
    
    setIsTesting(true)
    setTestStatus('Initiating call...')
    
    try {
      const result = await testCall(testPhone)
      setTestStatus(result.message)
    } catch (err) {
      setTestStatus('Failed to initiate test call')
    } finally {
      setIsTesting(false)
    }
  }

  const handleActivate = async () => {
    if (!agent?.phone_number) {
      alert('Please assign a phone number before activating')
      return
    }
    
    try {
      await update({ status: 'active' })
    } catch (err) {
      alert('Failed to activate agent')
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        Loading agent...
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ff4444' }}>
        <p>{error || 'Agent not found'}</p>
        <Link href="/dashboard/agents" style={{ color: '#00ff88', marginTop: '16px', display: 'inline-block' }}>
          ← Back to Agents
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <Link href="/dashboard/agents" style={{ color: '#666', textDecoration: 'none', fontSize: '13px' }}>
            ← Back to Agents
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginTop: '8px' }}>
            {agent.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <span style={{
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: agent.status === 'active' ? 'rgba(0, 255, 136, 0.1)' : 
                agent.status === 'draft' ? 'rgba(255, 200, 0, 0.1)' : '#1a1a1a',
              color: agent.status === 'active' ? '#00ff88' : 
                agent.status === 'draft' ? '#ffc800' : '#666',
              textTransform: 'capitalize',
            }}>
              {agent.status}
            </span>
            {agent.phone_number && (
              <span style={{ color: '#666', fontSize: '14px' }}>
                {agent.phone_number.number}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {agent.status === 'draft' && (
            <button
              onClick={handleActivate}
              style={{
                padding: '10px 20px',
                backgroundColor: '#00ff88',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Activate Agent
            </button>
          )}
          {agent.status === 'active' && (
            <button
              onClick={() => update({ status: 'inactive' })}
              style={{
                padding: '10px 20px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#ff4444',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Deactivate
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Configuration */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>
                Configuration
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setIsEditing(false)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#666',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#00ff88',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#000',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '8px' }}>
                  Agent Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#0a0a0a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                ) : (
                  <div style={{ color: '#fff', fontSize: '14px' }}>{agent.name}</div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '8px' }}>
                  Greeting Message
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.greeting}
                    onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#0a0a0a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px',
                      resize: 'vertical',
                    }}
                  />
                ) : (
                  <div style={{ color: '#fff', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                    {agent.greeting || 'No greeting set'}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '8px' }}>
                  Persona / System Prompt
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.persona}
                    onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#0a0a0a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px',
                      resize: 'vertical',
                      fontFamily: 'monospace',
                    }}
                  />
                ) : (
                  <div style={{ 
                    color: '#fff', 
                    fontSize: '13px', 
                    whiteSpace: 'pre-wrap',
                    maxHeight: '200px',
                    overflow: 'auto',
                    backgroundColor: '#0a0a0a',
                    padding: '12px',
                    borderRadius: '6px',
                  }}>
                    {agent.persona || 'No persona set'}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '8px' }}>
                  Voice
                </label>
                {isEditing ? (
                  <select
                    value={formData.voice_id}
                    onChange={(e) => setFormData({ ...formData, voice_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#0a0a0a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  >
                    <option value="alloy">Alloy (Neutral)</option>
                    <option value="nova">Nova (Female)</option>
                    <option value="shimmer">Shimmer (Female)</option>
                    <option value="echo">Echo (Male)</option>
                    <option value="onyx">Onyx (Male)</option>
                    <option value="fable">Fable (Expressive)</option>
                  </select>
                ) : (
                  <div style={{ color: '#fff', fontSize: '14px', textTransform: 'capitalize' }}>
                    {agent.voice_id}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Test Call */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '24px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              Test Your Agent
            </h2>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>
              Enter your phone number to receive a test call from your agent
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={handleTestCall}
                disabled={isTesting}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isTesting ? '#333' : '#00ff88',
                  border: 'none',
                  borderRadius: '6px',
                  color: isTesting ? '#666' : '#000',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isTesting ? 'not-allowed' : 'pointer',
                }}
              >
                {isTesting ? 'Calling...' : 'Call Me'}
              </button>
            </div>
            {testStatus && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#0a0a0a',
                borderRadius: '6px',
                color: testStatus.includes('Failed') ? '#ff4444' : '#00ff88',
                fontSize: '13px',
              }}>
                {testStatus}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Connection Status */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '24px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#888', fontSize: '13px' }}>Vapi Connected</span>
                <span style={{ color: agent.vapi_assistant_id ? '#00ff88' : '#ff4444', fontSize: '13px' }}>
                  {agent.vapi_assistant_id ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#888', fontSize: '13px' }}>Phone Number</span>
                <span style={{ color: agent.phone_number ? '#00ff88' : '#ff4444', fontSize: '13px' }}>
                  {agent.phone_number ? '✓ Assigned' : '✗ Not assigned'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#888', fontSize: '13px' }}>Status</span>
                <span style={{ 
                  color: agent.status === 'active' ? '#00ff88' : '#ffc800', 
                  fontSize: '13px',
                  textTransform: 'capitalize',
                }}>
                  {agent.status}
                </span>
              </div>
            </div>

            {!agent.phone_number && (
              <Link
                href="/dashboard/phone-numbers"
                style={{
                  display: 'block',
                  marginTop: '16px',
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
                Provision Phone Number
              </Link>
            )}
          </div>

          {/* Quick Info */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '24px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ color: '#888' }}>
                Template: <span style={{ color: '#fff' }}>{agent.template_id || 'Custom'}</span>
              </div>
              <div style={{ color: '#888' }}>
                Voice: <span style={{ color: '#fff', textTransform: 'capitalize' }}>{agent.voice_id}</span>
              </div>
              <div style={{ color: '#888' }}>
                Model: <span style={{ color: '#fff' }}>{agent.model || 'gpt-4o-mini'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
