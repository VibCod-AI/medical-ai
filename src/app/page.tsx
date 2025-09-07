'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  console.log('🏠 HomePage: Renderizando - loading:', loading, 'user:', user ? 'Existe' : 'No existe');

  useEffect(() => {
    console.log('🏠 HomePage: useEffect - loading:', loading, 'user:', user ? 'Existe' : 'No existe');
    
    if (!loading) {
      if (user) {
        console.log('🏠 HomePage: Redirigiendo a /medical');
        router.push('/medical');
      } else {
        console.log('🏠 HomePage: Redirigiendo a /auth');
        router.push('/auth');
      }
    } else {
      console.log('🏠 HomePage: Esperando... loading =', loading);
    }
  }, [user, loading, router]);

  // Mostrar loading mientras se verifica autenticación
  return (
    <div style={{
      fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      background: '#F5F5F7',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorations */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '15%',
        width: '300px',
        height: '300px',
        background: 'rgba(91, 156, 255, 0.1)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'pulse 4s infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '15%',
        width: '400px',
        height: '400px',
        background: 'rgba(74, 144, 226, 0.1)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'pulse 4s infinite 2s'
      }}></div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        padding: 'clamp(40px, 8vw, 60px)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%',
        margin: '0 2rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          border: '4px solid rgba(91, 156, 255, 0.2)',
          borderTop: '4px solid #5B9CFF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 2rem'
        }}></div>
        
        <h1 style={{
          fontSize: 'clamp(28px, 6vw, 36px)',
          fontWeight: '700',
          color: '#2C2C2E',
          marginBottom: '0.5rem',
          letterSpacing: '-0.5px'
        }}>
          Medical AI
        </h1>
        
        <p style={{ 
          color: '#6C6C70', 
          marginBottom: '2rem',
          fontSize: 'clamp(16px, 4vw, 18px)',
          lineHeight: '1.5',
          fontWeight: '400'
        }}>
          Sistema de Consultas Médicas con IA
        </p>
        
        <div style={{
          background: 'rgba(91, 156, 255, 0.1)',
          border: '1px solid rgba(91, 156, 255, 0.2)',
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          fontSize: '15px',
          color: '#2C2C2E',
          fontWeight: '500',
          backdropFilter: 'blur(10px)'
        }}>
          {loading ? 'Verificando autenticación...' : 'Redirigiendo...'}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}