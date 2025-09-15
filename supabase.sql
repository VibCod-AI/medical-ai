-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.medical_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id text,
  session_duration text,
  total_transcriptions integer DEFAULT 0,
  consultation_phase text DEFAULT 'listening'::text,
  transcriptions jsonb NOT NULL DEFAULT '[]'::jsonb,
  medical_analysis jsonb,
  symptoms jsonb DEFAULT '[]'::jsonb,
  diagnoses jsonb DEFAULT '[]'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  red_flags jsonb DEFAULT '[]'::jsonb,
  follow_up jsonb DEFAULT '[]'::jsonb,
  alternative_treatments jsonb DEFAULT '[]'::jsonb,
  emergency_criteria jsonb DEFAULT '[]'::jsonb,
  suggested_questions jsonb DEFAULT '[]'::jsonb,
  summary text,
  confidence_level numeric,
  requires_immediate_attention boolean DEFAULT false,
  final_report jsonb,
  tags ARRAY DEFAULT '{}'::text[],
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT medical_reports_pkey PRIMARY KEY (id),
  CONSTRAINT medical_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.medical_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid,
  doctor_id uuid,
  session_data jsonb,
  transcriptions ARRAY,
  analyses ARRAY,
  final_report jsonb,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'completed'::text, 'cancelled'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT medical_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT medical_sessions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.profiles(id),
  CONSTRAINT medical_sessions_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  phone text,
  role text DEFAULT 'patient'::text CHECK (role = ANY (ARRAY['patient'::text, 'doctor'::text, 'admin'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  voice_calibrated boolean DEFAULT false,
  voice_calibration_date timestamp with time zone,
  show_voice_onboarding boolean DEFAULT true,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);