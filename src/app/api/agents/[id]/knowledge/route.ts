import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

// POST /api/agents/[id]/knowledge - Upload knowledge base content
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Verify agent belongs to org
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('id')
      .eq('id', agentId)
      .eq('org_id', orgId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const body = await request.json()
    const { content, title, source_url } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Get or create knowledge base for agent
    let { data: knowledgeBase } = await supabaseAdmin
      .from('knowledge_bases')
      .select('id')
      .eq('agent_id', agentId)
      .single()

    if (!knowledgeBase) {
      const { data: newKb, error: kbError } = await supabaseAdmin
        .from('knowledge_bases')
        .insert({
          org_id: orgId,
          agent_id: agentId,
          name: 'Default Knowledge Base',
        })
        .select('id')
        .single()

      if (kbError) {
        return NextResponse.json({ error: 'Failed to create knowledge base' }, { status: 500 })
      }
      knowledgeBase = newKb
    }

    // Chunk the content
    const chunks = chunkText(content, 500, 100)

    // Generate embeddings and insert chunks
    const insertedChunks = []

    for (const chunk of chunks) {
      // Generate embedding
      const embedding = await generateEmbedding(chunk)

      // Insert chunk with embedding
      const { data: doc, error: docError } = await supabaseAdmin
        .from('knowledge_documents')
        .insert({
          knowledge_base_id: knowledgeBase.id,
          title: title || 'Uploaded Content',
          content: chunk,
          source_url,
          embedding,
        })
        .select('id')
        .single()

      if (!docError && doc) {
        insertedChunks.push(doc.id)
      }
    }

    return NextResponse.json({
      success: true,
      chunks_created: insertedChunks.length,
      knowledge_base_id: knowledgeBase.id,
    }, { status: 201 })

  } catch (error) {
    console.error('Knowledge upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/agents/[id]/knowledge - Clear all knowledge
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Get knowledge base
    const { data: knowledgeBase } = await supabaseAdmin
      .from('knowledge_bases')
      .select('id')
      .eq('agent_id', agentId)
      .single()

    if (!knowledgeBase) {
      return NextResponse.json({ success: true, deleted: 0 })
    }

    // Delete all documents
    const { count } = await supabaseAdmin
      .from('knowledge_documents')
      .delete()
      .eq('knowledge_base_id', knowledgeBase.id)
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({ success: true, deleted: count || 0 })

  } catch (error) {
    console.error('Knowledge delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Chunk text into smaller pieces with overlap
 */
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []
  
  let i = 0
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    chunks.push(chunk)
    i += chunkSize - overlap
    if (i + chunkSize >= words.length && i < words.length) {
      // Last chunk
      chunks.push(words.slice(i).join(' '))
      break
    }
  }

  return chunks
}

/**
 * Generate embedding using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not set, returning zero embedding')
    return new Array(1536).fill(0)
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  })

  if (!response.ok) {
    console.error('OpenAI embedding error:', await response.text())
    throw new Error('Failed to generate embedding')
  }

  const data = await response.json()
  return data.data[0].embedding
}
