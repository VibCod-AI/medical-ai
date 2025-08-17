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
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px 60px',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 24px'
        }}></div>
        
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          marginBottom: '8px'
        }}>
          🏥 Medical IA
        </h1>
        
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '16px',
          fontSize: '16px'
        }}>
          Sistema de Consultas Médicas con IA
        </p>
        
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '14px',
          color: '#64748b'
        }}>
          {loading ? 'Verificando autenticación...' : 'Redirigiendo...'}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}