'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // TODO: Implement Supabase auth
      // For now, just redirect to dashboard
      localStorage.setItem('swarm_demo_auth', 'true')
      localStorage.setItem('swarm_demo_org', 'demo-org-' + Date.now())
      router.push('/dashboard')
    } catch (err) {
      setError('Invalid credentials')
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

      {/* Card */}
      <div style={{
        backgroundColor: '#111',
        border: '1px solid #222',
        borderRadius: '16px',
        padding: '32px',
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          color: '#fff', 
          marginBottom: '8px',
          textAlign: 'center',
        }}>
          Welcome back
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: '14px', 
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          Sign in to manage your voice agents
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
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
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#333' : '#00ff88',
              border: 'none',
              borderRadius: '8px',
              color: loading ? '#666' : '#000',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center', 
          color: '#666', 
          fontSize: '14px' 
        }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: '#00ff88', textDecoration: 'none' }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
