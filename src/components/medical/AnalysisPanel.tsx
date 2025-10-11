'use client';

import React from 'react';
import { MedicalAnalysis } from '@/types/medical';

interface AnalysisPanelProps {
  currentAnalysis: MedicalAnalysis | null;
  isAnalyzing?: boolean;
}

// Funciones auxiliares para colores
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

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  currentAnalysis,
  isAnalyzing = false
}) => {
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
      <h2 style={{ 
        margin: '0 0 20px 0', 
        fontSize: '20px', 
        fontWeight: '600',
        color: '#374151',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        Análisis Médico IA
        {isAnalyzing && (
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid #3b82f6',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        )}
      </h2>

      {!currentAnalysis ? (
        <div style={{ 
          textAlign: 'center', 
          color: '#9ca3af', 
          marginTop: '120px',
          fontSize: '14px'
        }}>
          {isAnalyzing ? (
            <div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                🤖 Analizando conversación médica...
              </div>
              <div style={{ fontSize: '12px', color: '#10b981' }}>
                La IA está procesando los síntomas y generando recomendaciones
              </div>
            </div>
          ) : (
            'El análisis aparecerá después de algunas transcripciones'
          )}
        </div>
      ) : (
        <div style={{ 
          height: '400px', 
          overflowY: 'auto',
          padding: '4px'
        }}>
          
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
              background: 'rgba(240, 249, 255, 0.1)',
              border: '1px solid rgba(186, 230, 253, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '16px'
            }}>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#60A5FA'
              }}>
                Resumen
              </h3>
              <div style={{ fontSize: '14px', lineHeight: '1.5', color: 'rgba(255, 255, 255, 0.9)' }}>
                {currentAnalysis.summary}
              </div>
              <div style={{ 
                marginTop: '8px',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                Confianza: {Math.round(currentAnalysis.confidence_level * 100)}%
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AnalysisPanel;
