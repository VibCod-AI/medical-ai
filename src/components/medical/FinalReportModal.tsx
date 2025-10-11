'use client';

import React from 'react';
import { FinalMedicalReport } from '@/types/medical';

interface FinalReportModalProps {
  finalReport: FinalMedicalReport | null;
  isVisible: boolean;
  isReportSaved: boolean;
  isSavingReport: boolean;
  currentSessionId: string | null;
  onClose: () => void;
  onSaveReport: () => void;
  onViewHistory: () => void;
}

const FinalReportModal: React.FC<FinalReportModalProps> = ({
  finalReport,
  isVisible,
  isReportSaved,
  isSavingReport,
  currentSessionId,
  onClose,
  onSaveReport,
  onViewHistory
}) => {
  if (!isVisible || !finalReport) {
    return null;
  }

  return (
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
            onClick={onClose}
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
              onClick={onSaveReport}
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
              onClick={onViewHistory}
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
              onClick={onClose}
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

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default FinalReportModal;
