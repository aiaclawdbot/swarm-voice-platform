'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCalls } from '@/hooks/useCalls'

const intentColors: Record<string, { bg: string; text: string }> = {
  booking: { bg: 'rgba(0, 255, 136, 0.1)', text: '#00ff88' },
  inquiry: { bg: 'rgba(99, 102, 241, 0.1)', text: '#818cf8' },
  emergency: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
  status: { bg: 'rgba(245, 158, 11, 0.1)', text: '#fbbf24' },
  complaint: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
  other: { bg: 'rgba(255, 255, 255, 0.05)', text: '#888' },
}

export default function CallsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { calls, total, loading, error, setFilter } = useCalls()

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setFilter({ status: status !== 'all' ? status : undefined })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`
    return `${Math.floor(diffMins / 1440)} days ago`
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ff4444' }}>
        Error loading calls: {error}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
            Call History
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            {total} total calls
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
      }}>
        {['all', 'completed', 'missed', 'voicemail'].map((status) => (
          <button
            key={status}
            onClick={() => handleStatusFilter(status)}
            style={{
              padding: '8px 16px',
              backgroundColor: statusFilter === status ? '#00ff88' : '#111',
              border: statusFilter === status ? 'none' : '1px solid #333',
              borderRadius: '20px',
              color: statusFilter === status ? '#000' : '#888',
              fontSize: '13px',
              fontWeight: statusFilter === status ? '600' : '400',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {status === 'all' ? 'All Calls' : status}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
          Loading calls...
        </div>
      )}

      {/* Empty State */}
      {!loading && calls.length === 0 && (
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '12px',
          padding: '60px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📞</div>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
            {statusFilter !== 'all' ? 'No calls found' : 'No calls yet'}
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            {statusFilter !== 'all' 
              ? 'Try a different filter'
              : 'Calls will appear here once your agent starts receiving them'}
          </p>
          {statusFilter === 'all' && (
            <Link
              href="/dashboard/agents"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#00ff88',
                color: '#000',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Set Up Your Agent
            </Link>
          )}
        </div>
      )}

      {/* Calls List */}
      {!loading && calls.length > 0 && (
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {calls.map((call, index) => {
            const intent = call.intent || 'other'
            const colors = intentColors[intent] || intentColors.other
            const contactName = call.contact?.first_name 
              ? `${call.contact.first_name} ${call.contact.last_name || ''}`
              : call.caller_number || 'Unknown'

            return (
              <div
                key={call.id}
                style={{
                  padding: '20px 24px',
                  borderBottom: index < calls.length - 1 ? '1px solid #1a1a1a' : 'none',
                  display: 'flex',
                  gap: '16px',
                }}
              >
                {/* Status Icon */}
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: call.status === 'completed' ? 'rgba(0, 255, 136, 0.1)' :
                    call.status === 'missed' ? 'rgba(255, 68, 68, 0.1)' : 'rgba(255, 200, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0,
                }}>
                  {call.status === 'completed' ? '✓' : call.status === 'missed' ? '✗' : '📩'}
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>
                      {contactName}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '500',
                      backgroundColor: colors.bg,
                      color: colors.text,
                      textTransform: 'capitalize',
                    }}>
                      {intent}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      backgroundColor: call.direction === 'inbound' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: call.direction === 'inbound' ? '#818cf8' : '#fbbf24',
                    }}>
                      {call.direction}
                    </span>
                  </div>
                  <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>
                    {formatTimeAgo(call.created_at)} · {formatDuration(call.duration_seconds)} · {call.agent?.name || 'Unknown Agent'}
                  </div>
                  {call.summary && (
                    <div style={{
                      color: '#888',
                      fontSize: '13px',
                      backgroundColor: '#0a0a0a',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      marginTop: '8px',
                    }}>
                      {call.summary}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                  {call.recording_url && (
                    <a
                      href={call.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '12px',
                        textDecoration: 'none',
                        textAlign: 'center',
                      }}
                    >
                      🎧 Listen
                    </a>
                  )}
                  {call.contact?.id && (
                    <Link
                      href={`/dashboard/contacts/${call.contact.id}`}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '12px',
                        textDecoration: 'none',
                        textAlign: 'center',
                      }}
                    >
                      View Contact
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
