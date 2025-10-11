'use client';

import React, { useRef, useEffect } from 'react';
import { Transcription } from '@/types/medical';

interface TranscriptionPanelProps {
  transcriptions: Transcription[];
  isRecording: boolean;
  isConnected: boolean;
  onSetTranscriptions: (transcriptions: Transcription[]) => void;
  onTestTranscription?: () => void;
}

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({
  transcriptions,
  isRecording,
  isConnected,
  onSetTranscriptions,
  onTestTranscription
}) => {
  const transcriptionRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando lleguen nuevas transcripciones
  useEffect(() => {
    if (transcriptionRef.current) {
      transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight;
    }
  }, [transcriptions]);

  const handleAutoCorrect = () => {
    onSetTranscriptions(transcriptions.map(t => {
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
    console.log('🔄 Speakers auto-corregidos');
  };

  const handleClearTranscriptions = () => {
    if (confirm('¿Seguro que quieres limpiar todas las transcripciones?')) {
      onSetTranscriptions([]);
      console.log('🗑️ Transcripciones limpiadas');
    }
  };

  const handleToggleSpeaker = (transcriptionId: string) => {
    onSetTranscriptions(transcriptions.map(t => 
      t.id === transcriptionId 
        ? { ...t, speaker: t.speaker === 'medico' ? 'paciente' : 'medico' }
        : t
    ));
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      minHeight: '500px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '20px', 
          fontWeight: '600',
          color: '#374151',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          Transcripción en Tiempo Real
          {isRecording && (
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '6px',
              animation: 'pulse 2s infinite'
            }}>
              🔴 EN VIVO
            </span>
          )}
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {transcriptions.length > 0 && (
            <>
              <button
                onClick={handleAutoCorrect}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
              >
                🔄 Auto-Corregir
              </button>
              
              <button
                onClick={handleClearTranscriptions}
                style={{
                  padding: '8px 16px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
              >
                🗑️ Limpiar
              </button>
            </>
          )}
          {!isRecording && onTestTranscription && (
            <button
              onClick={onTestTranscription}
              disabled={true}
              style={{
                padding: '8px 16px',
                background: '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'not-allowed',
                fontWeight: '500',
                opacity: 0.5
              }}
              title="Botón de prueba deshabilitado para evitar mezclar datos mockeados con reales"
            >
              🧪 Prueba (Deshabilitado)
            </button>
          )}
        </div>
      </div>
      
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
            <div style={{ marginBottom: '16px' }}>
              {isRecording ? (
                <div>
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                    🎤 Escuchando audio en tiempo real...
                  </div>
                  <div style={{ fontSize: '12px', color: '#10b981' }}>
                    ✅ Solo transcripciones REALES de Deepgram
                  </div>
                </div>
              ) : (
                <div>
                  Las transcripciones aparecerán aquí en tiempo real
                  <div style={{ fontSize: '12px', marginTop: '8px', color: '#ef4444' }}>
                    🚫 Transcripciones mockeadas BLOQUEADAS
                  </div>
                </div>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Estado: {transcriptions.length} transcripciones | 
              Conectado: {isConnected ? '✅ Sí' : '❌ No'} | 
              Grabando: {isRecording ? '🔴 Sí' : '⏸️ No'}
            </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontWeight: '600',
                    color: transcription.speaker === 'medico' ? '#1d4ed8' : '#059669',
                    fontSize: '14px'
                  }}>
                    {transcription.speaker === 'medico' ? 'Médico' : 'Paciente'}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    background: '#10b981',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    REAL
                  </span>
                  <button
                    onClick={() => handleToggleSpeaker(transcription.id)}
                    style={{
                      fontSize: '10px',
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    title="Cambiar speaker"
                  >
                    ↔️
                  </button>
                </div>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#6b7280' 
                }}>
                  {transcription.timestamp instanceof Date 
                    ? transcription.timestamp.toLocaleTimeString() 
                    : transcription.timestamp} • {Math.round((transcription.confidence || 0) * 100)}%
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
  );
};

export default TranscriptionPanel;
