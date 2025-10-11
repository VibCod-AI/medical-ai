'use client';

import React from 'react';

interface FooterSectionProps {
  onScrollToSection?: (sectionId: string) => void;
}

const FooterSection: React.FC<FooterSectionProps> = ({ onScrollToSection }) => {
  const scrollToSection = (sectionId: string) => {
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  return (
    <footer style={{
      width: '100%',
      maxWidth: '1320px',
      margin: '0 auto',
      padding: '2.5rem 1.25rem 4.375rem 1.25rem',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '2rem',
      flexWrap: 'wrap'
    }}>
      {/* Left Section: Logo, Description, Social Links */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: '2rem',
        padding: '1rem 2rem'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'stretch',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => scrollToSection('hero')}
            style={{
              textAlign: 'center',
              color: '#111827',
              fontSize: '1.25rem',
              fontWeight: '600',
              lineHeight: '1',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            Medical AI
          </button>
        </div>
        <p style={{
          color: 'rgba(44, 44, 46, 0.9)',
          fontSize: '0.875rem',
          fontWeight: '500',
          lineHeight: '1.3',
          textAlign: 'left'
        }}>
          Medicina hecha más eficiente
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <a href="#" style={{ width: '1rem', height: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#4B5563">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
            </svg>
          </a>
          <a href="#" style={{ width: '1rem', height: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#4B5563">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
              <path d="M9 18c-4.51 2-5-2-7-2"/>
            </svg>
          </a>
          <a href="#" style={{ width: '1rem', height: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#4B5563">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect width="4" height="12" x="2" y="9"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
        </div>
      </div>
      {/* Right Section: Navigation Links */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '3rem',
        padding: '1rem 2rem',
        width: 'auto',
        minWidth: '400px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <h3 style={{
            color: '#4B5563',
            fontSize: '0.875rem',
            fontWeight: '500',
            lineHeight: '1.25rem'
          }}>
            Navegación
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <button 
              onClick={() => scrollToSection('features')}
              style={{
                color: '#111827',
                fontSize: '0.875rem',
                fontWeight: '400',
                lineHeight: '1.25rem',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}>
              Características
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              style={{
                color: '#111827',
                fontSize: '0.875rem',
                fontWeight: '400',
                lineHeight: '1.25rem',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}>
              Cómo Funciona
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              style={{
                color: '#111827',
                fontSize: '0.875rem',
                fontWeight: '400',
                lineHeight: '1.25rem',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}>
              Precios
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              style={{
                color: '#111827',
                fontSize: '0.875rem',
                fontWeight: '400',
                lineHeight: '1.25rem',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}>
              FAQ
            </button>
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <h3 style={{
            color: '#4B5563',
            fontSize: '0.875rem',
            fontWeight: '500',
            lineHeight: '1.25rem'
          }}>
            Soporte
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <a href="mailto:support@medical-ai.com" style={{
              color: '#111827',
              fontSize: '0.875rem',
              fontWeight: '400',
              lineHeight: '1.25rem',
              textDecoration: 'none'
            }}>
              Contacto
            </a>
            <a href="/privacy" style={{
              color: '#111827',
              fontSize: '0.875rem',
              fontWeight: '400',
              lineHeight: '1.25rem',
              textDecoration: 'none'
            }}>
              Privacidad
            </a>
            <a href="/terms" style={{
              color: '#111827',
              fontSize: '0.875rem',
              fontWeight: '400',
              lineHeight: '1.25rem',
              textDecoration: 'none'
            }}>
              Términos
            </a>
            <a href="/security" style={{
              color: '#111827',
              fontSize: '0.875rem',
              fontWeight: '400',
              lineHeight: '1.25rem',
              textDecoration: 'none'
            }}>
              Seguridad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
