import { NextRequest, NextResponse } from 'next/server'
import { searchAvailableNumbers } from '@/lib/twilio/client'

/**
 * GET /api/phone-numbers/available
 * Search for available phone numbers to provision
 */
export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const areaCode = searchParams.get('areaCode') || undefined
    const contains = searchParams.get('contains') || undefined
    const limit = parseInt(searchParams.get('limit') || '10')

    const numbers = await searchAvailableNumbers({
      areaCode,
      contains,
      limit: Math.min(limit, 20), // Max 20 results
    })

    return NextResponse.json({
      numbers: numbers.map(n => ({
        number: n.phoneNumber,
        friendly_name: n.friendlyName,
        locality: n.locality,
        region: n.region,
        capabilities: {
          voice: n.capabilities.voice,
          sms: n.capabilities.SMS,
        },
      })),
      count: numbers.length,
    })

  } catch (error) {
    console.error('Available numbers error:', error)
    return NextResponse.json({ error: 'Failed to search available numbers' }, { status: 500 })
  }
}
