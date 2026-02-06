/**
 * Med Spa / Aesthetics Voice Agent Template
 */

export const MEDSPA_TEMPLATE = {
  id: 'medspa',
  name: 'Med Spa',
  industry: 'Healthcare - Aesthetics',
  description: 'AI concierge for medical spas. Handles appointment booking, treatment inquiries, and consultation scheduling.',
  
  persona: `You are an elegant, knowledgeable concierge for {{company_name}}, a premier medical spa. Your job is to:

1. Greet callers warmly and professionally
2. Help schedule consultations and treatments
3. Answer questions about services and pricing
4. Create a luxurious experience from the first call
5. Collect client information for bookings

IMPORTANT RULES:
- Be warm, professional, and make clients feel pampered
- Never provide medical advice - recommend consultations
- Consultations are complimentary for most services
- If someone mentions adverse reaction or complication, treat as urgent
- Present pricing ranges, but note that exact pricing is determined at consultation

URGENT KEYWORDS (rare but important):
- allergic reaction, swelling after treatment
- infection, complication, adverse reaction

For urgent calls:
1. Get their name and callback number
2. Note what treatment they had and when
3. Assure them our medical team will call back immediately

SERVICE HOURS: {{business_hours}}`,

  greeting: `Thank you for calling {{company_name}}! This is our AI concierge. How may I assist you with your beauty and wellness journey today?`,

  voice_id: 'shimmer',
  voice_provider: 'openai',
  
  starter_knowledge: `
# {{company_name}} Services

## Treatments Offered
- Botox and Dysport
- Dermal fillers (lips, cheeks, jawline)
- Laser treatments (skin resurfacing, hair removal)
- Chemical peels
- Microneedling
- Body contouring (CoolSculpting, etc.)
- Medical-grade facials
- PRP treatments
- IV therapy

## Pricing Ranges
- Botox: $10-14 per unit (most areas need 20-40 units)
- Lip filler: $600-800 per syringe
- Cheek filler: $700-900 per syringe
- Chemical peel: $150-350
- Microneedling: $250-450 per session
- Laser treatment: varies by area and type

Exact pricing determined at consultation based on individual needs.

## Consultation Information
- All initial consultations are complimentary
- Our providers assess your goals and create a personalized plan
- No obligation to proceed with treatment
- Consultations typically last 30 minutes

## Preparation Guidelines
Before injectable treatments:
- Avoid blood thinners, alcohol, excessive caffeine 24 hours prior
- Come with a clean face for facial treatments
- Specific instructions provided at booking

## Financing Options
- CareCredit available
- Cherry financing available
- Package discounts available
- Membership programs with monthly benefits

## Frequently Asked Questions

### What's the difference between Botox and fillers?
Botox relaxes muscles to smooth expression wrinkles.
Fillers add volume to areas like lips, cheeks, and nasolabial folds.
Many clients benefit from both for comprehensive rejuvenation.

### Is there downtime?
Botox and fillers: minimal downtime, return to normal activities immediately.
Laser treatments: may require 1-3 days of healing depending on treatment.
Chemical peels: varies by depth, typically 3-7 days.

### How long do results last?
Botox: 3-4 months
Fillers: 6-18 months depending on area and product
Results vary by individual.
`,

  workflows: [
    {
      name: 'Consultation Follow-up',
      trigger_type: 'lead_captured',
      trigger_config: {},
      actions: [
        {
          action_type: 'wait',
          action_config: { delay_seconds: 600 },
        },
        {
          action_type: 'send_sms',
          action_config: {
            template: `Thank you for your interest in {{company_name}}! We're excited to help you on your beauty journey. Your consultation has been requested - we'll confirm shortly. Questions? Reply to this text or call us anytime. ✨`,
          },
        },
      ],
    },
    {
      name: 'Post-Treatment Check-in',
      trigger_type: 'call_completed',
      trigger_config: { intent: 'booking' },
      actions: [
        {
          action_type: 'add_note',
          action_config: {
            content: `Treatment inquiry noted. Follow up in 48 hours if no appointment scheduled.`,
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
            template: `We're sorry we missed your call at {{company_name}}! Our AI concierge is available 24/7, or we'll call you back shortly. Looking forward to helping you feel your best! ✨`,
          },
        },
      ],
    },
  ],

  settings: {
    max_call_duration: 600,
    transfer_on_emergency: false,
    business_hours: 'Monday-Saturday 9am-6pm',
    timezone: 'America/New_York',
  },
}

export function applyMedspaTemplate(companyName: string, customizations?: Partial<typeof MEDSPA_TEMPLATE>) {
  const template = { ...MEDSPA_TEMPLATE, ...customizations }
  
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
