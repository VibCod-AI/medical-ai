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
    setIsSigningOut(true)
    console.log('🚪 DashboardContent: Iniciando proceso de signOut...')
    
    try {
      // No esperar por el signOut, ejecutar inmediatamente
      signOut() // Sin await para evitar que se cuelgue
      
      console.log('🚀 DashboardContent: Redirigiendo inmediatamente...')
      
      // Pequeño delay para que se procese el signOut y luego redirección forzada
      setTimeout(() => {
        console.log('✅ DashboardContent: Forzando redirección...')
        window.location.replace('/auth') // replace en lugar de href para no poder volver atrás
      }, 500) // 500ms delay
      
    } catch (error) {
      console.error('❌ DashboardContent: Error en signOut:', error)
      // Redirección inmediata en caso de error
      window.location.replace('/auth')
    }
  }

  return (
    <div style={{
      fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      background: '#F5F5F7',
      color: '#2C2C2E',
      minHeight: '100vh'
    }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: '1rem',
        left: '2rem',
        right: '2rem',
        zIndex: 100,
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '30px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          fontSize: '22px',
          fontWeight: '700',
          color: '#2C2C2E'
        }}>
          Medical AI
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2.5rem'
        }}>
          <span style={{ 
            color: '#2C2C2E', 
            textDecoration: 'none', 
            fontSize: '15px', 
            fontWeight: '700',
            textShadow: 'none',
          }}>
            Dashboard
          </span>
          
          <span
            onClick={() => router.push('/medical')}
            style={{ 
              color: '#6C6C70', 
              textDecoration: 'none', 
              fontSize: '15px', 
              fontWeight: '500',
              textShadow: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#2C2C2E'
              e.currentTarget.style.fontWeight = '600'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6C6C70'
              e.currentTarget.style.fontWeight = '500'
            }}
          >
            Consultas
          </span>
          
          <a 
            href="#reports" 
            style={{ 
              color: '#6C6C70', 
              textDecoration: 'none', 
              fontSize: '15px', 
              fontWeight: '500',
              textShadow: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#2C2C2E'
              e.currentTarget.style.fontWeight = '600'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6C6C70'
              e.currentTarget.style.fontWeight = '500'
            }}
          >
            Reportes
          </a>

          {/* User Profile Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginLeft: '1rem',
            paddingLeft: '1rem',
            borderLeft: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <div style={{
              color: '#2C2C2E',
              fontSize: '14px',
              fontWeight: '500',
              textShadow: 'none'
            }}>
              {profile?.full_name || user?.email || 'Usuario'}
            </div>
            
            <button
              onClick={handleSignOut}
              disabled={isSigningOut || authLoading}
              style={{
                background: 'linear-gradient(135deg, #5B9CFF 0%, #4A90E2 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '20px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(91, 156, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(91, 156, 255, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #5B9CFF 0%, #4A90E2 100%)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(91, 156, 255, 0.3)'
              }}
            >
              {isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '8rem 2rem 2rem 2rem' // Top padding for fixed navbar
      }}>
        {/* Hero Text */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem',
          zIndex: 10
        }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: '1.5rem',
            color: '#2C2C2E',
            letterSpacing: '-0.02em'
          }}>
            Bienvenido a tu
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #5B9CFF 0%, #4A90E2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Dashboard Médico
            </span>
          </h1>
          <p style={{
            fontSize: '1.375rem',
            color: '#6C6C70',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.5',
            fontWeight: '400'
          }}>
            Hola, {profile?.full_name?.split(' ')[0] || 'Doctor'}. Tu asistente médico IA está listo para ayudarte con diagnósticos y consultas de pacientes.
          </p>
        </div>

        {/* Orb Container */}
        <div style={{ position: 'relative', marginBottom: '3rem' }}>
          <div className="orb-video"></div>
          
          {/* Search input overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ position: 'relative', width: '350px' }}>
              <input
                type="text"
                placeholder="Buscar insights médicos, síntomas, interacciones..."
                style={{
                  width: '100%',
                  padding: '1rem 3rem 1rem 1.5rem',
                  fontSize: '16px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  borderRadius: '25px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  outline: 'none',
                  color: '#2C2C2E',
                  fontFamily: '"SF Pro Display", "Inter", system-ui, sans-serif'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#5B9CFF'
                  e.target.style.boxShadow = '0 15px 35px rgba(91, 156, 255, 0.2)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.8)'
                  e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <button style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderRadius: '50%',
                background: '#5B9CFF',
                border: 'none',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(91, 156, 255, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#4A90E2'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#5B9CFF'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
              }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m5 12 7-7 7 7"/>
                  <path d="m12 19 0-14"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          maxWidth: '1000px',
          width: '100%',
          marginBottom: '4rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#5B9CFF',
              marginBottom: '0.5rem'
            }}>
              {reportsHistory.length}
            </div>
            <div style={{
              color: '#6C6C70',
              fontSize: '0.875rem',
              fontWeight: '500',
              lineHeight: '1.4'
            }}>
              Consultas médicas<br />completadas
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#5B9CFF',
              marginBottom: '0.5rem'
            }}>
              24/7
            </div>
            <div style={{
              color: '#6C6C70',
              fontSize: '0.875rem',
              fontWeight: '500',
              lineHeight: '1.4'
            }}>
              Asistente médico IA<br />disponibilidad
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#5B9CFF',
              marginBottom: '0.5rem'
            }}>
              97.3%
            </div>
            <div style={{
              color: '#6C6C70',
              fontSize: '0.875rem',
              fontWeight: '500',
              lineHeight: '1.4'
            }}>
              Precisión diagnóstica<br />del sistema
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#5B9CFF',
              marginBottom: '0.5rem'
            }}>
              ●
            </div>
            <div style={{
              color: '#6C6C70',
              fontSize: '0.875rem',
              fontWeight: '500',
              lineHeight: '1.4'
            }}>
              Estado del sistema<br />médico IA
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          width: '100%',
          marginBottom: '4rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)'
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(91, 156, 255, 0.15)'
            e.currentTarget.style.borderColor = 'rgba(91, 156, 255, 0.3)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.08)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)'
          }}
          onClick={() => router.push('/medical')}
          >
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #5B9CFF 0%, #4A90E2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '24px',
              color: 'white',
              boxShadow: '0 8px 16px rgba(91, 156, 255, 0.3)'
            }}>
              ⚕
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#2C2C2E',
              marginBottom: '0.5rem'
            }}>
              Nueva Consulta
            </h3>
            <p style={{
              color: '#6C6C70',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.5'
            }}>
              Inicia una nueva consulta de paciente con insights médicos IA en tiempo real y recomendaciones de diagnóstico
            </p>
            <button style={{
              background: '#5B9CFF',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '25px',
              border: 'none',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(91, 156, 255, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#4A90E2'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(91, 156, 255, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#5B9CFF'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(91, 156, 255, 0.3)'
            }}
            >
              Iniciar Consulta Médica
            </button>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)'
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(91, 156, 255, 0.15)'
            e.currentTarget.style.borderColor = 'rgba(91, 156, 255, 0.3)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.08)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)'
          }}
          onClick={() => setActiveTab('historico')}
          >
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #5B9CFF 0%, #4A90E2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '24px',
              color: 'white',
              boxShadow: '0 8px 16px rgba(91, 156, 255, 0.3)'
            }}>
              📊
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#2C2C2E',
              marginBottom: '0.5rem'
            }}>
              Análisis Médicos
            </h3>
            <p style={{
              color: '#6C6C70',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.5'
            }}>
              Rastrea precisión diagnóstica, resultados de pacientes, alertas de interacción de medicamentos y métricas de rendimiento de IA médica
            </p>
            <button style={{
              background: 'rgba(91, 156, 255, 0.1)',
              color: '#5B9CFF',
              padding: '0.75rem 2rem',
              borderRadius: '25px',
              border: '2px solid #5B9CFF',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#5B9CFF'
              e.currentTarget.style.color = 'white'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(91, 156, 255, 0.1)'
              e.currentTarget.style.color = '#5B9CFF'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            >
              Ver Datos Médicos
            </button>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)'
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(44, 44, 46, 0.15)'
            e.currentTarget.style.borderColor = 'rgba(44, 44, 46, 0.3)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.08)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)'
          }}
          onClick={() => setActiveTab('historico')}
          >
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #2C2C2E 0%, #1C1C1E 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '24px',
              color: 'white',
              boxShadow: '0 8px 16px rgba(44, 44, 46, 0.3)'
            }}>
              📋
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#2C2C2E',
              marginBottom: '0.5rem'
            }}>
              Registros Médicos
            </h3>
            <p style={{
              color: '#6C6C70',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.5'
            }}>
              Accede al historial de consultas de pacientes, reportes médicos, resúmenes diagnósticos y recomendaciones de tratamiento
            </p>
            <button style={{
              background: 'rgba(44, 44, 46, 0.1)',
              color: '#2C2C2E',
              padding: '0.75rem 2rem',
              borderRadius: '25px',
              border: '2px solid #2C2C2E',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#2C2C2E'
              e.currentTarget.style.color = 'white'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(44, 44, 46, 0.1)'
              e.currentTarget.style.color = '#2C2C2E'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            >
              Ver Registros de Pacientes
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Modern Style */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '800px',
          width: '100%',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <button
              onClick={() => setActiveTab('perfil')}
              style={{
                backgroundColor: activeTab === 'perfil' ? '#5B9CFF' : 'transparent',
                color: activeTab === 'perfil' ? 'white' : '#6C6C70',
                border: activeTab === 'perfil' ? 'none' : '1px solid rgba(108, 108, 112, 0.3)',
                padding: '12px 24px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'perfil' ? '0 4px 14px rgba(91, 156, 255, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'perfil') {
                  e.currentTarget.style.backgroundColor = 'rgba(91, 156, 255, 0.1)'
                  e.currentTarget.style.color = '#5B9CFF'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'perfil') {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#6C6C70'
                }
              }}
            >
              👤 Mi Perfil
            </button>
            
            <button
              onClick={() => setActiveTab('historico')}
              style={{
                backgroundColor: activeTab === 'historico' ? '#5B9CFF' : 'transparent',
                color: activeTab === 'historico' ? 'white' : '#6C6C70',
                border: activeTab === 'historico' ? 'none' : '1px solid rgba(108, 108, 112, 0.3)',
                padding: '12px 24px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'historico' ? '0 4px 14px rgba(91, 156, 255, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'historico') {
                  e.currentTarget.style.backgroundColor = 'rgba(91, 156, 255, 0.1)'
                  e.currentTarget.style.color = '#5B9CFF'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'historico') {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#6C6C70'
                }
              }}
            >
              📊 Histórico de Reportes
            </button>
            
            <button
              onClick={() => setActiveTab('configuracion')}
              style={{
                backgroundColor: activeTab === 'configuracion' ? '#5B9CFF' : 'transparent',
                color: activeTab === 'configuracion' ? 'white' : '#6C6C70',
                border: activeTab === 'configuracion' ? 'none' : '1px solid rgba(108, 108, 112, 0.3)',
                padding: '12px 24px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'configuracion' ? '0 4px 14px rgba(91, 156, 255, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'configuracion') {
                  e.currentTarget.style.backgroundColor = 'rgba(91, 156, 255, 0.1)'
                  e.currentTarget.style.color = '#5B9CFF'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'configuracion') {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#6C6C70'
                }
              }}
            >
              ⚙️ Configuración
            </button>
          </div>

          {/* Tab Content */}
          <div style={{
            minHeight: '300px'
          }}>
            {activeTab === 'perfil' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2C2C2E',
                  marginBottom: '1.5rem'
                }}>
                  Información de la Cuenta
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem',
                  textAlign: 'left'
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.8)'
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2C2C2E',
                      marginBottom: '8px'
                    }}>
                      Email
                    </label>
                    <p style={{
                      margin: 0,
                      color: '#6C6C70',
                      fontSize: '15px'
                    }}>
                      {user?.email}
                    </p>
                  </div>
                  
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.8)'
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2C2C2E',
                      marginBottom: '8px'
                    }}>
                      Nombre Completo
                    </label>
                    <p style={{
                      margin: 0,
                      color: '#6C6C70',
                      fontSize: '15px'
                    }}>
                      {profile?.full_name || 'No especificado'}
                    </p>
                  </div>
                  
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.8)'
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2C2C2E',
                      marginBottom: '8px'
                    }}>
                      Teléfono
                    </label>
                    <p style={{
                      margin: 0,
                      color: '#6C6C70',
                      fontSize: '15px'
                    }}>
                      {profile?.phone || 'No especificado'}
                    </p>
                  </div>
                  
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.8)'
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2C2C2E',
                      marginBottom: '8px'
                    }}>
                      Tipo de Usuario
                    </label>
                    <p style={{
                      margin: 0,
                      color: '#6C6C70',
                      fontSize: '15px',
                      textTransform: 'capitalize'
                    }}>
                      {profile?.role || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'historico' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#2C2C2E',
                    margin: 0
                  }}>
                    Histórico de Reportes Médicos
                  </h3>
                  
                  <button
                    onClick={loadReportsHistory}
                    disabled={loadingReports}
                    style={{
                      background: loadingReports ? 'rgba(91, 156, 255, 0.5)' : '#5B9CFF',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '12px 24px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: loadingReports ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: loadingReports ? 'none' : '0 4px 14px rgba(91, 156, 255, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (!loadingReports) {
                        e.currentTarget.style.background = '#4A90E2'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loadingReports) {
                        e.currentTarget.style.background = '#5B9CFF'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }
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
                      border: '4px solid rgba(91, 156, 255, 0.2)',
                      borderTop: '4px solid #5B9CFF',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  </div>
                ) : reportsHistory.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    color: '#6C6C70'
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '1rem' }}>📊</div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#2C2C2E', fontSize: '1.25rem', fontWeight: '600' }}>
                      No hay reportes disponibles
                    </h4>
                    <p style={{ margin: 0, fontSize: '1rem' }}>
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
              <div style={{ textAlign: 'center' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2C2C2E',
                  marginBottom: '2rem'
                }}>
                  Configuración
                </h3>
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  color: '#6C6C70'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '1rem' }}>⚙️</div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#2C2C2E', fontSize: '1.25rem', fontWeight: '600' }}>
                    Próximamente
                  </h4>
                  <p style={{ margin: 0, fontSize: '1rem' }}>
                    Funciones de configuración estarán disponibles pronto
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        /* Custom orb styling to match medical-ai-copy design */
        .orb-video {
          width: 300px;
          height: 300px;
          margin: 0 auto;
          border-radius: 50%;
          box-shadow: 0 0 50px 0 #d2ddf6, inset 0 0 30px rgba(255, 255, 255, 0.3), inset -10px -10px 20px rgba(0, 0, 0, 0.1);
          position: relative;
          background: radial-gradient(circle at 30% 30%, #f8fafc, #e2eaf2, #d4dde6, #c6d0da, #b8c3ce);
          animation: jellyFloat 4s ease-in-out infinite, randomRotate 8s linear infinite;
          overflow: hidden;
        }

        /* Added jelly-like floating animation with scale and rotation */
        @keyframes jellyFloat {
          0%, 100% {
            transform: translateY(0px) scale(1) rotate(0deg);
          }
          25% {
            transform: translateY(-8px) scale(1.02, 0.98) rotate(1deg);
          }
          50% {
            transform: translateY(-15px) scale(0.98, 1.02) rotate(-0.5deg);
          }
          75% {
            transform: translateY(-8px) scale(1.01, 0.99) rotate(0.8deg);
          }
        }

        /* Added random rotation animation */
        @keyframes randomRotate {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(72deg); }
          40% { transform: rotate(144deg); }
          60% { transform: rotate(216deg); }
          80% { transform: rotate(288deg); }
          100% { transform: rotate(360deg); }
        }

        /* Added primary shine effect using ::before */
        .orb-video::before {
          content: "";
          position: absolute;
          top: 15%;
          left: 20%;
          width: 40%;
          height: 40%;
          background: radial-gradient(
            ellipse at center,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 0.4) 40%,
            transparent 70%
          );
          border-radius: 50%;
          animation: shineMove 3s ease-in-out infinite;
          z-index: 1;
        }

        /* Added secondary shine effect using ::after */
        .orb-video::after {
          content: "";
          position: absolute;
          top: 60%;
          right: 25%;
          width: 25%;
          height: 25%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 80%);
          border-radius: 50%;
          animation: shineMove2 4s ease-in-out infinite reverse;
          z-index: 1;
        }

        /* Animation for primary shine movement */
        @keyframes shineMove {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(10px, -5px) scale(1.1);
            opacity: 0.8;
          }
        }

        /* Animation for secondary shine movement */
        @keyframes shineMove2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translate(-8px, 8px) scale(0.9);
            opacity: 0.6;
          }
        }

        /* Spin animation for loading indicators */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
