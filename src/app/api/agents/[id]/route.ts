import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { updateAssistant, deleteAssistant } from '@/lib/vapi/client'

// GET /api/agents/[id] - Get a single agent
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .select(`
        *,
        phone_number:phone_numbers(id, number, friendly_name)
      `)
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (error || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    return NextResponse.json({ agent })
  } catch (error) {
    console.error('Agent GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/agents/[id] - Update an agent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      persona,
      greeting,
      voice_id,
      voice_provider,
      model,
      settings,
      status,
      phone_number_id,
    } = body

    // Get existing agent to check vapi_assistant_id
    const { data: existingAgent } = await supabaseAdmin
      .from('agents')
      .select('vapi_assistant_id')
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (!existingAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Update Vapi assistant if it exists
    if (existingAgent.vapi_assistant_id && (persona || greeting || voice_id || model)) {
      try {
        const updates: Record<string, unknown> = {}
        
        if (persona) {
          updates.model = {
            provider: 'openai',
            model: model || 'gpt-4o-mini',
            systemPrompt: persona,
          }
        }
        if (greeting) {
          updates.firstMessage = greeting
        }
        if (voice_id) {
          updates.voice = {
            provider: voice_provider || 'openai',
            voiceId: voice_id,
          }
        }

        if (Object.keys(updates).length > 0) {
          await updateAssistant(existingAgent.vapi_assistant_id, updates)
        }
      } catch (vapiError) {
        console.error('Vapi update failed:', vapiError)
        // Continue with DB update even if Vapi fails
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (persona !== undefined) updateData.persona = persona
    if (greeting !== undefined) updateData.greeting = greeting
    if (voice_id !== undefined) updateData.voice_id = voice_id
    if (voice_provider !== undefined) updateData.voice_provider = voice_provider
    if (model !== undefined) updateData.model = model
    if (settings !== undefined) updateData.settings = settings
    if (status !== undefined) updateData.status = status
    if (phone_number_id !== undefined) updateData.phone_number_id = phone_number_id

    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select(`
        *,
        phone_number:phone_numbers(id, number, friendly_name)
      `)
      .single()

    if (error) {
      console.error('Error updating agent:', error)
      return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 })
    }

    return NextResponse.json({ agent })
  } catch (error) {
    console.error('Agent PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/agents/[id] - Delete an agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Get agent to delete Vapi assistant
    const { data: existingAgent } = await supabaseAdmin
      .from('agents')
      .select('vapi_assistant_id')
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (!existingAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Delete Vapi assistant if exists
    if (existingAgent.vapi_assistant_id) {
      try {
        await deleteAssistant(existingAgent.vapi_assistant_id)
      } catch (vapiError) {
        console.error('Vapi delete failed:', vapiError)
        // Continue with DB delete
      }
    }

    // Delete from database
    const { error } = await supabaseAdmin
      .from('agents')
      .delete()
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) {
      console.error('Error deleting agent:', error)
      return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Agent DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
