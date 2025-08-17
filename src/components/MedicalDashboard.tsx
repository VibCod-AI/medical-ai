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
  const transcriptionRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    // Escuchar análisis médicos
    socketService.on('medical-analysis', (...args: unknown[]) => {
      const analysis = args[0] as MedicalAnalysis;
      console.log('📊 Nuevo análisis médico recibido:', analysis);
      setCurrentAnalysis(analysis);
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
      
      // Solo mostrar transcripciones finales para evitar spam
      if (transcription.is_final && transcription.transcript.trim()) {
        const newTranscription: Transcription = {
          id: Date.now().toString() + Math.random(),
          speaker: transcription.speaker === 0 ? 'medico' : 
                  transcription.speaker === 1 ? 'paciente' : 'unknown',
          text: transcription.transcript,
          timestamp: new Date().toLocaleTimeString(),
          confidence: Math.round(transcription.confidence * 100)
        };
        
        setTranscriptions(prev => {
          const updated = [...prev, newTranscription];
          console.log('📝 Actualizando transcripciones. Total:', updated.length);
          // Mantener solo las últimas 20 transcripciones
          return updated.slice(-20);
        });
        
        console.log('📝 Nueva transcripción agregada:', newTranscription);
      } else {
        console.log('⏭️ Transcripción ignorada (no final o vacía)');
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
  }, [isRecording]);

  // Auto-scroll en transcripciones
  useEffect(() => {
    if (transcriptionRef.current) {
      transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight;
    }
  }, [transcriptions]);

  const startSession = async () => {
    try {
      if (!audioService) {
        throw new Error('AudioService no disponible');
      }

      setIsRecording(true);
      setSessionTime(0);
      setTranscriptions([]);
      setCurrentAnalysis(null);
      
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
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Auto-guardar sesión si hay contenido
    if (transcriptions.length > 0 || currentAnalysis) {
      await saveCurrentSession();
    }

    console.log('⏹️ Consulta médica finalizada');
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      padding: '20px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
              🏥 Dashboard Médico
            </h1>
            <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
              Sistema de Análisis de Consultas en Tiempo Real - Next.js
            </p>
          </div>
          
          {/* Info del usuario */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '12px 20px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                {profile?.role === 'doctor' ? '👨‍⚕️' : profile?.role === 'admin' ? '👤' : '🧑‍🦱'}
              </div>
              <div>
                <p style={{ 
                  margin: 0, 
                  fontWeight: '600', 
                  fontSize: '14px' 
                }}>
                  {profile?.full_name || user?.email}
                </p>
                <p style={{ 
                  margin: 0, 
                  opacity: 0.8, 
                  fontSize: '12px',
                  textTransform: 'capitalize'
                }}>
                  {profile?.role || 'usuario'} • {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!isRecording ? (
            <button
              onClick={startSession}
              disabled={!isConnected}
              style={{
                background: isConnected ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isConnected ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ▶️ Iniciar Consulta
            </button>
          ) : (
            <button
              onClick={stopSession}
              disabled={isSavingSession}
              style={{
                background: isSavingSession ? '#9ca3af' : '#ef4444',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isSavingSession ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSavingSession ? '💾 Guardando...' : '⏹️ Finalizar Consulta'}
            </button>
          )}
          
          <div style={{
            padding: '8px 16px',
            background: isRecording ? '#10b981' : '#f3f4f6',
            color: isRecording ? 'white' : '#6b7280',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {isRecording ? '🔴 GRABANDO' : '⚪ DETENIDO'}
          </div>
          
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
                    border: `1px solid ${transcription.speaker === 'medico' ? '#dbeafe' : '#dcfce7'}`
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
                    lineHeight: '1.5'
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
          <h2 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '20px', 
            fontWeight: '600',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🧠 Análisis Médico IA
          </h2>

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
                          background: getPriorityColor(question.priority),
                          color: 'white',
                          fontWeight: '500'
                        }}
                      >
                        {question.priority.toUpperCase()}
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
