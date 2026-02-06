import dental from './dental.json'
import plumbing from './plumbing.json'
import hvac from './hvac.json'
import medspa from './medspa.json'
import legal from './legal.json'
import realestate from './realestate.json'
import autorepair from './autorepair.json'
import insurance from './insurance.json'

export interface FAQ {
  question: string
  answer: string
}

export interface BookingConfig {
  appointment_types: string[]
  default_duration_minutes: number
  consultation_duration_minutes?: number
  new_patient_duration_minutes?: number
  showing_duration_minutes?: number
  oil_change_duration_minutes?: number
  emergency_priority: boolean
  emergency_surcharge?: string
  claims_priority?: boolean
}

export interface IndustryTemplate {
  id: string
  name: string
  description: string
  icon: string
  persona: string
  greeting: string
  voice_id: string
  emergency_keywords: string[]
  faqs: FAQ[]
  booking_config: BookingConfig
}

export const templates: Record<string, IndustryTemplate> = {
  dental: dental as IndustryTemplate,
  plumbing: plumbing as IndustryTemplate,
  hvac: hvac as IndustryTemplate,
  medspa: medspa as IndustryTemplate,
  legal: legal as IndustryTemplate,
  realestate: realestate as IndustryTemplate,
  autorepair: autorepair as IndustryTemplate,
  insurance: insurance as IndustryTemplate,
}

export const templateList: IndustryTemplate[] = Object.values(templates)

export function getTemplate(id: string): IndustryTemplate | undefined {
  return templates[id]
}

export function getTemplateOrThrow(id: string): IndustryTemplate {
  const template = templates[id]
  if (!template) {
    throw new Error(`Template not found: ${id}`)
  }
  return template
}

/**
 * Convert template FAQs to knowledge base content for embedding
 */
export function templateToKnowledgeContent(template: IndustryTemplate): string {
  const sections = [
    `# ${template.name} Knowledge Base`,
    '',
    '## Frequently Asked Questions',
    '',
    ...template.faqs.map(faq => `### ${faq.question}\n${faq.answer}\n`),
    '',
    '## Services',
    '',
    `Available appointment types: ${template.booking_config.appointment_types.join(', ')}`,
    '',
    template.booking_config.emergency_priority ? '**Emergency services available.**' : '',
    template.booking_config.emergency_surcharge || '',
  ]

  return sections.filter(Boolean).join('\n')
}

/**
 * Get emergency detection prompt for this template
 */
export function getEmergencyPrompt(template: IndustryTemplate): string {
  if (template.emergency_keywords.length === 0) {
    return ''
  }

  return `
EMERGENCY DETECTION:
If the caller mentions any of these keywords, this is an EMERGENCY and should be prioritized immediately:
${template.emergency_keywords.map(k => `- ${k}`).join('\n')}

For emergencies:
1. Get their contact information immediately
2. Acknowledge the urgency
3. Either transfer to emergency line or promise immediate callback
`
}

export default templates
