'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import PulsingBorderShader from './pulsing-border-shader'

// Medical Orb Component - Using exact PulsingBorder shader with medical colors
const MedicalOrb = () => {
  return (
    <div style={{
      position: 'relative'
    }}>
      <PulsingBorderShader />
    </div>
  )
}

export default function DashboardContent() {
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

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

  // Mostrar loading si está autenticando
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F5F5F7'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          border: '4px solid rgba(91, 156, 255, 0.2)',
          borderTop: '4px solid #4074a3',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      color: '#111827',
      overflow: 'hidden',
      fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif'
    }}>
           {/* Background gradient */}
           <div style={{
             position: 'absolute',
             inset: '0',
             background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.05) 0%, rgba(176, 224, 230, 0.05) 50%, rgba(173, 216, 230, 0.05) 100%)'
           }} />

      {/* Modern Navigation */}
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
        background: 'white',
        borderRadius: '30px',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        transition: 'none !important'
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '22px',
          fontWeight: '700',
          color: '#4074a3'
        }}>
          <img 
            src="/doctors/Codalfinalelunico.png" 
            alt="Codal Logo" 
            style={{
              width: '48px',
              height: '38px',
              borderRadius: '6px',
              objectFit: 'cover'
            }}
          />
          Codal
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
              transition: 'none !important',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#2C2C2E'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6C6C70'
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
              transition: 'none !important',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#2C2C2E'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6C6C70'
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
                background: 'linear-gradient(135deg, #4074a3 0%, #76afcf 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '20px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'none !important',
                boxShadow: '0 4px 14px rgba(91, 156, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #76afcf 0%, #4074a3 100%)'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(91, 156, 255, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #4074a3 0%, #76afcf 100%)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(91, 156, 255, 0.3)'
              }}
            >
              {isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '0 1rem',
        paddingTop: '5rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '3rem',
          alignItems: 'center',
          minHeight: '80vh'
        }}>
          {/* Left side - Text content */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            paddingRight: '2rem'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '9999px',
              border: '1px solid rgba(91, 156, 255, 0.3)',
              background: 'rgba(91, 156, 255, 0.1)',
              color: '#4074a3',
              fontSize: '0.875rem',
              fontWeight: '500',
              width: 'fit-content'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              IA Médica Avanzada
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                fontWeight: '700',
                lineHeight: '1.1',
                letterSpacing: '-0.02em'
              }}>
                Tu asistente{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #4074a3 0%, #76afcf 50%, #c3e5f3 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  médico
                </span>{' '}
                personal
              </h1>

              <p style={{
                fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
                color: '#6B7280',
                lineHeight: '1.6',
                maxWidth: '32rem'
              }}>
                Hola, {profile?.full_name?.split(' ')[0] || 'Doctor'}. Experimenta el futuro de la medicina con IA que te comprende, aprende de ti, y trabaja incansablemente para hacer tu práctica más eficiente.
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              paddingTop: '1rem'
            }}>
              <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => router.push('/medical')}
                  style={{
                    background: 'linear-gradient(135deg, #4074a3 0%, #76afcf 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '9999px',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 10px 40px rgba(91, 156, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #76afcf 0%, #4074a3 100%)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #4074a3 0%, #76afcf 100%)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Comenzar Consulta
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14"/>
                    <path d="M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  style={{
                    background: 'transparent',
                    color: '#111827',
                    border: '2px solid #E5E7EB',
                    padding: '1rem 2rem',
                    borderRadius: '9999px',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#111827'
                    e.currentTarget.style.color = 'white'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#111827'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Ver Historial
                </button>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                paddingTop: '2rem',
                fontSize: '0.875rem',
                color: '#6B7280'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#10B981',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                  Disponible 24/7
                </div>
                <div>Configuración automática</div>
                <div>Listo para hospitales</div>
              </div>
            </div>
          </div>

          {/* Right side - Medical Orb */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              position: 'relative'
            }}>
                     {/* Glow effect behind the orb */}
                     <div style={{
                       position: 'absolute',
                       inset: '0',
                       background: 'radial-gradient(circle, rgba(135, 206, 235, 0.2) 0%, rgba(176, 224, 230, 0.1) 50%, transparent 70%)',
                       filter: 'blur(60px)',
                       transform: 'scale(1.2)'
                     }} />

              {/* Main medical orb */}
              <div style={{
                position: 'relative'
              }}>
                <MedicalOrb />
              </div>

              {/* Floating medical elements */}
              <div
                style={{
                  position: 'absolute',
                  top: '-1rem',
                  right: '-1rem',
                  width: '12px',
                  height: '12px',
                  background: '#4074a3',
                  borderRadius: '50%',
                  animation: 'bounce 2s infinite',
                  animationDelay: '0s'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '33%',
                  left: '-1.5rem',
                  width: '8px',
                  height: '8px',
                  background: '#76afcf',
                  borderRadius: '50%',
                  animation: 'bounce 2s infinite',
                  animationDelay: '1s'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '25%',
                  right: '-2rem',
                  width: '16px',
                  height: '16px',
                  background: '#c3e5f3',
                  borderRadius: '50%',
                  animation: 'bounce 2s infinite',
                  animationDelay: '2s'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        height: '8rem',
        background: 'linear-gradient(to top, #F8FAFC, transparent)'
      }} />

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 100% { 
            transform: translateY(0px);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% { 
            transform: translateY(-25px);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
      `}</style>
    </div>
  )
}