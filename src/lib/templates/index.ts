/**
 * Agent Templates
 * 
 * Industry-specific voice agent templates with pre-built
 * personas, knowledge bases, and workflows.
 */

import { DENTAL_TEMPLATE, applyDentalTemplate, type DentalTemplate } from './dental'
import { PLUMBING_TEMPLATE, applyPlumbingTemplate } from './plumbing'
import { HVAC_TEMPLATE, applyHvacTemplate } from './hvac'
import { MEDSPA_TEMPLATE, applyMedspaTemplate } from './medspa'
import { LEGAL_TEMPLATE, applyLegalTemplate } from './legal'

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

// All templates
export const TEMPLATES: Record<string, AgentTemplate & { status: 'active' | 'coming_soon' }> = {
  dental: {
    ...DENTAL_TEMPLATE,
    status: 'active',
  },
  plumbing: {
    ...PLUMBING_TEMPLATE,
    status: 'active',
  },
  hvac: {
    ...HVAC_TEMPLATE,
    status: 'active',
  },
  medspa: {
    ...MEDSPA_TEMPLATE,
    status: 'active',
  },
  legal: {
    ...LEGAL_TEMPLATE,
    status: 'active',
  },
  // Coming soon templates
  realestate: {
    id: 'realestate',
    name: 'Real Estate',
    industry: 'Real Estate',
    description: 'AI assistant for real estate agents. Handles property inquiries, showing requests, and lead capture.',
    persona: '',
    greeting: '',
    voice_id: 'alloy',
    voice_provider: 'openai',
    starter_knowledge: '',
    workflows: [],
    settings: {},
    status: 'coming_soon',
  },
  autorepair: {
    id: 'autorepair',
    name: 'Auto Repair',
    industry: 'Automotive',
    description: 'AI service advisor for auto repair shops. Handles appointments, estimates, and service status.',
    persona: '',
    greeting: '',
    voice_id: 'echo',
    voice_provider: 'openai',
    starter_knowledge: '',
    workflows: [],
    settings: {},
    status: 'coming_soon',
  },
  insurance: {
    id: 'insurance',
    name: 'Insurance Agency',
    industry: 'Financial Services',
    description: 'AI assistant for insurance agencies. Handles quote requests, policy questions, and claims intake.',
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

// Template application functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templateAppliers: Record<string, (companyName: string, customizations?: any) => any> = {
  dental: applyDentalTemplate,
  plumbing: applyPlumbingTemplate,
  hvac: applyHvacTemplate,
  medspa: applyMedspaTemplate,
  legal: applyLegalTemplate,
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

/**
 * Apply a template with company-specific customizations
 */
export function applyTemplate(
  templateId: string,
  companyName: string,
  customizations?: Partial<AgentTemplate>
): AgentTemplate | null {
  const applier = templateAppliers[templateId]
  if (!applier) {
    // For coming_soon templates, just return null
    const template = TEMPLATES[templateId]
    if (!template || template.status === 'coming_soon') {
      return null
    }
    // Fallback: return template as-is with company name replaced
    return {
      ...template,
      persona: template.persona.replace(/\{\{company_name\}\}/g, companyName),
      greeting: template.greeting.replace(/\{\{company_name\}\}/g, companyName),
      starter_knowledge: template.starter_knowledge.replace(/\{\{company_name\}\}/g, companyName),
    }
  }
  return applier(companyName, customizations)
}

export { applyDentalTemplate, applyPlumbingTemplate, applyHvacTemplate, applyMedspaTemplate, applyLegalTemplate }
export type { DentalTemplate }
