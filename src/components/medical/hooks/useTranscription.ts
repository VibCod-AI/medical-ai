import { useState, useCallback, useRef, useEffect } from 'react';
import { Transcription } from '@/types/medical';
import audioService from '@/services/audioService';

interface UseTranscriptionOptions {
  onTranscriptionReceived?: (transcription: Transcription) => void;
  maxTranscriptions?: number;
  autoScroll?: boolean;
}

interface UseTranscriptionReturn {
  transcriptions: Transcription[];
  isRecording: boolean;
  isConnected: boolean;
  transcriptionRef: React.RefObject<HTMLDivElement>;
  
  // Actions
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearTranscriptions: () => void;
  addTranscription: (transcription: Transcription) => void;
  updateTranscription: (id: string, updates: Partial<Transcription>) => void;
  removeTranscription: (id: string) => void;
  autoCorrectSpeakers: () => void;
  toggleSpeaker: (id: string) => void;
}

// Función para detectar el speaker basándose en el contenido
const detectSpeaker = (text: string, speakerIndex: number, previousTranscriptions: Transcription[]): 'medico' | 'paciente' => {
  const lowerText = text.toLowerCase();
  
  // Frases claramente del médico
  const doctorPhrases = [
    'mi nombre es', 'soy el doctor', 'soy la doctora',
    'cuáles son los síntomas', 'qué síntomas tiene',
    'podrías describir', 'puede describir',
    'desde cuándo', 'cuándo comenzó',
    'vamos a examinar', 'necesitamos hacer',
    'le voy a recetar', 'recomiendo que'
  ];
  
  // Frases claramente del paciente
  const patientPhrases = [
    'me duele', 'siento dolor', 'tengo dolor',
    'me siento', 'he notado', 'noto que',
    'también noto', 'además tengo',
    'el dolor se siente', 'cuando me duele',
    'desde hace', 'empezó hace',
    'gracias doctor', 'gracias doctora'
  ];
  
  // Buscar coincidencias exactas
  const isDoctor = doctorPhrases.some(phrase => lowerText.includes(phrase)) ||
                 (lowerText.includes('?') && (lowerText.includes('cómo') || lowerText.includes('qué') || lowerText.includes('dónde')));
  
  const isPatient = patientPhrases.some(phrase => lowerText.includes(phrase)) ||
                   lowerText.includes('dolor') || lowerText.includes('sensibilidad') || lowerText.includes('molestia');
  
  // Si hay coincidencias claras, usar esas
  if (isDoctor && !isPatient) {
    return 'medico';
  } else if (isPatient && !isDoctor) {
    return 'paciente';
  }
  
  // Si no hay coincidencias claras, usar patrón alternado
  const lastTranscription = previousTranscriptions[previousTranscriptions.length - 1];
  if (lastTranscription) {
    return lastTranscription.speaker === 'medico' ? 'paciente' : 'medico';
  }
  
  // Por defecto, usar el índice del speaker (0 = médico, 1 = paciente)
  return speakerIndex === 0 ? 'medico' : 'paciente';
};

export const useTranscription = (options: UseTranscriptionOptions = {}): UseTranscriptionReturn => {
  const {
    onTranscriptionReceived,
    maxTranscriptions = 50,
    autoScroll = true
  } = options;

  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const transcriptionRef = useRef<HTMLDivElement>(null);

  // Auto-scroll cuando hay nuevas transcripciones
  useEffect(() => {
    if (autoScroll && transcriptionRef.current) {
      transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight;
    }
  }, [transcriptions, autoScroll]);

  // Configurar listeners de audioService
  useEffect(() => {
    if (!audioService) return;

    // Listener para conexión
    const handleConnectionChange = (connected: boolean) => {
      setIsConnected(connected);
      console.log(`🔗 useTranscription: Conexión ${connected ? 'establecida' : 'perdida'}`);
    };

    // Listener para transcripciones
    const handleTranscription = (transcriptionData: any) => {
      console.log('📝 useTranscription: Nueva transcripción recibida:', transcriptionData);
      
      const newTranscription: Transcription = {
        id: Date.now().toString() + Math.random(),
        speaker: 'paciente', // Se detectará correctamente después
        text: transcriptionData.transcript,
        timestamp: new Date(),
        confidence: transcriptionData.confidence || 0
      };
      
      setTranscriptions(prev => {
        // Crear la transcripción con detección de speaker mejorada
        const improvedTranscription = {
          ...newTranscription,
          speaker: detectSpeaker(
            transcriptionData.transcript, 
            transcriptionData.speaker || 0, 
            prev
          )
        };
        
        // Deduplicación estricta
        const isDuplicate = prev.some(t => {
          const textMatch = t.text.trim().toLowerCase() === improvedTranscription.text.trim().toLowerCase();
          const timeMatch = Math.abs(Date.now() - parseInt(t.id)) < 5000; // 5 segundos
          return textMatch && timeMatch;
        });
        
        if (isDuplicate) {
          console.log('🚫 useTranscription: Transcripción duplicada ignorada');
          return prev;
        }
        
        const updated = [...prev, improvedTranscription];
        const trimmed = updated.slice(-maxTranscriptions);
        
        // Callback opcional
        if (onTranscriptionReceived) {
          onTranscriptionReceived(improvedTranscription);
        }
        
        console.log(`✅ useTranscription: Transcripción agregada. Total: ${trimmed.length}`);
        return trimmed;
      });
    };

    // Registrar listeners (si audioService los soporta)
    if (audioService.on) {
      audioService.on('connection', handleConnectionChange);
      audioService.on('transcription', handleTranscription);
    }

    return () => {
      // Limpiar listeners
      if (audioService.off) {
        audioService.off('connection', handleConnectionChange);
        audioService.off('transcription', handleTranscription);
      }
    };
  }, [onTranscriptionReceived, maxTranscriptions]);

  const startRecording = useCallback(async () => {
    try {
      if (!audioService) {
        throw new Error('AudioService no disponible');
      }

      setIsRecording(true);
      setTranscriptions([]);
      
      // Inicializar audioService
      const initialized = await audioService.initialize();
      if (!initialized) {
        throw new Error('No se pudo inicializar el audio');
      }
      
      // Iniciar grabación de audio
      const started = await audioService.startRecording();
      if (!started) {
        throw new Error('No se pudo iniciar la grabación');
      }
      
      console.log('🎤 useTranscription: Grabación iniciada');
    } catch (error) {
      console.error('❌ useTranscription: Error iniciando grabación:', error);
      setIsRecording(false);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(() => {
    try {
      if (audioService) {
        audioService.stopRecording();
      }
      setIsRecording(false);
      console.log('⏹️ useTranscription: Grabación detenida');
    } catch (error) {
      console.error('❌ useTranscription: Error deteniendo grabación:', error);
    }
  }, []);

  const clearTranscriptions = useCallback(() => {
    setTranscriptions([]);
    console.log('🗑️ useTranscription: Transcripciones limpiadas');
  }, []);

  const addTranscription = useCallback((transcription: Transcription) => {
    setTranscriptions(prev => {
      const updated = [...prev, transcription];
      return updated.slice(-maxTranscriptions);
    });
  }, [maxTranscriptions]);

  const updateTranscription = useCallback((id: string, updates: Partial<Transcription>) => {
    setTranscriptions(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  }, []);

  const removeTranscription = useCallback((id: string) => {
    setTranscriptions(prev => prev.filter(t => t.id !== id));
  }, []);

  const autoCorrectSpeakers = useCallback(() => {
    setTranscriptions(prev => prev.map(t => {
      const text = t.text.toLowerCase();
      
      // Frases claramente del médico
      const doctorPhrases = ['mi nombre es', 'cuáles son los síntomas', 'podrías describir', 'desde cuándo'];
      // Frases claramente del paciente  
      const patientPhrases = ['me duele', 'siento', 'he notado', 'también noto', 'el dolor se siente'];
      
      const isDoctor = doctorPhrases.some(phrase => text.includes(phrase)) ||
                     (text.includes('?') && (text.includes('cómo') || text.includes('qué') || text.includes('dónde')));
      
      const isPatient = patientPhrases.some(phrase => text.includes(phrase)) ||
                      text.includes('dolor') || text.includes('sensibilidad');
      
      if (isDoctor && !isPatient) {
        return { ...t, speaker: 'medico' };
      } else if (isPatient && !isDoctor) {
        return { ...t, speaker: 'paciente' };
      }
      return t;
    }));
    console.log('🔄 useTranscription: Speakers auto-corregidos');
  }, []);

  const toggleSpeaker = useCallback((id: string) => {
    updateTranscription(id, {
      speaker: transcriptions.find(t => t.id === id)?.speaker === 'medico' ? 'paciente' : 'medico'
    });
  }, [transcriptions, updateTranscription]);

  return {
    transcriptions,
    isRecording,
    isConnected,
    transcriptionRef,
    startRecording,
    stopRecording,
    clearTranscriptions,
    addTranscription,
    updateTranscription,
    removeTranscription,
    autoCorrectSpeakers,
    toggleSpeaker
  };
};
