'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { AGENT_TEMPLATES, type AgentTemplate } from '@/lib/templates'

interface Agent {
  id: string
  name: string
  persona: string | null
  greeting: string | null
  voice_id: string | null
  model: string
  provider: 'vapi' | 'retell'
  is_active: boolean
}

interface Client {
  id: string
  company: string
  agents: Agent[]
}

const VOICE_OPTIONS = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral, professional', gender: 'neutral' },
  { id: 'echo', name: 'Echo', description: 'Warm, friendly', gender: 'male' },
  { id: 'fable', name: 'Fable', description: 'Expressive, British', gender: 'female' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative', gender: 'male' },
  { id: 'nova', name: 'Nova', description: 'Young, energetic', gender: 'female' },
  { id: 'shimmer', name: 'Shimmer', description: 'Soft, soothing', gender: 'female' },
]

const MODEL_OPTIONS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast, cost-effective', recommended: true },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High quality' },
]

export default function AgentConfigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeStep, setActiveStep] = useState<'template' | 'customize' | 'voice' | 'review'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null)
  
  const [formData, setFormData] = useState<{
    name: string
    persona: string
    greeting: string
    voice_id: string
    model: string
    provider: 'vapi' | 'retell'
  }>({
    name: '',
    persona: '',
    greeting: '',
    voice_id: 'alloy',
    model: 'gpt-4o-mini',
    provider: 'vapi',
  })

  useEffect(() => {
    fetchClient()
  }, [id])

  async function fetchClient() {
    try {
      const res = await fetch(`/api/clients/${id}`)
      if (res.ok) {
        const data = await res.json()
        setClient(data)
        
        if (data.agents?.length > 0) {
          const agent = data.agents[0]
          setFormData({
            name: agent.name || '',
            persona: agent.persona || '',
            greeting: agent.greeting || '',
            voice_id: agent.voice_id || 'alloy',
            model: agent.model || 'gpt-4o-mini',
            provider: agent.provider || 'vapi',
          })
          setActiveStep('customize')
        }
      }
    } catch (error) {
      console.error('Failed to fetch client:', error)
    } finally {
      setLoading(false)
    }
  }

  function applyTemplate(template: AgentTemplate) {
    const companyName = client?.company || 'the company'
    setSelectedTemplate(template)
    setFormData(prev => ({
      ...prev,
      name: template.name,
      persona: template.persona.replace(/\{\{company_name\}\}/g, companyName),
      greeting: template.greeting.replace(/\{\{company_name\}\}/g, companyName),
      voice_id: template.suggestedVoice,
    }))
    setActiveStep('customize')
  }

  async function handleSave() {
    setSaving(true)
    try {
      const existingAgent = client?.agents?.[0]
      const method = existingAgent ? 'PATCH' : 'POST'
      const url = existingAgent 
        ? `/api/clients/${id}/agents/${existingAgent.id}`
        : `/api/clients/${id}/agents`

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchClient()
      }
    } catch (error) {
      console.error('Failed to save agent:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading...</div>
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

  const hasAgent = (client.agents?.length || 0) > 0

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/ops/clients/${id}`} className="text-zinc-400 hover:text-white text-sm">
            ← Back to {client.company}
          </Link>
          <h1 className="text-3xl font-bold mt-2">Configure Voice Agent</h1>
          <p className="text-zinc-400">Set up the AI agent for {client.company}</p>
        </div>
        {hasAgent && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-sm">Agent Active</span>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {(['template', 'customize', 'voice', 'review'] as const).map((step, idx) => (
          <div key={step} className="flex items-center">
            <button
              onClick={() => setActiveStep(step)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeStep === step
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {idx + 1}. {step.charAt(0).toUpperCase() + step.slice(1)}
            </button>
            {idx < 3 && <div className="w-8 h-px bg-zinc-700 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {activeStep === 'template' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h2 className="text-lg font-semibold mb-2">Choose a Template</h2>
            <p className="text-zinc-400 text-sm mb-6">
              Start with an industry-optimized template, then customize for {client.company}.
            </p>
            
            <div className="grid grid-cols-4 gap-4">
              {AGENT_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                    selectedTemplate?.id === template.id
                      ? 'bg-emerald-500/10 border-emerald-500/50'
                      : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="text-3xl mb-3">{template.emoji}</div>
                  <div className="font-medium mb-1">{template.industry}</div>
                  <div className="text-xs text-zinc-400 line-clamp-2">{template.description}</div>
                </button>
              ))}
            </div>
          </div>

          {selectedTemplate && (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
                  <p className="text-zinc-400 text-sm">{selectedTemplate.description}</p>
                </div>
                <button
                  onClick={() => setActiveStep('customize')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium"
                >
                  Use This Template →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-zinc-400 mb-2">Key Capabilities</div>
                  <ul className="space-y-1">
                    {selectedTemplate.keyCapabilities.map(cap => (
                      <li key={cap} className="flex items-center gap-2">
                        <span className="text-emerald-500">✓</span> {cap}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-zinc-400 mb-2">Sample Questions It Handles</div>
                  <ul className="space-y-1 text-zinc-300">
                    {selectedTemplate.sampleQuestions.map(q => (
                      <li key={q} className="italic">&quot;{q}&quot;</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeStep === 'customize' && (
        <div className="space-y-6">
          {/* Agent Name */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <label className="block text-sm font-medium mb-2">Agent Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Sarah from Acme Plumbing"
              className="w-full px-4 py-3 bg-zinc-800 rounded-lg border border-zinc-700 focus:border-emerald-500 outline-none text-lg"
            />
            <p className="text-xs text-zinc-500 mt-2">This is how the agent identifies itself to callers</p>
          </div>

          {/* Greeting */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <label className="block text-sm font-medium mb-2">Greeting</label>
            <p className="text-zinc-400 text-sm mb-3">The first thing callers hear when the agent answers</p>
            <textarea
              value={formData.greeting}
              onChange={e => setFormData(prev => ({ ...prev, greeting: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-zinc-800 rounded-lg border border-zinc-700 focus:border-emerald-500 outline-none resize-none"
            />
          </div>

          {/* Persona */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <label className="block text-sm font-medium">Agent Instructions</label>
                <p className="text-zinc-400 text-sm">Define behavior, knowledge, and how to handle situations</p>
              </div>
              {selectedTemplate && (
                <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                  {selectedTemplate.industry} template applied
                </span>
              )}
            </div>
            <textarea
              value={formData.persona}
              onChange={e => setFormData(prev => ({ ...prev, persona: e.target.value }))}
              rows={16}
              className="w-full px-4 py-3 bg-zinc-800 rounded-lg border border-zinc-700 focus:border-emerald-500 outline-none resize-none font-mono text-sm"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setActiveStep('voice')}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium"
            >
              Next: Voice Settings →
            </button>
          </div>
        </div>
      )}

      {activeStep === 'voice' && (
        <div className="space-y-6">
          {/* Voice Selection */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h2 className="text-lg font-semibold mb-2">Voice</h2>
            <p className="text-zinc-400 text-sm mb-4">Choose how your agent sounds to callers</p>
            
            <div className="grid grid-cols-3 gap-3">
              {VOICE_OPTIONS.map(voice => (
                <button
                  key={voice.id}
                  onClick={() => setFormData(prev => ({ ...prev, voice_id: voice.id }))}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    formData.voice_id === voice.id
                      ? 'bg-emerald-500/10 border-emerald-500/50'
                      : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{voice.name}</span>
                    <span className="text-xs text-zinc-500">({voice.gender})</span>
                  </div>
                  <div className="text-sm text-zinc-400">{voice.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h2 className="text-lg font-semibold mb-2">AI Model</h2>
            <p className="text-zinc-400 text-sm mb-4">Select the intelligence level for your agent</p>
            
            <div className="space-y-2">
              {MODEL_OPTIONS.map(model => (
                <button
                  key={model.id}
                  onClick={() => setFormData(prev => ({ ...prev, model: model.id }))}
                  className={`w-full p-4 rounded-xl border text-left flex items-center justify-between ${
                    formData.model === model.id
                      ? 'bg-emerald-500/10 border-emerald-500/50'
                      : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-sm text-zinc-400">{model.description}</div>
                  </div>
                  {model.recommended && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                      Recommended
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Provider */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h2 className="text-lg font-semibold mb-2">Voice Provider</h2>
            <div className="grid grid-cols-2 gap-3">
              {(['vapi', 'retell'] as const).map(provider => (
                <button
                  key={provider}
                  onClick={() => setFormData(prev => ({ ...prev, provider }))}
                  className={`p-4 rounded-xl border ${
                    formData.provider === provider
                      ? 'bg-emerald-500/10 border-emerald-500/50'
                      : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="font-medium capitalize">{provider}</div>
                  <div className="text-sm text-zinc-400">
                    {provider === 'vapi' ? 'Voice AI Platform' : 'Conversational AI'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setActiveStep('customize')}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
            >
              ← Back
            </button>
            <button
              onClick={() => setActiveStep('review')}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium"
            >
              Review & Deploy →
            </button>
          </div>
        </div>
      )}

      {activeStep === 'review' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Review Configuration</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-zinc-800">
                <span className="text-zinc-400">Agent Name</span>
                <span className="font-medium">{formData.name || 'Not set'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-zinc-800">
                <span className="text-zinc-400">Voice</span>
                <span className="font-medium">
                  {VOICE_OPTIONS.find(v => v.id === formData.voice_id)?.name || formData.voice_id}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-zinc-800">
                <span className="text-zinc-400">Model</span>
                <span className="font-medium">
                  {MODEL_OPTIONS.find(m => m.id === formData.model)?.name || formData.model}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-zinc-800">
                <span className="text-zinc-400">Provider</span>
                <span className="font-medium capitalize">{formData.provider}</span>
              </div>
              <div className="py-3">
                <span className="text-zinc-400 block mb-2">Greeting Preview</span>
                <div className="bg-zinc-800 rounded-lg p-4 text-sm italic">
                  &quot;{formData.greeting || 'No greeting set'}&quot;
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div className="text-sm">
                <div className="font-medium text-amber-400">Before deploying</div>
                <div className="text-amber-200/70 mt-1">
                  Make sure you&apos;ve provisioned a phone number for this client and configured webhooks 
                  with your voice provider (Vapi/Retell).
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setActiveStep('voice')}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
            >
              ← Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium text-lg disabled:opacity-50"
            >
              {saving ? 'Deploying...' : hasAgent ? '✓ Update Agent' : '🚀 Deploy Agent'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
