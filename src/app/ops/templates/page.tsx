'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AGENT_TEMPLATES, type LegacyAgentTemplate } from '@/lib/templates'

type AgentTemplate = LegacyAgentTemplate

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null)
  const [previewMode, setPreviewMode] = useState<'greeting' | 'persona' | 'capabilities'>('greeting')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Templates</h1>
          <p className="text-zinc-400 mt-1">Pre-built configurations optimized for each industry</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Template List */}
        <div className="col-span-1 space-y-3">
          {AGENT_TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                selectedTemplate?.id === template.id
                  ? 'bg-emerald-500/10 border-emerald-500/50'
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{template.emoji}</div>
                <div>
                  <div className="font-medium">{template.industry}</div>
                  <div className="text-xs text-zinc-500">{template.name}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Template Preview */}
        <div className="col-span-2">
          {selectedTemplate ? (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              {/* Template Header */}
              <div className="p-6 border-b border-zinc-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{selectedTemplate.emoji}</div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
                      <p className="text-zinc-400">{selectedTemplate.description}</p>
                    </div>
                  </div>
                  <Link
                    href="/ops/clients"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium"
                  >
                    Use Template
                  </Link>
                </div>
              </div>

              {/* Preview Tabs */}
              <div className="border-b border-zinc-800 px-6">
                <div className="flex gap-6">
                  {(['greeting', 'persona', 'capabilities'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setPreviewMode(tab)}
                      className={`py-3 text-sm capitalize border-b-2 transition-colors ${
                        previewMode === tab
                          ? 'border-emerald-500 text-white'
                          : 'border-transparent text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-6">
                {previewMode === 'greeting' && (
                  <div>
                    <div className="text-sm text-zinc-400 mb-3">Sample Greeting</div>
                    <div className="bg-zinc-800 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-emerald-500 mb-1">AI Agent</div>
                          <div className="text-lg italic">
                            &quot;{selectedTemplate.greeting.replace(/\{\{company_name\}\}/g, '[Your Company]')}&quot;
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="text-sm text-zinc-400 mb-3">Questions This Template Handles</div>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedTemplate.sampleQuestions.map((q, i) => (
                          <div key={i} className="p-3 bg-zinc-800 rounded-lg text-sm">
                            <span className="text-zinc-500">&quot;</span>{q}<span className="text-zinc-500">&quot;</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {previewMode === 'persona' && (
                  <div>
                    <div className="text-sm text-zinc-400 mb-3">Agent Instructions (System Prompt)</div>
                    <pre className="bg-zinc-800 rounded-xl p-6 text-sm font-mono whitespace-pre-wrap overflow-auto max-h-96">
                      {selectedTemplate.persona.replace(/\{\{company_name\}\}/g, '[Your Company]')}
                    </pre>
                  </div>
                )}

                {previewMode === 'capabilities' && (
                  <div className="space-y-6">
                    <div>
                      <div className="text-sm text-zinc-400 mb-3">Key Capabilities</div>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedTemplate.keyCapabilities.map((cap, i) => (
                          <div key={i} className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg">
                            <span className="text-emerald-500">✓</span>
                            <span>{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-zinc-400 mb-3">Urgency Detection Keywords</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.urgencyKeywords.map((keyword, i) => (
                          <span key={i} className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-zinc-400 mb-3">Lead Information Captured</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.leadFields.map((field, i) => (
                          <span key={i} className="px-2 py-1 bg-zinc-800 rounded text-sm">
                            {field.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-zinc-400 mb-3">Recommended Voice</div>
                      <div className="p-3 bg-zinc-800 rounded-lg inline-block">
                        <span className="font-medium capitalize">{selectedTemplate.suggestedVoice}</span>
                        <span className="text-zinc-500 ml-2">(OpenAI TTS)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
              <div className="text-5xl mb-4">👈</div>
              <div className="text-zinc-400">Select a template to preview</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
