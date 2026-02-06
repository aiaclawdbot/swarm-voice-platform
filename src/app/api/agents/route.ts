import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, Agent } from '@/lib/supabase/server'
import { createAssistant } from '@/lib/vapi/client'
import { getTemplate, templateToKnowledgeContent, getEmergencyPrompt } from '@/data/templates'

// GET /api/agents - List agents for an organization
export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const { data: agents, error } = await supabaseAdmin
      .from('agents')
      .select(`
        *,
        phone_number:phone_numbers(id, number, friendly_name)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching agents:', error)
      return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
    }

    return NextResponse.json({ agents })
  } catch (error) {
    console.error('Agents GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const body = await request.json()
    let {
      name,
      template_id,
      persona,
      greeting,
      voice_id,
      voice_provider = 'openai',
      model = 'gpt-4o-mini',
      settings = {},
      business_name,
    } = body

    // If template_id provided, use template defaults
    let knowledgeContent: string | undefined
    if (template_id) {
      const template = getTemplate(template_id)
      if (template) {
        // Use template defaults for missing values
        name = name || `${template.name} Agent`
        persona = persona || template.persona
        greeting = greeting || template.greeting
        voice_id = voice_id || template.voice_id
        
        // Add emergency handling to persona if template has it
        const emergencyPrompt = getEmergencyPrompt(template)
        if (emergencyPrompt) {
          persona = `${persona}\n\n${emergencyPrompt}`
        }
        
        // Prepare knowledge content from template FAQs
        knowledgeContent = templateToKnowledgeContent(template)
        
        // Personalize greeting with business name if provided
        if (business_name && greeting) {
          greeting = greeting.replace(/the (dental office|plumbing company|HVAC company|med spa|law office|insurance agency|auto repair shop)/gi, business_name)
        }
      }
    }

    // Set defaults
    voice_id = voice_id || 'alloy'

    if (!name) {
      return NextResponse.json({ error: 'Agent name is required' }, { status: 400 })
    }

    // Create Vapi assistant
    const webhookUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/vapi`
      : undefined

    let vapiAssistantId: string | undefined

    try {
      const assistant = await createAssistant({
        name,
        persona: persona || `You are a helpful assistant for ${name}.`,
        greeting: greeting || `Hello! Thank you for calling. How can I help you today?`,
        voice: voice_id,
        model,
        webhookUrl,
      })
      vapiAssistantId = assistant.id
    } catch (vapiError) {
      console.error('Vapi assistant creation failed:', vapiError)
      // Continue without Vapi assistant - can be linked later
    }

    // Insert agent into database
    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .insert({
        org_id: orgId,
        name,
        template_id,
        persona,
        greeting,
        voice_id,
        voice_provider,
        model,
        vapi_assistant_id: vapiAssistantId,
        settings,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating agent:', error)
      return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
    }

    // If we have knowledge content from template, create knowledge base
    if (knowledgeContent && agent) {
      try {
        // Create knowledge base
        const { data: kb } = await supabaseAdmin
          .from('knowledge_bases')
          .insert({
            org_id: orgId,
            agent_id: agent.id,
            name: `${name} Knowledge Base`,
          })
          .select()
          .single()

        if (kb) {
          // Add template FAQs as knowledge documents
          // Note: Embeddings would be generated here with OpenAI
          await supabaseAdmin
            .from('knowledge_documents')
            .insert({
              knowledge_base_id: kb.id,
              title: 'Industry FAQs',
              content: knowledgeContent,
              metadata: { source: 'template', template_id },
            })
        }
      } catch (kbError) {
        console.error('Failed to create knowledge base:', kbError)
        // Non-fatal - agent still created
      }
    }

    return NextResponse.json({ agent }, { status: 201 })
  } catch (error) {
    console.error('Agents POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
