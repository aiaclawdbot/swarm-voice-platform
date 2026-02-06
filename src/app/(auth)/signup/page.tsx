'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    industry: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const industries = [
    { id: 'dental', name: 'Dental Practice', icon: '🦷' },
    { id: 'plumbing', name: 'Plumbing Company', icon: '🔧' },
    { id: 'hvac', name: 'HVAC Company', icon: '❄️' },
    { id: 'medspa', name: 'Med Spa', icon: '✨' },
    { id: 'legal', name: 'Law Firm', icon: '⚖️' },
    { id: 'other', name: 'Other', icon: '🏢' },
  ]

  const handleNext = () => {
    if (step === 1 && formData.email && formData.password) {
      setStep(2)
    }
  }

  const handleSubmit = async () => {
    if (!formData.companyName || !formData.industry) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // TODO: Implement Supabase auth + org creation
      // For now, store in localStorage for demo
      const orgId = 'org-' + Date.now()
      localStorage.setItem('swarm_demo_auth', 'true')
      localStorage.setItem('swarm_demo_org', orgId)
      localStorage.setItem('swarm_demo_company', formData.companyName)
      localStorage.setItem('swarm_demo_industry', formData.industry)
      
      // Redirect to agent creation with template pre-selected
      router.push(`/dashboard/agents/new?template=${formData.industry}`)
    } catch (err) {
      setError('Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>
            SWARM <span style={{ color: '#00ff88' }}>Voice</span>
          </span>
        </Link>
      </div>

      {/* Progress */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
      }}>
        <div style={{
          flex: 1,
          height: '4px',
          borderRadius: '2px',
          backgroundColor: '#00ff88',
        }} />
        <div style={{
          flex: 1,
          height: '4px',
          borderRadius: '2px',
          backgroundColor: step >= 2 ? '#00ff88' : '#333',
        }} />
      </div>

      {/* Card */}
      <div style={{
        backgroundColor: '#111',
        border: '1px solid #222',
        borderRadius: '16px',
        padding: '32px',
      }}>
        {step === 1 && (
          <>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#fff', 
              marginBottom: '8px',
            }}>
              Create your account
            </h1>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
              Start answering calls with AI in minutes
            </p>

            {error && (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: 'rgba(255, 68, 68, 0.1)',
                border: '1px solid rgba(255, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ff4444',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '6px' }}>
                Work Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 8 characters"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
            </div>

            <button
              onClick={handleNext}
              disabled={!formData.email || !formData.password}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: formData.email && formData.password ? '#00ff88' : '#333',
                border: 'none',
                borderRadius: '8px',
                color: formData.email && formData.password ? '#000' : '#666',
                fontSize: '14px',
                fontWeight: '600',
                cursor: formData.email && formData.password ? 'pointer' : 'not-allowed',
              }}
            >
              Continue →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#fff', 
              marginBottom: '8px',
            }}>
              Tell us about your business
            </h1>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
              We&apos;ll set up your AI agent with industry-specific knowledge
            </p>

            {error && (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: 'rgba(255, 68, 68, 0.1)',
                border: '1px solid rgba(255, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ff4444',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '6px' }}>
                Company Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Acme Dental"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '10px' }}>
                Industry
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {industries.map((ind) => (
                  <button
                    key={ind.id}
                    onClick={() => setFormData({ ...formData, industry: ind.id })}
                    style={{
                      padding: '12px',
                      backgroundColor: formData.industry === ind.id ? 'rgba(0, 255, 136, 0.1)' : '#0a0a0a',
                      border: formData.industry === ind.id ? '2px solid #00ff88' : '1px solid #333',
                      borderRadius: '8px',
                      color: formData.industry === ind.id ? '#00ff88' : '#fff',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{ind.icon}</span>
                    {ind.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: '14px 20px',
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
                onClick={handleSubmit}
                disabled={loading || !formData.companyName || !formData.industry}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: loading || !formData.companyName || !formData.industry ? '#333' : '#00ff88',
                  border: 'none',
                  borderRadius: '8px',
                  color: loading || !formData.companyName || !formData.industry ? '#666' : '#000',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading || !formData.companyName || !formData.industry ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </>
        )}

        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center', 
          color: '#666', 
          fontSize: '14px' 
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#00ff88', textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
