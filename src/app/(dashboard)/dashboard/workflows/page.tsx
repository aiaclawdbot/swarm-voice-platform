'use client'

import Link from 'next/link'

interface Workflow {
  id: string
  name: string
  description: string
  trigger: string
  actionsCount: number
  status: 'active' | 'paused' | 'draft'
  runsToday: number
  lastRun: string
}

const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'New Lead Follow-up',
    description: 'Send SMS and email after a new lead is captured',
    trigger: 'Lead Captured',
    actionsCount: 3,
    status: 'active',
    runsToday: 12,
    lastRun: '5 min ago',
  },
  {
    id: '2',
    name: 'Missed Call Recovery',
    description: 'Automatically text back when a call is missed',
    trigger: 'Missed Call',
    actionsCount: 2,
    status: 'active',
    runsToday: 8,
    lastRun: '32 min ago',
  },
  {
    id: '3',
    name: 'After Hours Response',
    description: 'Send email with business hours and booking link',
    trigger: 'Call Completed',
    actionsCount: 1,
    status: 'active',
    runsToday: 15,
    lastRun: '1 hr ago',
  },
  {
    id: '4',
    name: 'VIP Customer Alert',
    description: 'Notify owner when high-value customer calls',
    trigger: 'Call Completed',
    actionsCount: 2,
    status: 'paused',
    runsToday: 0,
    lastRun: '2 days ago',
  },
]

const triggerIcons: Record<string, string> = {
  'Lead Captured': '🎯',
  'Missed Call': '📵',
  'Call Completed': '✅',
  'Appointment Booked': '📅',
}

export default function WorkflowsPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
            Workflows
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Automate follow-ups, notifications, and more
          </p>
        </div>
        <Link
          href="/dashboard/workflows/new"
          style={{
            padding: '10px 20px',
            backgroundColor: '#00ff88',
            border: 'none',
            borderRadius: '8px',
            color: '#000',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          + Create Workflow
        </Link>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Active Workflows</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>3</div>
        </div>
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Runs Today</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#00ff88' }}>35</div>
        </div>
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Success Rate</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>98%</div>
        </div>
      </div>

      {/* Workflow Templates */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
          Quick Start Templates
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
        }}>
          {[
            { name: 'Lead Nurture', icon: '🌱', desc: 'Multi-touch follow-up sequence' },
            { name: 'Missed Call Text', icon: '📱', desc: 'Instant callback request' },
            { name: 'Review Request', icon: '⭐', desc: 'Ask for reviews after service' },
            { name: 'Appointment Reminder', icon: '🔔', desc: 'Reduce no-shows' },
          ].map((template) => (
            <button
              key={template.name}
              style={{
                padding: '20px',
                backgroundColor: '#111',
                border: '1px solid #333',
                borderRadius: '12px',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>{template.icon}</div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                {template.name}
              </div>
              <div style={{ color: '#666', fontSize: '12px' }}>
                {template.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Workflow List */}
      <div style={{
        backgroundColor: '#111',
        border: '1px solid #222',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #222',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>
            Your Workflows
          </h2>
        </div>
        <div>
          {mockWorkflows.map((workflow, index) => (
            <div
              key={workflow.id}
              style={{
                padding: '20px 24px',
                borderBottom: index < mockWorkflows.length - 1 ? '1px solid #1a1a1a' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              {/* Icon */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: workflow.status === 'active' ? 'rgba(0, 255, 136, 0.1)' : '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}>
                {triggerIcons[workflow.trigger] || '⚡'}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <span style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>
                    {workflow.name}
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '500',
                    backgroundColor: workflow.status === 'active' ? 'rgba(0, 255, 136, 0.1)' :
                      workflow.status === 'paused' ? 'rgba(245, 158, 11, 0.1)' : '#1a1a1a',
                    color: workflow.status === 'active' ? '#00ff88' :
                      workflow.status === 'paused' ? '#fbbf24' : '#666',
                    textTransform: 'uppercase',
                  }}>
                    {workflow.status}
                  </span>
                </div>
                <div style={{ color: '#666', fontSize: '13px' }}>
                  {workflow.description}
                </div>
              </div>

              {/* Stats */}
              <div style={{ textAlign: 'right', minWidth: '100px' }}>
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                  {workflow.runsToday} runs today
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  Last: {workflow.lastRun}
                </div>
              </div>

              {/* Trigger Badge */}
              <div style={{
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#1a1a1a',
                color: '#888',
                fontSize: '12px',
              }}>
                {workflow.trigger}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#888',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: 'transparent',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#888',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ⋮
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
