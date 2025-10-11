'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface CTASectionProps {
  onSignupClick?: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onSignupClick }) => {
  const router = useRouter();
  
  const handleSignupClick = () => {
    if (onSignupClick) {
      onSignupClick();
    } else {
      router.push('/auth');
    }
  };

  return (
    <section style={{
      width: '100%',
      paddingTop: '5rem',
      paddingBottom: '2.5rem',
      padding: '5rem 1.25rem 2.5rem 1.25rem',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible'
    }}>
      <div style={{
        position: 'absolute',
        top: '-90px',
        left: 0,
        right: 0,
        bottom: 0
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse 670px 355px at 50% -10%, rgba(91, 156, 255, 0.15) 0%, rgba(91, 156, 255, 0.05) 30%, transparent 70%)',
          filter: 'blur(40px)'
        }} />
      </div>
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '2.25rem',
        maxWidth: '64rem',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'center'
        }}>
          <h2 style={{
            color: '#111827',
            fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
            fontWeight: '600',
            lineHeight: '1.15',
            maxWidth: '435px'
          }}>
            Medicina hecha más eficiente
          </h2>
          <p style={{
            color: '#4B5563',
            fontSize: 'clamp(0.875rem, 2vw, 1rem)',
            fontWeight: '500',
            lineHeight: '1.4',
            maxWidth: '32rem'
          }}>
            Descubre cómo profesionales de la salud diagnostican más rápido, colaboran sin problemas, y atienden con confianza usando las potentes herramientas de IA de Codal
          </p>
        </div>
        <button
          onClick={handleSignupClick}
          style={{
            padding: '0.5rem 1.875rem',
            background: 'linear-gradient(135deg, #4074a3 0%, #76afcf 100%)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '500',
            lineHeight: '1.5',
            borderRadius: '99px',
            boxShadow: '0px 0px 0px 4px rgba(255,255,255,0.13)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
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
          Registrarse gratis
        </button>
      </div>
    </section>
  );
};

export default CTASection;
