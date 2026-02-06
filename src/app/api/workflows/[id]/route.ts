import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

// GET /api/workflows/[id] - Get a single workflow with actions
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

    const { data: workflow, error } = await supabaseAdmin
      .from('workflows')
      .select(`
        *,
        actions:workflow_actions(*)
      `)
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (error || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Sort actions by position
    if (workflow.actions) {
      workflow.actions.sort((a: { position: number }, b: { position: number }) => a.position - b.position)
    }

    return NextResponse.json({ workflow })

  } catch (error) {
    console.error('Workflow GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/workflows/[id] - Update a workflow
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
      description,
      trigger_type,
      trigger_config,
      status,
      actions,
    } = body

    // Update workflow
    const updates: Record<string, unknown> = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (trigger_type !== undefined) updates.trigger_type = trigger_type
    if (trigger_config !== undefined) updates.trigger_config = trigger_config
    if (status !== undefined) updates.status = status

    if (Object.keys(updates).length > 0) {
      const { error: wfError } = await supabaseAdmin
        .from('workflows')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)

      if (wfError) {
        console.error('Error updating workflow:', wfError)
        return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 })
      }
    }

    // Update actions if provided
    if (actions !== undefined) {
      // Delete existing actions
      await supabaseAdmin
        .from('workflow_actions')
        .delete()
        .eq('workflow_id', id)

      // Insert new actions
      if (actions.length > 0) {
        const actionsToInsert = actions.map((action: Record<string, unknown>, index: number) => ({
          workflow_id: id,
          action_type: action.action_type,
          action_config: action.action_config || {},
          position: index,
        }))

        const { error: actionsError } = await supabaseAdmin
          .from('workflow_actions')
          .insert(actionsToInsert)

        if (actionsError) {
          console.error('Error updating workflow actions:', actionsError)
        }
      }
    }

    // Return updated workflow
    const { data: workflow } = await supabaseAdmin
      .from('workflows')
      .select(`
        *,
        actions:workflow_actions(*)
      `)
      .eq('id', id)
      .single()

    return NextResponse.json({ workflow })

  } catch (error) {
    console.error('Workflow PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/workflows/[id] - Delete a workflow
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

    // Delete workflow (actions cascade)
    const { error } = await supabaseAdmin
      .from('workflows')
      .delete()
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) {
      console.error('Error deleting workflow:', error)
      return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Workflow DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
