'use client';

import React from 'react';
import { BackButton } from '@/design-system';

export default function TestBackButtonPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F5F5F7 0%, #E5E7EB 100%)',
      fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      padding: '2rem',
      position: 'relative'
    }}>
      {/* Diferentes variantes del botón BackButton */}
      
      {/* Glass variant - Top Left */}
      <BackButton 
        to="/" 
        label="Volver (Glass)"
        variant="glass"
        size="md"
        position="top-left"
      />

      {/* Solid variant - Top Right */}
      <BackButton 
        to="/" 
        label="Inicio (Solid)"
        variant="solid"
        size="lg"
        position="top-right"
      />

      {/* Outline variant - Bottom Left */}
      <BackButton 
        to="/" 
        label="Atrás (Outline)"
        variant="outline"
        size="sm"
        position="bottom-left"
      />

      {/* Glass variant - Bottom Right */}
      <BackButton 
        to="/" 
        label="Home (Glass)"
        variant="glass"
        size="md"
        position="bottom-right"
      />

      {/* Contenido de la página */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          color: '#1F2937',
          marginBottom: '1rem'
        }}>
          🔙 Test BackButton Component
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          color: '#6B7280',
          maxWidth: '600px',
          lineHeight: '1.6',
          marginBottom: '2rem'
        }}>
          Esta página demuestra las diferentes variantes del componente BackButton 
          de nuestro Design System. Puedes ver botones en las 4 esquinas con 
          diferentes estilos y tamaños.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1000px',
          width: '100%'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }}>
            <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>Glass Variant</h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
              Fondo translúcido con efecto blur. Perfecto para overlays y elementos flotantes.
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }}>
            <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>Solid Variant</h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
              Fondo sólido con bordes definidos. Ideal para interfaces más tradicionales.
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }}>
            <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>Outline Variant</h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
              Fondo transparente con borde de color. Perfecto para acciones secundarias.
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }}>
            <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>Tamaños</h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
              Disponible en 3 tamaños: sm (pequeño), md (mediano), lg (grande).
            </p>
          </div>
        </div>

        <div style={{
          marginTop: '3rem',
          padding: '1.5rem',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <p style={{
            color: '#1D4ED8',
            fontSize: '0.9rem',
            margin: 0
          }}>
            💡 <strong>Tip:</strong> Haz hover sobre los botones para ver las animaciones y efectos de transición.
          </p>
        </div>
      </div>
    </div>
  );
}
