/**
 * Law Firm Voice Agent Template
 */

export const LEGAL_TEMPLATE = {
  id: 'legal',
  name: 'Law Firm',
  industry: 'Legal Services',
  description: 'AI intake specialist for law firms. Handles initial consultations, appointment scheduling, and case screening.',
  
  persona: `You are a professional legal intake specialist for {{company_name}}. Your job is to:

1. Greet callers professionally and discreetly
2. Determine the nature of their legal matter
3. Schedule consultations with appropriate attorneys
4. Gather basic case information
5. Handle urgent matters appropriately

URGENT KEYWORDS - These need immediate attention:
- arrested, in jail, court date tomorrow
- restraining order, being served, deposition
- emergency hearing, custody emergency

For urgent matters:
1. Get their name and callback number immediately
2. Note the nature of the urgency
3. Assure them an attorney will call back ASAP
4. If someone is arrested, get location and charges if known

IMPORTANT RULES:
- Be professional, empathetic, and discreet
- NEVER provide legal advice - schedule consultations instead
- Maintain strict confidentiality
- If you don't know something, offer to have an attorney follow up
- Note that many case types offer free consultations

SERVICE HOURS: {{business_hours}}`,

  greeting: `Thank you for calling {{company_name}}. This is our AI assistant. How may I direct your call today?`,

  voice_id: 'onyx',
  voice_provider: 'openai',
  
  starter_knowledge: `
# {{company_name}} Legal Services

## Practice Areas
(Customize based on firm specialty)
- Personal injury
- Family law (divorce, custody, support)
- Criminal defense
- Estate planning
- Business law
- Real estate
- Employment law
- Immigration

## Consultation Information
- Free initial consultations for most case types
- Consultations typically scheduled within 24-48 hours
- Urgent matters: we accommodate same-day when possible
- Phone consultations available for out-of-area clients

## Fee Structures
- Personal injury: typically contingency (no fee unless we win)
- Hourly billing available for other matters
- Flat fee arrangements for some services
- Payment plans available
- Specific fees discussed with attorney during consultation

## What to Bring to Consultation
- Any relevant documents (police reports, contracts, court papers)
- Timeline of key events
- List of questions
- Medical records (for injury cases)
- Financial documents (for family/estate matters)

## Frequently Asked Questions

### Do you offer free consultations?
Yes, free initial consultations for most case types.
This allows you to discuss your situation with no obligation.

### How long will my case take?
Every case is different. Timeline depends on complexity, court schedules, and other factors. An attorney can provide estimates after reviewing your situation.

### Do you work on contingency?
For personal injury and certain other cases, yes - you pay nothing unless we recover for you. Other case types may have different arrangements.

### What areas do you serve?
Our attorneys are licensed in [state(s)]. We may be able to assist with matters in other jurisdictions through special admission or referral to trusted colleagues.

## After-Hours Information
For urgent legal matters after hours, please leave a detailed message with:
- Your name and phone number
- Brief description of the urgent situation
- Any deadlines or court dates approaching

An attorney will return your call as soon as possible.
`,

  workflows: [
    {
      name: 'Urgent Matter Alert',
      trigger_type: 'lead_captured',
      trigger_config: { urgency: 'emergency' },
      actions: [
        {
          action_type: 'send_sms',
          action_config: {
            template: `⚖️ URGENT LEGAL MATTER: {{first_name}} at {{phone}} - {{intent}}. Needs attorney callback ASAP.`,
            to: 'on_call',
          },
        },
      ],
    },
    {
      name: 'Consultation Request Follow-up',
      trigger_type: 'lead_captured',
      trigger_config: {},
      actions: [
        {
          action_type: 'wait',
          action_config: { delay_seconds: 300 },
        },
        {
          action_type: 'send_sms',
          action_config: {
            template: `Thank you for contacting {{company_name}}. We've received your consultation request and will be in touch shortly to schedule. For urgent matters, please call back immediately.`,
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
            template: `We missed your call at {{company_name}}. Our AI assistant is available 24/7 to help schedule a consultation. For urgent matters, please call back. We'll also return your call during business hours.`,
          },
        },
      ],
    },
  ],

  settings: {
    max_call_duration: 900,
    transfer_on_emergency: true,
    business_hours: 'Monday-Friday 9am-5pm',
    timezone: 'America/New_York',
  },
}

export function applyLegalTemplate(companyName: string, customizations?: Partial<typeof LEGAL_TEMPLATE>) {
  const template = { ...LEGAL_TEMPLATE, ...customizations }
  
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
        return { ...a, action_config: config }
      }),
    })),
  }
}
