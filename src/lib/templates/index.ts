/**
 * Agent Templates
 * 
 * CPO Review Decision: Focus on dental first, expand later
 * Only dental template is fully featured for MVP
 */

import { DENTAL_TEMPLATE, applyDentalTemplate, DentalTemplate } from './dental'

export interface AgentTemplate {
  id: string
  name: string
  industry: string
  description: string
  persona: string
  greeting: string
  voice_id: string
  voice_provider: string
  starter_knowledge: string
  workflows: Array<{
    name: string
    trigger_type: string
    trigger_config: Record<string, unknown>
    actions: Array<{
      action_type: string
      action_config: Record<string, unknown>
    }>
  }>
  settings: Record<string, unknown>
  status: 'active' | 'coming_soon'
}

// Active templates
export const TEMPLATES: Record<string, AgentTemplate & { status: 'active' | 'coming_soon' }> = {
  dental: {
    ...DENTAL_TEMPLATE,
    status: 'active',
  },
  // Coming soon - minimal stubs for UI
  plumbing: {
    id: 'plumbing',
    name: 'Plumbing Company',
    industry: 'Home Services',
    description: 'AI dispatcher for plumbing companies. Handles emergency calls, service scheduling, and quote requests.',
    persona: '',
    greeting: '',
    voice_id: 'onyx',
    voice_provider: 'openai',
    starter_knowledge: '',
    workflows: [],
    settings: {},
    status: 'coming_soon',
  },
  hvac: {
    id: 'hvac',
    name: 'HVAC Company',
    industry: 'Home Services',
    description: 'AI receptionist for HVAC companies. Handles service calls, maintenance scheduling, and emergency requests.',
    persona: '',
    greeting: '',
    voice_id: 'onyx',
    voice_provider: 'openai',
    starter_knowledge: '',
    workflows: [],
    settings: {},
    status: 'coming_soon',
  },
  legal: {
    id: 'legal',
    name: 'Law Firm',
    industry: 'Legal Services',
    description: 'AI intake specialist for law firms. Handles initial consultations, appointment scheduling, and case screening.',
    persona: '',
    greeting: '',
    voice_id: 'nova',
    voice_provider: 'openai',
    starter_knowledge: '',
    workflows: [],
    settings: {},
    status: 'coming_soon',
  },
  medspa: {
    id: 'medspa',
    name: 'Med Spa',
    industry: 'Healthcare - Aesthetics',
    description: 'AI concierge for medical spas. Handles appointment booking, treatment inquiries, and consultation scheduling.',
    persona: '',
    greeting: '',
    voice_id: 'nova',
    voice_provider: 'openai',
    starter_knowledge: '',
    workflows: [],
    settings: {},
    status: 'coming_soon',
  },
}

export function getTemplate(id: string): AgentTemplate | null {
  return TEMPLATES[id] || null
}

export function getActiveTemplates(): AgentTemplate[] {
  return Object.values(TEMPLATES).filter(t => t.status === 'active')
}

export function getAllTemplates(): Array<AgentTemplate & { status: 'active' | 'coming_soon' }> {
  return Object.values(TEMPLATES)
}

export { applyDentalTemplate }
export type { DentalTemplate }
