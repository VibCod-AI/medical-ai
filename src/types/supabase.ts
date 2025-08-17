// Database types for Supabase

export type UserProfile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: 'patient' | 'doctor' | 'admin'
  created_at: string
  updated_at: string
}

export type AuthUser = {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
    provider?: string
  }
}

// Tipos para las sesiones médicas
export type SessionData = {
  duration: number
  timestamp: string
  user_info: {
    id: string
    email: string
    name: string
    role: string
  }
  report_only?: boolean
}

export type Transcription = {
  id: string
  speaker: 'medico' | 'paciente' | 'unknown'
  text: string
  timestamp: string
  confidence: number
  is_final: boolean
}

export type MedicalAnalysis = {
  symptoms: unknown[]
  diagnoses: unknown[]
  recommendations: unknown[]
  red_flags: unknown[]
  follow_up: unknown[]
  alternative_treatments: unknown[]
  emergency_criteria: unknown[]
  suggested_questions: unknown[]
  summary: string
  confidence_level: number
  requires_immediate_attention: boolean
  timestamp: string
  session_id?: string
}

export type FinalMedicalReport = {
  patient_info: {
    session_id: string
    duration: string
    timestamp: string
  }
  summary: string
  diagnoses: unknown[]
  confidence_level: number
  requires_immediate_attention: boolean
  doctor_notes?: string
  emergency_criteria: unknown[]
}

export type MedicalSession = {
  id: string
  patient_id: string
  doctor_id: string | null
  session_data: SessionData | null
  transcriptions: Transcription[] | null
  analyses: MedicalAnalysis[] | null
  final_report: FinalMedicalReport | null
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

// Definir la estructura de la base de datos
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
      }
      medical_sessions: {
        Row: MedicalSession
        Insert: Omit<MedicalSession, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MedicalSession, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'patient' | 'doctor' | 'admin'
      session_status: 'active' | 'completed' | 'cancelled'
    }
  }
}
