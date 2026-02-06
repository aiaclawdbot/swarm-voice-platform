import { NextRequest, NextResponse } from 'next/server'
import { getTemplate, templateToKnowledgeContent, getEmergencyPrompt } from '@/data/templates'

/**
 * GET /api/templates/[id]
 * Get a specific template with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const template = getTemplate(id)

  if (!template) {
    return NextResponse.json(
      { error: 'Template not found' },
      { status: 404 }
    )
  }

  // Include knowledge content and emergency prompt
  const knowledgeContent = templateToKnowledgeContent(template)
  const emergencyPrompt = getEmergencyPrompt(template)

  return NextResponse.json({
    template,
    knowledgeContent,
    emergencyPrompt,
  })
}
