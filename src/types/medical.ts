// Interfaces para el análisis médico
export interface Symptom {
  name: string;
  severity: 'leve' | 'moderado' | 'severo';
  confidence: number;
  mentioned_by: 'medico' | 'paciente';
}

export interface Diagnosis {
  name: string;
  probability: number;
  confidence: number;
  supporting_symptoms: string[];
  risk_level: 'bajo' | 'medio' | 'alto' | 'critico';
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: 'oral' | 'iv' | 'im' | 'topica' | 'sublingual' | 'inhalada';
  instructions: string;
  contraindications?: string[];
  side_effects?: string[];
  category: 'analgesico' | 'antibiotico' | 'antiinflamatorio' | 'antihipertensivo' | 'otro';
}

export interface Recommendation {
  type: 'medicamento' | 'examen' | 'procedimiento' | 'seguimiento' | 'derivacion' | 'lifestyle';
  description: string;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  reasoning: string;
  medication?: Medication;
  timeline?: string;
}

export interface RedFlag {
  alert: string;
  severity: 'advertencia' | 'critico' | 'emergencia';
  action_required: string;
}

export interface FollowUpRecommendation {
  type: 'control_medico' | 'laboratorio' | 'imagen' | 'especialista' | 'autocuidado';
  description: string;
  timeframe: string;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  specific_instructions: string;
}

export interface AlternativeTreatment {
  type: 'terapia_fisica' | 'nutricional' | 'psicologica' | 'lifestyle' | 'complementaria';
  description: string;
  effectiveness: 'alta' | 'media' | 'baja';
  evidence_level: 'alta' | 'media' | 'baja';
  instructions: string;
  duration: string;
}

export interface EmergencyCriteria {
  symptom: string;
  severity_threshold: string;
  time_frame: 'inmediato' | '1-2_horas' | '24_horas';
  action: 'llamar_911' | 'ir_emergencias' | 'contactar_medico';
  reasoning: string;
}

export interface SymptomReport {
  normal_language: string;
  technical_language: string;
  cie10_code?: string;
  severity: 'leve' | 'moderado' | 'severo';
  confidence: number;
}

export interface DiagnosisReport {
  normal_language: string;
  technical_language: string;
  cie10_code: string;
  probability: number;
  confidence: number;
  supporting_evidence: string[];
  differential_diagnoses: string[];
}

export interface ExaminationRecommendation {
  type: 'laboratorio' | 'imagen' | 'fisica' | 'especializada';
  name: string;
  reason: string;
  urgency: 'inmediato' | 'urgente' | 'rutinario';
  expected_findings: string;
}

export interface FinalMedicalReport {
  patient_info: {
    session_id: string;
    date: string;
    duration: string;
    total_interactions: number;
  };
  executive_summary: string;
  symptoms_report: SymptomReport[];
  diagnoses_report: DiagnosisReport[];
  medications_prescribed: Recommendation[];
  examinations_recommended: ExaminationRecommendation[];
  follow_up_plan: FollowUpRecommendation[];
  emergency_criteria: EmergencyCriteria[];
  alternative_treatments: AlternativeTreatment[];
  doctor_notes: string;
  overall_confidence: number;
  requires_immediate_attention: boolean;
}

export interface SuggestedQuestion {
  id: string;
  question: string;
  category: 'sintoma' | 'antecedente' | 'examen_fisico' | 'descarte' | 'seguimiento';
  priority: 'alta' | 'media' | 'baja';
  reasoning: string;
  target_diagnosis?: string;
}

export interface MedicalAnalysis {
  symptoms: Symptom[];
  diagnoses: Diagnosis[];
  recommendations: Recommendation[];
  red_flags: RedFlag[];
  follow_up: FollowUpRecommendation[];
  alternative_treatments: AlternativeTreatment[];
  emergency_criteria: EmergencyCriteria[];
  suggested_questions: SuggestedQuestion[];
  summary: string;
  confidence_level: number;
  requires_immediate_attention: boolean;
}

export interface Transcription {
  id: string;
  speaker: 'medico' | 'paciente' | 'unknown';
  text: string;
  timestamp: string;
  confidence: number;
}

// Tipos de navegación
export type TabType = 'connection' | 'audio' | 'dashboard';
