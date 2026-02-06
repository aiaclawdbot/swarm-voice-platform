'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AGENT_TEMPLATES, getTemplate, type AgentTemplate } from '@/lib/templates'

function NewAgentContent() {
  const searchParams = useSearchParams()
  const templateParam = searchParams.get('template')
  
  const [step, setStep] = useState(templateParam ? 2 : 1)
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(
    templateParam ? getTemplate(templateParam) || null : null
  )
  const [companyName, setCompanyName] = useState('')
  const [agentName, setAgentName] = useState('')
  const [greeting, setGreeting] = useState('')
  const [persona, setPersona] = useState('')

  useEffect(() => {
    if (selectedTemplate) {
      setGreeting(selectedTemplate.greeting.replace(/\{\{company_name\}\}/g, companyName || 'Your Company'))
      setPersona(selectedTemplate.persona.replace(/\{\{company_name\}\}/g, companyName || 'Your Company'))
    }
  }, [selectedTemplate, companyName])

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/dashboard/agents" style={{ color: '#666', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          ← Back to Agents
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
          Create Voice Agent
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Set up a new AI agent to handle your calls
        </p>
      </div>

      {/* Progress */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
      }}>
        {['Template', 'Details', 'Voice', 'Review'].map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              backgroundColor: step > i ? '#00ff88' : '#333',
            }}
          />
        ))}
      </div>

      {/* Step 1: Choose Template */}
      {step === 1 && (
        <div>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            Choose your industry
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {AGENT_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template)
                  setStep(2)
                }}
                style={{
                  padding: '24px',
                  backgroundColor: '#111',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{template.icon}</div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>
                  {template.name}
                </div>
                <div style={{ color: '#666', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
                  {template.description}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {template.keyCapabilities.slice(0, 3).map((cap) => (
                    <span
                      key={cap}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#1a1a1a',
                        borderRadius: '4px',
                        color: '#888',
                        fontSize: '11px',
                      }}
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Business Details */}
      {step === 2 && selectedTemplate && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px',
            padding: '16px',
            backgroundColor: '#111',
            borderRadius: '12px',
            border: '1px solid #222',
          }}>
            <span style={{ fontSize: '28px' }}>{selectedTemplate.icon}</span>
            <div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                {selectedTemplate.name} Template
              </div>
              <button
                onClick={() => setStep(1)}
                style={{
                  color: '#00ff88',
                  fontSize: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Change template
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Smith Plumbing"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#111',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <div style={{ color: '#666', fontSize: '12px', marginTop: '6px' }}>
                This will be used in your agent's greeting
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Agent Name
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g., Main Line Agent"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#111',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <div style={{ color: '#666', fontSize: '12px', marginTop: '6px' }}>
                Internal name to identify this agent
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Greeting Script
              </label>
              <textarea
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#111',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => setStep(1)}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#888',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!companyName}
              style={{
                padding: '12px 24px',
                backgroundColor: companyName ? '#00ff88' : '#333',
                border: 'none',
                borderRadius: '8px',
                color: companyName ? '#000' : '#666',
                fontSize: '14px',
                fontWeight: '600',
                cursor: companyName ? 'pointer' : 'not-allowed',
              }}
            >
              Next: Voice Settings →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Voice Settings */}
      {step === 3 && selectedTemplate && (
        <div>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            Choose a voice
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
            {[
              { id: 'alloy', name: 'Alloy', desc: 'Neutral, professional', recommended: selectedTemplate.suggestedVoice === 'alloy' },
              { id: 'onyx', name: 'Onyx', desc: 'Deep, authoritative', recommended: selectedTemplate.suggestedVoice === 'onyx' },
              { id: 'nova', name: 'Nova', desc: 'Warm, friendly', recommended: selectedTemplate.suggestedVoice === 'nova' },
              { id: 'shimmer', name: 'Shimmer', desc: 'Clear, upbeat', recommended: selectedTemplate.suggestedVoice === 'shimmer' },
              { id: 'echo', name: 'Echo', desc: 'Calm, reassuring', recommended: selectedTemplate.suggestedVoice === 'echo' },
              { id: 'fable', name: 'Fable', desc: 'Expressive, dynamic', recommended: false },
            ].map((voice) => (
              <button
                key={voice.id}
                style={{
                  padding: '20px',
                  backgroundColor: voice.recommended ? 'rgba(0, 255, 136, 0.05)' : '#111',
                  border: voice.recommended ? '2px solid #00ff88' : '1px solid #333',
                  borderRadius: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {voice.recommended && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '12px',
                    padding: '2px 8px',
                    backgroundColor: '#00ff88',
                    color: '#000',
                    fontSize: '10px',
                    fontWeight: '700',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                  }}>
                    Recommended
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                  }}>
                    🎙️
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>{voice.name}</div>
                    <div style={{ color: '#666', fontSize: '12px' }}>{voice.desc}</div>
                  </div>
                </div>
                <button
                  style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#888',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  ▶ Preview
                </button>
              </button>
            ))}
          </div>

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => setStep(2)}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#888',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(4)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#00ff88',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Next: Review →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && selectedTemplate && (
        <div>
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <span style={{ fontSize: '40px' }}>{selectedTemplate.icon}</span>
              <div>
                <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
                  {agentName || companyName + ' Agent'}
                </h2>
                <div style={{ color: '#666', fontSize: '14px' }}>{selectedTemplate.name} • {selectedTemplate.suggestedVoice}</div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>Greeting</div>
              <div style={{ color: '#fff', fontSize: '14px', lineHeight: '1.6', padding: '12px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                "{greeting}"
              </div>
            </div>

            <div>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>Capabilities</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedTemplate.keyCapabilities.map((cap) => (
                  <span
                    key={cap}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#1a1a1a',
                      borderRadius: '6px',
                      color: '#888',
                      fontSize: '12px',
                    }}
                  >
                    ✓ {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(0, 255, 136, 0.05)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>📞</span>
              <div>
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                  Phone number will be assigned after creation
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  You can forward your existing number or get a new one
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => setStep(3)}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#888',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              style={{
                padding: '12px 32px',
                backgroundColor: '#00ff88',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Create Agent ✓
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NewAgentPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '32px', color: '#666' }}>Loading...</div>
    }>
      <NewAgentContent />
    </Suspense>
  )
}
