'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface HeroSectionProps {
  onGetStartedClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStartedClick }) => {
  const router = useRouter();

  const handleGetStartedClick = () => {
    if (onGetStartedClick) {
      onGetStartedClick();
    } else {
      router.push('/auth');
    }
  };

  return (
    <section id="hero" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '8rem 2rem 2rem 2rem',
      textAlign: 'center',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>
        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: '800',
          lineHeight: '1.1',
          marginBottom: '1.5rem',
          letterSpacing: '-0.02em',
          color: '#111827'
        }}>
          Revoluciona las
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #5B9CFF 0%, #4A90E2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Consultas Médicas
          </span>
          <br />
          con IA
        </h1>
        
        <p style={{
          fontSize: '1.375rem',
          color: '#4B5563',
          marginBottom: '3rem',
          lineHeight: '1.6',
          fontWeight: '400'
        }}>
          Sistema revolucionario de análisis médico en tiempo real con transcripción inteligente, 
          análisis de IA y generación automática de informes médicos completos con códigos CIE-10.
        </p>

        <div style={{
          display: 'flex',
          gap: '1.5rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '4rem'
        }}>
          <button
            onClick={handleGetStartedClick}
            style={{
              background: 'linear-gradient(135deg, #5B9CFF 0%, #4A90E2 100%)',
              color: '#111827',
              border: 'none',
              padding: '1rem 2.5rem',
              borderRadius: '25px',
              fontSize: '1.125rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(91, 156, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)'
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(91, 156, 255, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #5B9CFF 0%, #4A90E2 100%)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(91, 156, 255, 0.3)'
            }}
          >
            Comenzar Ahora
          </button>
          
          <button
            style={{
              background: 'rgba(91, 156, 255, 0.1)',
              color: '#5B9CFF',
              border: '2px solid #5B9CFF',
              padding: '1rem 2.5rem',
              borderRadius: '25px',
              fontSize: '1.125rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#5B9CFF'
              e.currentTarget.style.color = 'white'
              e.currentTarget.style.transform = 'translateY(-3px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(91, 156, 255, 0.1)'
              e.currentTarget.style.color = '#5B9CFF'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Ver Demo
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '2rem',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: '20px',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#5B9CFF',
              marginBottom: '0.5rem'
            }}>
              97.3%
            </div>
            <div style={{
              color: '#4B5563',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Precisión Diagnóstica
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: '20px',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#5B9CFF',
              marginBottom: '0.5rem'
            }}>
              24/7
            </div>
            <div style={{
              color: '#4B5563',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Disponibilidad
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: '20px',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#5B9CFF',
              marginBottom: '0.5rem'
            }}>
              &lt;3s
            </div>
            <div style={{
              color: '#4B5563',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Análisis en Tiempo Real
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
