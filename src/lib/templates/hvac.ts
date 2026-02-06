/**
 * HVAC Company Voice Agent Template
 */

export const HVAC_TEMPLATE = {
  id: 'hvac',
  name: 'HVAC Company',
  industry: 'Home Services',
  description: 'AI dispatcher for HVAC companies. Handles service calls, maintenance scheduling, and emergency requests.',
  
  persona: `You are a professional HVAC company dispatcher for {{company_name}}. Your job is to:

1. Greet callers professionally
2. Determine if this is an emergency (no heat in winter, no AC in heat wave)
3. Schedule service and maintenance appointments
4. Answer common HVAC questions
5. Collect customer information

EMERGENCY KEYWORDS - Prioritize these immediately:
- no heat, no AC, no air conditioning
- furnace not working, house is freezing
- carbon monoxide, gas smell, smoke from unit
- won't turn on, strange noise

For emergencies:
1. Get their name and callback number
2. Confirm their address
3. Ask if anyone is in danger (CO detector going off = evacuate and call 911)
4. Assure them we'll dispatch someone ASAP

IMPORTANT RULES:
- Temperature problems affect comfort and safety - be empathetic
- Prioritize no-heat calls in cold weather
- Prioritize no-AC calls during heat waves
- Never diagnose issues over the phone
- Recommend maintenance plans when appropriate

SERVICE HOURS: {{business_hours}}
EMERGENCY: 24/7 for no-heat and no-AC`,

  greeting: `Thanks for calling {{company_name}}! This is our AI assistant. Is your heating or cooling working properly, or do you need service?`,

  voice_id: 'echo',
  voice_provider: 'openai',
  
  starter_knowledge: `
# {{company_name}} HVAC Services

## Services Offered
- Air conditioning repair and installation
- Heating system repair and installation
- Furnace maintenance and repair
- Heat pump services
- Ductwork installation and repair
- Indoor air quality solutions
- Smart thermostat installation
- Preventive maintenance plans
- 24/7 emergency service

## Pricing Information
- Diagnostic fee: $79 (applied to repair if you proceed)
- Maintenance plan: Includes 2 tune-ups per year, priority scheduling, 15% off repairs
- New AC installation: $3,500 - $7,500 depending on size and efficiency
- Free in-home estimates for equipment replacement

## Common Questions

### How often should I change my filter?
Standard filters: every 1-3 months depending on usage and pets.
Higher-quality filters may last longer.
Regular changes improve efficiency and air quality.

### My AC isn't cooling - what could be wrong?
Could be low refrigerant, dirty filter, or compressor issue.
Schedule a service call for proper diagnosis.

### Do you offer financing?
Yes, we offer several financing options including 0% interest plans.
Details provided with your quote.

## Maintenance Plan Benefits
- Two tune-ups per year (heating and cooling)
- Priority scheduling
- 15% discount on all repairs
- No overtime charges
- Extended equipment life
- Lower energy bills

## Emergency Information
24/7 emergency service for no-heat and no-AC situations.
Diagnostic fee applies but we typically arrive within 1-2 hours.

All technicians are NATE-certified, licensed, bonded, and insured.
`,

  workflows: [
    {
      name: 'Emergency Dispatch Alert',
      trigger_type: 'lead_captured',
      trigger_config: { urgency: 'emergency' },
      actions: [
        {
          action_type: 'send_sms',
          action_config: {
            template: `🚨 HVAC EMERGENCY: {{first_name}} at {{phone}} - {{intent}}. Address: {{address}}. Dispatch needed.`,
            to: 'on_call',
          },
        },
      ],
    },
    {
      name: 'Service Confirmation',
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
            template: `Thanks for calling {{company_name}}! We've received your service request. A team member will confirm your appointment shortly.`,
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
            template: `We missed your call at {{company_name}}! For no-heat or no-AC emergencies, please call back - we have 24/7 service. For other inquiries, we'll return your call shortly.`,
          },
        },
      ],
    },
  ],

  settings: {
    max_call_duration: 600,
    transfer_on_emergency: true,
    business_hours: 'Monday-Saturday 8am-6pm, 24/7 Emergency',
    timezone: 'America/New_York',
  },
}

export function applyHvacTemplate(companyName: string, customizations?: Partial<typeof HVAC_TEMPLATE>) {
  const template = { ...HVAC_TEMPLATE, ...customizations }
  
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
