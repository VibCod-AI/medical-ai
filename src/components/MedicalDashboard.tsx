'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import socketService from '../services/socketService';
import audioService from '../services/audioService';
import {
  MedicalAnalysis,
  Transcription,
  FinalMedicalReport
  } from '../types/medical';
import { CreateMedicalReportData } from '../types/medical';

const MedicalDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<MedicalAnalysis | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [finalReport, setFinalReport] = useState<FinalMedicalReport | null>(null);
  const [showFinalReport, setShowFinalReport] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSavingSession, setIsSavingSession] = useState<boolean>(false);
  const [isSavingReport, setIsSavingReport] = useState<boolean>(false);
  const [isReportSaved, setIsReportSaved] = useState<boolean>(false);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; reportId?: string; error?: string } | null>(null);
  const [allSuggestedQuestions, setAllSuggestedQuestions] = useState<Array<{
    question: any;
    timestamp: string;
    analysis_id: string;
  }>>([]);
  const [sessionInfo, setSessionInfo] = useState<{
    phase: string;
    duration: string;
    transcriptions: number;
    analyses: number;
  } | null>(null);
  const transcriptionRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cache para muestras de audio recientes (para análisis de voz)
  const audioSamplesRef = useRef<{
    timestamp: number;
    audioData: Float32Array;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    features?: any;
  }[]>([]);
  
  // Tracking de speakers para detectar cambios
  const speakerTrackingRef = useRef<{
    lastSpeaker: string | null;
    speakerSequence: { speaker: string; timestamp: number; confidence: number }[];
    consecutiveCount: number;
  }>({
    lastSpeaker: null,
    speakerSequence: [],
    consecutiveCount: 0
  });
  
  // Estado para detección de silencio y transcripciones pendientes
  const [pendingTranscription, setPendingTranscription] = useState<string>('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAudioLevelRef = useRef<number>(0);
  const silenceStartRef = useRef<number>(0);
  const SILENCE_THRESHOLD = 0.01; // Umbral de silencio
  const SILENCE_DURATION = 1500; // 1.5 segundos de silencio antes de procesar

  // Función para mapear speaker usando estrategia del backend (Deepgram Diarization)
  const mapDeepgramSpeaker = React.useCallback((speakerNumber: number | undefined, transcript: string) => {
    console.log('🔍 Mapeando speaker con Deepgram:', { speakerNumber, transcript: transcript.substring(0, 50) + '...' });
    
    // Si no hay speaker number, hacer análisis de contenido básico
    if (speakerNumber === undefined || speakerNumber === null) {
      // Análisis de contenido simple para fallback
      const isQuestion = /\?|cuénteme|dígame|cómo|cuándo|dónde|qué|explique|tiene|siente|presenta/i.test(transcript);
      const isMedicalInstruction = /tome|prescribir|receta|medicamento|tratamiento|debe|voy a|le indico|recomiendo/i.test(transcript);
      
      if (isQuestion || isMedicalInstruction) {
        console.log('👨‍⚕️ Fallback: Clasificado como médico por contenido');
        return { 
          speaker_label: 'medico', 
          confidence: 0.7, 
          method: 'content_analysis_fallback' 
        };
      } else {
        console.log('🧑‍🦱 Fallback: Clasificado como paciente por contenido');
        return { 
          speaker_label: 'paciente', 
          confidence: 0.6, 
          method: 'content_analysis_fallback' 
        };
      }
    }
    
    // Mapeo fijo como en el backend (igual que server.ts líneas 63-70)
    const speakerMap: {[key: number]: 'medico' | 'paciente'} = {
      0: 'medico',   // Speaker 0 = Médico (👨‍⚕️)
      1: 'paciente', // Speaker 1 = Paciente (🧑‍🦱)
      // Speakers adicionales (2, 3, etc.) se consideran pacientes
    };
    
    const mappedSpeaker = speakerMap[speakerNumber] || 'paciente'; // Default a paciente para speakers adicionales
    
    console.log(`🎯 Speaker ${speakerNumber} → ${mappedSpeaker} (Deepgram diarization)`);
    
    return {
      speaker_label: mappedSpeaker,
      confidence: 0.9, // Alta confianza en diarización de Deepgram
      method: 'deepgram_diarization'
    };
  }, []);

  // Callback para capturar datos de audio del AudioService (usado en startSession)
  const handleAudioCapture = React.useCallback((audioData: Float32Array, timestamp: number) => {
    // Mantener solo las últimas 10 muestras para análisis
    audioSamplesRef.current = [
      ...audioSamplesRef.current.slice(-9),
      { timestamp, audioData: new Float32Array(audioData) }
    ];

    // DETECTAR NIVEL DE AUDIO para determinar silencio
    const audioLevel = Math.sqrt(audioData.reduce((sum, sample) => sum + sample * sample, 0) / audioData.length);
    lastAudioLevelRef.current = audioLevel;

    // Detectar si hay silencio o actividad de voz
    if (audioLevel < SILENCE_THRESHOLD) {
      // SILENCIO DETECTADO
      if (silenceStartRef.current === 0) {
        silenceStartRef.current = Date.now();
        console.log('🔇 SILENCIO iniciado');
      }

      // Si hay transcripción pendiente y ha pasado suficiente tiempo de silencio
      if (pendingTranscription && (Date.now() - silenceStartRef.current) >= SILENCE_DURATION) {
        console.log('⏱️ SILENCIO CONFIRMADO - Procesando transcripción pendiente:', pendingTranscription.substring(0, 50));
        
        // Procesar la transcripción pendiente como final
        processPendingTranscription();
      }
    } else {
      // ACTIVIDAD DE VOZ DETECTADA
      if (silenceStartRef.current > 0) {
        console.log('🎤 VOZ DETECTADA - Silencio interrumpido');
      }
      silenceStartRef.current = 0; // Reset silencio
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Función para procesar transcripción pendiente cuando hay silencio
  const processPendingTranscription = React.useCallback(() => {
    if (!pendingTranscription.trim()) return;

    console.log('🚀 PROCESANDO por SILENCIO:', pendingTranscription);
    
    const tempId = `${Date.now()}_${Math.random()}_silence_final`;
    
    // Crear transcripción final simulada
    const finalTranscription: Transcription = {
      id: tempId,
      speaker: 'unknown', // Temporal, se actualizará rápidamente
      text: pendingTranscription.trim(),
      timestamp: new Date().toLocaleTimeString(),
      confidence: 85, // Confianza media por detección de silencio
      is_final: true
    };

    // AGREGAR MENSAJE FINAL INMEDIATAMENTE a la UI
    setTranscriptions(prev => {
      const updated = [...prev, finalTranscription];
      console.log('✅ MENSAJE por SILENCIO AGREGADO:', pendingTranscription.substring(0, 50) + '...');
      return updated.slice(-25); // Mantener últimas 25 transcripciones
    });

    // IDENTIFICAR SPEAKER usando mapeo de Deepgram
    const speakerInfo = mapDeepgramSpeaker(0, pendingTranscription); // Default speaker 0 para silencio
    console.log('🎯 Identificación por SILENCIO completada:', speakerInfo.speaker_label, `(${speakerInfo.confidence.toFixed(2)})`);
    
    // ACTUALIZAR la transcripción con el speaker correcto
    setTranscriptions(prev => {
      const updatedList = prev.map(t => {
        if (t.id === tempId) {
          return {
            ...t,
            speaker: speakerInfo.speaker_label as 'medico' | 'paciente' | 'unknown',
            confidence: Math.round(speakerInfo.confidence * 100)
          };
        }
        return t;
      });
      
      console.log(`🔄 SPEAKER por SILENCIO ACTUALIZADO: ${speakerInfo.speaker_label} (${speakerInfo.method})`);
      return updatedList;
    });

    // Limpiar transcripción pendiente
    setPendingTranscription('');
    silenceStartRef.current = 0;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps



  // Función para crear un blob WAV a partir de datos PCM
  const createWavBlob = (pcmData: Int16Array, sampleRate: number): Blob => {
    const channels = 1;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = channels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = pcmData.length * bytesPerSample;
    const fileSize = 44 + dataSize;

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, fileSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // PCM data
    for (let i = 0; i < pcmData.length; i++) {
      view.setInt16(44 + i * 2, pcmData[i], true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  };

  // Función para obtener información de la sesión actual
  const fetchSessionInfo = async () => {
    try {
      const response = await fetch('/api/session-info');
      const data = await response.json();
      
      if (data.success && data.session_info) {
        setSessionInfo({
          phase: data.session_info.phase || 'listening',
          duration: data.session_info.duration || '0 minutos',
          transcriptions: data.session_info.transcriptions || 0,
          analyses: data.session_info.analyses || 0
        });
      }
    } catch (error) {
      console.error('Error obteniendo información de sesión:', error);
    }
  };

  useEffect(() => {
    // Conectar a WebSocket
    const connectSocket = async () => {
      try {
        const connected = await socketService.connect();
        setIsConnected(connected);
      } catch (error) {
        console.error('Error conectando WebSocket:', error);
        setIsConnected(false);
      }
    };


    connectSocket();
    
    // Obtener información inicial de sesión
    fetchSessionInfo();

    // Escuchar análisis médicos
    socketService.on('medical-analysis', (...args: unknown[]) => {
      const analysis = args[0] as MedicalAnalysis;
      console.log('📊 Nuevo análisis médico recibido:', analysis);
      
      // Acumular TODAS las preguntas sugeridas que aparecen
      if (analysis.suggested_questions && analysis.suggested_questions.length > 0) {
        const timestamp = new Date().toISOString();
        const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log(`💡 Acumulando ${analysis.suggested_questions.length} preguntas sugeridas del análisis ${analysisId}`);
        
        setAllSuggestedQuestions(prev => {
          const newQuestions = analysis.suggested_questions.map(question => ({
            question,
            timestamp,
            analysis_id: analysisId
          }));
          
          const updated = [...prev, ...newQuestions];
          console.log(`📝 Total preguntas acumuladas: ${updated.length}`);
          return updated;
        });
      }
      
      setCurrentAnalysis(analysis);
      
      // Actualizar información de sesión cuando llegue un nuevo análisis
      fetchSessionInfo();
    });

    socketService.on('final-report-generated', (...args: unknown[]) => {
      const report = args[0] as FinalMedicalReport;
      console.log('📋 Informe final recibido:', report);
      setFinalReport(report);
      setIsGeneratingReport(false);
      setIsReportSaved(false); // Reset estado de guardado para nuevo reporte
      setShowFinalReport(true);
    });

    // Escuchar transcripciones en tiempo real del backend
    socketService.on('transcription-update', (...args: unknown[]) => {
      const transcription = args[0] as {
        is_final: boolean;
        transcript: string;
        speaker: number;
        confidence: number;
      };
      console.log('🎧 RECIBIDO transcription-update:', transcription);
      
      // MANEJO DE TRANSCRIPCIONES: Finales + Intermedias (para detección de silencio)
      if (transcription.transcript.trim()) {
        if (transcription.is_final) {
          // MENSAJE FINAL RECIBIDO de Deepgram
          const tempId = `${Date.now()}_${Math.random()}_deepgram_final`;
          
          console.log('📝 MENSAJE FINAL de Deepgram:', transcription.transcript);
          
          // Limpiar transcripción pendiente ya que llegó una final
          setPendingTranscription('');
          silenceStartRef.current = 0;
          
          // Crear transcripción final con speaker por defecto
          const finalTranscription: Transcription = {
            id: tempId,
            speaker: 'unknown', // Temporal, se actualizará rápidamente
          text: transcription.transcript,
          timestamp: new Date().toLocaleTimeString(),
          confidence: Math.round(transcription.confidence * 100),
            is_final: true
        };
        
          // AGREGAR MENSAJE FINAL INMEDIATAMENTE a la UI
        setTranscriptions(prev => {
            const updated = [...prev, finalTranscription];
            console.log('✅ MENSAJE FINAL AGREGADO:', transcription.transcript.substring(0, 50) + '...');
            return updated.slice(-25); // Mantener últimas 25 transcripciones
          });

          // IDENTIFICAR SPEAKER usando mapeo de Deepgram (directamente del transcription.speaker)
          const speakerInfo = mapDeepgramSpeaker(transcription.speaker, transcription.transcript);
          console.log('🎯 Identificación Deepgram completada:', speakerInfo.speaker_label, `(${speakerInfo.confidence.toFixed(2)})`);
          
          // ACTUALIZAR la transcripción con el speaker correcto
          setTranscriptions(prev => {
            const updatedList = prev.map(t => {
              if (t.id === tempId) {
                return {
                  ...t,
                  speaker: speakerInfo.speaker_label as 'medico' | 'paciente' | 'unknown',
                  confidence: Math.round(speakerInfo.confidence * 100)
                };
              }
              return t;
            });
            
            console.log(`🔄 SPEAKER Deepgram ACTUALIZADO: ${speakerInfo.speaker_label} (${speakerInfo.method})`);
            return updatedList;
          });

        } else {
          // TRANSCRIPCIÓN INTERMEDIA - Acumular para detección de silencio
          console.log('⏳ Intermedia ACUMULADA:', transcription.transcript.substring(0, 50) + '...');
          
          // Actualizar transcripción pendiente (la más reciente sobrescribe)
          setPendingTranscription(transcription.transcript);
          
          // Reset timer de silencio porque hay nueva actividad de transcripción
          silenceStartRef.current = 0;
        }
      }
    });

    return () => {
      socketService.off('medical-analysis');
      socketService.off('transcription-update');
      socketService.off('final-report-generated');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Limpiar audio service si está grabando
      if (isRecording && audioService) {
        audioService.stopRecording();
      }
    };
  }, [isRecording, user, mapDeepgramSpeaker]);

  // Auto-scroll en transcripciones
  useEffect(() => {
    if (transcriptionRef.current) {
      transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight;
    }
  }, [transcriptions]);

  const startSession = async () => {
    // Ya no necesitamos verificar calibración - usando Deepgram diarization

    try {
      if (!audioService) {
        throw new Error('AudioService no disponible');
      }

      setIsRecording(true);
      setSessionTime(0);
      setTranscriptions([]);
      setCurrentAnalysis(null);
      setAllSuggestedQuestions([]); // Limpiar preguntas acumuladas de sesiones anteriores
      setPendingTranscription(''); // Limpiar transcripción pendiente
      silenceStartRef.current = 0; // Reset detección de silencio
      audioSamplesRef.current = []; // Limpiar muestras anteriores
      
      // Configurar callback de detección de silencio ANTES de inicializar
      audioService.setAudioDataCallback(handleAudioCapture);
      
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
      
      // Iniciar timer
      timerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);

      console.log('✅ Consulta médica iniciada con captura de audio');
      console.log('🔇 DETECCIÓN DE SILENCIO activada - Procesará transcripciones tras', SILENCE_DURATION + 'ms de silencio');
      
    } catch (error) {
      console.error('❌ Error iniciando consulta:', error);
      setIsRecording(false);
      alert('Error iniciando consulta: ' + (error as Error).message);
    }
  };

  const stopSession = async () => {
    setIsRecording(false);
    
    // Detener grabación de audio
    if (audioService) {
      audioService.stopRecording();
      // Limpiar callback de detección de silencio
      audioService.setAudioDataCallback(() => {});
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Limpiar estado de detección de silencio
    setPendingTranscription('');
    silenceStartRef.current = 0;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // Auto-guardar reporte médico si hay contenido
    if (transcriptions.length > 0 || currentAnalysis) {
      console.log('💾 Auto-guardando reporte médico al finalizar consulta...');
      setIsSavingReport(true);
      
      try {
        const result = await saveCurrentReport();
        setSaveResult(result);
        setShowSaveModal(true);
        
        if (result.success) {
          console.log('✅ Reporte médico auto-guardado exitosamente:', result.reportId);
        } else {
          console.error('❌ Error auto-guardando reporte:', result.error);
        }
      } catch (error) {
        console.error('❌ Error inesperado auto-guardando reporte:', error);
        setSaveResult({
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
        setShowSaveModal(true);
      } finally {
        setIsSavingReport(false);
      }
    }

    console.log('⏹️ Consulta médica finalizada');
    console.log('🔇 DETECCIÓN DE SILENCIO desactivada');
  };

  // Función para guardar sesión médica
  const saveCurrentSession = async () => {
    if (!user || isSavingSession) return;

    setIsSavingSession(true);
    
    try {
      const sessionData = {
        duration: sessionTime,
        timestamp: new Date().toISOString(),
        user_info: {
          id: user.id,
          email: user.email,
          name: profile?.full_name || user.email,
          role: profile?.role || 'patient'
        }
      };

      const response = await fetch('/api/medical-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: user.id,
          session_data: sessionData,
          transcriptions: transcriptions,
          analyses: currentAnalysis ? [currentAnalysis] : [],
          final_report: finalReport,
          status: finalReport ? 'completed' : 'active'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCurrentSessionId(result.session.id);
        console.log('✅ Sesión guardada:', result.session.id);
      } else {
        console.error('❌ Error guardando sesión:', result.error);
      }
    } catch (error) {
      console.error('❌ Error guardando sesión:', error);
    } finally {
      setIsSavingSession(false);
    }
  };

  // Función para guardar solo el reporte final
  const saveFinalReport = async () => {
    if (!user || !finalReport || isSavingReport) return;

    setIsSavingReport(true);
    
    try {
      // Si ya existe una sesión, actualizar con el reporte final
      if (currentSessionId) {
        const response = await fetch(`/api/medical-sessions/${currentSessionId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            final_report: finalReport,
            status: 'completed'
          }),
        });

        const result = await response.json();

        if (result.success) {
          setIsReportSaved(true);
          console.log('✅ Reporte final guardado en sesión existente:', currentSessionId);
        } else {
          console.error('❌ Error actualizando sesión con reporte:', result.error);
        }
      } else {
        // Crear nueva sesión solo para el reporte
        const sessionData = {
          duration: sessionTime,
          timestamp: new Date().toISOString(),
          user_info: {
            id: user.id,
            email: user.email,
            name: profile?.full_name || user.email,
            role: profile?.role || 'patient'
          },
          report_only: true // Marcador para indicar que es solo reporte
        };

        const response = await fetch('/api/medical-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patient_id: user.id,
            session_data: sessionData,
            transcriptions: transcriptions,
            analyses: currentAnalysis ? [currentAnalysis] : [],
            final_report: finalReport,
            status: 'completed'
          }),
        });

        const result = await response.json();

        if (result.success) {
          setCurrentSessionId(result.session.id);
          setIsReportSaved(true);
          console.log('✅ Reporte final guardado en nueva sesión:', result.session.id);
        } else {
          console.error('❌ Error guardando reporte:', result.error);
        }
      }
    } catch (error) {
      console.error('❌ Error guardando reporte final:', error);
    } finally {
      setIsSavingReport(false);
    }
  };

  // Función para guardar reporte médico
  const saveCurrentReport = async (): Promise<{ success: boolean; reportId?: string; error?: string }> => {
    try {
      console.log('🚀 Iniciando saveCurrentReport...');
      console.log('👤 Usuario actual:', user ? user.id : 'NO USER');
      console.log('📝 Transcripciones:', transcriptions.length);
      
      if (!user) {
        console.error('❌ No hay usuario autenticado');
        return { success: false, error: 'No hay usuario autenticado. Por favor, inicia sesión nuevamente.' };
      }

      if (transcriptions.length === 0) {
        console.error('❌ No hay transcripciones para guardar');
        return { success: false, error: 'No hay transcripciones para guardar' };
      }

      // Generar session_id único si no existe
      const sessionId = currentSessionId || `session_${Date.now()}_${user.id}`;
      
      // Preparar datos del reporte con validación extra
      const reportData: CreateMedicalReportData = {
        session_id: sessionId,
        session_duration: sessionInfo?.duration || `${Math.round(sessionTime / 60)} minutos`,
        total_transcriptions: transcriptions.length,
        consultation_phase: sessionInfo?.phase || 'listening',
        
        // Datos de la consulta
        transcriptions: transcriptions,
        medical_analysis: currentAnalysis,
        
        // Datos estructurados del análisis
        symptoms: currentAnalysis?.symptoms || [],
        diagnoses: currentAnalysis?.diagnoses || [],
        recommendations: currentAnalysis?.recommendations || [],
        red_flags: currentAnalysis?.red_flags || [],
        follow_up: currentAnalysis?.follow_up || [],
        alternative_treatments: currentAnalysis?.alternative_treatments || [],
        emergency_criteria: currentAnalysis?.emergency_criteria || [],
        suggested_questions: allSuggestedQuestions.map(item => ({
          ...item.question,
          generated_at: item.timestamp,
          analysis_id: item.analysis_id
        })), // TODAS las preguntas sugeridas acumuladas durante la consulta
        
        // Resumen y metadatos
        summary: currentAnalysis?.summary || null,
        confidence_level: currentAnalysis?.confidence_level || null,
        requires_immediate_attention: currentAnalysis?.requires_immediate_attention || false,
        
        // Informe final si existe
        final_report: finalReport,
        
        // Metadatos adicionales
        tags: currentAnalysis?.requires_immediate_attention ? ['urgente'] : [],
        notes: `Consulta médica - ${new Date().toLocaleDateString()}`
      };

      console.log('💾 Guardando reporte médico...', { 
        sessionId, 
        transcriptions: transcriptions.length,
        userId: user.id,
        hasAnalysis: !!currentAnalysis,
        totalSuggestedQuestions: allSuggestedQuestions.length,
        currentQuestions: currentAnalysis?.suggested_questions?.length || 0
      });
      
      console.log(`📝 PREGUNTAS ACUMULADAS: ${allSuggestedQuestions.length} preguntas de ${new Set(allSuggestedQuestions.map(q => q.analysis_id)).size} análisis diferentes`);

      // Llamar al API endpoint
      const response = await fetch('/api/medical-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      const result = await response.json();
      
      if (result.success && result.report) {
        console.log('✅ Reporte médico guardado exitosamente:', result.report.id);
        setCurrentSessionId(result.report.id);
        return { success: true, reportId: result.report.id };
      } else {
        console.error('❌ Error guardando reporte:', result.error);
        return { success: false, error: result.error || 'Error desconocido del servidor' };
      }

    } catch (error) {
      console.error('❌ Error en saveCurrentReport:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error de conexión' 
      };
    }
  };

  const generateFinalReport = async () => {
    if (transcriptions.length < 4) {
      alert('La consulta es muy corta para generar un informe completo. Necesita al menos 4 intercambios.');
      return;
    }

    setIsGeneratingReport(true);
    
    try {
      const response = await fetch('/api/generate-final-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        // El informe se recibe por WebSocket (final-report-generated)
        console.log('✅ Informe final solicitado exitosamente');
      } else {
        setIsGeneratingReport(false);
        alert(data.message || 'Error generando informe final');
      }
    } catch (error) {
      setIsGeneratingReport(false);
      console.error('Error generando informe:', error);
      alert('Error de conexión al generar informe');
    }
  };



  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'leve': return '#10b981';
      case 'moderado': return '#f59e0b';
      case 'severo': return '#ef4444';
      case 'critico': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'baja': return '#10b981';
      case 'media': return '#f59e0b';
      case 'alta': return '#ef4444';
      case 'urgente': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'bajo': return '#10b981';
      case 'medio': return '#f59e0b';
      case 'alto': return '#ef4444';
      case 'critico': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto',
      fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      background: 'transparent'
    }}>
      {/* Controles */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!isRecording ? (
            <button
              onClick={startSession}
              disabled={!isConnected}
              style={{
                background: isConnected ? 'linear-gradient(135deg, #5B9CFF 0%, #4A90E2 100%)' : 'rgba(108, 108, 112, 0.5)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '20px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: isConnected ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: isConnected ? '0 4px 14px rgba(91, 156, 255, 0.3)' : 'none'
              }}
            >
              Iniciar Consulta
            </button>
          ) : (
            <button
              onClick={stopSession}
              disabled={isSavingSession || isSavingReport}
              style={{
                background: (isSavingSession || isSavingReport) ? 'rgba(108, 108, 112, 0.5)' : 'linear-gradient(135deg, #FF6B6B 0%, #E74C3C 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '20px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: (isSavingSession || isSavingReport) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: !(isSavingSession || isSavingReport) ? '0 4px 14px rgba(255, 107, 107, 0.3)' : 'none'
              }}
            >
              {isSavingReport ? '💾 Guardando Reporte...' : isSavingSession ? 'Finalizando...' : 'Finalizar Consulta'}
            </button>
          )}
          
          <div style={{
            padding: '12px 20px',
            background: isRecording ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'rgba(108, 108, 112, 0.1)',
            color: isRecording ? 'white' : '#6C6C70',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            backdropFilter: 'blur(10px)',
            border: isRecording ? 'none' : '1px solid rgba(108, 108, 112, 0.2)'
          }}>
            {isRecording ? 'GRABANDO' : 'DETENIDO'}
          </div>
          
           {/* Botón Guardar Reporte */}
           {!isRecording && transcriptions.length > 0 && (
             <button
               onClick={async () => {
                 setIsSavingReport(true);
                 try {
                   const result = await saveCurrentReport();
                   if (result.success) {
                     alert('✅ Reporte guardado exitosamente.\n\nPuedes verlo en la sección "Reportes".');
                   } else {
                     alert(`❌ Error guardando reporte: ${result.error}`);
                   }
                 } catch (error) {
                   console.error('❌ Error inesperado:', error);
                   alert(`❌ Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
                 } finally {
                   setIsSavingReport(false);
                 }
               }}
               disabled={isSavingReport}
               style={{
                 background: isSavingReport ? '#9ca3af' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                 color: 'white',
                 border: 'none',
                 borderRadius: '12px',
                 padding: '14px 24px',
                 fontSize: '15px',
                 fontWeight: '600',
                 cursor: isSavingReport ? 'not-allowed' : 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '8px',
                 boxShadow: !isSavingReport ? '0 4px 14px rgba(16, 185, 129, 0.3)' : 'none',
                 transition: 'all 0.2s ease'
               }}
               onMouseEnter={(e) => {
                 if (!isSavingReport) {
                   e.currentTarget.style.transform = 'translateY(-1px)';
                   e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                 }
               }}
               onMouseLeave={(e) => {
                 if (!isSavingReport) {
                   e.currentTarget.style.transform = 'translateY(0)';
                   e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.3)';
                 }
               }}
             >
               {isSavingReport ? '💾 Guardando...' : '💾 Guardar Reporte'}
             </button>
           )}

           {/* Botón Generar Informe Final */}
           {!isRecording && transcriptions.length >= 4 && (
             <button
               onClick={generateFinalReport}
               disabled={isGeneratingReport}
               style={{
                 background: isGeneratingReport ? '#9ca3af' : '#7c3aed',
                 color: 'white',
                 border: 'none',
                 padding: '12px 24px',
                 borderRadius: '8px',
                 fontSize: '16px',
                 fontWeight: '600',
                 cursor: isGeneratingReport ? 'not-allowed' : 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '8px'
               }}
             >
               {isGeneratingReport ? '⏳ Generando...' : '📋 Generar Informe Final'}
             </button>
           )}

          <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#6b7280' }}>
            Transcripciones: {transcriptions.length}
          </div>
        </div>
      </div>

      {/* Layout principal - 6 paneles */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gridTemplateRows: '1fr 1fr', 
        gap: '16px', 
        height: '800px',
        marginBottom: '20px'
      }}>
        
        {/* Panel de Transcripciones */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '20px', 
            fontWeight: '600',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💬 Transcripción en Tiempo Real
          </h2>
          
          <div 
            ref={transcriptionRef}
            style={{
              height: '400px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              background: '#f9fafb'
            }}
          >
            {transcriptions.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#9ca3af', 
                marginTop: '120px',
                fontSize: '14px'
              }}>
                📝 Las transcripciones aparecerán aquí en tiempo real
              </div>
            ) : (
              transcriptions.map((transcription) => (
                <div
                  key={transcription.id}
                  style={{
                    marginBottom: '16px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: transcription.speaker === 'medico' ? '#eff6ff' : '#f0fdf4',
                    border: `1px solid ${transcription.speaker === 'medico' ? '#dbeafe' : '#dcfce7'}`,
                    opacity: transcription.is_final === false ? 0.6 : 1, // Transcripciones intermedias más transparentes
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '6px'
                  }}>
                    <span style={{ 
                      fontWeight: '600',
                      color: transcription.speaker === 'medico' ? '#1d4ed8' : '#059669',
                      fontSize: '14px'
                    }}>
                      {transcription.speaker === 'medico' ? '👨‍⚕️ Médico' : '🧑‍🦱 Paciente'}
                    </span>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#6b7280' 
                    }}>
                      {transcription.timestamp} • {transcription.confidence}%
                    </span>
                  </div>
                  <div style={{ 
                    color: '#374151',
                    lineHeight: '1.5',
                    fontStyle: transcription.is_final === false ? 'italic' : 'normal'
                  }}>
                    {transcription.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel de Análisis Médico */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '20px', 
              fontWeight: '600',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🧠 Análisis Médico IA
            </h2>
            
            {/* Indicador de Fase de Consulta */}
            {currentAnalysis && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#0369a1'
              }}>
                <span>📋</span>
                <span>
                  {(() => {
                    const phaseMap: { [key: string]: string } = {
                      'listening': '🔇 Escuchando',
                      'exploring': '🔍 Explorando',
                      'differential': '🎯 Diagnóstico Diferencial',
                      'confirmation': '✅ Confirmación'
                    };
                    return sessionInfo ? phaseMap[sessionInfo.phase] || 'Fase Activa' : 'Iniciando...';
                  })()}
                </span>
              </div>
            )}
          </div>

          {!currentAnalysis ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#9ca3af', 
              marginTop: '120px',
              fontSize: '14px'
            }}>
              🔬 El análisis aparecerá después de algunas transcripciones
            </div>
          ) : (
            <div style={{ height: '400px', overflowY: 'auto' }}>
              
              {/* Red Flags */}
              {currentAnalysis.red_flags.length > 0 && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    🚨 Alertas Críticas
                  </h3>
                  {currentAnalysis.red_flags.map((flag, index) => (
                    <div key={index} style={{ marginBottom: '8px' }}>
                      <div style={{ fontWeight: '500', color: '#dc2626', fontSize: '14px' }}>
                        {flag.alert}
                      </div>
                      <div style={{ fontSize: '12px', color: '#991b1b', marginTop: '4px' }}>
                        Acción: {flag.action_required}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Síntomas */}
              {currentAnalysis.symptoms.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    📋 Síntomas Detectados
                  </h3>
                  {currentAnalysis.symptoms.map((symptom, index) => (
                    <div 
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: '#f9fafb',
                        borderRadius: '6px',
                        marginBottom: '6px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>{symptom.name}</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span 
                          style={{ 
                            fontSize: '12px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: getSeverityColor(symptom.severity),
                            color: 'white',
                            fontWeight: '500'
                          }}
                        >
                          {symptom.severity}
                        </span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {Math.round(symptom.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Diagnósticos */}
              {currentAnalysis.diagnoses.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    🔍 Diagnósticos Probables
                  </h3>
                  {currentAnalysis.diagnoses.map((diagnosis, index) => (
                    <div 
                      key={index}
                      style={{
                        padding: '12px',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px'
                      }}>
                        <span style={{ fontWeight: '500', fontSize: '14px' }}>
                          {diagnosis.name}
                        </span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span 
                            style={{ 
                              fontSize: '12px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: getRiskColor(diagnosis.risk_level),
                              color: 'white',
                              fontWeight: '500'
                            }}
                          >
                            {diagnosis.risk_level}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: '600' }}>
                            {Math.round(diagnosis.probability * 100)}%
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Síntomas: {diagnosis.supporting_symptoms.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recomendaciones */}
              {currentAnalysis.recommendations.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    💡 Recomendaciones
                  </h3>
                  {currentAnalysis.recommendations.map((rec, index) => (
                    <div 
                      key={index}
                      style={{
                        padding: '12px',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px'
                      }}>
                        <span style={{ 
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          fontWeight: '600',
                          color: '#6b7280'
                        }}>
                          {rec.type}
                        </span>
                        <span 
                          style={{ 
                            fontSize: '12px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: getPriorityColor(rec.priority),
                            color: 'white',
                            fontWeight: '500'
                          }}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                        {rec.description}
                      </div>
                      
                      {/* Detalles de medicamento si está disponible */}
                      {rec.medication && (
                        <div style={{
                          background: '#ecfdf5',
                          border: '1px solid #d1fae5',
                          borderRadius: '6px',
                          padding: '12px',
                          margin: '8px 0',
                          fontSize: '13px'
                        }}>
                          <div style={{ fontWeight: '600', color: '#059669', marginBottom: '8px' }}>
                            💊 {rec.medication.name}
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <strong>Dosis:</strong> {rec.medication.dosage}
                            </div>
                            <div>
                              <strong>Frecuencia:</strong> {rec.medication.frequency}
                            </div>
                            <div>
                              <strong>Duración:</strong> {rec.medication.duration}
                            </div>
                            <div>
                              <strong>Vía:</strong> {rec.medication.route}
                            </div>
                          </div>
                          
                          {rec.medication.instructions && (
                            <div style={{ marginTop: '8px', color: '#065f46' }}>
                              <strong>📋 Instrucciones:</strong> {rec.medication.instructions}
                            </div>
                          )}
                          
                          {rec.medication.contraindications && rec.medication.contraindications.length > 0 && (
                            <div style={{ marginTop: '8px', color: '#dc2626' }}>
                              <strong>⚠️ Contraindicaciones:</strong> {rec.medication.contraindications.join(', ')}
                            </div>
                          )}
                          
                          {rec.medication.side_effects && rec.medication.side_effects.length > 0 && (
                            <div style={{ marginTop: '8px', color: '#d97706' }}>
                              <strong>👁️ Vigilar:</strong> {rec.medication.side_effects.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {rec.timeline && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#7c3aed', 
                          fontWeight: '500',
                          marginTop: '4px'
                        }}>
                          ⏰ {rec.timeline}
                        </div>
                      )}
                      
                      <div style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                        {rec.reasoning}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Resumen */}
              {currentAnalysis.summary && (
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: '#0369a1'
                  }}>
                    📄 Resumen
                  </h3>
                  <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#374151' }}>
                    {currentAnalysis.summary}
                  </div>
                  <div style={{ 
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    Confianza: {Math.round(currentAnalysis.confidence_level * 100)}%
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel de Seguimiento */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'auto'
        }}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#374151'
          }}>
            📅 Seguimiento
          </h2>

          {!currentAnalysis || currentAnalysis.follow_up.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#9ca3af', 
              fontSize: '14px',
              marginTop: '60px'
            }}>
              📋 Recomendaciones de seguimiento aparecerán aquí
            </div>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {currentAnalysis.follow_up.map((followUp, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ 
                    fontWeight: '600', 
                    fontSize: '14px',
                    color: '#1e40af',
                    marginBottom: '4px'
                  }}>
                    {followUp.type === 'control_medico' && '👩‍⚕️ Control Médico'}
                    {followUp.type === 'laboratorio' && '🧪 Laboratorio'}
                    {followUp.type === 'imagen' && '📸 Estudios por Imagen'}
                    {followUp.type === 'especialista' && '🏥 Especialista'}
                    {followUp.type === 'autocuidado' && '🏠 Autocuidado'}
                  </div>
                  <div style={{ fontSize: '13px', marginBottom: '6px' }}>
                    {followUp.description}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#059669',
                    fontWeight: '500'
                  }}>
                    ⏰ {followUp.timeframe}
                  </div>
                  {followUp.specific_instructions && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6b7280',
                      marginTop: '4px',
                      fontStyle: 'italic'
                    }}>
                      📋 {followUp.specific_instructions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel de Tratamientos Alternativos */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'auto'
        }}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#374151'
          }}>
            🌿 Tratamientos Alternativos
          </h2>

          {!currentAnalysis || currentAnalysis.alternative_treatments.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#9ca3af', 
              fontSize: '14px',
              marginTop: '60px'
            }}>
              🌱 Opciones de tratamiento no farmacológico aparecerán aquí
            </div>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {currentAnalysis.alternative_treatments.map((treatment, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '12px',
                    background: '#f0fdf4',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: '1px solid #bbf7d0'
                  }}
                >
                  <div style={{ 
                    fontWeight: '600', 
                    fontSize: '14px',
                    color: '#059669',
                    marginBottom: '4px'
                  }}>
                    {treatment.type === 'terapia_fisica' && '🏃‍♂️ Terapia Física'}
                    {treatment.type === 'nutricional' && '🥗 Nutricional'}
                    {treatment.type === 'psicologica' && '🧠 Psicológica'}
                    {treatment.type === 'lifestyle' && '🌟 Estilo de Vida'}
                    {treatment.type === 'complementaria' && '🌿 Complementaria'}
                  </div>
                  <div style={{ fontSize: '13px', marginBottom: '6px' }}>
                    {treatment.description}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                    📋 {treatment.instructions}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                    <span style={{ 
                      color: treatment.effectiveness === 'alta' ? '#059669' : 
                             treatment.effectiveness === 'media' ? '#d97706' : '#9ca3af'
                    }}>
                      💪 Efectividad: {treatment.effectiveness}
                    </span>
                    <span style={{ color: '#6b7280' }}>
                      ⏱️ {treatment.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel de Criterios de Emergencia */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'auto'
        }}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#374151'
          }}>
            🚨 Criterios de Emergencia
          </h2>

          {!currentAnalysis || currentAnalysis.emergency_criteria.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#9ca3af', 
              fontSize: '14px',
              marginTop: '60px'
            }}>
              🔴 Criterios de emergencia aparecerán aquí
            </div>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {currentAnalysis.emergency_criteria.map((criteria, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '12px',
                    background: criteria.time_frame === 'inmediato' ? '#fef2f2' : 
                               criteria.time_frame === '1-2_horas' ? '#fff7ed' : '#fefce8',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: criteria.time_frame === 'inmediato' ? '1px solid #fecaca' :
                            criteria.time_frame === '1-2_horas' ? '1px solid #fed7aa' : '1px solid #fef3c7'
                  }}
                >
                  <div style={{ 
                    fontWeight: '600', 
                    fontSize: '14px',
                    color: criteria.time_frame === 'inmediato' ? '#dc2626' :
                           criteria.time_frame === '1-2_horas' ? '#ea580c' : '#d97706',
                    marginBottom: '4px'
                  }}>
                    🚨 {criteria.symptom}
                  </div>
                  <div style={{ fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>
                    Umbral: {criteria.severity_threshold}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    {criteria.reasoning}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '600',
                    color: criteria.action === 'llamar_911' ? '#dc2626' :
                           criteria.action === 'ir_emergencias' ? '#ea580c' : '#d97706'
                  }}>
                    {criteria.action === 'llamar_911' && '📞 LLAMAR 911'}
                    {criteria.action === 'ir_emergencias' && '🏥 IR A EMERGENCIAS'}
                    {criteria.action === 'contactar_medico' && '📱 CONTACTAR MÉDICO'}
                    {' - '}
                    {criteria.time_frame === 'inmediato' && 'INMEDIATO'}
                    {criteria.time_frame === '1-2_horas' && 'EN 1-2 HORAS'}
                    {criteria.time_frame === '24_horas' && 'EN 24 HORAS'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel de Preguntas Sugeridas */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '20px', 
            fontWeight: '600',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ❓ Preguntas Sugeridas
          </h2>

          {!currentAnalysis || currentAnalysis.suggested_questions.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#9ca3af', 
              marginTop: '120px',
              fontSize: '14px'
            }}>
              💡 Las preguntas aparecerán después del análisis médico
            </div>
          ) : (
            <div style={{ height: '400px', overflowY: 'auto' }}>
              {currentAnalysis.suggested_questions
                .sort((a, b) => {
                  const priorityOrder = { 'alta': 3, 'media': 2, 'baja': 1 };
                  return priorityOrder[b.priority] - priorityOrder[a.priority];
                })
                .map((question) => (
                  <div 
                    key={question.id}
                    style={{
                      padding: '16px',
                      background: '#f9fafb',
                      borderRadius: '12px',
                      marginBottom: '12px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                    onClick={() => {
                      // Copiar pregunta al clipboard
                      navigator.clipboard.writeText(question.question);
                      alert('Pregunta copiada al portapapeles');
                    }}
                  >
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        fontWeight: '600',
                        color: '#6b7280',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center'
                      }}>
                        {question.category === 'sintoma' && '🔍 Síntoma'}
                        {question.category === 'antecedente' && '📋 Antecedente'}
                        {question.category === 'examen_fisico' && '👩‍⚕️ Examen'}
                        {question.category === 'descarte' && '❌ Descarte'}
                        {question.category === 'seguimiento' && '🔄 Seguimiento'}
                      </div>
                      <span 
                        style={{ 
                          fontSize: '12px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: getPriorityColor(question.priority || 'baja'),
                          color: 'white',
                          fontWeight: '500'
                        }}
                      >
                        {(question.priority || 'BAJA').toUpperCase()}
                      </span>
                    </div>

                    <div style={{ 
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      color: '#374151',
                      lineHeight: '1.4'
                    }}>
                      {question.question}
                    </div>

                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6b7280',
                      fontStyle: 'italic',
                      lineHeight: '1.3'
                    }}>
                      {question.reasoning}
                    </div>

                    {question.target_diagnosis && (
                      <div style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#059669',
                        background: '#d1fae5',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}>
                        Descarte: {question.target_diagnosis}
                      </div>
                    )}

                    <div style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      color: '#9ca3af',
                      textAlign: 'center'
                    }}>
                      💡 Click para copiar pregunta
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Guardado Automático */}
      {showSaveModal && saveResult && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            textAlign: 'center'
          }}>
            {/* Icono y título */}
            <div style={{
              fontSize: '64px',
              marginBottom: '16px'
            }}>
              {saveResult.success ? '✅' : '❌'}
            </div>
            
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: saveResult.success ? '#059669' : '#dc2626',
              marginBottom: '16px'
            }}>
              {saveResult.success ? '¡Reporte Guardado!' : 'Error al Guardar'}
            </h2>
            
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              lineHeight: '1.5',
              marginBottom: '24px'
            }}>
              {saveResult.success 
                ? 'Tu consulta médica ha sido guardada exitosamente. Puedes encontrarla en la sección "Reportes".'
                : `Hubo un problema al guardar el reporte: ${saveResult.error}`
              }
            </p>
            
            {/* Información adicional si fue exitoso */}
            {saveResult.success && saveResult.reportId && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '24px'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#059669',
                  fontWeight: '600'
                }}>
                  📋 ID del Reporte: {saveResult.reportId.substring(0, 8)}...
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#065f46',
                  marginTop: '4px'
                }}>
                  {transcriptions.length} transcripciones • {currentAnalysis ? 'Con análisis IA' : 'Sin análisis'}
                </div>
              </div>
            )}
            
            {/* Botones */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {saveResult.success && (
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    // Navegar a reportes
                    window.location.href = '/medical?section=reportes';
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  📊 Ver Reportes
                </button>
              )}
              
              {!saveResult.success && (
                <button
                  onClick={async () => {
                    setShowSaveModal(false);
                    // Intentar guardar nuevamente
                    setIsSavingReport(true);
                    try {
                      const result = await saveCurrentReport();
                      setSaveResult(result);
                      setShowSaveModal(true);
                    } catch (error) {
                      setSaveResult({
                        success: false,
                        error: error instanceof Error ? error.message : 'Error desconocido'
                      });
                      setShowSaveModal(true);
                    } finally {
                      setIsSavingReport(false);
                    }
                  }}
                  disabled={isSavingReport}
                  style={{
                    background: isSavingReport ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isSavingReport ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isSavingReport ? '⏳ Reintentando...' : '🔄 Reintentar'}
                </button>
              )}
              
              <button
                onClick={() => setShowSaveModal(false)}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                }}
              >
                {saveResult.success ? '✅ Entendido' : '❌ Cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal del Informe Final */}
      {showFinalReport && finalReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '1200px',
            maxHeight: '90vh',
            width: '100%',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Header del Informe */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '24px',
              borderRadius: '16px 16px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                  📋 Informe Médico Final
                </h1>
                <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                  ID: {finalReport.patient_info.session_id} | {finalReport.patient_info.duration}
                </p>
              </div>
              <button
                onClick={() => setShowFinalReport(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Contenido del Informe */}
            <div style={{ padding: '24px' }}>
              
              {/* Resumen Ejecutivo */}
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ color: '#1f2937', marginBottom: '12px', fontSize: '20px' }}>
                  📄 Resumen Ejecutivo
                </h2>
                <div style={{
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  {finalReport.executive_summary}
                </div>
                <div style={{ 
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#6b7280',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Confianza General: {Math.round(finalReport.overall_confidence * 100)}%</span>
                  <span>
                    {finalReport.requires_immediate_attention ? 
                      '🚨 REQUIERE ATENCIÓN INMEDIATA' : 
                      '✅ Evolución Normal'
                    }
                  </span>
                </div>
              </div>

              {/* Grid de 2 columnas para el contenido */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                
                {/* Columna Izquierda */}
                <div>
                  
                  {/* Síntomas */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: '#1f2937', marginBottom: '12px', fontSize: '18px' }}>
                      🔬 Síntomas Identificados
                    </h3>
                    {finalReport.symptoms_report.map((symptom, index) => (
                      <div key={index} style={{
                        background: '#fef3c7',
                        border: '1px solid #f59e0b',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '8px'
                      }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                          👤 Para el paciente: {symptom.normal_language}
                        </div>
                        <div style={{ fontSize: '13px', color: '#7c2d12', marginBottom: '4px' }}>
                          🏥 Técnico: {symptom.technical_language}
                        </div>
                        {symptom.cie10_code && (
                          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>
                            📋 CIE-10: {symptom.cie10_code}
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                          Severidad: {symptom.severity} | Confianza: {Math.round(symptom.confidence * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Diagnósticos */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: '#1f2937', marginBottom: '12px', fontSize: '18px' }}>
                      🎯 Diagnósticos
                    </h3>
                    {finalReport.diagnoses_report.map((diagnosis, index) => (
                      <div key={index} style={{
                        background: '#dbeafe',
                        border: '1px solid #3b82f6',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '8px'
                      }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                          👤 Para el paciente: {diagnosis.normal_language}
                        </div>
                        <div style={{ fontSize: '13px', color: '#1e40af', marginBottom: '4px' }}>
                          🏥 Técnico: {diagnosis.technical_language}
                        </div>
                        <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600', marginBottom: '4px' }}>
                          📋 CIE-10: {diagnosis.cie10_code}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          Probabilidad: {Math.round(diagnosis.probability * 100)}% | 
                          Confianza: {Math.round(diagnosis.confidence * 100)}%
                        </div>
                        {diagnosis.supporting_evidence.length > 0 && (
                          <div style={{ fontSize: '11px', marginTop: '4px' }}>
                            <strong>Evidencia:</strong> {diagnosis.supporting_evidence.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                </div>

                {/* Columna Derecha */}
                <div>
                  
                  {/* Medicamentos */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: '#1f2937', marginBottom: '12px', fontSize: '18px' }}>
                      💊 Medicamentos Prescritos
                    </h3>
                    {finalReport.medications_prescribed.map((med, index) => (
                      <div key={index} style={{
                        background: '#ecfdf5',
                        border: '1px solid #10b981',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '8px'
                      }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>
                          💊 {med.medication?.name || med.description}
                        </div>
                        {med.medication && (
                          <div style={{ fontSize: '12px', color: '#065f46' }}>
                            <div>📏 Dosis: {med.medication.dosage}</div>
                            <div>🕐 Frecuencia: {med.medication.frequency}</div>
                            <div>⏱️ Duración: {med.medication.duration}</div>
                            <div>💉 Vía: {med.medication.route}</div>
                            {med.medication.instructions && (
                              <div>📋 Instrucciones: {med.medication.instructions}</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Exámenes Recomendados */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: '#1f2937', marginBottom: '12px', fontSize: '18px' }}>
                      🧪 Exámenes Recomendados
                    </h3>
                    {finalReport.examinations_recommended.map((exam, index) => (
                      <div key={index} style={{
                        background: '#fef3c7',
                        border: '1px solid #f59e0b',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '8px'
                      }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                          {exam.type === 'laboratorio' && '🧪'} 
                          {exam.type === 'imagen' && '📸'} 
                          {exam.type === 'fisica' && '👩‍⚕️'} 
                          {exam.type === 'especializada' && '🔬'} 
                          {exam.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#7c2d12', marginBottom: '4px' }}>
                          {exam.reason}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          Urgencia: {exam.urgency} | Esperado: {exam.expected_findings}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* Plan de Seguimiento */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#1f2937', marginBottom: '12px', fontSize: '18px' }}>
                  📅 Plan de Seguimiento
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                  {finalReport.follow_up_plan.map((followUp, index) => (
                    <div key={index} style={{
                      background: '#f0f9ff',
                      border: '1px solid #0284c7',
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                        {followUp.type === 'control_medico' && '👩‍⚕️'} 
                        {followUp.type === 'laboratorio' && '🧪'} 
                        {followUp.type === 'imagen' && '📸'} 
                        {followUp.type === 'especialista' && '🏥'} 
                        {followUp.type === 'autocuidado' && '🏠'} 
                        {followUp.description}
                      </div>
                      <div style={{ fontSize: '12px', color: '#0369a1' }}>
                        ⏰ {followUp.timeframe}
                      </div>
                      {followUp.specific_instructions && (
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                          📋 {followUp.specific_instructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Criterios de Emergencia */}
              {finalReport.emergency_criteria.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ color: '#dc2626', marginBottom: '12px', fontSize: '18px' }}>
                    🚨 Criterios de Emergencia
                  </h3>
                  {finalReport.emergency_criteria.map((criteria, index) => (
                    <div key={index} style={{
                      background: criteria.time_frame === 'inmediato' ? '#fef2f2' : '#fff7ed',
                      border: criteria.time_frame === 'inmediato' ? '2px solid #dc2626' : '1px solid #f97316',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#dc2626', marginBottom: '4px' }}>
                        🚨 {criteria.symptom}
                      </div>
                      <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                        <strong>Umbral:</strong> {criteria.severity_threshold}
                      </div>
                      <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                        <strong>Acción:</strong> {criteria.action.toUpperCase()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        {criteria.reasoning}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notas del Médico */}
              {finalReport.doctor_notes && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ color: '#1f2937', marginBottom: '12px', fontSize: '18px' }}>
                    📝 Notas Médicas Adicionales
                  </h3>
                  <div style={{
                    background: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    fontStyle: 'italic'
                  }}>
                    {finalReport.doctor_notes}
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div style={{
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                {/* Estado del reporte */}
                <div style={{
                  marginRight: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {isReportSaved ? (
                    <div style={{
                      background: '#ecfdf5',
                      color: '#059669',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      border: '1px solid #10b981'
                    }}>
                      ✅ Reporte Guardado
                    </div>
                  ) : (
                    <div style={{
                      background: '#fef3c7',
                      color: '#d97706',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      border: '1px solid #f59e0b'
                    }}>
                      ⚠️ No Guardado
                    </div>
                  )}
                  
                  {currentSessionId && (
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      background: '#f9fafb',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #e5e7eb'
                    }}>
                      ID: {currentSessionId}
                    </div>
                  )}
                </div>

                {/* Botón Guardar Reporte */}
                <button
                  onClick={saveFinalReport}
                  disabled={isSavingReport || isReportSaved}
                  style={{
                    background: isReportSaved ? '#9ca3af' : isSavingReport ? '#d1d5db' : '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isReportSaved || isSavingReport ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isReportSaved && !isSavingReport) {
                      e.currentTarget.style.background = '#059669';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isReportSaved && !isSavingReport) {
                      e.currentTarget.style.background = '#10b981';
                    }
                  }}
                >
                  {isSavingReport ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #ffffff30',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Guardando...
                    </>
                  ) : isReportSaved ? (
                    <>✅ Guardado</>
                  ) : (
                    <>💾 Guardar Reporte</>
                  )}
                </button>

                {/* Botón Ver Histórico */}
                <button
                  onClick={() => {
                    // Implementaremos la navegación al histórico
                    window.location.href = '/dashboard?tab=historico';
                  }}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                >
                  📊 Ver Histórico
                </button>

                {/* Botón Cerrar */}
                <button
                  onClick={() => setShowFinalReport(false)}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#6b7280'}
                >
                  🚪 Cerrar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MedicalDashboard;
