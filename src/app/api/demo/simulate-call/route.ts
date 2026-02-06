import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/demo/simulate-call
 * Simulates a call experience in demo mode without making a real call
 * 
 * Body: { template_id: string, scenario?: 'booking' | 'inquiry' | 'emergency' }
 */

// Sample conversations by scenario
const SAMPLE_CONVERSATIONS: Record<string, {
  messages: { role: 'agent' | 'caller'; text: string; delay: number }[]
  summary: string
  intent: string
  sentiment: string
}> = {
  booking: {
    messages: [
      { role: 'agent', text: "Thank you for calling Bright Smile Dental! This is Sarah, your AI receptionist. How can I help you today?", delay: 0 },
      { role: 'caller', text: "Hi, I'd like to schedule a cleaning appointment.", delay: 2000 },
      { role: 'agent', text: "I'd be happy to help you schedule a cleaning! Let me check our availability. What days work best for you?", delay: 3500 },
      { role: 'caller', text: "Tuesdays are usually good for me, ideally in the afternoon.", delay: 5500 },
      { role: 'agent', text: "Perfect! I have availability next Tuesday at 2:00 PM or 3:30 PM. Which would you prefer?", delay: 7500 },
      { role: 'caller', text: "2:00 PM works great.", delay: 9000 },
      { role: 'agent', text: "Wonderful! I've scheduled your cleaning for Tuesday at 2:00 PM. Can I get your name for the appointment?", delay: 10500 },
      { role: 'caller', text: "It's Sarah Johnson.", delay: 12000 },
      { role: 'agent', text: "Thank you, Sarah! You're all set for Tuesday at 2:00 PM. We'll send you a reminder the day before. Is there anything else I can help you with?", delay: 13500 },
      { role: 'caller', text: "No, that's all. Thank you!", delay: 15500 },
      { role: 'agent', text: "You're welcome! We look forward to seeing you Tuesday. Have a great day!", delay: 17000 },
    ],
    summary: "Caller scheduled a dental cleaning appointment for Tuesday at 2:00 PM. Contact: Sarah Johnson.",
    intent: 'booking',
    sentiment: 'positive',
  },
  inquiry: {
    messages: [
      { role: 'agent', text: "Thank you for calling! This is your AI assistant. How can I help you today?", delay: 0 },
      { role: 'caller', text: "Hi, do you accept Delta Dental insurance?", delay: 2000 },
      { role: 'agent', text: "Yes, we do accept Delta Dental! We work with most major dental insurance providers. Is there a specific procedure you're looking to have covered?", delay: 3500 },
      { role: 'caller', text: "I need a crown. How much would that cost with insurance?", delay: 5500 },
      { role: 'agent', text: "Great question. With Delta Dental, crowns are typically covered at 50% after your deductible. The exact coverage depends on your specific plan. Would you like me to schedule a consultation so we can verify your benefits and give you an exact estimate?", delay: 7500 },
      { role: 'caller', text: "That would be helpful. What times do you have available?", delay: 10000 },
      { role: 'agent', text: "I have openings this Thursday at 10 AM or Friday at 2 PM. Which works better for you?", delay: 11500 },
      { role: 'caller', text: "Thursday at 10 works.", delay: 13000 },
      { role: 'agent', text: "Perfect! I've scheduled your consultation for Thursday at 10 AM. Please bring your insurance card. May I get your name?", delay: 14500 },
      { role: 'caller', text: "Mike Chen.", delay: 16000 },
      { role: 'agent', text: "Thank you, Mike! You're confirmed for Thursday at 10 AM. We'll see you then!", delay: 17500 },
    ],
    summary: "Caller inquired about Delta Dental coverage for crowns. Scheduled consultation for Thursday at 10 AM. Contact: Mike Chen.",
    intent: 'inquiry',
    sentiment: 'neutral',
  },
  emergency: {
    messages: [
      { role: 'agent', text: "Thank you for calling! This is your AI assistant. How can I help you today?", delay: 0 },
      { role: 'caller', text: "I have a really bad toothache! It's been throbbing all night and I can barely sleep.", delay: 2000 },
      { role: 'agent', text: "I'm so sorry to hear that! A severe toothache needs attention right away. We reserve emergency slots daily for situations like this. Can you come in today?", delay: 4000 },
      { role: 'caller', text: "Yes, please! As soon as possible.", delay: 5500 },
      { role: 'agent', text: "I have an emergency opening at 11:00 AM this morning. I'm booking that for you right now. Can I get your name?", delay: 7000 },
      { role: 'caller', text: "Emily Rodriguez.", delay: 8500 },
      { role: 'agent', text: "Emily, you're booked for 11:00 AM. Please come in 15 minutes early to complete paperwork. In the meantime, you can take over-the-counter pain relievers and apply a cold compress to help with the pain.", delay: 10000 },
      { role: 'caller', text: "Thank you so much!", delay: 12000 },
      { role: 'agent', text: "Of course! We'll take care of you. See you at 11:00 AM. Feel better soon!", delay: 13500 },
    ],
    summary: "URGENT: Emergency toothache. Booked same-day emergency appointment for 11:00 AM. Contact: Emily Rodriguez.",
    intent: 'emergency',
    sentiment: 'negative',
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template_id, scenario = 'booking' } = body

    // Get conversation for scenario
    const conversation = SAMPLE_CONVERSATIONS[scenario] || SAMPLE_CONVERSATIONS.booking

    // Generate a mock call
    const mockCall = {
      id: `demo-call-${Date.now()}`,
      template_id,
      scenario,
      status: 'completed',
      duration_seconds: Math.floor(conversation.messages.length * 2.5),
      started_at: new Date(Date.now() - 60000).toISOString(),
      ended_at: new Date().toISOString(),
      transcript: conversation.messages.map(m => 
        `${m.role === 'agent' ? 'Agent' : 'Caller'}: ${m.text}`
      ).join('\n'),
      summary: conversation.summary,
      intent: conversation.intent,
      sentiment: conversation.sentiment,
      messages: conversation.messages,
    }

    return NextResponse.json({
      success: true,
      call: mockCall,
      message: 'Demo call simulation complete. In production, this would be a real call.',
    })

  } catch (error) {
    console.error('Demo simulate-call error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
