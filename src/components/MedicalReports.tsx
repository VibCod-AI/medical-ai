import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MedicalReport } from '../types/medical';

const MedicalReports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const reportsPerPage = 10;

  // Cargar reportes
  const loadReports = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: reportsPerPage.toString(),
        offset: (currentPage * reportsPerPage).toString(),
        ...(showUrgentOnly && { urgent_only: 'true' })
      });

      const response = await fetch(`/api/medical-reports?${params}`);
      const data = await response.json();

      if (data.success) {
        setReports(data.reports);
        setTotalReports(data.total);
      } else {
        console.error('Error cargando reportes:', data.error);
      }
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [user, currentPage, showUrgentOnly]);

  // Eliminar reporte
  const deleteReport = async (reportId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este reporte?')) return;

    try {
      const response = await fetch(`/api/medical-reports?id=${reportId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setReports(reports.filter(r => r.id !== reportId));
        setSelectedReport(null);
        alert('Reporte eliminado exitosamente');
      } else {
        alert(`Error eliminando reporte: ${data.error}`);
      }
    } catch (error) {
      console.error('Error eliminando reporte:', error);
      alert('Error de conexión al eliminar reporte');
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener color según urgencia
  const getUrgencyColor = (requiresAttention: boolean) => {
    return requiresAttention 
      ? { bg: '#fef2f2', border: '#dc2626', text: '#dc2626' }
      : { bg: '#f0fdf4', border: '#10b981', text: '#059669' };
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        ⏳ Cargando reportes médicos...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: '#1f2937',
          marginBottom: '8px'
        }}>
          📋 Reportes Médicos
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Historial completo de tus consultas médicas
        </p>
      </div>

      {/* Filtros */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        alignItems: 'center'
      }}>
        <button
          onClick={() => setShowUrgentOnly(!showUrgentOnly)}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: showUrgentOnly ? '2px solid #dc2626' : '1px solid #d1d5db',
            background: showUrgentOnly ? '#fef2f2' : 'white',
            color: showUrgentOnly ? '#dc2626' : '#374151',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {showUrgentOnly ? '🚨 Solo Urgentes' : '📋 Todos los Reportes'}
        </button>
        
        <div style={{ color: '#6b7280', fontSize: '14px' }}>
          {totalReports} reporte{totalReports !== 1 ? 's' : ''} encontrado{totalReports !== 1 ? 's' : ''}
        </div>
      </div>

      {reports.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '64px 24px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
            {showUrgentOnly ? 'No hay reportes urgentes' : 'No hay reportes médicos'}
          </h3>
          <p>
            {showUrgentOnly 
              ? 'No tienes reportes que requieran atención inmediata.'
              : 'Realiza una consulta médica para generar tu primer reporte.'
            }
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Lista de Reportes */}
          <div style={{ flex: '1', maxWidth: '400px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reports.map((report) => {
                const urgencyColor = getUrgencyColor(report.requires_immediate_attention);
                const isSelected = selectedReport?.id === report.id;
                
                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid #3b82f6` : '1px solid #e5e7eb',
                      background: isSelected ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                      }
                    }}
                  >
                    {/* Header del reporte */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                        {formatDate(report.created_at)}
                      </div>
                      {report.requires_immediate_attention && (
                        <div style={{
                          background: urgencyColor.bg,
                          color: urgencyColor.text,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          border: `1px solid ${urgencyColor.border}`
                        }}>
                          🚨 URGENTE
                        </div>
                      )}
                    </div>

                    {/* Información del reporte */}
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                      <div>📝 {report.total_transcriptions} transcripciones</div>
                      <div>⏱️ {report.session_duration}</div>
                      <div>📋 Fase: {report.consultation_phase}</div>
                    </div>

                    {/* Resumen */}
                    {report.summary && (
                      <div style={{
                        fontSize: '12px',
                        color: '#374151',
                        lineHeight: '1.4',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {report.summary}
                      </div>
                    )}

                    {/* Stats rápidas */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      marginTop: '8px',
                      fontSize: '11px',
                      color: '#6b7280'
                    }}>
                      {report.symptoms.length > 0 && <span>🎯 {report.symptoms.length} síntomas</span>}
                      {report.diagnoses.length > 0 && <span>🔍 {report.diagnoses.length} diagnósticos</span>}
                      {report.recommendations.length > 0 && <span>💡 {report.recommendations.length} recomendaciones</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginación */}
            {totalReports > reportsPerPage && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '8px', 
                marginTop: '24px' 
              }}>
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: currentPage === 0 ? '#f9fafb' : 'white',
                    color: currentPage === 0 ? '#9ca3af' : '#374151',
                    cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ← Anterior
                </button>
                
                <span style={{ 
                  padding: '8px 16px', 
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  Página {currentPage + 1} de {Math.ceil(totalReports / reportsPerPage)}
                </span>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={(currentPage + 1) * reportsPerPage >= totalReports}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: (currentPage + 1) * reportsPerPage >= totalReports ? '#f9fafb' : 'white',
                    color: (currentPage + 1) * reportsPerPage >= totalReports ? '#9ca3af' : '#374151',
                    cursor: (currentPage + 1) * reportsPerPage >= totalReports ? 'not-allowed' : 'pointer'
                  }}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>

          {/* Detalle del Reporte */}
          <div style={{ flex: '2' }}>
            {selectedReport ? (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
              }}>
                {/* Header del detalle */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '24px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                      📋 Reporte Médico
                    </h2>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                      {formatDate(selectedReport.created_at)}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => deleteReport(selectedReport.id)}
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>

                {/* Contenido del reporte */}
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  
                  {/* Transcripciones */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                      💬 Transcripciones ({selectedReport.transcriptions.length})
                    </h3>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
                      {selectedReport.transcriptions.map((transcription, index) => (
                        <div key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
                          <span style={{ 
                            fontWeight: '600',
                            color: transcription.speaker === 'medico' ? '#1d4ed8' : '#059669'
                          }}>
                            {transcription.speaker === 'medico' ? '👨‍⚕️ Médico' : '🧑‍🦱 Paciente'}:
                          </span>
                          <span style={{ marginLeft: '8px', color: '#374151' }}>
                            {transcription.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Síntomas */}
                  {selectedReport.symptoms.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                        🎯 Síntomas Detectados ({selectedReport.symptoms.length})
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {selectedReport.symptoms.map((symptom, index) => (
                          <div key={index} style={{
                            background: '#f0fdf4',
                            border: '1px solid #10b981',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '12px'
                          }}>
                            <strong>{symptom.name}</strong> ({symptom.severity})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diagnósticos */}
                  {selectedReport.diagnoses.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                        🔍 Diagnósticos Probables ({selectedReport.diagnoses.length})
                      </h3>
                      {selectedReport.diagnoses.map((diagnosis, index) => (
                        <div key={index} style={{
                          background: '#eff6ff',
                          border: '1px solid #3b82f6',
                          borderRadius: '8px',
                          padding: '12px',
                          marginBottom: '8px'
                        }}>
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                            {diagnosis.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Probabilidad: {Math.round(diagnosis.probability * 100)}% | 
                            Riesgo: {diagnosis.risk_level}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recomendaciones */}
                  {selectedReport.recommendations.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                        💡 Recomendaciones ({selectedReport.recommendations.length})
                      </h3>
                      {selectedReport.recommendations.map((rec, index) => (
                        <div key={index} style={{
                          background: '#fef3c7',
                          border: '1px solid #f59e0b',
                          borderRadius: '8px',
                          padding: '12px',
                          marginBottom: '8px'
                        }}>
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                            {rec.description}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Tipo: {rec.type} | Prioridad: {rec.priority}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Seguimiento */}
                  {selectedReport.follow_up.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                        📅 Seguimiento ({selectedReport.follow_up.length})
                      </h3>
                      {selectedReport.follow_up.map((followUp, index) => (
                        <div key={index} style={{
                          background: '#f3f4f6',
                          border: '1px solid #6b7280',
                          borderRadius: '8px',
                          padding: '12px',
                          marginBottom: '8px'
                        }}>
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                            {followUp.description}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {followUp.timeframe} | Prioridad: {followUp.priority}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Criterios de Emergencia */}
                  {selectedReport.emergency_criteria.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                        🚨 Criterios de Emergencia ({selectedReport.emergency_criteria.length})
                      </h3>
                      {selectedReport.emergency_criteria.map((criteria, index) => (
                        <div key={index} style={{
                          background: '#fef2f2',
                          border: '1px solid #dc2626',
                          borderRadius: '8px',
                          padding: '12px',
                          marginBottom: '8px'
                        }}>
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px', color: '#dc2626' }}>
                            {criteria.symptom}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Acción: {criteria.action} | Tiempo: {criteria.time_frame}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preguntas Sugeridas */}
                  {selectedReport.suggested_questions.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                        💡 Preguntas Sugeridas ({selectedReport.suggested_questions.length})
                      </h3>
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {selectedReport.suggested_questions.map((question, index) => (
                          <div key={index} style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '8px'
                          }}>
                            <div style={{ 
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: '6px'
                            }}>
                              <div style={{
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: '600',
                                color: '#6b7280'
                              }}>
                                {question.category === 'sintoma' && '🔍 Síntoma'}
                                {question.category === 'antecedente' && '📋 Antecedente'}
                                {question.category === 'examen_fisico' && '👩‍⚕️ Examen'}
                                {question.category === 'descarte' && '❌ Descarte'}
                                {question.category === 'seguimiento' && '🔄 Seguimiento'}
                                {!question.category && '💭 General'}
                              </div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ 
                                  fontSize: '11px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: question.priority === 'alta' ? '#dc2626' : 
                                             question.priority === 'media' ? '#f59e0b' : '#10b981',
                                  color: 'white',
                                  fontWeight: '500'
                                }}>
                                  {(question.priority || 'BAJA').toUpperCase()}
                                </span>
                                {question.generated_at && (
                                  <span style={{ 
                                    fontSize: '10px',
                                    color: '#9ca3af',
                                    background: '#f3f4f6',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                  }}>
                                    {new Date(question.generated_at).toLocaleTimeString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div style={{ 
                              fontSize: '14px',
                              fontWeight: '500',
                              marginBottom: '6px',
                              color: '#374151',
                              lineHeight: '1.4'
                            }}>
                              {question.question}
                            </div>

                            {question.reasoning && (
                              <div style={{ 
                                fontSize: '12px', 
                                color: '#6b7280',
                                fontStyle: 'italic',
                                lineHeight: '1.3',
                                marginBottom: '4px'
                              }}>
                                {question.reasoning}
                              </div>
                            )}

                            {question.target_diagnosis && (
                              <div style={{
                                fontSize: '11px',
                                color: '#059669',
                                background: '#d1fae5',
                                padding: '3px 6px',
                                borderRadius: '4px',
                                display: 'inline-block'
                              }}>
                                Descarte: {question.target_diagnosis}
                              </div>
                            )}

                            {question.analysis_id && (
                              <div style={{
                                fontSize: '10px',
                                color: '#9ca3af',
                                marginTop: '6px',
                                fontFamily: 'monospace'
                              }}>
                                Análisis: {question.analysis_id.substring(0, 12)}...
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Estadísticas de preguntas */}
                      <div style={{
                        background: '#f0f9ff',
                        border: '1px solid #0ea5e9',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        marginTop: '12px',
                        fontSize: '12px',
                        color: '#0369a1'
                      }}>
                        📊 Total: {selectedReport.suggested_questions.length} preguntas • 
                        Análisis únicos: {new Set(selectedReport.suggested_questions.map(q => q.analysis_id).filter(Boolean)).size} • 
                        Alta prioridad: {selectedReport.suggested_questions.filter(q => q.priority === 'alta').length}
                      </div>
                    </div>
                  )}

                  {/* Resumen */}
                  {selectedReport.summary && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                        📄 Resumen
                      </h3>
                      <div style={{
                        background: '#f0f9ff',
                        border: '1px solid #0ea5e9',
                        borderRadius: '8px',
                        padding: '16px',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {selectedReport.summary}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '64px 24px',
                border: '1px solid #e5e7eb',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👈</div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
                  Selecciona un reporte
                </h3>
                <p>
                  Haz clic en un reporte de la lista para ver los detalles completos.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalReports;
