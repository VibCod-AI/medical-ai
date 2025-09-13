'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ConnectionTest from '../../components/ConnectionTest';
import AudioRecorder from '../../components/AudioRecorder';
import MedicalDashboard from '../../components/MedicalDashboard';
import Navbar from '../../components/Navbar';

export default function MedicalPage() {
  const [activeSection, setActiveSection] = useState<'consultas' | 'configuracion'>('consultas');
  const searchParams = useSearchParams();

  // Detectar parámetro de sección en la URL
  useEffect(() => {
    const section = searchParams?.get('section');
    if (section === 'configuracion') {
      setActiveSection('configuracion');
      // Limpiar la URL sin recargar la página
      const url = new URL(window.location.href);
      url.searchParams.delete('section');
      window.history.replaceState({}, '', url.pathname);
    }
  }, [searchParams]);


  const renderMainContent = () => {
    switch (activeSection) {
      case 'consultas':
        // Mostrar directamente el Dashboard Médico
        return <MedicalDashboard />;
      case 'configuracion':
        return (
          <div>
            {/* Header de Configuración */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '1200px',
              margin: '0 auto 2rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#2C2C2E',
                textAlign: 'center',
                marginBottom: '0.5rem',
                letterSpacing: '-0.3px'
              }}>
                Configuración del Sistema
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#6C6C70',
                textAlign: 'center',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Prueba la conectividad del sistema y configura las opciones de grabación y análisis
              </p>
            </div>
            
            {/* Ambas secciones en pantalla compartida */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: '2rem',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {/* Pruebas de Conectividad */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '20px',
                padding: '1.5rem',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
              }}>
                <h4 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#2C2C2E',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🔗 Pruebas de Conectividad
                </h4>
                <ConnectionTest />
              </div>

              {/* Grabación y Análisis */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '20px',
                padding: '1.5rem',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
              }}>
                <h4 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#2C2C2E',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🎙️ Grabación y Análisis
                </h4>
                <AudioRecorder />
              </div>
            </div>
          </div>
        );
      default:
        return <MedicalDashboard />;
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
      <Navbar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />
      
      {/* Main Content */}
      <main style={{
        position: 'relative',
        paddingTop: '8rem', // Space for fixed navbar
        minHeight: '100vh',
        padding: '8rem 2rem 2rem'
      }}>
        {/* Main Content - No tabs needed, controlled by navigation */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
}
