/**
 * Dental Practice Voice Agent Template
 * Pre-configured for dental offices with industry-specific knowledge
 */

export const DENTAL_TEMPLATE = {
  id: 'dental',
  name: 'Dental Practice',
  industry: 'Healthcare - Dental',
  description: 'AI receptionist for dental practices. Handles appointment booking, insurance questions, new patient inquiries, and after-hours calls.',
  
  // Default persona prompt
  persona: `You are a friendly and professional receptionist for {{company_name}}, a dental practice. Your job is to:

1. Greet callers warmly and professionally
2. Help with appointment scheduling
3. Answer common questions about services and insurance
4. Collect new patient information
5. Triage emergencies appropriately

IMPORTANT RULES:
- Be warm, empathetic, and professional
- Never diagnose conditions or provide medical advice
- For dental emergencies (severe pain, trauma, swelling), offer to transfer to emergency line or get callback info
- If you don't know something, say "Let me have someone from our team call you back about that"
- Collect: caller name, phone number, reason for call
- Confirm appointment details before ending call

HOURS: {{business_hours}}
SERVICES: General dentistry, cleanings, fillings, crowns, implants, cosmetic dentistry, emergency care`,

  // Default greeting
  greeting: `Hello, thank you for calling {{company_name}}! This is our AI assistant. I can help you schedule appointments, answer questions about our services, or connect you with our team. How can I help you today?`,

  // Voice settings
  voice_id: 'nova', // Friendly, professional female voice
  voice_provider: 'openai',
  
  // Starter knowledge base - common dental FAQ
  starter_knowledge: `
# {{company_name}} Information

## Services Offered
- Routine cleanings and exams
- Dental fillings
- Crowns and bridges
- Dental implants
- Root canals
- Teeth whitening
- Veneers
- Emergency dental care
- Pediatric dentistry
- Invisalign and orthodontics

## Insurance Information
We accept most major dental insurance plans including:
- Delta Dental
- Cigna
- MetLife
- Aetna
- United Healthcare Dental
- Guardian

Please bring your insurance card to your first appointment. We'll verify your benefits and explain any out-of-pocket costs before treatment.

## New Patient Information
For your first visit, please arrive 15 minutes early to complete paperwork. Bring:
- Valid photo ID
- Insurance card
- List of current medications
- Medical history form (can be completed online)

## Appointment Policies
- Please provide 24 hours notice for cancellations
- We confirm appointments via text/email
- Late arrivals may need to be rescheduled
- We offer early morning and evening appointments for your convenience

## Emergency Care
For dental emergencies during business hours, we reserve time daily for urgent cases. Call us immediately if you experience:
- Severe tooth pain
- Knocked-out tooth
- Broken tooth
- Swelling in mouth or face
- Bleeding that won't stop

After hours emergencies: Please leave a detailed message and we'll call you back as soon as possible. For life-threatening emergencies, call 911.

## Payment Options
- We accept all major credit cards
- Payment plans available for treatments over $500
- CareCredit financing accepted
- We can provide a detailed estimate before any treatment
`,

  // Default workflow templates
  workflows: [
    {
      name: 'New Patient Follow-up',
      trigger_type: 'lead_captured',
      trigger_config: {},
      actions: [
        {
          action_type: 'wait',
          action_config: { delay_seconds: 300 }, // 5 min delay
        },
        {
          action_type: 'send_sms',
          action_config: {
            template: `Hi {{first_name}}! Thank you for calling {{company_name}}. We're excited to welcome you as a new patient! If you'd like to schedule an appointment, you can call us back or book online. - {{company_name}} Team`,
          },
        },
      ],
    },
    {
      name: 'Missed Call Recovery',
      trigger_type: 'missed_call',
      trigger_config: {},
      actions: [
        {
          action_type: 'send_sms',
          action_config: {
            template: `Hi, we're sorry we missed your call at {{company_name}}! Our AI assistant is available 24/7, or you can call us back during business hours. Is there something we can help you with?`,
          },
        },
      ],
    },
    {
      name: 'Post-Call Summary',
      trigger_type: 'call_completed',
      trigger_config: { min_duration: 30 }, // Only for calls > 30 sec
      actions: [
        {
          action_type: 'add_note',
          action_config: {
            content: `AI Call Summary:\n{{call_summary}}\n\nIntent: {{intent}}\nDuration: {{call_duration}}s`,
          },
        },
      ],
    },
  ],

  // Settings
  settings: {
    max_call_duration: 600, // 10 minutes max
    transfer_on_emergency: true,
    business_hours: 'Monday-Friday 8am-5pm',
    timezone: 'America/New_York',
  },
}

// Export function to apply template to agent
export function applyDentalTemplate(companyName: string, customizations?: Partial<typeof DENTAL_TEMPLATE>) {
  const template = { ...DENTAL_TEMPLATE, ...customizations }
  
  // Replace placeholders
  const replace = (text: string) => 
    text
      .replace(/\{\{company_name\}\}/g, companyName)
      .replace(/\{\{business_hours\}\}/g, template.settings.business_hours)

  return {
    ...template,
    persona: replace(template.persona),
    greeting: replace(template.greeting),
    starter_knowledge: replace(template.starter_knowledge),
    workflows: template.workflows.map(w => ({
      ...w,
      actions: w.actions.map(a => {
        const config: Record<string, unknown> = { ...a.action_config }
        if (typeof config.template === 'string') {
          config.template = replace(config.template)
        }
        if (typeof config.content === 'string') {
          config.content = replace(config.content)
        }
        return {
          ...a,
          action_config: config,
        }
      }),
    })),
  }
}

export type DentalTemplate = typeof DENTAL_TEMPLATE
