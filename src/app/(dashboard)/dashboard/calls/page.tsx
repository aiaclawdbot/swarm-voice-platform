'use client'

import { useState } from 'react'

interface Call {
  id: string
  callerNumber: string
  callerName: string
  duration: string
  status: 'completed' | 'missed' | 'voicemail' | 'transferred'
  time: string
  agent: string
  intent: string
  sentiment: 'positive' | 'neutral' | 'negative'
}

const mockCalls: Call[] = [
  { id: '1', callerNumber: '+1 (555) 123-4567', callerName: 'John Smith', duration: '4:32', status: 'completed', time: '2 min ago', agent: 'Main Line', intent: 'Booking', sentiment: 'positive' },
  { id: '2', callerNumber: '+1 (555) 234-5678', callerName: 'Sarah Johnson', duration: '2:15', status: 'completed', time: '15 min ago', agent: 'Main Line', intent: 'Inquiry', sentiment: 'neutral' },
  { id: '3', callerNumber: '+1 (555) 345-6789', callerName: 'Unknown', duration: '0:00', status: 'missed', time: '32 min ago', agent: 'Main Line', intent: '-', sentiment: 'neutral' },
  { id: '4', callerNumber: '+1 (555) 456-7890', callerName: 'Mike Williams', duration: '6:18', status: 'completed', time: '1 hr ago', agent: 'Main Line', intent: 'Emergency', sentiment: 'negative' },
  { id: '5', callerNumber: '+1 (555) 567-8901', callerName: 'Emily Brown', duration: '1:45', status: 'voicemail', time: '2 hr ago', agent: 'After Hours', intent: '-', sentiment: 'neutral' },
  { id: '6', callerNumber: '+1 (555) 678-9012', callerName: 'David Lee', duration: '3:22', status: 'transferred', time: '3 hr ago', agent: 'Main Line', intent: 'Complaint', sentiment: 'negative' },
  { id: '7', callerNumber: '+1 (555) 789-0123', callerName: 'Lisa Chen', duration: '5:10', status: 'completed', time: '4 hr ago', agent: 'Main Line', intent: 'Booking', sentiment: 'positive' },
]

const statusConfig = {
  completed: { bg: 'rgba(0, 255, 136, 0.1)', text: '#00ff88', icon: '✓' },
  missed: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', icon: '✗' },
  voicemail: { bg: 'rgba(245, 158, 11, 0.1)', text: '#fbbf24', icon: '📩' },
  transferred: { bg: 'rgba(99, 102, 241, 0.1)', text: '#818cf8', icon: '↗' },
}

const sentimentConfig = {
  positive: { color: '#00ff88' },
  neutral: { color: '#666' },
  negative: { color: '#ef4444' },
}

export default function CallsPage() {
  const [filter, setFilter] = useState('all')
  const [selectedCall, setSelectedCall] = useState<string | null>(null)

  const filteredCalls = filter === 'all' 
    ? mockCalls 
    : mockCalls.filter(c => c.status === filter)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
            Call History
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            View and analyze all calls
          </p>
        </div>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          📥 Export
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
      }}>
        {['all', 'completed', 'missed', 'voicemail', 'transferred'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              backgroundColor: filter === f ? '#00ff88' : '#111',
              border: filter === f ? 'none' : '1px solid #333',
              borderRadius: '20px',
              color: filter === f ? '#000' : '#888',
              fontSize: '13px',
              fontWeight: filter === f ? '600' : '400',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Calls Table */}
      <div style={{
        backgroundColor: '#111',
        border: '1px solid #222',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #222' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                Caller
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                Status
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                Duration
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                Intent
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                Agent
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                Time
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredCalls.map((call, index) => (
              <tr
                key={call.id}
                onClick={() => setSelectedCall(call.id)}
                style={{
                  borderBottom: index < filteredCalls.length - 1 ? '1px solid #1a1a1a' : 'none',
                  cursor: 'pointer',
                  backgroundColor: selectedCall === call.id ? 'rgba(0, 255, 136, 0.05)' : 'transparent',
                }}
              >
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: statusConfig[call.status].bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: statusConfig[call.status].text,
                      fontSize: '14px',
                    }}>
                      {statusConfig[call.status].icon}
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                        {call.callerName}
                      </div>
                      <div style={{ color: '#666', fontSize: '12px' }}>
                        {call.callerNumber}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: statusConfig[call.status].bg,
                    color: statusConfig[call.status].text,
                    textTransform: 'capitalize',
                  }}>
                    {call.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: '#fff', fontSize: '14px', fontFamily: 'monospace' }}>
                  {call.duration}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: sentimentConfig[call.sentiment].color,
                    }} />
                    <span style={{ color: '#888', fontSize: '14px' }}>
                      {call.intent}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: '#666', fontSize: '14px' }}>
                  {call.agent}
                </td>
                <td style={{ padding: '16px 24px', color: '#666', fontSize: '14px' }}>
                  {call.time}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {call.status === 'completed' && (
                      <button
                        style={{
                          padding: '6px 12px',
                          backgroundColor: 'transparent',
                          border: '1px solid #333',
                          borderRadius: '6px',
                          color: '#888',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        ▶ Play
                      </button>
                    )}
                    <button
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'transparent',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        color: '#888',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '24px',
      }}>
        <div style={{ color: '#666', fontSize: '13px' }}>
          Showing 1-7 of 127 calls
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '6px',
            color: '#888',
            fontSize: '13px',
            cursor: 'pointer',
          }}>
            Previous
          </button>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '6px',
            color: '#888',
            fontSize: '13px',
            cursor: 'pointer',
          }}>
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
