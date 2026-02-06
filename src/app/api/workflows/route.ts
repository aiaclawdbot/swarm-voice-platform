import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

// GET /api/workflows - List workflows
export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const { data: workflows, error } = await supabaseAdmin
      .from('workflows')
      .select(`
        *,
        actions:workflow_actions(*)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching workflows:', error)
      return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 })
    }

    return NextResponse.json({ workflows })
  } catch (error) {
    console.error('Workflows GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/workflows - Create a workflow
export async function POST(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      description,
      trigger_type,
      trigger_config = {},
      status = 'draft',
      actions = [],
    } = body

    if (!name || !trigger_type) {
      return NextResponse.json(
        { error: 'Name and trigger_type are required' },
        { status: 400 }
      )
    }

    // Validate trigger_type
    const validTriggers = ['call_completed', 'lead_captured', 'missed_call', 'manual']
    if (!validTriggers.includes(trigger_type)) {
      return NextResponse.json(
        { error: `Invalid trigger_type. Must be one of: ${validTriggers.join(', ')}` },
        { status: 400 }
      )
    }

    // Create workflow
    const { data: workflow, error: workflowError } = await supabaseAdmin
      .from('workflows')
      .insert({
        org_id: orgId,
        name,
        description,
        trigger_type,
        trigger_config,
        status,
      })
      .select()
      .single()

    if (workflowError) {
      console.error('Error creating workflow:', workflowError)
      return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 })
    }

    // Create actions if provided
    if (actions.length > 0) {
      const actionsToInsert = actions.map((action: Record<string, unknown>, index: number) => ({
        workflow_id: workflow.id,
        action_type: action.action_type,
        action_config: action.action_config || {},
        position: index,
      }))

      const { error: actionsError } = await supabaseAdmin
        .from('workflow_actions')
        .insert(actionsToInsert)

      if (actionsError) {
        console.error('Error creating workflow actions:', actionsError)
        // Workflow was created, but actions failed
      }
    }

    // Fetch complete workflow with actions
    const { data: completeWorkflow } = await supabaseAdmin
      .from('workflows')
      .select(`
        *,
        actions:workflow_actions(*)
      `)
      .eq('id', workflow.id)
      .single()

    return NextResponse.json({ workflow: completeWorkflow }, { status: 201 })
  } catch (error) {
    console.error('Workflows POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
