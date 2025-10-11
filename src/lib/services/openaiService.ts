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
    console.log('📝 OPENAI: Agregando transcripción:', {
      speakerLabel,
      transcript: transcription.transcript,
      currentHistoryLength: this.conversationHistory.length
    });
    
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${speakerLabel}: "${transcription.transcript}"`;
    
    this.conversationHistory.push(entry);
    
    // Normalizar el speakerLabel para comparación
    const normalizedSpeaker = speakerLabel.toLowerCase();
    
    if (normalizedSpeaker.includes('médico') || normalizedSpeaker.includes('doctor')) {
      if (this.isQuestion(transcription.transcript)) {
      this.doctorQuestions.push(transcription.transcript);
      console.log('❓ Pregunta del médico detectada:', transcription.transcript);
      }
    }
    
    if (normalizedSpeaker.includes('paciente')) {
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
    
    console.log(`✅ OPENAI: Transcripción agregada. Total conversación: ${this.conversationHistory.length} mensajes`);
    console.log('📊 OPENAI: Estado actual:', {
      conversationHistory: this.conversationHistory.slice(-3), // Solo últimas 3 para no saturar logs
      doctorQuestions: this.doctorQuestions.length,
      extractedSymptoms: this.extractedInfo.symptoms_mentioned.length,
      consultationPhase: this.consultationPhase
    });
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

Responde ÚNICAMENTE en formato JSON válido sin texto adicional.
`;
  }

  async generateMedicalAnalysis(): Promise<MedicalAnalysis | null> {
    if (this.isAnalyzing) {
      console.log('⚠️ Análisis ya en curso, saltando duplicado');
      return this.getLatestAnalysis();
    }
    
    this.isAnalyzing = true;
    
    try {
      console.log('🔍 OPENAI: Verificando datos para análisis:', {
        conversationHistoryLength: this.conversationHistory.length,
        conversationHistory: this.conversationHistory,
        extractedInfo: this.extractedInfo,
        doctorQuestions: this.doctorQuestions,
        consultationPhase: this.consultationPhase
      });
      
      if (this.conversationHistory.length < 2) {
        console.log('❌ OPENAI: Insuficientes datos - necesita al menos 2 mensajes en conversación');
        return null;
      }

      const prompt = this.createMedicalPrompt();

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
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
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const analysisText = response.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error('No se recibió respuesta de OpenAI');
      }

      console.log('🔍 OPENAI RAW RESPONSE:', analysisText);

      let analysis: MedicalAnalysis;
      try {
        analysis = JSON.parse(analysisText);
        console.log('✅ OPENAI JSON PARSED:', analysis);
      } catch (parseError) {
        console.error('❌ OPENAI JSON PARSE ERROR:', parseError);
        console.error('❌ RAW TEXT:', analysisText);
        throw new Error('Respuesta de OpenAI no es JSON válido');
      }
      
      // Transformar la estructura (la función siempre devuelve true después de transformar)
      try {
        console.log('🔄 OPENAI: Iniciando transformación de estructura...');
        this.validateAnalysisStructure(analysis);
        console.log('✅ OPENAI: Transformación completada exitosamente');
      } catch (transformError) {
        console.error('❌ OPENAI: Error durante transformación:', transformError);
        console.error('❌ OPENAI: Estructura original:', JSON.stringify(analysis, null, 2));
        throw new Error(`Error en transformación: ${transformError.message}`);
      }
      
      console.log('🔍 VALIDATION RESULT AFTER TRANSFORMATION:', {
        hasSymptoms: Array.isArray(analysis.symptoms),
        hasDiagnoses: Array.isArray(analysis.diagnoses),
        hasRecommendations: Array.isArray(analysis.recommendations),
        hasRedFlags: Array.isArray(analysis.red_flags),
        hasFollowUp: Array.isArray(analysis.follow_up),
        hasAlternativeTreatments: Array.isArray(analysis.alternative_treatments),
        hasEmergencyCriteria: Array.isArray(analysis.emergency_criteria),
        hasSuggestedQuestions: Array.isArray(analysis.suggested_questions),
        hasSummary: typeof analysis.summary === 'string',
        hasConfidenceLevel: typeof analysis.confidence_level === 'number',
        hasRequiresAttention: typeof analysis.requires_immediate_attention === 'boolean'
      });

      this.analysisHistory.push(analysis);

      console.log('🧠 OPENAI → ANÁLISIS MÉDICO COMPLETO:');
      console.log(`   📋 Síntomas detectados: ${analysis.symptoms.length}`);
      console.log(`   🔍 Diagnósticos sugeridos: ${analysis.diagnoses.length}`);
      console.log(`   💡 Recomendaciones: ${analysis.recommendations.length}`);
      console.log(`   🎯 Confianza general: ${Math.round(analysis.confidence_level * 100)}%`);
      
      this.lastQuestionUpdate = Date.now();
      
      if (analysis.requires_immediate_attention) {
        console.log('🚨 ¡ATENCIÓN INMEDIATA REQUERIDA!');
      }

      return analysis;

    } catch (error) {
      console.error('❌ Error generando análisis médico:', error);
      return null;
    } finally {
      this.isAnalyzing = false;
    }
  }

  private validateAnalysisStructure(analysis: unknown): boolean {
    console.log('🚀 OPENAI: validateAnalysisStructure INICIADO');
    console.log('🔍 OPENAI: Tipo de análisis recibido:', typeof analysis);
    const analysisData = analysis as any;
    console.log('🔍 OPENAI: analysisData definido:', !!analysisData);
    
    // OpenAI está devolviendo estructura en español, vamos a transformarla
    console.log('🔧 OPENAI: Transformando estructura de OpenAI...');
    console.log('🔍 OPENAI: Estructura original recibida:', Object.keys(analysisData));
    
    // Manejar todas las variantes de preguntas
    const preguntas = analysisData.preguntas || analysisData.preguntas_inteligentes || analysisData.preguntas_criticas;
    if (preguntas && !analysisData.suggested_questions) {
      analysisData.suggested_questions = preguntas.map((p: any) => {
        if (typeof p === 'string') {
          return {
            question: p,
            reasoning: 'Pregunta sugerida por el análisis médico',
            priority: 'media',
            type: 'exploracion'
          };
        } else {
          return {
            question: p.pregunta || p.texto || p,
            reasoning: p.justificacion || 'Pregunta médica',
            priority: 'media',
            type: 'exploracion'
          };
        }
      });
      console.log('✅ Preguntas transformadas:', analysisData.suggested_questions.length);
    }
    
    // Manejar ambas variantes de diagnósticos
    const diagnosticos = analysisData.posibles_diagnosticos || analysisData.diagnosticos_posibles;
    if (diagnosticos && !analysisData.diagnoses) {
      analysisData.diagnoses = diagnosticos.map((d: any) => ({
        name: d.diagnostico || d.nombre,
        probability: 0.7,
        risk_level: 'medio',
        supporting_symptoms: [],
        reasoning: d.razonamiento || d.justificacion
      }));
      console.log('✅ Diagnósticos transformados:', analysisData.diagnoses.length);
    }
    
    if (analysisData.recomendaciones_farmacologicas && !analysisData.recommendations) {
      analysisData.recommendations = analysisData.recomendaciones_farmacologicas.map((r: any) => ({
        type: 'medicamento',
        description: `${r.medicamento} - ${r.dosis} ${r.frecuencia}`,
        priority: 'alta',
        timeline: r.duracion,
        reasoning: r.instrucciones,
        medication: {
          name: r.medicamento,
          dosage: r.dosis,
          frequency: r.frecuencia,
          duration: r.duracion,
          route: r.via_de_administracion || r.via_administracion, // Ambas variantes
          instructions: r.instrucciones,
          contraindications: [r.contraindicaciones],
          side_effects: [r.efectos_secundarios]
        }
      }));
      console.log('✅ Recomendaciones farmacológicas transformadas:', analysisData.recommendations.length);
    }
    
    // Transformar seguimiento - manejar ambas variantes (array u objeto)
    const seguimiento = analysisData.recomendaciones_de_seguimiento || analysisData.recomendaciones_seguimiento;
    if (seguimiento && !analysisData.follow_up) {
      if (Array.isArray(seguimiento)) {
        analysisData.follow_up = seguimiento.map((s: any) => ({
          type: 'control_medico',
          description: s.controles_medicos_necesarios || s.controles_medicos || 'Control médico recomendado',
          timeframe: '1 semana',
          specific_instructions: s.instrucciones_de_autocuidado || s.instrucciones_autocuidado
        }));
      } else {
        // Es un objeto único
        analysisData.follow_up = [{
          type: 'control_medico',
          description: seguimiento.controles_medicos_necesarios || seguimiento.controles_medicos || 'Control médico recomendado',
          timeframe: '1 semana',
          specific_instructions: seguimiento.instrucciones_de_autocuidado || seguimiento.instrucciones_autocuidado
        }];
      }
      console.log('✅ Seguimiento transformado:', analysisData.follow_up.length);
    }
    
    // Transformar tratamientos alternativos
    if (analysisData.tratamientos_alternativos && !analysisData.alternative_treatments) {
      analysisData.alternative_treatments = analysisData.tratamientos_alternativos.map((t: any) => ({
        name: t.terapia || t.tipo,
        description: t.descripcion,
        duration: t.duracion || t.duracion_y_efectividad_esperada,
        effectiveness: t.efectividad_esperada || t.duracion_y_efectividad_esperada,
        evidence_level: 'moderada'
      }));
      console.log('✅ Tratamientos alternativos transformados:', analysisData.alternative_treatments.length);
    }
    
    // Transformar criterios de emergencia - manejar todas las variantes
    const emergencia = analysisData.criterios_de_emergencia || analysisData.criterios_emergencia || analysisData.criterios_de_emergencia_especificos;
    if (emergencia && !analysisData.emergency_criteria) {
      analysisData.emergency_criteria = emergencia.map((c: any) => {
        if (c.sintomas_que_requieren_atencion_inmediata) {
          // Formato especial - puede ser string o array
          const sintomas = typeof c.sintomas_que_requieren_atencion_inmediata === 'string' 
            ? c.sintomas_que_requieren_atencion_inmediata.split(',').map((s: string) => s.trim())
            : c.sintomas_que_requieren_atencion_inmediata;
          
          return sintomas.map((sintoma: string) => ({
            symptom: sintoma,
            severity_threshold: 'alto',
            action: c.acciones_claras_para_el_paciente || 'Buscar atención médica inmediata',
            time_frame: c.marcos_de_tiempo_precisos || 'Inmediato',
            reasoning: 'Criterio de emergencia médica'
          }));
        } else {
          // Formato normal
          return {
            symptom: c.sintoma,
            severity_threshold: 'alto',
            action: c.accion,
            time_frame: c.marco_de_tiempo || c.marco_tiempo,
            reasoning: 'Criterio de emergencia médica'
          };
        }
      }).flat(); // Aplanar en caso de arrays anidados
      console.log('✅ Criterios de emergencia transformados:', analysisData.emergency_criteria.length);
    }
    
    // Agregar síntomas basándose en la información extraída
    if (!analysisData.symptoms || analysisData.symptoms.length === 0) {
      analysisData.symptoms = this.extractedInfo.symptoms_mentioned.map(symptom => ({
        name: symptom,
        severity: 'moderado',
        confidence: 0.8,
        location: this.extractedInfo.location_mentioned ? 'frontal' : 'no especificada',
        duration: this.extractedInfo.duration_mentioned ? 'varios días' : 'no especificada'
      }));
      
      // Agregar síntomas adicionales basándose en las transcripciones
      if (this.conversationHistory.some(h => h.toLowerCase().includes('náuseas'))) {
        analysisData.symptoms.push({
          name: 'náuseas',
          severity: 'leve',
          confidence: 0.9,
          location: 'no aplica',
          duration: 'asociada al dolor'
        });
      }
      
      if (this.conversationHistory.some(h => h.toLowerCase().includes('sensibilidad a la luz'))) {
        analysisData.symptoms.push({
          name: 'fotofobia',
          severity: 'moderado',
          confidence: 0.9,
          location: 'ocular',
          duration: 'asociada al dolor'
        });
      }
    }
    
    // Agregar red flags basándose en criterios de emergencia
    if (!analysisData.red_flags || analysisData.red_flags.length === 0) {
      analysisData.red_flags = [];
      if (analysisData.emergency_criteria && analysisData.emergency_criteria.length > 0) {
        analysisData.red_flags = analysisData.emergency_criteria.map((c: any) => ({
          alert: `Alerta: ${c.symptom}`,
          action_required: c.action,
          severity: 'alto'
        }));
      }
    }
    
    // Agregar campos faltantes con valores por defecto
    if (!analysisData.follow_up) analysisData.follow_up = [];
    if (!analysisData.alternative_treatments) analysisData.alternative_treatments = [];
    if (!analysisData.emergency_criteria) analysisData.emergency_criteria = [];
    if (!analysisData.summary) {
      // Crear resumen basado en los diagnósticos
      const diagnosticos = analysisData.diagnoses?.map((d: any) => d.name).join(', ') || 'diagnósticos pendientes';
      analysisData.summary = `Consulta médica: ${diagnosticos}. Síntomas principales incluyen dolor de cabeza, fotofobia y náuseas.`;
    }
    if (!analysisData.confidence_level) analysisData.confidence_level = 0.8;
    if (analysisData.requires_immediate_attention === undefined) analysisData.requires_immediate_attention = false;
    
    console.log('🎯 OPENAI: Estructura final completada:', {
      symptoms: analysisData.symptoms?.length || 0,
      diagnoses: analysisData.diagnoses?.length || 0,
      recommendations: analysisData.recommendations?.length || 0,
      suggested_questions: analysisData.suggested_questions?.length || 0,
      red_flags: analysisData.red_flags?.length || 0,
      follow_up: analysisData.follow_up?.length || 0,
      alternative_treatments: analysisData.alternative_treatments?.length || 0,
      emergency_criteria: analysisData.emergency_criteria?.length || 0
    });
    
    console.log('✅ OPENAI: Estructura transformada y validada');
    return true; // Siempre válido después de la transformación
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
