'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MeshGradient } from '@paper-design/shaders-react';

// FAQ Component
const FAQItem = ({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggle();
  };

  return (
    <div
      style={{
        width: '100%',
        background: 'rgba(231, 236, 235, 0.08)',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.16)',
        overflow: 'hidden',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer'
      }}
      onClick={handleClick}
    >
      <div style={{
        width: '100%',
        padding: '18px 16px 18px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        textAlign: 'left',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{
          flex: 1,
          color: '#111827',
          fontSize: '16px',
          fontWeight: '500',
          lineHeight: '24px',
          wordBreak: 'break-word'
        }}>
          {question}
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6B7280"
            strokeWidth="2"
            style={{
              transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isOpen ? 'rotate(180deg) scale(1.1)' : 'rotate(0deg) scale(1)'
            }}
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>
      <div
        style={{
          overflow: 'hidden',
          transition: 'max-height 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 500ms cubic-bezier(0.4, 0, 0.2, 1), padding 500ms cubic-bezier(0.4, 0, 0.2, 1)',
          maxHeight: isOpen ? '500px' : '0px',
          opacity: isOpen ? 1 : 0
        }}
      >
        <div style={{
          padding: isOpen ? '8px 20px 18px 20px' : '0px 20px 0px 20px',
          transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'translateY(0)' : 'translateY(-8px)'
        }}>
          <div style={{
            color: 'rgba(17, 24, 39, 0.8)',
            fontSize: '14px',
            fontWeight: '400',
            lineHeight: '24px',
            wordBreak: 'break-word'
          }}>
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQSection = () => {
  const [openItems, setOpenItems] = React.useState<Set<number>>(new Set());
  
  const faqData = [
    {
      question: "¿Qué es Medical AI y para quién está diseñado?",
      answer: "Medical AI es una plataforma de IA médica diseñada para médicos, equipos de salud y organizaciones que buscan acelerar su flujo de trabajo clínico. Es perfecto tanto para médicos individuales que buscan mejorar su productividad como para equipos que necesitan herramientas de colaboración eficientes."
    },
    {
      question: "¿Cómo funciona el análisis médico con IA?",
      answer: "Nuestra IA analiza las consultas en tiempo real, proporcionando sugerencias inteligentes para diagnósticos, detectando posibles complicaciones y asegurando las mejores prácticas. Aprende de tus patrones clínicos y se adapta a los estándares de tu equipo médico."
    },
    {
      question: "¿Puedo integrar Medical AI con mis herramientas existentes?",
      answer: "¡Sí! Medical AI ofrece integraciones con sistemas populares de historias clínicas, laboratorios, sistemas hospitalarios y muchos más. Nuestra conectividad permite gestionar fácilmente el acceso a servidores en todo tu stack de salud."
    },
    {
      question: "¿Qué incluye el plan gratuito?",
      answer: "El plan gratuito incluye hasta 50 consultas mensuales, transcripción básica en tiempo real, análisis básico de IA, informes CIE-10 y soporte por email. Es perfecto para médicos individuales que están comenzando."
    },
    {
      question: "¿Cómo funcionan las transcripciones en tiempo real?",
      answer: "Nuestras transcripciones en tiempo real pueden procesar múltiples consultas simultáneamente, convirtiendo conversaciones médicas complejas en texto estructurado más rápido que los métodos tradicionales de documentación manual."
    },
    {
      question: "¿Mis datos médicos están seguros con Medical AI?",
      answer: "Absolutamente. Utilizamos medidas de seguridad de nivel empresarial incluyendo encriptación de extremo a extremo, transmisión segura de datos y cumplimiento con estándares de la industria como HIPAA. Tus datos nunca salen de tu entorno seguro sin tu permiso explícito."
    }
  ];

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section id="faq" style={{
      width: '100%',
      paddingTop: '66px',
      paddingBottom: '80px',
      padding: '66px 20px 160px 20px',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        width: '300px',
        height: '500px',
        position: 'absolute',
        top: '150px',
        left: '50%',
        transform: 'translateX(-50%) rotate(-33.39deg)',
        transformOrigin: 'top left',
        background: 'rgba(91, 156, 255, 0.1)',
        filter: 'blur(100px)',
        zIndex: 0
      }} />
      <div style={{
        alignSelf: 'stretch',
        paddingTop: '32px',
        paddingBottom: '56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '16px'
        }}>
          <h2 style={{
            width: '100%',
            maxWidth: '435px',
            textAlign: 'center',
            color: '#111827',
            fontSize: '40px',
            fontWeight: '600',
            lineHeight: '40px',
            wordBreak: 'break-word'
          }}>
            Preguntas Frecuentes
          </h2>
          <p style={{
            alignSelf: 'stretch',
            textAlign: 'center',
            color: '#6B7280',
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '18.20px',
            wordBreak: 'break-word'
          }}>
            Todo lo que necesitas saber sobre Medical AI y cómo puede transformar tu práctica médica
          </p>
        </div>
      </div>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        paddingTop: '2px',
        paddingBottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: '16px',
        position: 'relative',
        zIndex: 10
      }}>
        {faqData.map((faq, index) => (
          <FAQItem 
            key={index} 
            question={faq.question}
            answer={faq.answer}
            isOpen={openItems.has(index)} 
            onToggle={() => toggleItem(index)} 
          />
        ))}
      </div>
    </section>
  );
};

// CTA Section Component
const CTASection = () => {
  const router = useRouter();
  
  const handleSignupClick = () => {
    router.push('/auth');
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
            Descubre cómo profesionales de la salud diagnostican más rápido, colaboran sin problemas, y atienden con confianza usando las potentes herramientas de IA de Medical AI
          </p>
        </div>
        <button
          onClick={handleSignupClick}
          style={{
            padding: '0.5rem 1.875rem',
            background: 'linear-gradient(135deg, #5B9CFF 0%, #4A90E2 100%)',
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
            e.currentTarget.style.background = 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #5B9CFF 0%, #4A90E2 100%)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          Registrarse gratis
        </button>
      </div>
    </section>
  );
};

// Footer Section Component
const FooterSection = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
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

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  console.log('🏠 HomePage: Renderizando - loading:', loading, 'user:', user ? 'Existe' : 'No existe');

  useEffect(() => {
    console.log('🏠 HomePage: useEffect - loading:', loading, 'user:', user ? 'Existe' : 'No existe');
    
    // Solo redirigir a /medical si el usuario está autenticado
    if (!loading && user) {
      console.log('🏠 HomePage: Usuario autenticado, redirigiendo a /medical');
      router.push('/medical');
    }
  }, [user, loading, router]);

  const handleLoginClick = () => {
    router.push('/auth');
  };

  const handleGetStartedClick = () => {
    router.push('/auth');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Si está cargando o el usuario está autenticado (y está por redirigir), mostrar loading
  if (loading || user) {
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
            color: '#111827',
            marginBottom: '0.5rem',
            letterSpacing: '-0.5px'
          }}>
            Medical AI
          </h1>
          
          <p style={{ 
            color: '#4B5563', 
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
            color: '#111827',
            fontWeight: '500',
            backdropFilter: 'blur(10px)'
          }}>
            {loading ? 'Verificando autenticación...' : 'Redirigiendo al dashboard...'}
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

  // Si no está cargando y no hay usuario, mostrar la landing page
  return (
    <div style={{
      fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      background: 'transparent',
      color: '#2C2C2E',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Navigation */}
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
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '30px',
        border: '1px solid rgba(0, 0, 0, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease'
      }}>
        <button
          onClick={() => scrollToSection('hero')}
          style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#1F2937',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
        >
          Medical AI
        </button>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2.5rem'
        }}>
          <button
            onClick={() => scrollToSection('features')}
            style={{ 
              color: '#4B5563', 
              background: 'none',
              border: 'none',
              textDecoration: 'none', 
              fontSize: '15px', 
              fontWeight: '500',
              textShadow: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1F2937'
              e.currentTarget.style.fontWeight = '600'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#4B5563'
              e.currentTarget.style.fontWeight = '500'
            }}>
            Características
          </button>
          
          <button
            onClick={() => scrollToSection('how-it-works')}
            style={{ 
              color: '#4B5563', 
              background: 'none',
              border: 'none',
              textDecoration: 'none', 
              fontSize: '15px', 
              fontWeight: '500',
              textShadow: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1F2937'
              e.currentTarget.style.fontWeight = '600'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#4B5563'
              e.currentTarget.style.fontWeight = '500'
            }}>
            Cómo Funciona
          </button>
          
          <button
            onClick={() => scrollToSection('pricing')}
            style={{ 
              color: '#4B5563', 
              background: 'none',
              border: 'none',
              textDecoration: 'none', 
              fontSize: '15px', 
              fontWeight: '500',
              textShadow: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1F2937'
              e.currentTarget.style.fontWeight = '600'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#4B5563'
              e.currentTarget.style.fontWeight = '500'
            }}>
            Precios
          </button>

          {/* Login Button */}
          <button
            onClick={handleLoginClick}
            style={{
              background: 'linear-gradient(135deg, #5B9CFF 0%, #4A90E2 100%)',
              color: '#111827',
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
              e.currentTarget.style.background = 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(91, 156, 255, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #5B9CFF 0%, #4A90E2 100%)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(91, 156, 255, 0.3)'
            }}
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* Hero Section */}
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
                color: '#5B9CFF'
              }}>
                4.9
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="#5B9CFF">
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

      {/* Video Section */}
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

      {/* Testimonials Section */}
      <section id="features" style={{
        width: '100%',
        padding: '1.5rem 1.25rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start'
      }}>
        <div style={{
          alignSelf: 'stretch',
          padding: '1.5rem 0 3.5rem 0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <h2 style={{
              textAlign: 'center',
              color: '#111827',
              fontSize: 'clamp(1.875rem, 4vw, 2.5rem)',
              fontWeight: '600',
              lineHeight: '1.125',
              letterSpacing: 'tight'
            }}>
              Medicina hecha más eficiente
            </h2>
            <p style={{
              alignSelf: 'stretch',
              textAlign: 'center',
              color: '#4B5563',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              fontWeight: '500',
              lineHeight: '1.3'
            }}>
              Descubre cómo profesionales de la salud diagnostican más rápido, colaboran sin problemas,
              <br />
              y atienden con confianza usando las potentes herramientas de IA de Medical AI
            </p>
          </div>
        </div>
        <div style={{
          width: '100%',
          paddingTop: '0.125rem',
          paddingBottom: '2.5rem',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '1.5rem',
          maxWidth: '1100px',
          margin: '0 auto',
          flexWrap: 'wrap'
        }}>
          {/* Column 1 */}
          <div style={{
            flex: 1,
            minWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '1.5rem'
          }}>
            {/* Large Card - Primary */}
            <div style={{
              width: '100%',
              maxWidth: '384px',
              height: '502px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              overflow: 'hidden',
              borderRadius: '10px',
              boxShadow: '0px 2px 4px rgba(0,0,0,0.08)',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #5B9CFF 0%, #4A90E2 100%)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDQwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXIiIHgxPSIwIiB5MT0iMCIgeDI9IjQwMCIgeTI9IjUwMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjZmZmZmZmIiBzdG9wLW9wYWNpdHk9IjAuMSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZmZmZmYiIHN0b3Atb3BhY2l0eT0iMC4wNSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNTAwIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXIpIi8+Cjwvc3ZnPgo=")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: 0
              }} />
              <div style={{
                position: 'relative',
                zIndex: 10,
                fontWeight: '400',
                wordBreak: 'break-word',
                color: '#111827',
                fontSize: '1.5rem',
                lineHeight: '2rem'
              }}>
                "Medical AI ha transformado completamente nuestra práctica. Las transcripciones en tiempo real son tan precisas que se sienten como tener un asistente médico especializado revisando cada consulta mientras hablas."
              </div>
              <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '41px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src="/doctors/image.png" 
                    alt="Dr. Ana Martínez"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  gap: '0.125rem'
                }}>
                  <div style={{
                    color: '#111827',
                    fontSize: '1rem',
                    fontWeight: '400',
                    lineHeight: '1.5rem'
                  }}>
                    Dr. Ana Martínez
                  </div>
                  <div style={{
                    color: '#4B5563',
                    fontSize: '1rem',
                    fontWeight: '400',
                    lineHeight: '1.5rem'
                  }}>
                    Hospital General
                  </div>
                </div>
              </div>
            </div>
            {/* Small Card */}
            <div style={{
              width: '100%',
              maxWidth: '384px',
              height: '244px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              overflow: 'hidden',
              borderRadius: '10px',
              boxShadow: '0px 2px 4px rgba(0,0,0,0.08)',
              padding: '1.875rem',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(229, 231, 235, 0.8)',
              borderWidth: '1px',
              borderStyle: 'solid',
              outline: '1px solid rgba(229, 231, 235, 0.8)',
              outlineOffset: '-1px',
              position: 'relative'
            }}>
              <div style={{
                position: 'relative',
                zIndex: 10,
                fontWeight: '400',
                wordBreak: 'break-word',
                color: 'rgba(44, 44, 46, 0.8)',
                fontSize: '17px',
                lineHeight: '1.5rem'
              }}>
                "Integrar Medical AI en nuestro hospital fue sencillo, y las conexiones con nuestros sistemas existentes nos ahorraron semanas de configuración"
              </div>
              <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '30.75px',
                  background: 'rgba(229, 231, 235, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src="/doctors/image copy.png" 
                    alt="Dr. Carlos Ruiz"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  gap: '0.125rem'
                }}>
                  <div style={{
                    color: '#111827',
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    lineHeight: '22px'
                  }}>
                    Dr. Carlos Ruiz
                  </div>
                  <div style={{
                    color: '#4B5563',
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    lineHeight: '22px'
                  }}>
                    Clínica San Rafael
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            flex: 1,
            minWidth: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '1.5rem'
          }}>
            {/* Small Testimonial 2 */}
            <div style={{
              width: '100%',
              maxWidth: '384px',
              height: '244px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              overflow: 'hidden',
              borderRadius: '10px',
              boxShadow: '0px 2px 4px rgba(0,0,0,0.08)',
              padding: '1.875rem',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.8)'
            }}>
              <div style={{
                color: 'rgba(44, 44, 46, 0.8)',
                fontSize: '1.063rem',
                fontWeight: '400',
                lineHeight: '1.5rem'
              }}>
                "La función de análisis médico con IA ha sido revolucionaria. Estamos detectando patologías complejas en minutos en lugar de horas."
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '30.75px',
                  background: 'rgba(91, 156, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src="/doctors/image copy 2.png" 
                    alt="Dra. María López"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  gap: '0.125rem'
                }}>
                  <div style={{
                    color: '#111827',
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    lineHeight: '1.375rem'
                  }}>
                    Dra. María López
                  </div>
                  <div style={{
                    color: '#4B5563',
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    lineHeight: '1.375rem'
                  }}>
                    Centro Médico ABC
                  </div>
                </div>
              </div>
            </div>
            {/* Small Testimonial 3 */}
            <div style={{
              width: '100%',
              maxWidth: '384px',
              height: '244px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              overflow: 'hidden',
              borderRadius: '10px',
              boxShadow: '0px 2px 4px rgba(0,0,0,0.08)',
              padding: '1.875rem',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.8)'
            }}>
              <div style={{
                color: 'rgba(44, 44, 46, 0.8)',
                fontSize: '1.063rem',
                fontWeight: '400',
                lineHeight: '1.5rem'
              }}>
                "Ya no hacemos malabares con múltiples herramientas. Medical AI integró todas nuestras aplicaciones médicas en un solo lugar."
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '30.75px',
                  background: 'rgba(91, 156, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src="/doctors/image copy 3.png" 
                    alt="Dr. Roberto Silva"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  gap: '0.125rem'
                }}>
                  <div style={{
                    color: '#111827',
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    lineHeight: '1.375rem'
                  }}>
                    Dr. Roberto Silva
                  </div>
                  <div style={{
                    color: '#4B5563',
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    lineHeight: '1.375rem'
                  }}>
                    Hospital Universitario
                  </div>
                </div>
              </div>
            </div>
            {/* Small Testimonial 4 */}
            <div style={{
              width: '100%',
              maxWidth: '384px',
              height: '244px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              overflow: 'hidden',
              borderRadius: '10px',
              boxShadow: '0px 2px 4px rgba(0,0,0,0.08)',
              padding: '1.875rem',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.8)'
            }}>
              <div style={{
                color: 'rgba(44, 44, 46, 0.8)',
                fontSize: '1.063rem',
                fontWeight: '400',
                lineHeight: '1.5rem'
              }}>
                "Comenzamos con el plan gratuito solo para probarlo, pero en una semana upgradeamos a Pro. Ahora no podemos imaginar trabajar sin Medical AI"
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '30.75px',
                  background: 'rgba(91, 156, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src="/doctors/image copy 4.png" 
                    alt="Dra. Carmen Vega"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  gap: '0.125rem'
                }}>
                  <div style={{
                    color: '#111827',
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    lineHeight: '1.375rem'
                  }}>
                    Dra. Carmen Vega
                  </div>
                  <div style={{
                    color: '#4B5563',
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    lineHeight: '1.375rem'
                  }}>
                    Medicina Familiar
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            flex: 1,
            minWidth: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '1.5rem'
          }}>
            {/* Small Testimonial 5 */}
            <div style={{
              width: '100%',
              maxWidth: '384px',
              height: '244px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              overflow: 'hidden',
              borderRadius: '10px',
              boxShadow: '0px 2px 4px rgba(0,0,0,0.08)',
              padding: '1.875rem',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.8)'
            }}>
              <div style={{
                color: 'rgba(44, 44, 46, 0.8)',
                fontSize: '1.063rem',
                fontWeight: '400',
                lineHeight: '1.5rem'
              }}>
                "Las consultas colaborativas se sienten naturales ahora. Con las transcripciones en tiempo real de Medical AI, la telemedicina se volvió más productiva."
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '30.75px',
                  background: 'rgba(91, 156, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src="/doctors/image copy 5.png" 
                    alt="Dr. Luis Fernández"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  gap: '0.125rem'
                }}>
                  <div style={{
                    color: '#111827',
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    lineHeight: '1.375rem'
                  }}>
                    Dr. Luis Fernández
                  </div>
                  <div style={{
                    color: '#4B5563',
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    lineHeight: '1.375rem'
                  }}>
                    Telemedicina Plus
                  </div>
                </div>
              </div>
            </div>
            {/* Large Testimonial 2 */}
            <div style={{
              width: '100%',
              maxWidth: '384px',
              height: '502px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              overflow: 'hidden',
              borderRadius: '10px',
              boxShadow: '0px 2px 4px rgba(0,0,0,0.08)',
              padding: '1.5rem',
              background: 'rgba(231, 236, 235, 0.12)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDQwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXIiIHgxPSIwIiB5MT0iMCIgeDI9IjQwMCIgeTI9IjUwMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjZmZmZmZmIiBzdG9wLW9wYWNpdHk9IjAuMSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZmZmZmYiIHN0b3Atb3BhY2l0eT0iMC4wNSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNTAwIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXIpIi8+Cjwvc3ZnPgo=")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.2,
                zIndex: 0
              }} />
              <div style={{
                position: 'relative',
                zIndex: 10,
                color: '#111827',
                fontSize: '1.5rem',
                fontWeight: '500',
                lineHeight: '2rem',
                fontFamily: 'inherit'
              }}>
                "Implementar Medical AI en nuestro centro de diagnóstico no solo fue simple, se sintió perfecto. Fuimos de las consultas tradicionales a ver análisis de IA en vivo en minutos sin problemas de configuración."
              </div>
              <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '41px',
                  background: 'rgba(91, 156, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src="/doctors/image copy 6.png" 
                    alt="Dr. Alberto Flores"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  gap: '0.125rem'
                }}>
                  <div style={{
                    color: '#111827',
                    fontSize: '1rem',
                    fontWeight: '400',
                    lineHeight: '1.5rem'
                  }}>
                    Dr. Alberto Flores
                  </div>
                  <div style={{
                    color: '#4B5563',
                    fontSize: '1rem',
                    fontWeight: '400',
                    lineHeight: '1.5rem'
                  }}>
                    Centro de Diagnóstico Avanzado
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
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
          {/* Plan Básico - Light Card */}
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
                Plan Básico
              </h3>
              <p style={{
                color: '#6B7280',
                fontSize: '1rem',
                lineHeight: '1.6',
                marginBottom: '2rem'
              }}>
                Perfecto para consultorios pequeños y médicos independientes.
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
                  $99
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
                onClick={handleGetStartedClick}
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
                {['Hasta 50 consultas/mes', 'Transcripción básica', 'Análisis con IA', 'Informes CIE-10', 'Soporte por email'].map((feature) => (
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
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                    Configuración rápida (5 días)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Profesional - Dark Card */}
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
                Plan Profesional
              </h3>
              <p style={{
                color: '#9CA3AF',
                fontSize: '1rem',
                lineHeight: '1.6',
                marginBottom: '2rem'
              }}>
                Ideal para clínicas y hospitales con alto volumen de consultas.
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
                  $299
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
                onClick={handleGetStartedClick}
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
                {['Consultas ilimitadas', 'Transcripción avanzada', 'IA médica completa', 'Informes detallados', 'Integración sistemas'].map((feature) => (
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
                  <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                    Configuración rápida (5 días)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer Section */}
      <FooterSection />

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}