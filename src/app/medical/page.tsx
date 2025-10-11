'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import MedicalDashboard from '../../components/MedicalDashboard';

export default function MedicalPage() {
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

  return (
    <div style={{
      fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      background: 'transparent',
      color: '#1F2937',
      minHeight: '100vh'
    }}>
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
          <span
            onClick={() => router.push('/dashboard')}
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
      
      {/* Main Content */}
      <main style={{
        paddingTop: '6rem',
        minHeight: '100vh'
      }}>
        {/* Medical Dashboard Content */}
        <MedicalDashboard />
      </main>
    </div>
  );
}
