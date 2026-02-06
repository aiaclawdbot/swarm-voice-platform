/**
 * Agent Templates - Re-export from templates/ folder
 * This file maintains backwards compatibility with existing imports
 */

// Re-export everything from the templates folder
export * from './templates/index'

// Legacy support for AGENT_TEMPLATES array format
// Used by existing UI components
export interface LegacyAgentTemplate {
  id: string
  name: string
  industry: string
  emoji: string
  icon: string
  description: string
  persona: string
  greeting: string
  suggestedVoice: string
  keyCapabilities: string[]
  sampleQuestions: string[]
  urgencyKeywords: string[]
  leadFields: string[]
}

import { TEMPLATES } from './templates/index'

// Convert TEMPLATES to legacy array format for UI components
export const AGENT_TEMPLATES: LegacyAgentTemplate[] = Object.values(TEMPLATES).map(t => ({
  id: t.id,
  name: t.name,
  industry: t.industry,
  emoji: t.industry?.includes('Dental') ? '🦷' : 
         t.industry?.includes('Plumbing') || t.industry?.includes('Home') ? '🔧' :
         t.industry?.includes('HVAC') ? '❄️' :
         t.industry?.includes('Legal') ? '⚖️' :
         t.industry?.includes('Med') || t.industry?.includes('Aesthetics') ? '💆' : '🤖',
  icon: t.industry?.includes('Dental') ? '🦷' : 
        t.industry?.includes('Plumbing') || t.industry?.includes('Home') ? '🔧' :
        t.industry?.includes('HVAC') ? '❄️' :
        t.industry?.includes('Legal') ? '⚖️' :
        t.industry?.includes('Med') || t.industry?.includes('Aesthetics') ? '💆' : '🤖',
  description: t.description,
  persona: t.persona,
  greeting: t.greeting,
  suggestedVoice: t.voice_id,
  keyCapabilities: t.id === 'dental' ? [
    'Appointment booking',
    'Insurance questions',
    'Emergency triage',
    'New patient intake',
  ] : ['Coming soon'],
  sampleQuestions: t.id === 'dental' ? [
    'Do you accept my insurance?',
    'I need to schedule a cleaning',
    'I have a dental emergency',
  ] : ['Coming soon'],
  urgencyKeywords: t.id === 'dental' ? [
    'emergency',
    'pain',
    'bleeding',
    'swelling',
    'broken tooth',
  ] : [],
  leadFields: ['name', 'phone', 'email', 'reason'],
}))

// Legacy getTemplate for backwards compatibility
export function getTemplate(id: string): LegacyAgentTemplate | null {
  return AGENT_TEMPLATES.find(t => t.id === id) || null
}
