'use client';

import React, { useState } from 'react';
import ControlsSection from '@/components/medical/ControlsSection';
import TranscriptionPanel from '@/components/medical/TranscriptionPanel';
import FinalReportModal from '@/components/medical/FinalReportModal';
import AnalysisPanel from '@/components/medical/AnalysisPanel';
import { MedicalAnalysis, Transcription, FinalMedicalReport } from '@/types/medical';

export default function TestMedicalPage() {
  // Estados de prueba
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [isReportSaved, setIsReportSaved] = useState(false);
  const [showFinalReport, setShowFinalReport] = useState(false);
  const [currentSessionId] = useState('test-session-123');
  const [finalReport, setFinalReport] = useState<FinalMedicalReport | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<MedicalAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([
    {
      id: '1',
      text: 'Buenos días doctor, tengo un dolor de cabeza',
      speaker: 'paciente',
      timestamp: new Date(),
      confidence: 0.95
    },
    {
      id: '2', 
      text: '¿Desde cuándo tiene este dolor?',
      speaker: 'medico',
      timestamp: new Date(),
      confidence: 0.98
    },
    {
      id: '3',
      text: 'Desde hace tres días aproximadamente',
      speaker: 'paciente',
      timestamp: new Date(),
      confidence: 0.92
    },
    {
      id: '4',
      text: 'Vamos a examinar sus síntomas más detalladamente',
      speaker: 'medico',
      timestamp: new Date(),
      confidence: 0.96
    },
    {
      id: '5',
      text: 'El dolor es más intenso por las mañanas',
      speaker: 'paciente',
      timestamp: new Date(),
      confidence: 0.94
    }
  ]);

  // Handlers de prueba
  const handleStartSession = () => {
    console.log('🎬 Iniciando sesión...');
    setIsRecording(true);
  };

  const handleStopSession = () => {
    console.log('⏹️ Deteniendo sesión...');
    setIsSavingSession(true);
    setTimeout(() => {
      setIsRecording(false);
      setIsSavingSession(false);
    }, 2000);
  };

  const handleGenerateFinalReport = () => {
    console.log('📋 Generando reporte final...');
    setIsGeneratingReport(true);
    
    // Simular generación del reporte
    setTimeout(() => {
      const mockReport: FinalMedicalReport = {
        patient_info: {
          session_id: currentSessionId,
          duration: '15:32'
        },
        executive_summary: 'Paciente presenta cefalea tensional de 3 días de evolución, con características típicas de dolor de cabeza por tensión. Se recomienda manejo sintomático y seguimiento.',
        overall_confidence: 0.87,
        requires_immediate_attention: false,
        symptoms_report: [
          {
            normal_language: 'Dolor de cabeza persistente',
            technical_language: 'Cefalea tensional bilateral',
            cie10_code: 'G44.2',
            severity: 'moderada',
            confidence: 0.89
          }
        ],
        diagnoses_report: [
          {
            normal_language: 'Dolor de cabeza por tensión muscular',
            technical_language: 'Cefalea tensional episódica',
            cie10_code: 'G44.2',
            probability: 0.85,
            confidence: 0.87,
            supporting_evidence: ['Dolor bilateral', 'Duración de 3 días', 'Intensidad matutina']
          }
        ],
        medications_prescribed: [
          {
            description: 'Analgésico para el dolor',
            medication: {
              name: 'Paracetamol',
              dosage: '500mg',
              frequency: 'Cada 8 horas',
              duration: '3 días',
              route: 'Oral',
              instructions: 'Tomar con alimentos'
            }
          }
        ],
        examinations_recommended: [
          {
            type: 'fisica',
            name: 'Examen neurológico básico',
            reason: 'Descartar signos neurológicos focales',
            urgency: 'rutina',
            expected_findings: 'Normal'
          }
        ],
        follow_up_plan: [
          {
            type: 'control_medico',
            description: 'Control médico de seguimiento',
            timeframe: 'En 1 semana',
            specific_instructions: 'Si los síntomas persisten o empeoran'
          }
        ],
        emergency_criteria: [
          {
            symptom: 'Dolor de cabeza severo súbito',
            severity_threshold: 'Intensidad 8/10 o mayor',
            action: 'acudir_emergencia',
            time_frame: 'inmediato',
            reasoning: 'Podría indicar patología intracraneal grave'
          }
        ],
        doctor_notes: 'Paciente colaborador, sin signos de alarma evidentes. Recomendar hidratación adecuada y manejo del estrés.'
      };
      
      setFinalReport(mockReport);
      setIsGeneratingReport(false);
      setShowFinalReport(true);
      console.log('✅ Reporte generado exitosamente');
    }, 2000);
  };

  const handleSetCurrentAnalysis = (analysis: MedicalAnalysis) => {
    setCurrentAnalysis(analysis);
    console.log('🔬 Análisis recibido:', analysis);
  };

  const handleSaveReport = () => {
    console.log('💾 Guardando reporte...');
    setIsSavingReport(true);
    
    setTimeout(() => {
      setIsSavingReport(false);
      setIsReportSaved(true);
      console.log('✅ Reporte guardado exitosamente');
    }, 1500);
  };

  const handleViewHistory = () => {
    console.log('📊 Navegando al histórico...');
    // Simular navegación
    alert('Navegando al histórico de reportes...');
  };

  const handleCloseModal = () => {
    setShowFinalReport(false);
  };

  return (
    <div style={{
      fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      background: '#F5F5F7',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        background: '#333',
        color: 'white',
        padding: '1rem',
        borderRadius: '8px'
      }}>
        🧪 Test Componentes Médicos - Progreso: 4/4 ✅ COMPLETO
      </h1>

      {/* Panel de Estado para Testing */}
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        fontSize: '14px'
      }}>
        <h3>Estado Actual:</h3>
        <p>🔌 Conectado: {isConnected ? '✅' : '❌'}</p>
        <p>🎙️ Grabando: {isRecording ? '✅' : '❌'}</p>
        <p>💾 Guardando: {isSavingSession ? '✅' : '❌'}</p>
        <p>📋 Generando Reporte: {isGeneratingReport ? '✅' : '❌'}</p>
        <p>📝 Transcripciones: {transcriptions.length}</p>
        
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setIsConnected(!isConnected)}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: '#5B9CFF', color: 'white' }}
          >
            Toggle Conexión
          </button>
          <button 
            onClick={() => setTranscriptions(prev => [...prev, {
              id: Date.now().toString(),
              text: 'Nueva transcripción de prueba',
              speaker: Math.random() > 0.5 ? 'medico' : 'paciente',
              timestamp: new Date(),
              confidence: 0.9 + Math.random() * 0.1
            }])}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: '#10b981', color: 'white' }}
          >
            + Transcripción
          </button>
          <button 
            onClick={() => setTranscriptions([])}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: '#ef4444', color: 'white' }}
          >
            Limpiar Transcripciones
          </button>
          
          <button 
            onClick={() => setShowFinalReport(true)}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: '#8b5cf6', color: 'white' }}
          >
            📋 Mostrar Modal Reporte
          </button>
          
          <button 
            onClick={() => {
              setIsAnalyzing(true);
              setTimeout(() => {
                const mockAnalysis: MedicalAnalysis = {
                  red_flags: [
                    {
                      alert: 'Dolor de cabeza severo de aparición súbita',
                      action_required: 'Evaluación neurológica inmediata'
                    }
                  ],
                  symptoms: [
                    {
                      name: 'Cefalea tensional',
                      severity: 'moderado',
                      confidence: 0.89
                    },
                    {
                      name: 'Dolor bilateral',
                      severity: 'leve',
                      confidence: 0.76
                    }
                  ],
                  diagnoses: [
                    {
                      name: 'Cefalea tensional episódica',
                      probability: 0.85,
                      risk_level: 'bajo',
                      supporting_symptoms: ['dolor bilateral', 'duración 3 días', 'intensidad matutina']
                    }
                  ],
                  recommendations: [
                    {
                      type: 'medicamento',
                      priority: 'media',
                      description: 'Analgésico para control del dolor',
                      reasoning: 'Manejo sintomático de cefalea tensional',
                      timeline: 'Inmediato',
                      medication: {
                        name: 'Paracetamol',
                        dosage: '500mg',
                        frequency: 'Cada 8 horas',
                        duration: '3 días',
                        route: 'Oral',
                        instructions: 'Tomar con alimentos',
                        contraindications: ['Alergia al paracetamol'],
                        side_effects: ['Náuseas leves']
                      }
                    }
                  ],
                  summary: 'Paciente presenta cuadro compatible con cefalea tensional de 3 días de evolución. Requiere manejo sintomático y seguimiento.',
                  confidence_level: 0.87
                };
                setCurrentAnalysis(mockAnalysis);
                setIsAnalyzing(false);
              }, 2000);
            }}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: '#3b82f6', color: 'white' }}
          >
            🤖 Simular Análisis IA
          </button>
          
          <button 
            onClick={() => {
              setTranscriptions([]);
              setIsReportSaved(false);
              setFinalReport(null);
              setCurrentAnalysis(null);
              setIsAnalyzing(false);
            }}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: '#dc2626', color: 'white' }}
          >
            🗑️ Reset Todo
          </button>
        </div>
      </div>

      {/* Componentes bajo prueba */}
      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* ControlsSection */}
        <div style={{ 
          border: '3px solid #5B9CFF', 
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-10px',
            left: '10px',
            background: '#5B9CFF',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 10
          }}>
            ✅ ControlsSection.tsx
          </div>
          
          <div style={{ padding: '1rem' }}>
            <ControlsSection
              isRecording={isRecording}
              isConnected={isConnected}
              isSavingSession={isSavingSession}
              isGeneratingReport={isGeneratingReport}
              transcriptions={transcriptions}
              onStartSession={handleStartSession}
              onStopSession={handleStopSession}
              onGenerateFinalReport={handleGenerateFinalReport}
              onSetCurrentAnalysis={handleSetCurrentAnalysis}
            />
          </div>
        </div>

        {/* TranscriptionPanel */}
        <div style={{ 
          border: '3px solid #10b981', 
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-10px',
            left: '10px',
            background: '#10b981',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 10
          }}>
            ✅ TranscriptionPanel.tsx
          </div>
          
          <div style={{ padding: '1rem' }}>
            <TranscriptionPanel
              transcriptions={transcriptions}
              isRecording={isRecording}
              isConnected={isConnected}
              onSetTranscriptions={setTranscriptions}
            />
          </div>
        </div>

        {/* AnalysisPanel */}
        <div style={{ 
          border: '3px solid #7c3aed', 
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-10px',
            left: '10px',
            background: '#7c3aed',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 10
          }}>
            ✅ AnalysisPanel.tsx (ÚLTIMO COMPONENTE)
          </div>
          
          <div style={{ padding: '1rem' }}>
            <AnalysisPanel
              currentAnalysis={currentAnalysis}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>
      </div>

      {/* Modal de Reporte Final */}
      <FinalReportModal
        finalReport={finalReport}
        isVisible={showFinalReport}
        isReportSaved={isReportSaved}
        isSavingReport={isSavingReport}
        currentSessionId={currentSessionId}
        onClose={handleCloseModal}
        onSaveReport={handleSaveReport}
        onViewHistory={handleViewHistory}
      />
    </div>
  );
}
