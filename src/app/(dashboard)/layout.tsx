'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Agents', href: '/dashboard/agents', icon: '🤖' },
  { name: 'Contacts', href: '/dashboard/contacts', icon: '👥' },
  { name: 'Calls', href: '/dashboard/calls', icon: '📞' },
  { name: 'Messages', href: '/dashboard/messages', icon: '💬' },
  { name: 'Workflows', href: '/dashboard/workflows', icon: '⚡' },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        backgroundColor: '#111',
        borderRight: '1px solid #222',
        padding: '24px 0',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 24px', marginBottom: '32px' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#00ff88',
              letterSpacing: '-0.5px',
            }}>
              SWARM
            </span>
            <span style={{
              fontSize: '12px',
              color: '#666',
              display: 'block',
              marginTop: '4px',
            }}>
              Voice Platform
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  color: isActive ? '#00ff88' : '#888',
                  backgroundColor: isActive ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                  borderLeft: isActive ? '3px solid #00ff88' : '3px solid transparent',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '400',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Usage */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          right: '24px',
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '8px',
            }}>
              Minutes Used
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#fff',
              marginBottom: '8px',
            }}>
              342 / 500
            </div>
            <div style={{
              height: '4px',
              backgroundColor: '#333',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: '68%',
                height: '100%',
                backgroundColor: '#00ff88',
              }} />
            </div>
            <Link
              href="/dashboard/settings/billing"
              style={{
                display: 'block',
                marginTop: '12px',
                fontSize: '12px',
                color: '#00ff88',
                textDecoration: 'none',
              }}
            >
              Upgrade plan →
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: '240px',
        padding: '32px',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  )
}
