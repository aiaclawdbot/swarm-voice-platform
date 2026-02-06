'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { TEMPLATES, getAllTemplates } from '@/lib/templates'
import { agentsApi } from '@/lib/api/client'

function NewAgentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateParam = searchParams.get('template')
  
  const [step, setStep] = useState(templateParam ? 2 : 1)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(templateParam)
  const [companyName, setCompanyName] = useState('')
  const [greeting, setGreeting] = useState('')
  const [persona, setPersona] = useState('')
  const [voiceId, setVoiceId] = useState('nova')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedTemplate = selectedTemplateId ? TEMPLATES[selectedTemplateId] : null
  const allTemplates = getAllTemplates()

  useEffect(() => {
    if (selectedTemplate) {
      setGreeting(selectedTemplate.greeting.replace(/\{\{company_name\}\}/g, companyName || 'Your Company'))
      setPersona(selectedTemplate.persona.replace(/\{\{company_name\}\}/g, companyName || 'Your Company'))
      setVoiceId(selectedTemplate.voice_id)
    }
  }, [selectedTemplate, companyName])

  const handleCreate = async () => {
    if (!selectedTemplateId || !companyName) {
      setError('Please complete all required fields')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const result = await agentsApi.createFromTemplate({
        template_id: selectedTemplateId,
        company_name: companyName,
        customizations: {
          greeting,
          persona,
          voice_id: voiceId,
        },
      })

      // Navigate to the new agent
      router.push(`/dashboard/agents/${result.agent.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent')
      setIsCreating(false)
    }
  }

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

      {/* Error */}
      {error && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: 'rgba(255, 68, 68, 0.1)',
          border: '1px solid rgba(255, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#ff4444',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      {/* Step 1: Choose Template */}
      {step === 1 && (
        <div>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            Choose your industry
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {allTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  if (template.status === 'active') {
                    setSelectedTemplateId(template.id)
                    setStep(2)
                  }
                }}
                disabled={template.status === 'coming_soon'}
                style={{
                  padding: '24px',
                  backgroundColor: '#111',
                  border: selectedTemplateId === template.id ? '2px solid #00ff88' : '1px solid #333',
                  borderRadius: '12px',
                  textAlign: 'left',
                  cursor: template.status === 'coming_soon' ? 'not-allowed' : 'pointer',
                  opacity: template.status === 'coming_soon' ? 0.5 : 1,
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>
                  {template.industry?.includes('Dental') ? '🦷' : 
                   template.industry?.includes('Plumbing') || template.industry?.includes('Home') ? '🔧' :
                   template.industry?.includes('HVAC') ? '❄️' :
                   template.industry?.includes('Legal') ? '⚖️' :
                   template.industry?.includes('Med') ? '💆' : '🤖'}
                </div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>
                  {template.name}
                </div>
                <div style={{ color: '#666', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
                  {template.description}
                </div>
                {template.status === 'coming_soon' && (
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '4px',
                    color: '#666',
                    fontSize: '11px',
                  }}>
                    Coming Soon
                  </span>
                )}
                {template.status === 'active' && (
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    borderRadius: '4px',
                    color: '#00ff88',
                    fontSize: '11px',
                  }}>
                    Ready
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Company Details */}
      {step === 2 && (
        <div>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            Business details
          </h2>
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '24px',
          }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '8px' }}>
                Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Bright Smile Dental"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '15px',
                }}
              />
              <p style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
                This will be used in your agent&apos;s greeting and responses
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
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
                onClick={() => companyName && setStep(3)}
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
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Voice Settings */}
      {step === 3 && (
        <div>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            Choose a voice
          </h2>
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '24px',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {[
                { id: 'alloy', name: 'Alloy', desc: 'Neutral, balanced' },
                { id: 'nova', name: 'Nova', desc: 'Warm, professional' },
                { id: 'shimmer', name: 'Shimmer', desc: 'Friendly, energetic' },
                { id: 'echo', name: 'Echo', desc: 'Clear, authoritative' },
                { id: 'onyx', name: 'Onyx', desc: 'Deep, commanding' },
                { id: 'fable', name: 'Fable', desc: 'Expressive, dynamic' },
              ].map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setVoiceId(voice.id)}
                  style={{
                    padding: '16px',
                    backgroundColor: voiceId === voice.id ? 'rgba(0, 255, 136, 0.1)' : '#0a0a0a',
                    border: voiceId === voice.id ? '2px solid #00ff88' : '1px solid #333',
                    borderRadius: '8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ 
                    color: voiceId === voice.id ? '#00ff88' : '#fff', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    marginBottom: '4px',
                  }}>
                    {voice.name}
                  </div>
                  <div style={{ color: '#666', fontSize: '11px' }}>
                    {voice.desc}
                  </div>
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '8px' }}>
                Greeting Message
              </label>
              <textarea
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Review & Create */}
      {step === 4 && (
        <div>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            Review & Create
          </h2>
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Template</div>
              <div style={{ color: '#fff', fontSize: '16px' }}>{selectedTemplate?.name}</div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Company Name</div>
              <div style={{ color: '#fff', fontSize: '16px' }}>{companyName}</div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Voice</div>
              <div style={{ color: '#fff', fontSize: '16px', textTransform: 'capitalize' }}>{voiceId}</div>
            </div>
            <div>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>Greeting Preview</div>
              <div style={{
                padding: '16px',
                backgroundColor: '#0a0a0a',
                borderRadius: '8px',
                color: '#888',
                fontSize: '14px',
                fontStyle: 'italic',
              }}>
                &quot;{greeting}&quot;
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
            <h3 style={{ color: '#00ff88', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
              ✨ What happens next
            </h3>
            <ul style={{ color: '#888', fontSize: '13px', margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>Your agent will be created with industry-specific knowledge</li>
              <li>Pre-built workflows for follow-ups will be set up</li>
              <li>You&apos;ll be able to provision a phone number</li>
              <li>Test your agent before going live</li>
            </ul>
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
              onClick={handleCreate}
              disabled={isCreating}
              style={{
                padding: '12px 32px',
                backgroundColor: isCreating ? '#333' : '#00ff88',
                border: 'none',
                borderRadius: '8px',
                color: isCreating ? '#666' : '#000',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isCreating ? 'not-allowed' : 'pointer',
              }}
            >
              {isCreating ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NewAgentPage() {
  return (
    <Suspense fallback={<div style={{ color: '#666', padding: '40px' }}>Loading...</div>}>
      <NewAgentContent />
    </Suspense>
  )
}
