import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for API route protection and org context
 * 
 * For MVP, we use x-org-id header. In production, this would use
 * Supabase Auth to get the user's org from their session.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only apply to API routes (except webhooks and public endpoints)
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Skip auth for webhooks (they have their own auth)
  if (pathname.startsWith('/api/webhooks/')) {
    return NextResponse.next()
  }

  // Skip auth for cron endpoints (they use secret)
  if (pathname.startsWith('/api/cron/')) {
    return NextResponse.next()
  }

  // Skip auth for organization creation (signup flow)
  if (pathname === '/api/organizations' && request.method === 'POST') {
    return NextResponse.next()
  }

  // For MVP: Require x-org-id header
  // In production: Get org from Supabase session
  const orgId = request.headers.get('x-org-id')
  
  if (!orgId) {
    return NextResponse.json(
      { 
        error: 'Authentication required',
        hint: 'Include x-org-id header (MVP) or authenticate via Supabase (production)',
      },
      { status: 401 }
    )
  }

  // Validate org ID format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(orgId)) {
    return NextResponse.json(
      { error: 'Invalid organization ID format' },
      { status: 400 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
