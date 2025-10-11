'use client';

import React from 'react';
import { MedicalAnalysis, Transcription } from '@/types/medical';

interface ControlsSectionProps {
  isRecording: boolean;
  isConnected: boolean;
  isSavingSession: boolean;
  isGeneratingReport: boolean;
  transcriptions: Transcription[];
  onStartSession: () => void;
  onStopSession: () => void;
  onGenerateFinalReport: () => void;
  onSetCurrentAnalysis: (analysis: MedicalAnalysis) => void;
}

const ControlsSection: React.FC<ControlsSectionProps> = ({
  isRecording,
  isConnected,
  isSavingSession,
  isGeneratingReport,
  transcriptions,
  onStartSession,
  onStopSession,
  onGenerateFinalReport,
  onSetCurrentAnalysis
}) => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      borderRadius: '20px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
      padding: '2rem',
      marginBottom: '2rem'
    }}>
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
      }}>
        {/* Control Buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!isRecording ? (
            <button
              onClick={onStartSession}
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
              onClick={onStopSession}
              disabled={isSavingSession}
              style={{
                background: isSavingSession ? 'rgba(108, 108, 112, 0.5)' : 'linear-gradient(135deg, #FF6B6B 0%, #E74C3C 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '20px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: isSavingSession ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: !isSavingSession ? '0 4px 14px rgba(255, 107, 107, 0.3)' : 'none'
              }}
            >
              {isSavingSession ? 'Guardando...' : 'Finalizar Consulta'}
            </button>
          )}
          
          {/* Recording Status */}
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

        {/* Botón Generar Informe Final */}
        {!isRecording && transcriptions.length >= 4 && (
          <button
            onClick={onGenerateFinalReport}
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
            {isGeneratingReport ? 'Generando...' : 'Generar Informe Final'}
          </button>
        )}

        {/* Botones Debug */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={async () => {
              console.log('🔍 DEBUG: Verificando servicios...');
              try {
                const response = await fetch('/api/debug-services');
                const data = await response.json();
                console.log('🔍 DEBUG SERVICIOS:', data);
                alert(`Servicios: ${data.debug?.hasOpenaiService ? 'OpenAI ✅' : 'OpenAI ❌'}`);
              } catch (error) {
                console.error('❌ DEBUG: Error verificando servicios:', error);
              }
            }}
            style={{
              padding: '8px 16px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔍 Debug Servicios
          </button>
          
          <button
            onClick={async () => {
              console.log('🔧 DEBUG: Forzando inicialización de OpenAI...');
              try {
                const response = await fetch('/api/force-init-openai', {
                  method: 'POST'
                });
                const data = await response.json();
                console.log('🔧 DEBUG INIT:', data);
                alert(`Inicialización: ${data.status === 'success' ? 'OpenAI ✅' : 'Error ❌'}`);
              } catch (error) {
                console.error('❌ DEBUG: Error forzando inicialización:', error);
                alert('Error forzando inicialización');
              }
            }}
            style={{
              padding: '8px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔧 Forzar Init
          </button>
          
          {transcriptions.length >= 2 && (
            <button
              onClick={async () => {
                console.log('🧪 DEBUG: Forzando análisis médico...');
                try {
                  const response = await fetch('/api/medical-analysis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });
                  const data = await response.json();
                  console.log('🧪 DEBUG: Respuesta del análisis:', data);
                  
                  if (data.status === 'success' && data.analysis) {
                    onSetCurrentAnalysis(data.analysis);
                    console.log('✅ DEBUG: Análisis forzado aplicado');
                  } else {
                    console.warn('⚠️ DEBUG: No se pudo generar análisis:', data.message);
                  }
                } catch (error) {
                  console.error('❌ DEBUG: Error forzando análisis:', error);
                }
              }}
              style={{
                padding: '8px 16px',
                background: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#6d28d9'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#7c3aed'}
            >
              🧪 Forzar Análisis
            </button>
          )}
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#6b7280' }}>
          Transcripciones: {transcriptions.length}
        </div>
      </div>
    </div>
  );
};

export default ControlsSection;
