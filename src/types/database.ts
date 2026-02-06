export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          company: string
          email: string
          phone: string | null
          status: 'active' | 'paused' | 'churned' | 'onboarding'
          plan: 'starter' | 'pro' | 'enterprise'
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      phone_numbers: {
        Row: {
          id: string
          client_id: string
          number: string
          twilio_sid: string | null
          friendly_name: string | null
          status: 'active' | 'inactive' | 'pending'
          capabilities: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['phone_numbers']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['phone_numbers']['Insert']>
      }
      agents: {
        Row: {
          id: string
          client_id: string
          knowledge_base_id: string | null
          name: string
          persona: string | null
          greeting: string | null
          voice_id: string | null
          model: string
          provider: 'vapi' | 'retell' | 'custom'
          provider_agent_id: string | null
          settings: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['agents']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['agents']['Insert']>
      }
      calls: {
        Row: {
          id: string
          client_id: string
          agent_id: string | null
          phone_number_id: string | null
          direction: 'inbound' | 'outbound'
          caller_number: string | null
          callee_number: string | null
          status: 'in_progress' | 'completed' | 'failed' | 'no_answer' | 'busy'
          duration_seconds: number | null
          recording_url: string | null
          transcript: string | null
          summary: string | null
          outcome: 'lead_captured' | 'appointment_booked' | 'transferred' | 'voicemail' | 'hangup' | 'other' | null
          metadata: Json
          provider_call_id: string | null
          started_at: string
          ended_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['calls']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['calls']['Insert']>
      }
      leads: {
        Row: {
          id: string
          client_id: string
          call_id: string | null
          name: string | null
          phone: string | null
          email: string | null
          company: string | null
          intent: string | null
          notes: string | null
          urgency: 'low' | 'medium' | 'high' | 'emergency' | null
          status: 'new' | 'notified' | 'contacted' | 'converted' | 'lost'
          notified_at: string | null
          metadata: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
      knowledge_bases: {
        Row: {
          id: string
          client_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['knowledge_bases']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['knowledge_bases']['Insert']>
      }
      knowledge_documents: {
        Row: {
          id: string
          knowledge_base_id: string
          title: string
          content: string
          source_url: string | null
          metadata: Json
          embedding: number[] | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['knowledge_documents']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['knowledge_documents']['Insert']>
      }
    }
  }
}

// Convenience types
export type Client = Database['public']['Tables']['clients']['Row']
export type PhoneNumber = Database['public']['Tables']['phone_numbers']['Row']
export type Agent = Database['public']['Tables']['agents']['Row']
export type Call = Database['public']['Tables']['calls']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type KnowledgeBase = Database['public']['Tables']['knowledge_bases']['Row']
export type KnowledgeDocument = Database['public']['Tables']['knowledge_documents']['Row']
