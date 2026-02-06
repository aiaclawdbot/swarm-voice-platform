'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MOCK_CALLS, isDemoMode } from '@/lib/mock-data'
import { callsApi, Call } from '@/lib/api/client'

export default function CallDetailPage() {
  const params = useParams()
  const callId = params.id as string
  const [call, setCall] = useState<Call | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCall = async () => {
      try {
        // Check demo mode
        if (isDemoMode()) {
          const mockCall = MOCK_CALLS.find(c => c.id === callId)
          if (mockCall) {
            setCall({
              ...mockCall,
              contact: {
                id: mockCall.contact_id,
                org_id: mockCall.org_id,
                phone: mockCall.caller_number,
                first_name: mockCall.id === 'call-1' ? 'Sarah' : mockCall.id === 'call-2' ? 'Mike' : 'Emily',
                last_name: mockCall.id === 'call-1' ? 'Johnson' : mockCall.id === 'call-2' ? 'Chen' : null,
                status: 'qualified',
                created_at: mockCall.created_at,
                updated_at: mockCall.created_at,
              },
              agent: {
                id: mockCall.agent_id,
                name: 'Dental Reception AI',
              },
            } as unknown as Call)
          }
          setLoading(false)
          return
        }
        
        const data = await callsApi.get(callId)
        setCall(data.call)
      } catch (err) {
        // Try mock data as fallback
        const mockCall = MOCK_CALLS.find(c => c.id === callId)
        if (mockCall) {
          setCall(mockCall as unknown as Call)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCall()
  }, [callId])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Parse transcript into conversation format
  const parseTranscript = (transcript: string) => {
    if (!transcript) return []
    
    const lines = transcript.split('\n').filter(line => line.trim())
    return lines.map((line, index) => {
      const match = line.match(/^(Caller|Agent|User|Assistant):\s*(.*)$/i)
      if (match) {
        return {
          role: match[1].toLowerCase() === 'caller' || match[1].toLowerCase() === 'user' ? 'caller' : 'agent',
          message: match[2],
          id: index,
        }
      }
      return { role: 'unknown', message: line, id: index }
    })
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        Loading call details...
      </div>
    )
  }

  if (!call) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <p>Call not found</p>
        <Link href="/dashboard/calls" style={{ color: '#00ff88', marginTop: '16px', display: 'inline-block' }}>
          ← Back to Calls
        </Link>
      </div>
    )
  }

  const conversation = parseTranscript(call.transcript || '')
  const contactName = call.contact?.first_name 
    ? `${call.contact.first_name} ${call.contact.last_name || ''}`
    : call.caller_number || 'Unknown'

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link href="/dashboard/calls" style={{ color: '#666', textDecoration: 'none', fontSize: '13px' }}>
          ← Back to Calls
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
              Call with {contactName}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#666', fontSize: '14px' }}>
              <span>{formatDate(call.created_at)}</span>
              <span>•</span>
              <span>{formatDuration(call.duration_seconds)}</span>
              <span>•</span>
              <span style={{ textTransform: 'capitalize' }}>{call.direction}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {call.recording_url && (
              <a
                href={call.recording_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                🎧 Listen to Recording
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '8px',
          padding: '16px',
        }}>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Status</div>
          <div style={{
            color: call.status === 'completed' ? '#00ff88' : call.status === 'missed' ? '#ff4444' : '#fbbf24',
            fontSize: '16px',
            fontWeight: '600',
            textTransform: 'capitalize',
          }}>
            {call.status}
          </div>
        </div>
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '8px',
          padding: '16px',
        }}>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Intent</div>
          <div style={{
            color: call.intent === 'emergency' ? '#ff4444' : call.intent === 'booking' ? '#00ff88' : '#fff',
            fontSize: '16px',
            fontWeight: '600',
            textTransform: 'capitalize',
          }}>
            {call.intent || 'Unknown'}
          </div>
        </div>
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '8px',
          padding: '16px',
        }}>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Sentiment</div>
          <div style={{
            color: call.sentiment === 'positive' ? '#00ff88' : call.sentiment === 'negative' ? '#ff4444' : '#fff',
            fontSize: '16px',
            fontWeight: '600',
            textTransform: 'capitalize',
          }}>
            {call.sentiment || 'Neutral'}
          </div>
        </div>
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '8px',
          padding: '16px',
        }}>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Agent</div>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>
            {call.agent?.name || 'Unknown'}
          </div>
        </div>
      </div>

      {/* Summary */}
      {call.summary && (
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
            Summary
          </h2>
          <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>
            {call.summary}
          </p>
        </div>
      )}

      {/* Transcript */}
      <div style={{
        backgroundColor: '#111',
        border: '1px solid #222',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
          Transcript
        </h2>
        
        {conversation.length === 0 ? (
          <p style={{ color: '#666', fontSize: '14px' }}>No transcript available</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {conversation.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: item.role === 'agent' ? 'row-reverse' : 'row',
                  gap: '12px',
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: item.role === 'agent' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  flexShrink: 0,
                }}>
                  {item.role === 'agent' ? '🤖' : '👤'}
                </div>
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  backgroundColor: item.role === 'agent' ? 'rgba(0, 255, 136, 0.05)' : '#1a1a1a',
                  border: item.role === 'agent' ? '1px solid rgba(0, 255, 136, 0.2)' : '1px solid #333',
                  borderRadius: item.role === 'agent' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                  color: '#fff',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}>
                  {item.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Link */}
      {call.contact?.id && (
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link
            href={`/dashboard/contacts/${call.contact.id}`}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            View Contact Profile →
          </Link>
        </div>
      )}
    </div>
  )
}
