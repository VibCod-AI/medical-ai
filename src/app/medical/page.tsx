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
    try {
      setIsSigningOut(true)
      console.log('🚪 MedicalPage: Iniciando proceso de signOut...')
      
      const { error } = await signOut();
      
      if (!error) {
        console.log('✅ MedicalPage: SignOut exitoso, redirigiendo...')
        router.push('/auth');
      } else {
        console.error('❌ MedicalPage: Error en signOut:', error)
      }
    } catch (error) {
      console.error('❌ MedicalPage: Error inesperado en signOut:', error)
    } finally {
      setIsSigningOut(false)
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
    <div style={{ minHeight: '100vh' }}>
      {/* Header con navegación y usuario */}
      <header style={{ 
        backgroundColor: '#1f2937', 
        padding: '20px',
        color: 'white',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Top bar con usuario */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '32px', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #60a5fa 0%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                🏥 Medical IA
              </h1>
              <p style={{ 
                margin: '8px 0 0 0', 
                opacity: 0.9,
                fontSize: '18px'
              }}>
                Consultas Médicas con IA en Tiempo Real - Next.js
              </p>
            </div>

            {/* Info del usuario */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '12px 20px',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ 
                  margin: 0, 
                  fontWeight: '600', 
                  fontSize: '14px' 
                }}>
                  {profile?.full_name || user?.email}
                </p>
                <p style={{ 
                  margin: 0, 
                  opacity: 0.8, 
                  fontSize: '12px',
                  textTransform: 'capitalize'
                }}>
                  {profile?.role || 'usuario'}
                </p>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={() => router.push('/dashboard')}
                  style={{
                    background: 'rgba(59, 130, 246, 0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.8)'}
                >
                  📊 Dashboard
                </button>
                
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut || authLoading}
                  style={{
                    background: isSigningOut || authLoading ? 'rgba(156, 163, 175, 0.8)' : 'rgba(220, 38, 38, 0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: isSigningOut || authLoading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                    opacity: isSigningOut || authLoading ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isSigningOut && !authLoading) {
                      e.currentTarget.style.background = 'rgba(220, 38, 38, 1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSigningOut && !authLoading) {
                      e.currentTarget.style.background = 'rgba(220, 38, 38, 0.8)'
                    }
                  }}
                >
                  {isSigningOut ? '🚪 Saliendo...' : '🚪 Salir'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Navegación por Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setActiveTab('connection')}
              style={{
                backgroundColor: activeTab === 'connection' ? '#2563eb' : 'transparent',
                color: 'white',
                border: '2px solid #2563eb',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === 'connection' ? '700' : '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🔗 Conectividad
            </button>
            
            <button
              onClick={() => setActiveTab('audio')}
              style={{
                backgroundColor: activeTab === 'audio' ? '#16a34a' : 'transparent',
                color: 'white',
                border: '2px solid #16a34a',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === 'audio' ? '700' : '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🎙️ Grabación Audio
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                backgroundColor: activeTab === 'dashboard' ? '#7c3aed' : 'transparent',
                color: 'white',
                border: '2px solid #7c3aed',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === 'dashboard' ? '700' : '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🩺 Dashboard Médico
            </button>
          </div>
        </div>
      </header>
      
      {/* Contenido principal */}
      <main style={{ 
        background: '#f8fafc',
        minHeight: 'calc(100vh - 140px)'
      }}>
        {renderTabContent()}
      </main>

      {/* Footer */}
      <footer style={{
        background: '#374151',
        color: 'white',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            © 2024 Medical IA - Sistema de Consultas Médicas con IA
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '16px',
            fontSize: '14px',
            opacity: 0.8
          }}>
            <span>🚀 Next.js 15</span>
            <span>⚡ TypeScript</span>
            <span>🎯 WebRTC</span>
            <span>🧠 IA Médica</span>
            <span>🔐 Supabase Auth</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
