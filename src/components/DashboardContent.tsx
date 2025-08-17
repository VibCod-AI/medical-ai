'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'

type TabType = 'perfil' | 'historico' | 'configuracion';

type ReportHistoryItem = {
  id: string
  created_at: string
  updated_at: string
  status: string
  patient: unknown
  session_duration: number
  report_summary: string
  diagnoses: unknown[]
  cie10_codes: Array<{ code: string; description?: string; confidence?: number }>
  requires_immediate_attention: boolean
  confidence_level: number
  emergency_criteria: unknown[]
  diagnoses_count: number
  symptoms_count: number
  recommendations_count: number
  patient_info: unknown
}

export default function DashboardContent() {
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('perfil')
  const [reportsHistory, setReportsHistory] = useState<ReportHistoryItem[]>([])
  const [loadingReports, setLoadingReports] = useState(false)

  // Obtener tab desde URL
  useEffect(() => {
    const tab = searchParams?.get('tab') as TabType
    if (tab && ['perfil', 'historico', 'configuracion'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Cargar histórico cuando se selecciona el tab
  useEffect(() => {
    if (activeTab === 'historico' && user) {
      loadReportsHistory()
    }
  }, [activeTab, user])

  const loadReportsHistory = async () => {
    setLoadingReports(true)
    try {
      const response = await fetch('/api/reports-history?limit=20')
      const result = await response.json()
      
      if (result.success) {
        setReportsHistory(result.data)
      } else {
        console.error('Error loading reports:', result.error)
      }
    } catch (error) {
      console.error('Error loading reports history:', error)
    } finally {
      setLoadingReports(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      console.log('🚪 DashboardContent: Iniciando proceso de signOut...')
      
      const { error } = await signOut()
      
      if (!error) {
        console.log('✅ DashboardContent: SignOut exitoso, redirigiendo...')
        router.push('/auth')
      } else {
        console.error('❌ DashboardContent: Error en signOut:', error)
      }
    } catch (error) {
      console.error('❌ DashboardContent: Error inesperado en signOut:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            margin: 0
          }}>
            🏥 Medical IA Dashboard
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ 
              margin: 0, 
              fontWeight: '600', 
              color: '#374151',
              fontSize: '14px' 
            }}>
              {profile?.full_name || user?.email}
            </p>
            <p style={{ 
              margin: 0, 
              color: '#6b7280', 
              fontSize: '12px',
              textTransform: 'capitalize'
            }}>
              {profile?.role || 'usuario'}
            </p>
          </div>
          
          <button
            onClick={handleSignOut}
            disabled={isSigningOut || authLoading}
            style={{
              background: isSigningOut || authLoading ? '#9ca3af' : '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isSigningOut || authLoading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              opacity: isSigningOut || authLoading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSigningOut && !authLoading) {
                e.currentTarget.style.background = '#b91c1c'
              }
            }}
            onMouseLeave={(e) => {
              if (!isSigningOut && !authLoading) {
                e.currentTarget.style.background = '#dc2626'
              }
            }}
          >
            {isSigningOut ? '🚪 Cerrando sesión...' : 'Cerrar Sesión'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Welcome Card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              ¡Bienvenido, {profile?.full_name?.split(' ')[0] || 'Usuario'}! 👋
            </h2>
            <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '24px' }}>
              Sistema de consultas médicas con IA en tiempo real. Tu cuenta está configurada como{' '}
              <span style={{
                color: '#667eea',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {profile?.role}
              </span>.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {/* Quick Action Card */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => router.push('/medical')}
              >
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  🎙️ Iniciar Consulta
                </h3>
                <p style={{ fontSize: '14px', opacity: 0.9 }}>
                  Comienza una nueva sesión médica con transcripción en tiempo real
                </p>
              </div>

              {/* Reports History Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '24px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => setActiveTab('historico')}
              >
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                  📊 Histórico de Reportes
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Consulta tus reportes médicos anteriores y códigos CIE-10
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            background: 'white',
            borderRadius: '16px 16px 0 0',
            padding: '20px 24px 0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            marginBottom: '0'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '8px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <button
                onClick={() => setActiveTab('perfil')}
                style={{
                  backgroundColor: activeTab === 'perfil' ? '#667eea' : 'transparent',
                  color: activeTab === 'perfil' ? 'white' : '#6b7280',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  borderBottom: activeTab === 'perfil' ? '2px solid #667eea' : '2px solid transparent'
                }}
              >
                👤 Mi Perfil
              </button>
              
              <button
                onClick={() => setActiveTab('historico')}
                style={{
                  backgroundColor: activeTab === 'historico' ? '#667eea' : 'transparent',
                  color: activeTab === 'historico' ? 'white' : '#6b7280',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  borderBottom: activeTab === 'historico' ? '2px solid #667eea' : '2px solid transparent'
                }}
              >
                📊 Histórico de Reportes
              </button>
              
              <button
                onClick={() => setActiveTab('configuracion')}
                style={{
                  backgroundColor: activeTab === 'configuracion' ? '#667eea' : 'transparent',
                  color: activeTab === 'configuracion' ? 'white' : '#6b7280',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  borderBottom: activeTab === 'configuracion' ? '2px solid #667eea' : '2px solid transparent'
                }}
              >
                ⚙️ Configuración
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div style={{
            background: 'white',
            borderRadius: '0 0 16px 16px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            minHeight: '400px'
          }}>
            {activeTab === 'perfil' && (
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '16px'
                }}>
                  Información de la Cuenta
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '4px'
                    }}>
                      Email
                    </label>
                    <p style={{
                      padding: '8px',
                      background: '#f9fafb',
                      borderRadius: '6px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {user?.email}
                    </p>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '4px'
                    }}>
                      Nombre Completo
                    </label>
                    <p style={{
                      padding: '8px',
                      background: '#f9fafb',
                      borderRadius: '6px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {profile?.full_name || 'No especificado'}
                    </p>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '4px'
                    }}>
                      Teléfono
                    </label>
                    <p style={{
                      padding: '8px',
                      background: '#f9fafb',
                      borderRadius: '6px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {profile?.phone || 'No especificado'}
                    </p>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '4px'
                    }}>
                      Tipo de Usuario
                    </label>
                    <p style={{
                      padding: '8px',
                      background: '#f9fafb',
                      borderRadius: '6px',
                      color: '#6b7280',
                      margin: 0,
                      textTransform: 'capitalize'
                    }}>
                      {profile?.role || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'historico' && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    Histórico de Reportes Médicos
                  </h3>
                  
                  <button
                    onClick={loadReportsHistory}
                    disabled={loadingReports}
                    style={{
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: loadingReports ? 'not-allowed' : 'pointer',
                      opacity: loadingReports ? 0.6 : 1
                    }}
                  >
                    {loadingReports ? '🔄 Cargando...' : '🔄 Actualizar'}
                  </button>
                </div>

                {loadingReports ? (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid #f3f4f6',
                      borderTop: '4px solid #667eea',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  </div>
                ) : reportsHistory.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#6b7280'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
                      No hay reportes disponibles
                    </h4>
                    <p style={{ margin: 0 }}>
                      Los reportes médicos aparecerán aquí después de completar una consulta
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gap: '16px'
                  }}>
                    {reportsHistory.map((report, index) => (
                      <div key={report.id} style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '20px',
                        background: '#f9fafb',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      >
                        {/* Header del reporte */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '16px',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}>
                          <div>
                            <h4 style={{
                              margin: '0 0 4px 0',
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#1f2937'
                            }}>
                              📋 Reporte #{index + 1}
                            </h4>
                            <p style={{
                              margin: 0,
                              fontSize: '12px',
                              color: '#6b7280'
                            }}>
                              {new Date(report.updated_at).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            {report.requires_immediate_attention && (
                              <span style={{
                                background: '#fef2f2',
                                color: '#dc2626',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600',
                                border: '1px solid #fecaca'
                              }}>
                                🚨 URGENTE
                              </span>
                            )}
                            
                            <span style={{
                              background: '#ecfdf5',
                              color: '#059669',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600',
                              border: '1px solid #a7f3d0'
                            }}>
                              {report.confidence_level}% confianza
                            </span>
                          </div>
                        </div>

                        {/* Resumen */}
                        <div style={{ marginBottom: '16px' }}>
                          <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#374151',
                            lineHeight: '1.5'
                          }}>
                            {report.report_summary.length > 200 
                              ? report.report_summary.substring(0, 200) + '...'
                              : report.report_summary
                            }
                          </p>
                        </div>

                        {/* Diagnósticos CIE-10 */}
                        {report.cie10_codes.length > 0 && (
                          <div style={{ marginBottom: '16px' }}>
                            <h5 style={{
                              margin: '0 0 8px 0',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#1f2937'
                            }}>
                              🏥 Códigos CIE-10:
                            </h5>
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}>
                              {report.cie10_codes.slice(0, 3).map((cie, idx: number) => (
                                <span key={idx} style={{
                                  background: '#dbeafe',
                                  color: '#1e40af',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  border: '1px solid #93c5fd'
                                }}>
                                  {cie.code}
                                </span>
                              ))}
                              {report.cie10_codes.length > 3 && (
                                <span style={{
                                  color: '#6b7280',
                                  fontSize: '12px',
                                  padding: '4px 8px'
                                }}>
                                  +{report.cie10_codes.length - 3} más
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Stats */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '16px',
                          borderTop: '1px solid #e5e7eb',
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          <div style={{ display: 'flex', gap: '16px' }}>
                            <span>🔍 {report.diagnoses_count} diagnósticos</span>
                            <span>💊 {report.recommendations_count} recomendaciones</span>
                          </div>
                          
                          <span style={{
                            background: '#f3f4f6',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontFamily: 'monospace'
                          }}>
                            ID: {report.id.substring(0, 8)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'configuracion' && (
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '16px'
                }}>
                  Configuración
                </h3>
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
                    Próximamente
                  </h4>
                  <p style={{ margin: 0 }}>
                    Funciones de configuración estarán disponibles pronto
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
