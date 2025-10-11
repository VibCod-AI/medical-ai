'use client';

import React from 'react';

const FeaturesSection: React.FC = () => {
  return (
    <>
      {/* Product Features Section */}
      <section id="product-features" style={{
        padding: '8rem 1.25rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          marginBottom: '2rem',
          textAlign: 'center',
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: '800',
          letterSpacing: 'tight',
          color: '#2C2C2E'
        }}>
          Lo que nos hace la mejor plataforma para ti.
        </h2>

        <div style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
        }}>
          {/* Adaptability Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.15)',
            borderRadius: '16px',
            padding: '2rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <p style={{
              fontSize: '11px',
              letterSpacing: '0.2em',
              color: '#4B5563',
              marginBottom: '0.5rem',
              textTransform: 'uppercase'
            }}>
              ADAPTABILIDAD
            </p>
            <h3 style={{
              marginTop: '0.25rem',
              fontSize: '1.25rem',
              color: '#111827',
              marginBottom: '1.5rem',
              fontWeight: '600'
            }}>
              Hace la experiencia verdaderamente intuitiva
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem'
            }}>
              <div style={{
                position: 'relative',
                aspectRatio: '3/4',
                overflow: 'hidden',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(229, 231, 235, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280',
                fontSize: '0.875rem'
              }}>
                [Imagen médica 1]
              </div>
              <div style={{
                position: 'relative',
                aspectRatio: '3/4',
                overflow: 'hidden',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(229, 231, 235, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280',
                fontSize: '0.875rem'
              }}>
                [Imagen médica 2]
              </div>
            </div>
          </div>

          {/* Client Love Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.15)',
            borderRadius: '16px',
            padding: '2rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <p style={{
              fontSize: '11px',
              letterSpacing: '0.2em',
              color: '#4B5563',
              marginBottom: '0.5rem',
              textTransform: 'uppercase'
            }}>
              AMOR DEL CLIENTE
            </p>
            <h3 style={{
              marginTop: '0.25rem',
              fontSize: '1.25rem',
              color: '#111827',
              marginBottom: '1.5rem',
              fontWeight: '600'
            }}>
              Su trabajo no solo se veía bien, mejoró resultados — nuestros pacientes sintieron la diferencia al instante.
            </h3>
            <div style={{
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '1rem'
            }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: '#4074a3'
              }}>
                4.9
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="#4074a3">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem'
            }}>
              <div style={{
                height: '160px',
                width: '100%',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(229, 231, 235, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280',
                fontSize: '0.875rem'
              }}>
                [Imagen dashboard 1]
              </div>
              <div style={{
                height: '160px',
                width: '100%',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(229, 231, 235, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280',
                fontSize: '0.875rem'
              }}>
                [Imagen dashboard 2]
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        padding: '8rem 1.25rem',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '11px',
          letterSpacing: '0.2em',
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: '1rem',
          textTransform: 'uppercase'
        }}>
          OPTIMIZA TUS CONSULTAS
        </p>
        <h2 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: '800',
          color: '#2C2C2E',
          marginBottom: '1rem',
          lineHeight: '1.2'
        }}>
          Previsualiza y aprueba análisis médicos de alta calidad desde cualquier lugar
        </h2>
        <p style={{
          fontSize: '1.25rem',
          color: '#374151',
          marginBottom: '3rem',
          maxWidth: '600px',
          margin: '0 auto 3rem auto',
          lineHeight: '1.6'
        }}>
          Revisa diagnósticos, deja comentarios con marcas de tiempo, y aprueba casos desde cualquier lugar. Usando nuestras herramientas de revisión y colaboración médica
        </p>
        <div style={{
          position: 'relative',
          aspectRatio: '16/9',
          maxWidth: '800px',
          margin: '0 auto',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '1.125rem'
        }}>
          [Video de demostración médica]
        </div>
      </section>
    </>
  );
};

export default FeaturesSection;
