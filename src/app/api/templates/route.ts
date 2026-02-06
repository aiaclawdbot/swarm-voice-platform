import { NextResponse } from 'next/server'
import { templateList, getTemplate, templateToKnowledgeContent } from '@/data/templates'

/**
 * GET /api/templates
 * List all available industry templates
 */
export async function GET() {
  const templates = templateList.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    icon: t.icon,
    voice_id: t.voice_id,
    has_emergency_handling: t.emergency_keywords.length > 0,
    faq_count: t.faqs.length,
  }))

  return NextResponse.json({ templates })
}
