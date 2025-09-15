'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

type NavbarProps = {
  activeSection?: 'dashboard' | 'consultas' | 'configuracion' | 'reportes';
  onSectionChange?: (section: 'consultas' | 'configuracion' | 'reportes') => void;
};

export default function Navbar({ activeSection, onSectionChange }: NavbarProps) {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    console.log('🚪 Navbar: Iniciando proceso de signOut...');
    
    try {
      // No esperar por el signOut, ejecutar inmediatamente
      signOut(); // Sin await para evitar que se cuelgue
      
      console.log('🚀 Navbar: Redirigiendo inmediatamente...');
      
      // Pequeño delay para que se procese el signOut y luego redirección forzada
      setTimeout(() => {
        console.log('✅ Navbar: Forzando redirección...');
        window.location.replace('/auth'); // replace en lugar de href para no poder volver atrás
      }, 500); // 500ms delay
      
    } catch (error) {
      console.error('❌ Navbar: Error en signOut:', error);
      // Redirección inmediata en caso de error
      window.location.replace('/auth');
    }
  };

  const isOnMedicalPage = pathname === '/medical';
  const isOnDashboard = pathname === '/dashboard';

  return (
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
        {/* Dashboard */}
        <span
          onClick={() => router.push('/dashboard')}
          style={{ 
            color: isOnDashboard ? '#2C2C2E' : '#6C6C70', 
            textDecoration: 'none', 
            fontSize: '15px', 
            fontWeight: isOnDashboard ? '700' : '500',
            textShadow: 'none',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#2C2C2E';
            e.currentTarget.style.fontWeight = '600';
          }}
          onMouseLeave={(e) => {
            if (!isOnDashboard) {
              e.currentTarget.style.color = '#6C6C70';
              e.currentTarget.style.fontWeight = '500';
            }
          }}
        >
          Dashboard
        </span>
        
        {/* Consultas */}
        <span 
          onClick={() => {
            if (isOnMedicalPage && onSectionChange) {
              onSectionChange('consultas');
            } else {
              router.push('/medical');
            }
          }}
          style={{ 
            color: (activeSection === 'consultas' || (!activeSection && isOnMedicalPage)) ? '#2C2C2E' : '#6C6C70', 
            textDecoration: 'none', 
            fontSize: '15px', 
            fontWeight: (activeSection === 'consultas' || (!activeSection && isOnMedicalPage)) ? '700' : '500',
            textShadow: 'none',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#2C2C2E';
            e.currentTarget.style.fontWeight = '600';
          }}
          onMouseLeave={(e) => {
            if (!(activeSection === 'consultas' || (!activeSection && isOnMedicalPage))) {
              e.currentTarget.style.color = '#6C6C70';
              e.currentTarget.style.fontWeight = '500';
            }
          }}
        >
          Consultas
        </span>
        
        {/* Configuración - Visible siempre */}
        <span 
          onClick={() => {
            if (isOnMedicalPage && onSectionChange) {
              // Si estamos en la página médica, cambiar sección
              onSectionChange('configuracion');
            } else {
              // Si estamos en otra página, navegar a médica con configuración
              router.push('/medical?section=configuracion');
            }
          }}
          style={{ 
            color: activeSection === 'configuracion' ? '#2C2C2E' : '#6C6C70', 
            textDecoration: 'none', 
            fontSize: '15px', 
            fontWeight: activeSection === 'configuracion' ? '700' : '500',
            textShadow: 'none',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#2C2C2E';
            e.currentTarget.style.fontWeight = '600';
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'configuracion') {
              e.currentTarget.style.color = '#6C6C70';
              e.currentTarget.style.fontWeight = '500';
            }
          }}
        >
          Configuración
        </span>
        
        {/* Reportes */}
        <span 
          onClick={() => {
            if (isOnMedicalPage && onSectionChange) {
              // Si estamos en la página médica, cambiar sección
              onSectionChange('reportes');
            } else {
              // Si estamos en otra página, navegar a médica con reportes
              router.push('/medical?section=reportes');
            }
          }}
          style={{ 
            color: activeSection === 'reportes' ? '#2C2C2E' : '#6C6C70', 
            textDecoration: 'none', 
            fontSize: '15px', 
            fontWeight: activeSection === 'reportes' ? '700' : '500',
            textShadow: 'none',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#2C2C2E';
            e.currentTarget.style.fontWeight = '600';
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'reportes') {
              e.currentTarget.style.color = '#6C6C70';
              e.currentTarget.style.fontWeight = '500';
            }
          }}
        >
          Reportes
        </span>

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
              e.currentTarget.style.background = 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(91, 156, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #5B9CFF 0%, #4A90E2 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(91, 156, 255, 0.3)';
            }}
          >
            {isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>
        </div>
      </div>
    </nav>
  );
}
