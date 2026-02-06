'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SettingsPage() {
  const [phoneNumbers, setPhoneNumbers] = useState<Array<{
    id: string
    number: string
    friendly_name: string
    status: string
  }>>([])
  const [isProvisioning, setIsProvisioning] = useState(false)
  const [areaCode, setAreaCode] = useState('')

  const handleProvision = async () => {
    setIsProvisioning(true)
    try {
      // TODO: Call /api/phone-numbers/provision
      // For demo, just simulate
      const newNumber = {
        id: 'ph-' + Date.now(),
        number: `+1${areaCode || '555'}${Math.random().toString().slice(2, 9)}`,
        friendly_name: 'New Phone Number',
        status: 'active',
      }
      setPhoneNumbers([...phoneNumbers, newNumber])
      setAreaCode('')
    } catch (err) {
      alert('Failed to provision number')
    } finally {
      setIsProvisioning(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
          Settings
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Manage your phone numbers and account settings
        </p>
      </div>

      {/* Phone Numbers Section */}
      <div style={{
        backgroundColor: '#111',
        border: '1px solid #222',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
          Phone Numbers
        </h2>
        
        {/* Provision New */}
        <div style={{
          padding: '16px',
          backgroundColor: '#0a0a0a',
          borderRadius: '8px',
          marginBottom: '20px',
        }}>
          <div style={{ marginBottom: '12px', color: '#888', fontSize: '13px' }}>
            Provision a new phone number for your agents
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Area code (optional)"
              value={areaCode}
              onChange={(e) => setAreaCode(e.target.value)}
              maxLength={3}
              style={{
                width: '140px',
                padding: '10px 12px',
                backgroundColor: '#111',
                border: '1px solid #333',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
              }}
            />
            <button
              onClick={handleProvision}
              disabled={isProvisioning}
              style={{
                padding: '10px 20px',
                backgroundColor: isProvisioning ? '#333' : '#00ff88',
                border: 'none',
                borderRadius: '6px',
                color: isProvisioning ? '#666' : '#000',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isProvisioning ? 'not-allowed' : 'pointer',
              }}
            >
              {isProvisioning ? 'Provisioning...' : 'Get New Number'}
            </button>
          </div>
          <div style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
            $15/month per number. Includes voice and SMS.
          </div>
        </div>

        {/* Phone Number List */}
        {phoneNumbers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {phoneNumbers.map((pn) => (
              <div
                key={pn.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#0a0a0a',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ color: '#fff', fontSize: '16px', fontFamily: 'monospace' }}>
                    {pn.number}
                  </div>
                  <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                    {pn.friendly_name}
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  backgroundColor: pn.status === 'active' ? 'rgba(0, 255, 136, 0.1)' : '#1a1a1a',
                  color: pn.status === 'active' ? '#00ff88' : '#666',
                }}>
                  {pn.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#666', fontSize: '14px', textAlign: 'center', padding: '24px' }}>
            No phone numbers yet. Provision one above to get started.
          </div>
        )}
      </div>

      {/* Organization Info */}
      <div style={{
        backgroundColor: '#111',
        border: '1px solid #222',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
          Organization
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>Plan</span>
            <span style={{ color: '#fff' }}>Starter ($99/mo)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>Minutes Used</span>
            <span style={{ color: '#fff' }}>0 / 500</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>Agents</span>
            <span style={{ color: '#fff' }}>0 / 1</span>
          </div>
        </div>
        <button
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Upgrade Plan
        </button>
      </div>

      {/* Danger Zone */}
      <div style={{
        backgroundColor: '#111',
        border: '1px solid rgba(255, 68, 68, 0.3)',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ff4444', marginBottom: '8px' }}>
          Danger Zone
        </h2>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>
          Permanently delete your account and all data
        </p>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 68, 68, 0.5)',
            borderRadius: '6px',
            color: '#ff4444',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  )
}
