'use client'

import { useState } from 'react'

interface Contact {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost'
  source: string
  lastContact: string
  totalCalls: number
}

const mockContacts: Contact[] = [
  { id: '1', firstName: 'John', lastName: 'Smith', phone: '+1 (555) 123-4567', email: 'john@example.com', status: 'qualified', source: 'Inbound Call', lastContact: '2 hours ago', totalCalls: 3 },
  { id: '2', firstName: 'Sarah', lastName: 'Johnson', phone: '+1 (555) 234-5678', email: 'sarah@example.com', status: 'new', source: 'Inbound Call', lastContact: '1 day ago', totalCalls: 1 },
  { id: '3', firstName: 'Mike', lastName: 'Williams', phone: '+1 (555) 345-6789', email: 'mike@example.com', status: 'contacted', source: 'Website', lastContact: '3 days ago', totalCalls: 2 },
  { id: '4', firstName: 'Emily', lastName: 'Brown', phone: '+1 (555) 456-7890', email: 'emily@example.com', status: 'won', source: 'Inbound Call', lastContact: '1 week ago', totalCalls: 5 },
  { id: '5', firstName: 'David', lastName: 'Lee', phone: '+1 (555) 567-8901', email: 'david@example.com', status: 'lost', source: 'Import', lastContact: '2 weeks ago', totalCalls: 4 },
]

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

  const filteredContacts = mockContacts.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(search.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(search.toLowerCase()) ||
      contact.phone.includes(search) ||
      contact.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
            Contacts
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Manage your leads and customers
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
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
            📥 Import
          </button>
          <button
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
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            maxWidth: '400px',
            padding: '10px 16px',
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
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

      {/* Contacts Table */}
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
                Calls
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                Last Contact
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map((contact, index) => (
              <tr
                key={contact.id}
                style={{
                  borderBottom: index < filteredContacts.length - 1 ? '1px solid #1a1a1a' : 'none',
                  cursor: 'pointer',
                }}
              >
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                    }}>
                      {contact.firstName[0]}{contact.lastName[0]}
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                        {contact.firstName} {contact.lastName}
                      </div>
                      <div style={{ color: '#666', fontSize: '12px' }}>
                        {contact.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: '#fff', fontSize: '14px' }}>
                  {contact.phone}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: statusColors[contact.status].bg,
                    color: statusColors[contact.status].text,
                    textTransform: 'capitalize',
                  }}>
                    {contact.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: '#888', fontSize: '14px' }}>
                  {contact.source}
                </td>
                <td style={{ padding: '16px 24px', color: '#fff', fontSize: '14px' }}>
                  {contact.totalCalls}
                </td>
                <td style={{ padding: '16px 24px', color: '#666', fontSize: '14px' }}>
                  {contact.lastContact}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
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
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
