import OpenAI from 'openai';
import { TranscriptionResult } from '../types/audio';
import { MedicalAnalysis, FinalMedicalReport } from '../../types/medical';

type ConsultationPhase = 'listening' | 'exploring' | 'differential' | 'confirmation';

interface PhaseRule {
  phase: ConsultationPhase;
  minPatientMessages: number;
  maxQuestions: number;
  questionTypes: string[];
  description: string;
}

interface ExtractedInformation {
  symptoms_mentioned: string[];
  characteristics_provided: string[];
  duration_mentioned: boolean;
  intensity_mentioned: boolean;
  location_mentioned: boolean;
  triggers_mentioned: boolean;
  associated_symptoms: string[];
  medications_mentioned: string[];
  allergies_mentioned: string[];
  medical_history: string[];
}

interface ConceptualAnswer {
  concept: string;
  answered_by: string;
  timestamp: number;
  confidence: number;
}

class OpenAIService {
  private openai: OpenAI;
  private conversationHistory: string[] = [];
  private analysisHistory: MedicalAnalysis[] = [];
  private doctorQuestions: string[] = [];
  private informationObtained: string[] = [];
  private extractedInfo: ExtractedInformation = {
    symptoms_mentioned: [],
    characteristics_provided: [],
    duration_mentioned: false,
    intensity_mentioned: false,
    location_mentioned: false,
    triggers_mentioned: false,
    associated_symptoms: [],
    medications_mentioned: [],
    allergies_mentioned: [],
    medical_history: []
  };
  private consultationPhase: ConsultationPhase = 'listening';
  private conceptualAnswers: ConceptualAnswer[] = [];
  private sessionStartTime: number = Date.now();
  private sessionId: string = '';
  private phaseRules: PhaseRule[] = [
    {
      phase: 'listening',
      minPatientMessages: 0,
      maxQuestions: 0,
      questionTypes: [],
      description: 'Escuchar motivo de consulta sin interrumpir'
    },
    {
      phase: 'exploring', 
      minPatientMessages: 2,
      maxQuestions: 2,
      questionTypes: ['caracterizacion', 'cronologia'],
      description: 'Profundizar en síntoma principal'
    },
    {
      phase: 'differential',
      minPatientMessages: 4,
      maxQuestions: 3,
      questionTypes: ['descarte', 'examen_fisico', 'antecedentes'],
      description: 'Diferenciar entre diagnósticos posibles'
    },
    {
      phase: 'confirmation',
      minPatientMessages: 6,
      maxQuestions: 1,
      questionTypes: ['confirmacion', 'red_flags'],
      description: 'Confirmar diagnóstico o detectar emergencias'
    }
  ];
  private lastQuestionUpdate: number = 0;
  private isAnalyzing: boolean = false;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY no encontrada en las variables de entorno');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  addTranscription(transcription: TranscriptionResult, speakerLabel: string): void {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${speakerLabel}: "${transcription.transcript}"`;
    
    this.conversationHistory.push(entry);
    
    if (speakerLabel === 'Médico' && this.isQuestion(transcription.transcript)) {
      this.doctorQuestions.push(transcription.transcript);
      console.log('❓ Pregunta del médico detectada:', transcription.transcript);
    }
    
    if (speakerLabel === 'Paciente') {
      this.extractPatientInformation(transcription.transcript);
      this.analyzeConceptualAnswers(transcription.transcript);
      
      if (this.hasNewCriticalInfo(transcription.transcript)) {
        console.log('🚨 Información crítica detectada - Análisis inmediato recomendado');
      }
    }
    
    this.updateConsultationPhase();
    
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  private isQuestion(text: string): boolean {
    const questionPatterns = [
      /\?/,
      /^(¿|cómo|cuándo|dónde|qué|cuál|por qué|desde cuándo|tiene|siente|ha tenido)/i,
      /(dígame|cuénteme|explique|describe)/i
    ];
    
    return questionPatterns.some(pattern => pattern.test(text.toLowerCase()));
  }

  private extractPatientInformation(text: string): void {
    
    const symptomPatterns = [
      /(dolor|duele|me duele|tengo dolor)/i,
      /(fiebre|calentura|temperatura)/i,
      /(náuseas|ganas de vomitar|mareo)/i,
      /(tos|toser)/i,
      /(cansancio|fatiga|agotado)/i,
      /(diarrea|estreñimiento)/i,
      /(dificultad para respirar|falta de aire)/i
    ];
    
    symptomPatterns.forEach(pattern => {
      if (pattern.test(text) && !this.extractedInfo.symptoms_mentioned.includes(pattern.source)) {
        this.extractedInfo.symptoms_mentioned.push(pattern.source);
        console.log('🎯 Síntoma detectado:', pattern.source);
      }
    });
    
    if (/(desde|hace|durante|por)\s+(ayer|hoy|días|semanas|meses|años|horas)/i.test(text)) {
      if (!this.extractedInfo.duration_mentioned) {
        this.extractedInfo.duration_mentioned = true;
        console.log('⏰ Duración mencionada');
      }
    }
    
    if (/(del 1 al 10|escala|intensidad|fuerte|leve|moderado|severo|\d+\s*de\s*10)/i.test(text)) {
      if (!this.extractedInfo.intensity_mentioned) {
        this.extractedInfo.intensity_mentioned = true;
        console.log('📊 Intensidad mencionada');
      }
    }
    
    if (/(cabeza|estómago|pecho|espalda|brazo|pierna|abdomen|garganta)/i.test(text)) {
      if (!this.extractedInfo.location_mentioned) {
        this.extractedInfo.location_mentioned = true;
        console.log('📍 Localización mencionada');
      }
    }
    
    const medicationPatterns = /(tomo|tomar|medicamento|pastilla|ibuprofeno|paracetamol|aspirina)/i;
    if (medicationPatterns.test(text)) {
      const medMatch = text.match(/\b(ibuprofeno|paracetamol|aspirina|omeprazol|losartan)\b/gi);
      if (medMatch) {
        medMatch.forEach(med => {
          if (!this.extractedInfo.medications_mentioned.includes(med.toLowerCase())) {
            this.extractedInfo.medications_mentioned.push(med.toLowerCase());
            console.log('💊 Medicamento mencionado:', med);
          }
        });
      }
    }
    
    if (/(alérgico|alergia|no puedo tomar)/i.test(text)) {
      console.log('⚠️ Alergia/intolerancia mencionada');
    }
  }

  private hasNewCriticalInfo(text: string): boolean {
    const criticalPatterns = [
      /(dolor de pecho|dolor torácico|dificultad para respirar|falta de aire)/i,
      /(sangre|sangrado|hemorragia)/i,
      /(desmayo|pérdida de conciencia|convulsión)/i,
      /(fiebre alta|temperatura alta|40|39)/i,
      /(irradiación|se extiende|hacia)/i,
      /(empeora|mejora|peor|mejor)/i,
      /(por la noche|por la mañana|al moverse|en reposo)/i,
      /(ahora|actualmente|en este momento|desde hace poco)/i,
      /(diferente|cambió|ya no|antes sí)/i
    ];
    
    return criticalPatterns.some(pattern => pattern.test(text));
  }

  private analyzeConceptualAnswers(text: string): void {
    const concepts = [
      {
        concept: 'duracion_temporal',
        patterns: [/(desde|hace|durante|por|ayer|hoy|días|semanas|meses|años|horas|tiempo)/i],
        questions: ['¿Desde cuándo?', '¿Cuánto tiempo?', '¿Hace cuánto?']
      },
      {
        concept: 'intensidad_dolor',
        patterns: [/(intensidad|fuerte|leve|moderado|severo|\d+.*10|escala|dolor.*mucho|poco)/i],
        questions: ['¿Qué intensidad?', '¿Del 1 al 10?', '¿Qué tan fuerte?']
      },
      {
        concept: 'localizacion_sintoma',
        patterns: [/(cabeza|estómago|pecho|espalda|brazo|pierna|abdomen|garganta|aquí|ahí|lado)/i],
        questions: ['¿Dónde duele?', '¿En qué parte?', '¿Dónde exactamente?']
      },
      {
        concept: 'caracteristicas_dolor',
        patterns: [/(pulsátil|constante|punzante|sordo|quemante|eléctrico|tipo|como)/i],
        questions: ['¿Cómo es el dolor?', '¿Qué tipo de dolor?', '¿Es pulsátil?']
      },
      {
        concept: 'factores_desencadenantes',
        patterns: [/(empeora|mejora|cuando|movimiento|reposo|comida|estrés|actividad)/i],
        questions: ['¿Qué lo empeora?', '¿Qué lo mejora?', '¿Con qué se relaciona?']
      },
      {
        concept: 'sintomas_asociados',
        patterns: [/(también|además|acompañado|junto|náuseas|vómito|fiebre|mareo)/i],
        questions: ['¿Tiene otros síntomas?', '¿Algo más?', '¿Síntomas asociados?']
      }
    ];

    concepts.forEach(conceptGroup => {
      if (conceptGroup.patterns.some(pattern => pattern.test(text))) {
        const existingAnswer = this.conceptualAnswers.find(ca => ca.concept === conceptGroup.concept);
        
        if (!existingAnswer) {
          this.conceptualAnswers.push({
            concept: conceptGroup.concept,
            answered_by: text,
            timestamp: Date.now(),
            confidence: 0.8
          });
          
          console.log(`🎯 Concepto respondido: ${conceptGroup.concept} → "${text}"`);
        }
      }
    });
  }

  private updateConsultationPhase(): void {
    const patientMessages = this.conversationHistory.filter(msg => msg.includes('Paciente:')).length;
    const doctorQuestions = this.doctorQuestions.length;
    
    let newPhase: ConsultationPhase = 'listening';
    
    for (const rule of this.phaseRules) {
      if (patientMessages >= rule.minPatientMessages) {
        newPhase = rule.phase;
      }
    }
    
    if (doctorQuestions >= 3 && newPhase === 'exploring') {
      newPhase = 'differential';
    }
    if (doctorQuestions >= 5 && newPhase === 'differential') {
      newPhase = 'confirmation';
    }
    
    if (this.consultationPhase !== newPhase) {
      const oldPhase = this.consultationPhase;
      this.consultationPhase = newPhase;
      
      const currentRule = this.phaseRules.find(r => r.phase === newPhase);
      console.log(`📋 CAMBIO DE FASE: ${oldPhase} → ${newPhase}`);
      console.log(`   📝 ${currentRule?.description}`);
      console.log(`   📊 Paciente: ${patientMessages} msgs, Médico: ${doctorQuestions} preguntas`);
    }
  }

  private getPhaseSpecificInstructions(): string {
    switch (this.consultationPhase) {
      case 'listening':
        return `
🔇 FASE DE ESCUCHA ACTIVA (Escuchar motivo de consulta sin interrumpir)
- NO sugieras preguntas AÚN. El paciente está contando su motivo de consulta.
- Deja que termine de explicar sus síntomas principales.
- Solo sugiere preguntas si el paciente parece haber terminado completamente.
- Máximo: 0 preguntas (preferible).`;

      case 'exploring':
        return `
🔍 FASE DE EXPLORACIÓN (Profundizar en síntoma principal)
- Ahora SÍ puedes hacer preguntas para profundizar en el síntoma principal.
- ENFÓCATE en: caracterización del síntoma, cronología específica.
- NO preguntes sobre antecedentes familiares o examen físico aún.
- Máximo: 2 preguntas muy específicas.
- Solo preguntas que el paciente NO haya respondido conceptualmente.`;

      case 'differential':
        return `
🎯 FASE DIAGNÓSTICO DIFERENCIAL (Diferenciar entre diagnósticos posibles)
- Preguntas para DESCARTAR diagnósticos específicos.
- Enfócate en: examen físico dirigido, antecedentes relevantes, factores de riesgo.
- Cada pregunta debe tener IMPACTO DIAGNÓSTICO real.
- Máximo: 3 preguntas ultra-dirigidas.
- Prioriza por probabilidad de cambiar el diagnóstico.`;

      case 'confirmation':
        return `
✅ FASE DE CONFIRMACIÓN (Confirmar diagnóstico o detectar emergencias)
- Solo preguntas CRÍTICAS para confirmar diagnóstico o detectar red flags.
- Enfócate en: signos de alarma, confirmaciones finales, seguridad del paciente.
- Máximo: 1 pregunta crítica.
- Si no hay nada crítico que preguntar, NO sugieras nada.`;

      default:
        return '';
    }
  }

  // Crear prompt médico especializado - Exactamente igual que medical-main
  private createMedicalPrompt(): string {
    const conversationText = this.conversationHistory.join('\n');
    const questionsAsked = this.doctorQuestions.join('\n- ');
    
    return `
Eres un asistente médico AI especializado en análisis de consultas en tiempo real.

CONTEXTO DE LA CONSULTA:
${conversationText}

PREGUNTAS YA REALIZADAS POR EL MÉDICO:
${questionsAsked ? `- ${questionsAsked}` : '(Ninguna pregunta específica detectada aún)'}

INFORMACIÓN YA PROPORCIONADA POR EL PACIENTE:
- Síntomas mencionados: ${this.extractedInfo.symptoms_mentioned.length > 0 ? this.extractedInfo.symptoms_mentioned.join(', ') : 'Ninguno específico'}
- Duración: ${this.extractedInfo.duration_mentioned ? '✅ YA MENCIONADA' : '❌ NO mencionada'}
- Intensidad: ${this.extractedInfo.intensity_mentioned ? '✅ YA MENCIONADA' : '❌ NO mencionada'}
- Localización: ${this.extractedInfo.location_mentioned ? '✅ YA MENCIONADA' : '❌ NO mencionada'}
- Medicamentos actuales: ${this.extractedInfo.medications_mentioned.length > 0 ? this.extractedInfo.medications_mentioned.join(', ') : 'Ninguno mencionado'}

CONCEPTOS RESPONDIDOS INDIRECTAMENTE:
${this.conceptualAnswers.length > 0 
  ? this.conceptualAnswers.map(ca => `- ${ca.concept}: "${ca.answered_by}"`).join('\n')
  : '- Ningún concepto respondido aún'}

FASE ACTUAL DE LA CONSULTA: ${this.consultationPhase.toUpperCase()}

INSTRUCCIONES ESPECÍFICAS SEGÚN LA FASE:
${this.getPhaseSpecificInstructions()}

INSTRUCCIONES GENERALES:
1. Analiza la conversación médica entre el médico y el paciente
2. Identifica síntomas mencionados por el paciente
3. Sugiere posibles diagnósticos basados en los síntomas
4. **PROPORCIONA RECOMENDACIONES FARMACOLÓGICAS DETALLADAS:**
   - Medicamentos específicos con nombres comerciales y genéricos
   - Dosis exactas (mg, ml, unidades)
   - Frecuencia precisa (cada 8h, 2 veces al día, etc.)
   - Duración del tratamiento (7 días, 2 semanas, etc.)
   - Vía de administración (oral, tópica, IM, IV)
   - Instrucciones específicas (con comida, en ayunas, etc.)
   - Contraindicaciones importantes
   - Efectos secundarios a monitorear
5. **PROPORCIONA RECOMENDACIONES DE SEGUIMIENTO:**
   - Controles médicos necesarios (cuándo volver)
   - Estudios complementarios (laboratorio, imágenes)
   - Derivaciones a especialistas si necesario
   - Instrucciones de autocuidado específicas
6. **SUGIERE TRATAMIENTOS ALTERNATIVOS:**
   - Terapias no farmacológicas efectivas
   - Modificaciones de estilo de vida
   - Terapias complementarias con evidencia
   - Duración y efectividad esperada
7. **DEFINE CRITERIOS DE EMERGENCIA ESPECÍFICOS:**
   - Síntomas que requieren atención inmediata
   - Umbrales específicos de gravedad
   - Acciones claras para el paciente
   - Marcos de tiempo precisos (inmediato, 1-2h, 24h)
8. Detecta cualquier red flag que requiera atención inmediata
6. **GENERA PREGUNTAS INTELIGENTES** siguiendo estas reglas ESTRICTAS:
   - ❌ NO repitas preguntas ya hechas por el médico
   - ❌ NO preguntes información YA PROPORCIONADA por el paciente
   - ❌ NO hagas preguntas obvias (ej: "¿qué síntomas tiene?" si ya los mencionó)
   - ✅ SÍ enfócate en DETALLES FALTANTES de información ya mencionada
   - ✅ SÍ haz preguntas ESPECÍFICAS que llenen vacíos diagnósticos
   - ✅ SÍ adapta preguntas a la fase actual de la consulta
   - ✅ Máximo 2-3 preguntas MUY específicas (no abrumar)
7. **CRITERIOS DE CALIDAD para preguntas:**
   - ESPECÍFICAS y DIRIGIDAS (no genéricas)
   - Que PROFUNDICEN en información ya mencionada
   - Que DESCARTEN diagnósticos específicos
   - Que APORTEN valor diagnóstico REAL
   - Si toda la información básica ya está, hacer preguntas de DESCARTE
8. Responde ÚNICAMENTE en formato JSON válido

FORMATO DE RESPUESTA REQUERIDO (JSON):
{
  "symptoms": [
    {
      "name": "nombre del síntoma",
      "severity": "leve|moderado|severo",
      "confidence": 0.85,
      "mentioned_by": "medico|paciente"
    }
  ],
  "diagnoses": [
    {
      "name": "posible diagnóstico",
      "probability": 0.75,
      "confidence": 0.80,
      "supporting_symptoms": ["síntoma1", "síntoma2"],
      "risk_level": "bajo|medio|alto|critico"
    }
  ],
  "recommendations": [
    {
      "type": "medicamento|examen|procedimiento|seguimiento|derivacion|lifestyle",
      "description": "descripción detallada",
      "priority": "baja|media|alta|urgente",
      "reasoning": "justificación médica",
      "timeline": "cuándo realizar (ej: inmediatamente, en 24h, próxima semana)",
      "medication": {
        "name": "Nombre del medicamento (comercial y genérico)",
        "dosage": "Dosis exacta (ej: 500mg, 10ml, 2 tabletas)",
        "frequency": "Frecuencia específica (ej: cada 8 horas, 3 veces al día)",
        "duration": "Duración del tratamiento (ej: 7 días, 2 semanas)",
        "route": "oral|iv|im|topica|sublingual|inhalada",
        "instructions": "Instrucciones específicas (ej: con comida, en ayunas)",
        "contraindications": ["Condición1", "Condición2"],
        "side_effects": ["Efecto1", "Efecto2"],
        "category": "analgesico|antibiotico|antiinflamatorio|antihipertensivo|otro"
      }
    }
  ],
  "red_flags": [
    {
      "alert": "descripción de la alerta",
      "severity": "advertencia|critico|emergencia",
      "action_required": "acción requerida"
    }
  ],
  "follow_up": [
    {
      "type": "control_medico|laboratorio|imagen|especialista|autocuidado",
      "description": "descripción del seguimiento",
      "timeframe": "en 1 semana|en 2-3 días|en 1 mes|si no mejora",
      "priority": "baja|media|alta|urgente",
      "specific_instructions": "instrucciones específicas para el paciente"
    }
  ],
  "alternative_treatments": [
    {
      "type": "terapia_fisica|nutricional|psicologica|lifestyle|complementaria",
      "description": "descripción del tratamiento alternativo",
      "effectiveness": "alta|media|baja",
      "evidence_level": "alta|media|baja",
      "instructions": "cómo implementar el tratamiento",
      "duration": "duración esperada del tratamiento"
    }
  ],
  "emergency_criteria": [
    {
      "symptom": "síntoma específico a vigilar",
      "severity_threshold": "umbral específico de gravedad",
      "time_frame": "inmediato|1-2_horas|24_horas",
      "action": "llamar_911|ir_emergencias|contactar_medico",
      "reasoning": "por qué este síntoma requiere atención urgente"
    }
  ],
  "suggested_questions": [
    {
      "id": "q1",
      "question": "¿Desde cuándo comenzó el dolor?",
      "category": "sintoma|antecedente|examen_fisico|descarte|seguimiento",
      "priority": "alta|media|baja",
      "reasoning": "Esta pregunta ayuda a determinar...",
      "target_diagnosis": "migraña"
    }
  ],
  "summary": "resumen conciso de la consulta y hallazgos principales",
  "confidence_level": 0.85,
  "requires_immediate_attention": false
}

IMPORTANTE:
- Responde SOLO con JSON válido, sin texto adicional
- Usa valores numéricos entre 0 y 1 para confidence y probability
- Solo incluye diagnósticos con probability > 0.3
- Prioriza la seguridad del paciente en las recomendaciones
- Si hay información insuficiente, indica baja confianza
`;
  }

  // Generar análisis médico usando OpenAI (OPTIMIZADO) - Exactamente igual que medical-main
  async generateMedicalAnalysis(): Promise<MedicalAnalysis | null> {
    // Prevenir análisis paralelos (optimización) - Exactamente igual que medical-main
    if (this.isAnalyzing) {
      console.log('⚠️ Análisis ya en curso, saltando duplicado');
      return this.getLatestAnalysis();
    }
    
    this.isAnalyzing = true;
    
    try {
      if (this.conversationHistory.length < 2) {
        return null; // Necesita al menos 2 intervenciones para analizar
      }

      const prompt = this.createMedicalPrompt();

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview', // Modelo más avanzado para análisis médico
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente médico especializado. Responde únicamente en formato JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Baja temperatura para respuestas más consistentes
        max_tokens: 2000,
        response_format: { type: 'json_object' } // Forzar respuesta JSON
      });

      const analysisText = response.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error('No se recibió respuesta de OpenAI');
      }

      // Parsear la respuesta JSON
      const analysis: MedicalAnalysis = JSON.parse(analysisText);
      
      // Validar que tiene la estructura esperada
      if (!this.validateAnalysisStructure(analysis)) {
        throw new Error('Estructura de análisis inválida');
      }

      // Agregar al historial
      this.analysisHistory.push(analysis);

      console.log('🧠 OPENAI → ANÁLISIS MÉDICO COMPLETO:');
      console.log(`   📋 Síntomas detectados: ${analysis.symptoms.length}`);
      console.log(`   🔍 Diagnósticos sugeridos: ${analysis.diagnoses.length}`);
      console.log(`   💡 Recomendaciones: ${analysis.recommendations.length}`);
      console.log(`   📅 Seguimiento: ${analysis.follow_up.length}`);
      console.log(`   🌿 Tratamientos alternativos: ${analysis.alternative_treatments.length}`);
      console.log(`   🚨 Criterios de emergencia: ${analysis.emergency_criteria.length}`);
      console.log(`   ❓ Preguntas sugeridas: ${analysis.suggested_questions.length}`);
      console.log(`   🎯 Información extraída: ${Object.keys(this.extractedInfo).filter(key => {
        const value = this.extractedInfo[key as keyof ExtractedInformation];
        return Array.isArray(value) ? value.length > 0 : value === true;
      }).length} elementos`);
      
      this.lastQuestionUpdate = Date.now();
      console.log(`   ⚠️ Red flags: ${analysis.red_flags.length}`);
      console.log(`   🎯 Confianza general: ${Math.round(analysis.confidence_level * 100)}%`);
      
      if (analysis.requires_immediate_attention) {
        console.log('🚨 ¡ATENCIÓN INMEDIATA REQUERIDA!');
      }

      return analysis;

    } catch (error) {
      console.error('❌ Error generando análisis médico:', error);
      return null;
    } finally {
      // Liberar el lock de análisis
      this.isAnalyzing = false;
    }
  }

  // Validar estructura del análisis - Exactamente igual que medical-main
  private validateAnalysisStructure(analysis: any): boolean {
    return (
      analysis &&
      Array.isArray(analysis.symptoms) &&
      Array.isArray(analysis.diagnoses) &&
      Array.isArray(analysis.recommendations) &&
      Array.isArray(analysis.red_flags) &&
      Array.isArray(analysis.follow_up) &&
      Array.isArray(analysis.alternative_treatments) &&
      Array.isArray(analysis.emergency_criteria) &&
      Array.isArray(analysis.suggested_questions) &&
      typeof analysis.summary === 'string' &&
      typeof analysis.confidence_level === 'number' &&
      typeof analysis.requires_immediate_attention === 'boolean'
    );
  }

  private sanitizeAnalysisStructure(analysis: unknown): MedicalAnalysis | null {
    try {
      console.log('🔧 Sanitizando estructura de análisis...');
      
      // Cast to any for property access
      const analysisData = analysis as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      
      // Crear estructura base con valores por defecto
      const sanitized: MedicalAnalysis = {
        symptoms: this.ensureArray(analysisData.symptoms, 'symptoms'),
        diagnoses: this.ensureArray(analysisData.diagnoses, 'diagnoses'),
        recommendations: this.ensureArray(analysisData.recommendations, 'recommendations'),
        red_flags: this.ensureArray(analysisData.red_flags, 'red_flags'),
        follow_up: this.ensureArray(analysisData.follow_up, 'follow_up'),
        alternative_treatments: this.ensureArray(analysisData.alternative_treatments, 'alternative_treatments'),
        emergency_criteria: this.ensureArray(analysisData.emergency_criteria, 'emergency_criteria'),
        suggested_questions: this.ensureArray(analysisData.suggested_questions, 'suggested_questions'),
        summary: typeof analysisData.summary === 'string' && analysisData.summary.trim() 
          ? analysisData.summary.trim() 
          : 'Análisis médico generado automáticamente.',
        confidence_level: typeof analysisData.confidence_level === 'number' && 
          analysisData.confidence_level >= 0 && analysisData.confidence_level <= 1
          ? analysisData.confidence_level 
          : 0.5,
        requires_immediate_attention: typeof analysisData.requires_immediate_attention === 'boolean' 
          ? analysisData.requires_immediate_attention 
          : false,
        timestamp: new Date().toISOString(),
        session_id: this.sessionId
      };
      
      console.log('🔧 Estructura sanitizada:', {
        symptoms: sanitized.symptoms.length,
        diagnoses: sanitized.diagnoses.length,
        recommendations: sanitized.recommendations.length,
        confidence: sanitized.confidence_level
      });
      
      return sanitized;
    } catch (error) {
      console.error('❌ Error sanitizando análisis:', error);
      return null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ensureArray(value: unknown, fieldName: string): any[] {
    if (Array.isArray(value)) {
      console.log(`✅ ${fieldName} es array válido: ${value.length} elementos`);
      return value;
    }
    
    if (typeof value === 'string' && value.trim()) {
      // Intentar convertir string a array si es JSON válido
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          console.log(`🔧 ${fieldName} convertido de string a array: ${parsed.length} elementos`);
          return parsed;
        }
      } catch {
        // Si no es JSON válido, crear array con el string
        console.log(`🔧 ${fieldName} convertido a array de 1 elemento`);
        return [value];
      }
    }
    
    console.warn(`⚠️ ${fieldName} no válido, usando array vacío. Valor:`, value);
    return [];
  }

  getLatestAnalysis(): MedicalAnalysis | null {
    return this.analysisHistory.length > 0 
      ? this.analysisHistory[this.analysisHistory.length - 1] || null
      : null;
  }

  getAnalysisHistory(): MedicalAnalysis[] {
    return [...this.analysisHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
    this.analysisHistory = [];
    this.doctorQuestions = [];
    this.informationObtained = [];
    this.extractedInfo = {
      symptoms_mentioned: [],
      characteristics_provided: [],
      duration_mentioned: false,
      intensity_mentioned: false,
      location_mentioned: false,
      triggers_mentioned: false,
      associated_symptoms: [],
      medications_mentioned: [],
      allergies_mentioned: [],
      medical_history: []
    };
    this.consultationPhase = 'listening';
    this.conceptualAnswers = [];
    this.sessionStartTime = Date.now();
    this.sessionId = `session_${Date.now()}`;
    this.lastQuestionUpdate = 0;
    this.isAnalyzing = false;
    console.log('🔄 Historial limpiado - Nueva consulta iniciada');
  }

  async generateFinalReport(): Promise<FinalMedicalReport | null> {
    try {
      if (this.conversationHistory.length < 4) {
        throw new Error('Consulta muy corta para generar informe completo');
      }

      const sessionDuration = Date.now() - this.sessionStartTime;
      const conversationText = this.conversationHistory.join('\n');
      
      const prompt = `
Eres un médico especialista generando un INFORME MÉDICO FINAL de consulta.

CONVERSACIÓN COMPLETA:
${conversationText}

INSTRUCCIONES PARA EL INFORME FINAL:

1. **SÍNTOMAS** - Proporciona en DOS versiones:
   - Lenguaje normal (para el paciente)
   - Lenguaje técnico médico con códigos CIE-10 cuando aplique

2. **DIAGNÓSTICOS** - Proporciona en DOS versiones:
   - Lenguaje descriptivo (para comunicar al paciente)
   - Lenguaje técnico con códigos CIE-10 OBLIGATORIOS
   
3. **CÓDIGOS CIE-10** - OBLIGATORIO usar códigos específicos:
   - Ejemplo: "R51 - Cefalea" no "R50-R69 - Síntomas generales"
   - Usar códigos de 4-5 caracteres específicos
   - Si no tienes el código exacto, usa el más específico posible

4. **EXÁMENES RECOMENDADOS** - Específicos por tipo:
   - Laboratorio: Hemograma, química sanguínea, etc.
   - Imagen: RX, TAC, RMN, eco, etc.
   - Física: Palpación, auscultación, etc.
   - Especializada: Endoscopia, biopsia, etc.

5. **ESTRUCTURA PROFESIONAL**:
   - Resumen ejecutivo claro
   - Evidencia que soporta cada diagnóstico
   - Plan de seguimiento temporal específico
   - Criterios de alarma precisos

Responde ÚNICAMENTE en formato JSON válido.
`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 4000
      });

      const reportText = completion.choices[0]?.message?.content?.trim();
      if (!reportText) {
        throw new Error('No se recibió respuesta de OpenAI para el informe final');
      }

      const finalReport: FinalMedicalReport = JSON.parse(reportText);
      
      finalReport.patient_info.session_id = this.sessionId || `session_${Date.now()}`;
      finalReport.patient_info.date = new Date().toISOString();
      finalReport.patient_info.duration = `${Math.round(sessionDuration / 60000)} minutos`;
      finalReport.patient_info.total_interactions = this.conversationHistory.length;

      console.log('📋 INFORME FINAL GENERADO:');
      console.log(`   📅 Duración: ${finalReport.patient_info.duration}`);
      console.log(`   🔬 Síntomas: ${finalReport.symptoms_report.length}`);
      console.log(`   🎯 Diagnósticos: ${finalReport.diagnoses_report.length}`);

      return finalReport;

    } catch (error) {
      console.error('❌ Error generando informe final:', error);
      return null;
    }
  }

  getStats() {
    return {
      transcriptions_processed: this.conversationHistory.length,
      analyses_generated: this.analysisHistory.length,
      doctor_questions_detected: this.doctorQuestions.length,
      consultation_phase: this.consultationPhase,
      extracted_info: this.extractedInfo,
      session_duration: Date.now() - this.sessionStartTime,
      last_analysis_time: this.analysisHistory.length > 0 ? new Date().toISOString() : null
    };
  }
}

export default OpenAIService;
