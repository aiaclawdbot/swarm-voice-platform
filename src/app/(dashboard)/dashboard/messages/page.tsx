'use client'

import { useState } from 'react'

interface Message {
  id: string
  contactName: string
  contactPhone: string
  channel: 'sms' | 'email'
  direction: 'inbound' | 'outbound'
  preview: string
  time: string
  read: boolean
}

const mockMessages: Message[] = [
  { id: '1', contactName: 'John Smith', contactPhone: '+1 (555) 123-4567', channel: 'sms', direction: 'inbound', preview: 'Thanks for the quick response! Can I book...', time: '5 min ago', read: false },
  { id: '2', contactName: 'Sarah Johnson', contactPhone: '+1 (555) 234-5678', channel: 'sms', direction: 'outbound', preview: 'Hi Sarah! Thanks for calling Smith Plumbing...', time: '1 hr ago', read: true },
  { id: '3', contactName: 'Mike Williams', contactPhone: '+1 (555) 345-6789', channel: 'email', direction: 'outbound', preview: 'Thank you for choosing us for your emergency...', time: '2 hr ago', read: true },
  { id: '4', contactName: 'Emily Brown', contactPhone: '+1 (555) 456-7890', channel: 'sms', direction: 'inbound', preview: 'What time are you available tomorrow?', time: '3 hr ago', read: false },
  { id: '5', contactName: 'David Lee', contactPhone: '+1 (555) 567-8901', channel: 'sms', direction: 'outbound', preview: 'We missed your call. Reply to schedule a...', time: '5 hr ago', read: true },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1')
  const [filter, setFilter] = useState('all')

  const filteredMessages = filter === 'all' 
    ? mockMessages 
    : filter === 'unread'
    ? mockMessages.filter(m => !m.read)
    : mockMessages.filter(m => m.channel === filter)

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Conversation List */}
      <div style={{
        width: '380px',
        borderRight: '1px solid #222',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #222' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            Messages
          </h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'unread', 'sms', 'email'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: filter === f ? '#00ff88' : '#111',
                  border: filter === f ? 'none' : '1px solid #333',
                  borderRadius: '16px',
                  color: filter === f ? '#000' : '#888',
                  fontSize: '12px',
                  fontWeight: filter === f ? '600' : '400',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Messages List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              onClick={() => setSelectedConversation(message.id)}
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #1a1a1a',
                cursor: 'pointer',
                backgroundColor: selectedConversation === message.id ? 'rgba(0, 255, 136, 0.05)' : 'transparent',
                borderLeft: selectedConversation === message.id ? '3px solid #00ff88' : '3px solid transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '14px',
                  fontWeight: '600',
                  flexShrink: 0,
                }}>
                  {message.contactName.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{
                      color: message.read ? '#888' : '#fff',
                      fontSize: '14px',
                      fontWeight: message.read ? '400' : '600',
                    }}>
                      {message.contactName}
                    </span>
                    <span style={{ color: '#666', fontSize: '11px' }}>{message.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px' }}>
                      {message.channel === 'sms' ? '💬' : '📧'}
                    </span>
                    {message.direction === 'outbound' && (
                      <span style={{ color: '#666', fontSize: '11px' }}>Sent</span>
                    )}
                  </div>
                  <div style={{
                    color: '#666',
                    fontSize: '13px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {message.preview}
                  </div>
                </div>
                {!message.read && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#00ff88',
                    flexShrink: 0,
                  }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (
          <>
            {/* Contact Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #222',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '14px',
                  fontWeight: '600',
                }}>
                  JS
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>John Smith</div>
                  <div style={{ color: '#666', fontSize: '13px' }}>+1 (555) 123-4567</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  padding: '8px 16px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}>
                  📞 Call
                </button>
                <button style={{
                  padding: '8px 16px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}>
                  👤 View Contact
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Outbound message */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    backgroundColor: '#00ff88',
                    color: '#000',
                    borderRadius: '16px 16px 4px 16px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                  }}>
                    Hi John! Thanks for calling Smith Plumbing. We'd love to help with your water heater issue. Our next available slot is tomorrow at 2pm. Does that work for you?
                  </div>
                </div>
                
                {/* Timestamp */}
                <div style={{ textAlign: 'center', color: '#666', fontSize: '11px' }}>
                  Today 2:30 PM
                </div>

                {/* Inbound message */}
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    backgroundColor: '#1a1a1a',
                    color: '#fff',
                    borderRadius: '16px 16px 16px 4px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                  }}>
                    Thanks for the quick response! Can I book for 3pm instead? Also, do you offer any warranty on the work?
                  </div>
                </div>
              </div>
            </div>

            {/* Compose */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #222',
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    backgroundColor: '#111',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <button style={{
                  padding: '12px 24px',
                  backgroundColor: '#00ff88',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}>
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <div style={{ fontSize: '16px' }}>Select a conversation</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
