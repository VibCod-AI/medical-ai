import { Transcription } from '@/types/medical';

export type SpeakerType = 'medico' | 'paciente';

export interface SpeakerDetectionConfig {
  // Frases características del médico
  doctorPhrases: string[];
  // Frases características del paciente
  patientPhrases: string[];
  // Palabras clave médicas (típicamente usadas por el médico)
  medicalKeywords: string[];
  // Palabras clave de síntomas (típicamente usadas por el paciente)
  symptomKeywords: string[];
  // Patrones de preguntas médicas
  questionPatterns: string[];
  // Peso para el contexto previo
  contextWeight: number;
}

// Configuración por defecto para detección de speakers
export const defaultSpeakerConfig: SpeakerDetectionConfig = {
  doctorPhrases: [
    'mi nombre es',
    'soy el doctor',
    'soy la doctora',
    'cuáles son los síntomas',
    'qué síntomas tiene',
    'podrías describir',
    'puede describir',
    'desde cuándo',
    'cuándo comenzó',
    'vamos a examinar',
    'necesitamos hacer',
    'le voy a recetar',
    'recomiendo que',
    'voy a prescribir',
    'según el examen',
    'en mi diagnóstico',
    'basándome en',
    'lo que observo'
  ],
  
  patientPhrases: [
    'me duele',
    'siento dolor',
    'tengo dolor',
    'me siento',
    'he notado',
    'noto que',
    'también noto',
    'además tengo',
    'el dolor se siente',
    'cuando me duele',
    'desde hace',
    'empezó hace',
    'gracias doctor',
    'gracias doctora',
    'no puedo',
    'me cuesta',
    'siento que'
  ],
  
  medicalKeywords: [
    'diagnóstico',
    'tratamiento',
    'medicamento',
    'prescripción',
    'examen',
    'análisis',
    'radiografía',
    'ecografía',
    'biopsia',
    'cirugía',
    'terapia',
    'dosis',
    'posología'
  ],
  
  symptomKeywords: [
    'dolor',
    'molestia',
    'sensibilidad',
    'hinchazón',
    'inflamación',
    'fiebre',
    'náuseas',
    'mareo',
    'cansancio',
    'fatiga',
    'debilidad',
    'picazón',
    'ardor',
    'entumecimiento'
  ],
  
  questionPatterns: [
    'cómo',
    'qué',
    'dónde',
    'cuándo',
    'por qué',
    'cuál',
    'cuáles',
    'cuánto',
    'cuántos'
  ],
  
  contextWeight: 0.3
};

/**
 * Detecta el speaker basándose en el contenido del texto y el contexto previo
 */
export function detectSpeaker(
  text: string, 
  speakerIndex: number, 
  previousTranscriptions: Transcription[],
  config: SpeakerDetectionConfig = defaultSpeakerConfig
): SpeakerType {
  const lowerText = text.toLowerCase().trim();
  
  if (!lowerText) {
    return speakerIndex === 0 ? 'medico' : 'paciente';
  }

  let doctorScore = 0;
  let patientScore = 0;

  // 1. Buscar frases características exactas
  config.doctorPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) {
      doctorScore += 3; // Peso alto para frases exactas
    }
  });

  config.patientPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) {
      patientScore += 3; // Peso alto para frases exactas
    }
  });

  // 2. Buscar palabras clave médicas
  config.medicalKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      doctorScore += 2;
    }
  });

  config.symptomKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      patientScore += 2;
    }
  });

  // 3. Detectar patrones de preguntas médicas
  const hasQuestionMark = lowerText.includes('?');
  if (hasQuestionMark) {
    const hasQuestionPattern = config.questionPatterns.some(pattern => 
      lowerText.includes(pattern)
    );
    if (hasQuestionPattern) {
      doctorScore += 2; // Los médicos hacen preguntas estructuradas
    }
  }

  // 4. Análisis de patrones lingüísticos
  
  // Patrones típicos del médico
  if (lowerText.includes('según') || lowerText.includes('basándome en')) {
    doctorScore += 1;
  }
  
  if (lowerText.includes('recomiendo') || lowerText.includes('sugiero')) {
    doctorScore += 2;
  }

  // Patrones típicos del paciente
  if (lowerText.includes('siento') || lowerText.includes('me pasa')) {
    patientScore += 1;
  }
  
  if (lowerText.includes('no sé') || lowerText.includes('creo que')) {
    patientScore += 1;
  }

  // 5. Contexto previo (alternancia de speakers)
  const lastTranscription = previousTranscriptions[previousTranscriptions.length - 1];
  if (lastTranscription && config.contextWeight > 0) {
    const contextBonus = config.contextWeight;
    if (lastTranscription.speaker === 'medico') {
      patientScore += contextBonus; // Tendencia a alternar
    } else {
      doctorScore += contextBonus;
    }
  }

  // 6. Longitud y complejidad del texto
  const wordCount = lowerText.split(' ').length;
  if (wordCount > 15) {
    // Textos largos tienden a ser explicaciones médicas
    doctorScore += 0.5;
  } else if (wordCount < 5) {
    // Textos cortos tienden a ser respuestas del paciente
    patientScore += 0.5;
  }

  // 7. Decisión final
  if (Math.abs(doctorScore - patientScore) < 0.5) {
    // Si los puntajes están muy cerca, usar el índice del speaker original
    return speakerIndex === 0 ? 'medico' : 'paciente';
  }

  return doctorScore > patientScore ? 'medico' : 'paciente';
}

/**
 * Auto-corrige speakers en un array de transcripciones basándose en patrones
 */
export function autoCorrectSpeakers(
  transcriptions: Transcription[],
  config: SpeakerDetectionConfig = defaultSpeakerConfig
): Transcription[] {
  return transcriptions.map((transcription, index) => {
    const previousTranscriptions = transcriptions.slice(0, index);
    const detectedSpeaker = detectSpeaker(
      transcription.text,
      transcription.speaker === 'medico' ? 0 : 1,
      previousTranscriptions,
      config
    );
    
    return {
      ...transcription,
      speaker: detectedSpeaker
    };
  });
}

/**
 * Analiza la calidad de la detección de speakers en una conversación
 */
export function analyzeSpeakerDetectionQuality(transcriptions: Transcription[]): {
  alternationRate: number;
  averageLength: { medico: number; paciente: number };
  questionCount: { medico: number; paciente: number };
  confidence: number;
} {
  if (transcriptions.length === 0) {
    return {
      alternationRate: 0,
      averageLength: { medico: 0, paciente: 0 },
      questionCount: { medico: 0, paciente: 0 },
      confidence: 0
    };
  }

  // Calcular tasa de alternancia
  let alternations = 0;
  for (let i = 1; i < transcriptions.length; i++) {
    if (transcriptions[i].speaker !== transcriptions[i - 1].speaker) {
      alternations++;
    }
  }
  const alternationRate = alternations / (transcriptions.length - 1);

  // Calcular longitud promedio por speaker
  const medicoTexts = transcriptions.filter(t => t.speaker === 'medico');
  const pacienteTexts = transcriptions.filter(t => t.speaker === 'paciente');
  
  const averageLength = {
    medico: medicoTexts.length > 0 
      ? medicoTexts.reduce((sum, t) => sum + t.text.split(' ').length, 0) / medicoTexts.length 
      : 0,
    paciente: pacienteTexts.length > 0 
      ? pacienteTexts.reduce((sum, t) => sum + t.text.split(' ').length, 0) / pacienteTexts.length 
      : 0
  };

  // Contar preguntas por speaker
  const questionCount = {
    medico: medicoTexts.filter(t => t.text.includes('?')).length,
    paciente: pacienteTexts.filter(t => t.text.includes('?')).length
  };

  // Calcular confianza general (heurística)
  let confidence = 0.5; // Base
  
  // Bonus por alternancia saludable (50-80% es ideal)
  if (alternationRate >= 0.5 && alternationRate <= 0.8) {
    confidence += 0.2;
  }
  
  // Bonus si el médico hace más preguntas
  if (questionCount.medico > questionCount.paciente) {
    confidence += 0.1;
  }
  
  // Bonus si hay diferencia razonable en longitud promedio
  if (Math.abs(averageLength.medico - averageLength.paciente) > 2) {
    confidence += 0.1;
  }

  return {
    alternationRate,
    averageLength,
    questionCount,
    confidence: Math.min(confidence, 1.0)
  };
}

/**
 * Sugiere correcciones para mejorar la detección de speakers
 */
export function suggestSpeakerCorrections(transcriptions: Transcription[]): {
  suggestions: string[];
  potentialErrors: { index: number; reason: string; suggestedSpeaker: SpeakerType }[];
} {
  const suggestions: string[] = [];
  const potentialErrors: { index: number; reason: string; suggestedSpeaker: SpeakerType }[] = [];

  const analysis = analyzeSpeakerDetectionQuality(transcriptions);

  // Sugerencias basadas en el análisis
  if (analysis.alternationRate < 0.3) {
    suggestions.push('La tasa de alternancia es muy baja. Verifica si hay speakers mal asignados consecutivos.');
  }

  if (analysis.questionCount.paciente > analysis.questionCount.medico) {
    suggestions.push('El paciente parece hacer más preguntas que el médico. Revisa las asignaciones.');
  }

  // Buscar errores potenciales
  transcriptions.forEach((transcription, index) => {
    const text = transcription.text.toLowerCase();
    
    // Paciente diciendo cosas típicas de médico
    if (transcription.speaker === 'paciente' && 
        (text.includes('diagnóstico') || text.includes('prescribir') || text.includes('recomiendo'))) {
      potentialErrors.push({
        index,
        reason: 'Paciente usando terminología médica profesional',
        suggestedSpeaker: 'medico'
      });
    }

    // Médico diciendo cosas típicas de paciente
    if (transcription.speaker === 'medico' && 
        (text.includes('me duele') || text.includes('siento dolor') || text.includes('gracias doctor'))) {
      potentialErrors.push({
        index,
        reason: 'Médico expresando síntomas personales',
        suggestedSpeaker: 'paciente'
      });
    }
  });

  return { suggestions, potentialErrors };
}
