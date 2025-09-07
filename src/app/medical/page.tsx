'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ConnectionTest from '../../components/ConnectionTest';
import AudioRecorder from '../../components/AudioRecorder';
import MedicalDashboard from '../../components/MedicalDashboard';
import { TabType } from '../../types/medical';

export default function MedicalPage() {
  const [activeTab, setActiveTab] = useState<TabType>('connection');
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true)
    console.log('🚪 MedicalPage: Iniciando proceso de signOut...')
    
    try {
      // No esperar por el signOut, ejecutar inmediatamente
      signOut() // Sin await para evitar que se cuelgue
      
      console.log('🚀 MedicalPage: Redirigiendo inmediatamente...')
      
      // Pequeño delay para que se procese el signOut y luego redirección forzada
      setTimeout(() => {
        console.log('✅ MedicalPage: Forzando redirección...')
        window.location.replace('/auth') // replace en lugar de href para no poder volver atrás
      }, 500) // 500ms delay
      
    } catch (error) {
      console.error('❌ MedicalPage: Error en signOut:', error)
      // Redirección inmediata en caso de error
      window.location.replace('/auth')
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'connection':
        return <ConnectionTest />;
      case 'audio':
        return <AudioRecorder />;
      case 'dashboard':
        return <MedicalDashboard />;
      default:
        return <ConnectionTest />;
    }
  };

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
          <span
            onClick={() => router.push('/dashboard')}
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
            Dashboard
          </span>
          
          <span style={{ 
            color: '#2C2C2E', 
            textDecoration: 'none', 
            fontSize: '15px', 
            fontWeight: '700',
            textShadow: 'none',
          }}>
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
        paddingTop: '8rem', // Space for fixed navbar
        minHeight: '100vh',
        padding: '8rem 2rem 2rem'
      }}>
        {/* Tab Navigation - Modern Style */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '1000px',
          margin: '0 auto 3rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#2C2C2E',
            textAlign: 'center',
            marginBottom: '2rem',
            letterSpacing: '-0.5px'
          }}>
            Consultas Médicas con IA
          </h2>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setActiveTab('connection')}
              style={{
                backgroundColor: activeTab === 'connection' ? '#5B9CFF' : 'transparent',
                color: activeTab === 'connection' ? 'white' : '#6C6C70',
                border: activeTab === 'connection' ? 'none' : '1px solid rgba(108, 108, 112, 0.3)',
                padding: '12px 24px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'connection' ? '0 4px 14px rgba(91, 156, 255, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'connection') {
                  e.currentTarget.style.backgroundColor = 'rgba(91, 156, 255, 0.1)'
                  e.currentTarget.style.color = '#5B9CFF'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'connection') {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#6C6C70'
                }
              }}
            >
              Pruebas de Conectividad
            </button>
            
            <button
              onClick={() => setActiveTab('audio')}
              style={{
                backgroundColor: activeTab === 'audio' ? '#5B9CFF' : 'transparent',
                color: activeTab === 'audio' ? 'white' : '#6C6C70',
                border: activeTab === 'audio' ? 'none' : '1px solid rgba(108, 108, 112, 0.3)',
                padding: '12px 24px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'audio' ? '0 4px 14px rgba(91, 156, 255, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'audio') {
                  e.currentTarget.style.backgroundColor = 'rgba(91, 156, 255, 0.1)'
                  e.currentTarget.style.color = '#5B9CFF'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'audio') {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#6C6C70'
                }
              }}
            >
              Grabación y Análisis
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                backgroundColor: activeTab === 'dashboard' ? '#5B9CFF' : 'transparent',
                color: activeTab === 'dashboard' ? 'white' : '#6C6C70',
                border: activeTab === 'dashboard' ? 'none' : '1px solid rgba(108, 108, 112, 0.3)',
                padding: '12px 24px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'dashboard' ? '0 4px 14px rgba(91, 156, 255, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'dashboard') {
                  e.currentTarget.style.backgroundColor = 'rgba(91, 156, 255, 0.1)'
                  e.currentTarget.style.color = '#5B9CFF'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'dashboard') {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#6C6C70'
                }
              }}
            >
              Dashboard Médico
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
