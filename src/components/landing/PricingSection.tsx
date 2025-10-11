'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface PricingPlanProps {
  title: string;
  description: string;
  price: string;
  features: string[];
  isDark?: boolean;
  onGetStartedClick?: () => void;
}

const PricingPlan: React.FC<PricingPlanProps> = ({ 
  title, 
  description, 
  price, 
  features, 
  isDark = false,
  onGetStartedClick 
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onGetStartedClick) {
      onGetStartedClick();
    } else {
      router.push('/auth');
    }
  };

  if (isDark) {
    return (
      <div style={{
        background: '#262626',
        borderRadius: '24px',
        padding: '8px',
        boxShadow: '0 12px 50px -15px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          background: '#2C2C2E',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '8px'
        }}>
          <h3 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '0.5rem',
            letterSpacing: '-0.025em'
          }}>
            {title}
          </h3>
          <p style={{
            color: '#9CA3AF',
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '2rem'
          }}>
            {description}
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            marginBottom: '2rem'
          }}>
            <span style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: 'white',
              letterSpacing: '-0.05em'
            }}>
              {price}
            </span>
            <span style={{
              color: '#6B7280',
              fontSize: '1.125rem',
              marginLeft: '0.25rem'
            }}>
              /mes
            </span>
          </div>
          <button
            onClick={handleClick}
            style={{
              width: '100%',
              background: 'white',
              color: '#111827',
              padding: '1rem',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '1rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              boxShadow: '0 4px 20px -5px rgba(255,255,255,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            Comenzar Prueba
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
              <path d="M8 2v4"/>
              <path d="M16 2v4"/>
              <rect width="18" height="18" x="3" y="4" rx="2"/>
              <path d="M3 10h18"/>
            </svg>
          </button>
        </div>
        <div style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
          paddingBottom: '1.5rem',
          paddingTop: '1rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: 'auto'
          }}>
            {features.map((feature) => (
              <div key={feature} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="8" cy="8" r="7.5" stroke="#4B5563" fill="none" />
                  <path d="M5.5 8.5L7 10L11 6" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{
                  color: '#D1D5DB',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button style={{
                position: 'relative',
                display: 'inline-flex',
                height: '24px',
                width: '40px',
                alignItems: 'center',
                borderRadius: '9999px',
                backgroundColor: '#2C2C2E',
                transition: 'background-color 0.2s ease-in-out',
                border: 'none',
                cursor: 'pointer',
                outline: 'none'
              }}>
                <span style={{
                  display: 'inline-block',
                  height: '16px',
                  width: '16px',
                  borderRadius: '9999px',
                  backgroundColor: '#9CA3AF',
                  transform: 'translateX(4px)',
                  transition: 'transform 0.2s ease-in-out'
                }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#F5F5F7',
      borderRadius: '24px',
      padding: '8px',
      boxShadow: '0 12px 50px -15px rgba(0,0,0,0.1)',
      border: '1px solid rgba(209, 213, 219, 0.6)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '8px'
      }}>
        <h3 style={{
          fontSize: '1.875rem',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '0.5rem',
          letterSpacing: '-0.025em'
        }}>
          {title}
        </h3>
        <p style={{
          color: '#6B7280',
          fontSize: '1rem',
          lineHeight: '1.6',
          marginBottom: '2rem'
        }}>
          {description}
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          marginBottom: '2rem'
        }}>
          <span style={{
            fontSize: '3rem',
            fontWeight: '700',
            color: '#111827',
            letterSpacing: '-0.05em'
          }}>
            {price}
          </span>
          <span style={{
            color: '#9CA3AF',
            fontSize: '1.125rem',
            marginLeft: '0.25rem'
          }}>
            /mes
          </span>
        </div>
        <button
          onClick={handleClick}
          style={{
            width: '100%',
            background: '#111827',
            color: 'white',
            padding: '1rem',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.625rem',
            boxShadow: '0 4px 20px -5px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          Comenzar Prueba
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <path d="M8 2v4"/>
            <path d="M16 2v4"/>
            <rect width="18" height="18" x="3" y="4" rx="2"/>
            <path d="M3 10h18"/>
          </svg>
        </button>
      </div>
      <div style={{
        background: '#F5F5F7',
        padding: '1.5rem',
        paddingBottom: '1.5rem',
        paddingTop: '1rem',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          marginBottom: 'auto'
        }}>
          {features.map((feature) => (
            <div key={feature} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="8" cy="8" r="8" fill="#111827" />
                <path d="M5.5 8.5L7 10L11 6" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {feature}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button style={{
              position: 'relative',
              display: 'inline-flex',
              height: '24px',
              width: '40px',
              alignItems: 'center',
              borderRadius: '9999px',
              backgroundColor: '#E5E7EB',
              transition: 'background-color 0.2s ease-in-out',
              border: 'none',
              cursor: 'pointer',
              outline: 'none'
            }}>
              <span style={{
                display: 'inline-block',
                height: '16px',
                width: '16px',
                borderRadius: '9999px',
                backgroundColor: 'white',
                transform: 'translateX(4px)',
                transition: 'transform 0.2s ease-in-out'
              }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PricingSectionProps {
  onGetStartedClick?: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onGetStartedClick }) => {
  const basicFeatures = [
    'Hasta 50 consultas/mes',
    'Transcripción básica',
    'Análisis con IA',
    'Informes CIE-10',
    'Soporte por email'
  ];

  const proFeatures = [
    'Consultas ilimitadas',
    'Transcripción avanzada',
    'IA médica completa',
    'Informes detallados',
    'Integración sistemas'
  ];

  return (
    <section id="pricing" style={{
      padding: '8rem 2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: '700',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #111827 0%, #4B5563 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Planes de Suscripción
        </h2>
        <p style={{
          fontSize: '1.25rem',
          color: '#4B5563',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Elige el plan perfecto para tu práctica médica
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '2rem',
        maxWidth: '820px',
        margin: '0 auto'
      }}>
        <PricingPlan
          title="Plan Básico"
          description="Perfecto para consultorios pequeños y médicos independientes."
          price="$99"
          features={basicFeatures}
          onGetStartedClick={onGetStartedClick}
        />
        
        <PricingPlan
          title="Plan Profesional"
          description="Ideal para clínicas y hospitales con alto volumen de consultas."
          price="$299"
          features={proFeatures}
          isDark={true}
          onGetStartedClick={onGetStartedClick}
        />
      </div>
    </section>
  );
};

export default PricingSection;
