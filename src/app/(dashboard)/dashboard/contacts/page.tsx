'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useContacts } from '@/hooks/useContacts'

const statusColors: Record<string, { bg: string; text: string }> = {
  new: { bg: 'rgba(99, 102, 241, 0.1)', text: '#818cf8' },
  contacted: { bg: 'rgba(245, 158, 11, 0.1)', text: '#fbbf24' },
  qualified: { bg: 'rgba(0, 255, 136, 0.1)', text: '#00ff88' },
  won: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
  lost: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
}

export default function ContactsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { contacts, total, loading, error, setFilter, updateContact, deleteContact } = useContacts()

  // Apply filters when they change
  const handleSearch = (value: string) => {
    setSearch(value)
    setFilter({ search: value || undefined, status: statusFilter !== 'all' ? statusFilter : undefined })
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setFilter({ search: search || undefined, status: status !== 'all' ? status : undefined })
  }

  const handleStatusChange = async (contactId: string, newStatus: string) => {
    try {
      await updateContact(contactId, { status: newStatus as any })
    } catch (err) {
      alert('Failed to update status')
    }
  }

  const handleDelete = async (contactId: string, name: string) => {
    if (confirm(`Delete contact "${name}"?`)) {
      try {
        await deleteContact(contactId)
      } catch (err) {
        alert('Failed to delete contact')
      }
    }
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
        Error loading contacts: {error}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
            Contacts
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            {total} total contacts
          </p>
        </div>
        <button
          onClick={() => {/* TODO: Open add contact modal */}}
          style={{
            padding: '10px 20px',
            backgroundColor: '#00ff88',
            border: 'none',
            borderRadius: '8px',
            color: '#000',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          + Add Contact
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#111',
        border: '1px solid #222',
        borderRadius: '12px',
      }}>
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 16px',
            backgroundColor: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '14px',
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            backgroundColor: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '14px',
            minWidth: '150px',
          }}
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
          Loading contacts...
        </div>
      )}

      {/* Empty State */}
      {!loading && contacts.length === 0 && (
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '12px',
          padding: '60px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
            {search || statusFilter !== 'all' ? 'No contacts found' : 'No contacts yet'}
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            {search || statusFilter !== 'all' 
              ? 'Try adjusting your filters'
              : 'Contacts will appear here when calls come in or you add them manually'}
          </p>
        </div>
      )}

      {/* Contacts Table */}
      {!loading && contacts.length > 0 && (
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
                  Contact
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  Phone
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  Source
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  Added
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'right', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact, index) => {
                const colors = statusColors[contact.status] || statusColors.new
                const displayName = contact.first_name || contact.last_name 
                  ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                  : contact.phone || contact.email || 'Unknown'

                return (
                  <tr
                    key={contact.id}
                    style={{
                      borderBottom: index < contacts.length - 1 ? '1px solid #1a1a1a' : 'none',
                    }}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <Link
                        href={`/dashboard/contacts/${contact.id}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                          {displayName}
                        </div>
                        {contact.email && (
                          <div style={{ color: '#666', fontSize: '12px', marginTop: '2px' }}>
                            {contact.email}
                          </div>
                        )}
                      </Link>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#888', fontSize: '14px' }}>
                      {contact.phone || '-'}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <select
                        value={contact.status}
                        onChange={(e) => handleStatusChange(contact.id, e.target.value)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: colors.bg,
                          color: colors.text,
                          border: 'none',
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                        }}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#888', fontSize: '13px', textTransform: 'capitalize' }}>
                      {contact.source?.replace('_', ' ') || '-'}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#666', fontSize: '13px' }}>
                      {formatTimeAgo(contact.created_at)}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Link
                          href={`/dashboard/contacts/${contact.id}`}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '12px',
                            textDecoration: 'none',
                          }}
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(contact.id, displayName)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'transparent',
                            border: '1px solid #333',
                            borderRadius: '4px',
                            color: '#ff4444',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Footer */}
      {!loading && contacts.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '24px',
          marginTop: '24px',
          padding: '16px 24px',
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '12px',
        }}>
          {['new', 'contacted', 'qualified', 'won', 'lost'].map((status) => {
            const count = contacts.filter(c => c.status === status).length
            const colors = statusColors[status]
            return (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: colors.text,
                }} />
                <span style={{ color: '#888', fontSize: '13px', textTransform: 'capitalize' }}>
                  {status}: <span style={{ color: '#fff' }}>{count}</span>
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
