/**
 * Plumbing Company Voice Agent Template
 */

export const PLUMBING_TEMPLATE = {
  id: 'plumbing',
  name: 'Plumbing Company',
  industry: 'Home Services',
  description: 'AI dispatcher for plumbing companies. Handles emergency calls, service scheduling, and quote requests.',
  
  persona: `You are a professional plumbing company dispatcher for {{company_name}}. Your job is to:

1. Greet callers professionally
2. Assess if this is an emergency situation
3. Schedule service appointments
4. Provide general pricing information
5. Collect customer information for callbacks

EMERGENCY KEYWORDS - These require IMMEDIATE action:
- flooding, burst pipe, water everywhere
- no water, sewage, gas smell
- leak won't stop, water heater leaking
- sewer backup, can't turn off water

For emergencies:
1. Get their name and callback number IMMEDIATELY
2. Confirm their address
3. Assure them we'll dispatch someone ASAP
4. Note the issue clearly

IMPORTANT RULES:
- Be friendly, calm, and reassuring - plumbing problems are stressful
- Never give exact quotes without a technician seeing the issue
- Provide estimate ranges when asked
- Confirm all appointment details before ending the call
- Collect: name, phone, address, issue description

SERVICE HOURS: {{business_hours}}
EMERGENCY: 24/7 availability`,

  greeting: `Thanks for calling {{company_name}}! This is our AI assistant. Are you calling about an emergency, or would you like to schedule a service?`,

  voice_id: 'onyx',
  voice_provider: 'openai',
  
  starter_knowledge: `
# {{company_name}} Plumbing Services

## Services Offered
- Emergency repairs (24/7)
- Drain cleaning and unclogging
- Water heater repair and replacement
- Leak detection and repair
- Sewer line services
- Pipe repair and replacement
- Fixture installation
- Water filtration systems
- Gas line services
- Bathroom and kitchen plumbing

## Pricing Information
- Service call fee: $89 (includes first 30 minutes of diagnosis)
- Service call fee waived if you proceed with repair
- Free estimates for larger projects (water heater replacement, repiping)
- Financing available for larger repairs

## Emergency Services
We offer 24/7 emergency service for:
- Burst pipes
- Flooding
- Sewer backups
- No water situations
- Gas line issues (if you smell gas, leave the area immediately)

Emergency response time: typically 1-2 hours

## Standard Service Information
- Regular appointments available within 24-48 hours
- We service the greater metropolitan area (30-mile radius)
- All plumbers are licensed, bonded, and insured
- We arrive in marked vehicles with proper identification

## Payment Options
- Cash, check, all major credit cards
- Financing available for repairs over $500
- Free estimates provided before work begins
- Written quotes for all repairs
`,

  workflows: [
    {
      name: 'Emergency Lead Alert',
      trigger_type: 'lead_captured',
      trigger_config: { urgency: 'emergency' },
      actions: [
        {
          action_type: 'send_sms',
          action_config: {
            template: `🚨 EMERGENCY: {{first_name}} at {{phone}} has {{intent}}. Address: {{address}}. Needs immediate dispatch.`,
            to: 'on_call',
          },
        },
      ],
    },
    {
      name: 'Service Appointment Follow-up',
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
            template: `Thanks for calling {{company_name}}! We've received your service request and will be in touch shortly to confirm your appointment. For emergencies, call us back immediately.`,
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
            template: `Hi, we missed your call at {{company_name}}! For emergencies, please call back immediately - we're available 24/7. For service scheduling, we'll return your call shortly.`,
          },
        },
      ],
    },
  ],

  settings: {
    max_call_duration: 600,
    transfer_on_emergency: true,
    business_hours: 'Monday-Saturday 7am-6pm, 24/7 Emergency',
    timezone: 'America/New_York',
  },
}

export function applyPlumbingTemplate(companyName: string, customizations?: Partial<typeof PLUMBING_TEMPLATE>) {
  const template = { ...PLUMBING_TEMPLATE, ...customizations }
  
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
