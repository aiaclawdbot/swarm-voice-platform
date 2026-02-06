import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { createAssistant } from '@/lib/vapi/client'
import { getTemplate, applyDentalTemplate } from '@/lib/templates'

/**
 * POST /api/agents/from-template
 * Create a new agent from a template with pre-populated settings
 */
export async function POST(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const body = await request.json()
    const {
      template_id,
      company_name,
      customizations = {},
    } = body

    if (!template_id) {
      return NextResponse.json({ error: 'template_id is required' }, { status: 400 })
    }

    if (!company_name) {
      return NextResponse.json({ error: 'company_name is required' }, { status: 400 })
    }

    // Get base template
    const baseTemplate = getTemplate(template_id)
    if (!baseTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (baseTemplate.status === 'coming_soon') {
      return NextResponse.json({ 
        error: 'This template is coming soon. Please use the dental template for now.' 
      }, { status: 400 })
    }

    // Apply template with company name
    let appliedTemplate
    if (template_id === 'dental') {
      appliedTemplate = applyDentalTemplate(company_name, customizations)
    } else {
      // Generic template application
      appliedTemplate = {
        ...baseTemplate,
        ...customizations,
        persona: baseTemplate.persona.replace(/\{\{company_name\}\}/g, company_name),
        greeting: baseTemplate.greeting.replace(/\{\{company_name\}\}/g, company_name),
      }
    }

    // Create Vapi assistant
    const webhookUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/vapi`
      : undefined

    let vapiAssistantId: string | undefined

    try {
      const assistant = await createAssistant({
        name: `${company_name} - ${appliedTemplate.name}`,
        persona: appliedTemplate.persona,
        greeting: appliedTemplate.greeting,
        voice: appliedTemplate.voice_id,
        model: 'gpt-4o-mini',
        webhookUrl,
      })
      vapiAssistantId = assistant.id
    } catch (vapiError) {
      console.error('Vapi assistant creation failed:', vapiError)
      // Continue without Vapi - can be retried later
    }

    // Create agent in database
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .insert({
        org_id: orgId,
        name: company_name,
        template_id,
        persona: appliedTemplate.persona,
        greeting: appliedTemplate.greeting,
        voice_id: appliedTemplate.voice_id,
        voice_provider: appliedTemplate.voice_provider,
        model: 'gpt-4o-mini',
        vapi_assistant_id: vapiAssistantId,
        settings: appliedTemplate.settings,
        status: 'draft',
      })
      .select()
      .single()

    if (agentError) {
      console.error('Error creating agent:', agentError)
      return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
    }

    // Create knowledge base with starter content
    if (appliedTemplate.starter_knowledge) {
      const { data: kb } = await supabaseAdmin
        .from('knowledge_bases')
        .insert({
          org_id: orgId,
          agent_id: agent.id,
          name: 'Starter Knowledge Base',
        })
        .select('id')
        .single()

      if (kb) {
        // Insert starter knowledge as a single document for now
        // In production, would chunk and embed
        await supabaseAdmin.from('knowledge_documents').insert({
          knowledge_base_id: kb.id,
          title: 'Starter FAQ',
          content: appliedTemplate.starter_knowledge,
          metadata: { template: template_id },
        })
      }
    }

    // Create default workflows
    for (const workflow of appliedTemplate.workflows) {
      const { data: wf, error: wfError } = await supabaseAdmin
        .from('workflows')
        .insert({
          org_id: orgId,
          name: workflow.name,
          trigger_type: workflow.trigger_type,
          trigger_config: workflow.trigger_config,
          status: 'active',
        })
        .select('id')
        .single()

      if (wf && !wfError) {
        // Add actions
        const actionsToInsert = workflow.actions.map((action, idx) => ({
          workflow_id: wf.id,
          action_type: action.action_type,
          action_config: action.action_config,
          position: idx,
        }))

        await supabaseAdmin.from('workflow_actions').insert(actionsToInsert)
      }
    }

    // Return complete agent
    const { data: completeAgent } = await supabaseAdmin
      .from('agents')
      .select(`
        *,
        phone_number:phone_numbers(id, number, friendly_name)
      `)
      .eq('id', agent.id)
      .single()

    return NextResponse.json({
      agent: completeAgent,
      message: `Agent created from ${appliedTemplate.name} template. Add a phone number to start receiving calls.`,
      next_steps: [
        'Provision a phone number',
        'Customize your greeting and persona',
        'Test with a call to your number',
        'Activate your agent',
      ],
    }, { status: 201 })

  } catch (error) {
    console.error('Template agent creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
