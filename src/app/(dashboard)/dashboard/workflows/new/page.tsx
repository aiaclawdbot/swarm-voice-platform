'use client'

import { useState } from 'react'
import Link from 'next/link'

type TriggerType = 'call_completed' | 'lead_captured' | 'missed_call' | 'appointment_booked'
type ActionType = 'send_sms' | 'send_email' | 'add_note' | 'update_contact' | 'notify_team' | 'webhook' | 'wait'

interface WorkflowAction {
  id: string
  type: ActionType
  config: Record<string, string | number>
}

const triggers = [
  { id: 'call_completed', name: 'Call Completed', icon: '✅', desc: 'When any call finishes' },
  { id: 'lead_captured', name: 'Lead Captured', icon: '🎯', desc: 'When contact info is extracted' },
  { id: 'missed_call', name: 'Missed Call', icon: '📵', desc: 'When a call goes unanswered' },
  { id: 'appointment_booked', name: 'Appointment Booked', icon: '📅', desc: 'When booking is confirmed' },
]

const actionTypes = [
  { id: 'send_sms', name: 'Send SMS', icon: '💬', desc: 'Text message to contact' },
  { id: 'send_email', name: 'Send Email', icon: '📧', desc: 'Email to contact' },
  { id: 'add_note', name: 'Add Note', icon: '📝', desc: 'Note on contact record' },
  { id: 'update_contact', name: 'Update Contact', icon: '👤', desc: 'Change status or add tags' },
  { id: 'notify_team', name: 'Notify Team', icon: '🔔', desc: 'Alert team member' },
  { id: 'webhook', name: 'Webhook', icon: '🔗', desc: 'Send to external system' },
  { id: 'wait', name: 'Wait', icon: '⏱️', desc: 'Delay before next action' },
]

export default function NewWorkflowPage() {
  const [name, setName] = useState('')
  const [trigger, setTrigger] = useState<TriggerType | null>(null)
  const [actions, setActions] = useState<WorkflowAction[]>([])
  const [step, setStep] = useState(1)

  const addAction = (type: ActionType) => {
    setActions([...actions, { id: crypto.randomUUID(), type, config: {} }])
  }

  const removeAction = (id: string) => {
    setActions(actions.filter(a => a.id !== id))
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/dashboard/workflows" style={{ color: '#666', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          ← Back to Workflows
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
          Create Workflow
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Automate actions based on call events
        </p>
      </div>

      {/* Progress */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
      }}>
        {['Trigger', 'Actions', 'Review'].map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              backgroundColor: step > i ? '#00ff88' : '#333',
            }}
          />
        ))}
      </div>

      {/* Step 1: Name & Trigger */}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              Workflow Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., New Lead Follow-up"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#111',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: '500', marginBottom: '16px' }}>
              When should this workflow run?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {triggers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTrigger(t.id as TriggerType)}
                  style={{
                    padding: '20px',
                    backgroundColor: trigger === t.id ? 'rgba(0, 255, 136, 0.1)' : '#111',
                    border: trigger === t.id ? '2px solid #00ff88' : '1px solid #333',
                    borderRadius: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '12px' }}>{t.icon}</div>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    {t.name}
                  </div>
                  <div style={{ color: '#666', fontSize: '12px' }}>
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setStep(2)}
              disabled={!name || !trigger}
              style={{
                padding: '12px 24px',
                backgroundColor: name && trigger ? '#00ff88' : '#333',
                border: 'none',
                borderRadius: '8px',
                color: name && trigger ? '#000' : '#666',
                fontSize: '14px',
                fontWeight: '600',
                cursor: name && trigger ? 'pointer' : 'not-allowed',
              }}
            >
              Next: Add Actions →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Actions */}
      {step === 2 && (
        <div>
          {/* Current Actions */}
          {actions.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: '500', marginBottom: '16px' }}>
                Workflow Steps
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {actions.map((action, index) => {
                  const actionType = actionTypes.find(a => a.id === action.type)
                  return (
                    <div
                      key={action.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px 20px',
                        backgroundColor: '#111',
                        border: '1px solid #333',
                        borderRadius: '12px',
                      }}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#00ff88',
                        color: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ fontSize: '20px' }}>{actionType?.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                          {actionType?.name}
                        </div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          {actionType?.desc}
                        </div>
                      </div>
                      <button
                        onClick={() => removeAction(action.id)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'transparent',
                          border: '1px solid #333',
                          borderRadius: '6px',
                          color: '#888',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Add Action */}
          <div>
            <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: '500', marginBottom: '16px' }}>
              {actions.length === 0 ? 'Add your first action' : 'Add another action'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {actionTypes.map((a) => (
                <button
                  key={a.id}
                  onClick={() => addAction(a.id as ActionType)}
                  style={{
                    padding: '16px',
                    backgroundColor: '#111',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>{a.icon}</div>
                  <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>
                    {a.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => setStep(1)}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#888',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={actions.length === 0}
              style={{
                padding: '12px 24px',
                backgroundColor: actions.length > 0 ? '#00ff88' : '#333',
                border: 'none',
                borderRadius: '8px',
                color: actions.length > 0 ? '#000' : '#666',
                fontSize: '14px',
                fontWeight: '600',
                cursor: actions.length > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              Next: Review →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div>
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
              {name}
            </h2>
            
            {/* Trigger */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>
                Trigger
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>{triggers.find(t => t.id === trigger)?.icon}</span>
                <span style={{ color: '#fff', fontSize: '14px' }}>
                  {triggers.find(t => t.id === trigger)?.name}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase' }}>
                Actions ({actions.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {actions.map((action, index) => {
                  const actionType = actionTypes.find(a => a.id === action.type)
                  return (
                    <div
                      key={action.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        backgroundColor: '#1a1a1a',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ color: '#00ff88', fontSize: '12px', fontWeight: '600' }}>
                        {index + 1}.
                      </span>
                      <span style={{ fontSize: '16px' }}>{actionType?.icon}</span>
                      <span style={{ color: '#fff', fontSize: '14px' }}>{actionType?.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => setStep(2)}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#888',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              style={{
                padding: '12px 24px',
                backgroundColor: '#00ff88',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Create Workflow ✓
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
