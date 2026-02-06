import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold">
            SWARM <span className="text-emerald-500">Voice</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/ops" 
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
            >
              Ops Dashboard →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-3xl">
          <div className="text-emerald-500 text-sm font-medium mb-4">AI VOICE PLATFORM</div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Never miss another call.
            <br />
            <span className="text-zinc-500">Let AI handle it.</span>
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Deploy AI voice agents that answer calls 24/7, capture leads, book appointments, 
            and notify your team instantly. No more voicemail. No more missed opportunities.
          </p>
          <div className="flex gap-4">
            <Link 
              href="/ops/clients" 
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition-colors"
            >
              Start Managing Clients
            </Link>
            <Link 
              href="/ops" 
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-emerald-500">78%</div>
              <div className="text-zinc-400 mt-2">Choose first responder</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-500">67%</div>
              <div className="text-zinc-400 mt-2">Won&apos;t leave voicemail</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-500">21x</div>
              <div className="text-zinc-400 mt-2">Conversion within 5 min</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-500">35%</div>
              <div className="text-zinc-400 mt-2">Calls after 6pm</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold mb-12">Platform Capabilities</h2>
        <div className="grid grid-cols-3 gap-6">
          <FeatureCard 
            icon="🎙️"
            title="Voice Agent Engine"
            description="Deploy AI agents with custom personas, voices, and knowledge bases. Handles inbound calls naturally."
          />
          <FeatureCard 
            icon="🎯"
            title="Lead Capture"
            description="Automatically extract caller info, intent, and urgency. Instant SMS/email notifications to your team."
          />
          <FeatureCard 
            icon="📅"
            title="Appointment Booking"
            description="Real-time calendar integration. AI books appointments directly without human intervention."
          />
          <FeatureCard 
            icon="🧠"
            title="Knowledge Base"
            description="Upload docs, FAQs, pricing sheets. Your agent learns your business and answers accurately."
          />
          <FeatureCard 
            icon="📊"
            title="Analytics Dashboard"
            description="Call volume, duration, outcomes, lead capture rates. Full visibility into performance."
          />
          <FeatureCard 
            icon="🔔"
            title="Real-time Alerts"
            description="High-urgency leads get instant attention. Never miss an emergency call again."
          />
        </div>
      </section>

      {/* Industry Templates */}
      <section className="border-t border-zinc-800 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold mb-4">Pre-Built Industry Templates</h2>
          <p className="text-zinc-400 mb-12 max-w-2xl">
            Get started in minutes with optimized agent configurations for your industry.
          </p>
          <div className="grid grid-cols-4 gap-4">
            {[
              { name: 'Plumbing', emoji: '🔧', color: 'bg-blue-500/10 border-blue-500/30' },
              { name: 'HVAC', emoji: '❄️', color: 'bg-cyan-500/10 border-cyan-500/30' },
              { name: 'Dental', emoji: '🦷', color: 'bg-white/10 border-white/30' },
              { name: 'Med Spa', emoji: '💆', color: 'bg-pink-500/10 border-pink-500/30' },
              { name: 'Legal', emoji: '⚖️', color: 'bg-amber-500/10 border-amber-500/30' },
              { name: 'Real Estate', emoji: '🏠', color: 'bg-emerald-500/10 border-emerald-500/30' },
              { name: 'Auto Repair', emoji: '🚗', color: 'bg-red-500/10 border-red-500/30' },
              { name: 'Insurance', emoji: '🛡️', color: 'bg-purple-500/10 border-purple-500/30' },
            ].map(industry => (
              <div key={industry.name} className={`p-4 rounded-xl border ${industry.color} text-center`}>
                <div className="text-3xl mb-2">{industry.emoji}</div>
                <div className="font-medium">{industry.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to deploy?</h2>
        <p className="text-zinc-400 mb-8">Add your first client and configure their AI voice agent in minutes.</p>
        <Link 
          href="/ops/clients" 
          className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium text-lg transition-colors"
        >
          Go to Ops Dashboard →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-zinc-500 text-sm">
          SWARM Voice Platform • Built for AI-first agencies
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm">{description}</p>
    </div>
  )
}
