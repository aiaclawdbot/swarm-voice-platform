import { NextRequest, NextResponse } from 'next/server'
import { processPendingRuns } from '@/lib/workflows/engine'

/**
 * POST /api/cron/process-workflows
 * Process pending workflow runs
 * 
 * This endpoint should be called by a cron job (Vercel Cron, etc.)
 * Secured by a secret header
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret')
    const expectedSecret = process.env.CRON_SECRET

    if (expectedSecret && cronSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Process pending workflow runs
    const processed = await processPendingRuns()

    return NextResponse.json({
      success: true,
      processed,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Workflow processing error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

// Also support GET for Vercel Cron
export async function GET(request: NextRequest) {
  return POST(request)
}
