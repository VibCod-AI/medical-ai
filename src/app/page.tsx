'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Import all modular landing page components
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import CTASection from '@/components/landing/CTASection';
import FooterSection from '@/components/landing/FooterSection';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  console.log('🏠 HomePage: Renderizando - loading:', loading, 'user:', user ? 'Existe' : 'No existe');

  useEffect(() => {
    console.log('🏠 HomePage: useEffect - loading:', loading, 'user:', user ? 'Existe' : 'No existe');
    
    // TEMPORALMENTE COMENTADO PARA TESTING
    // Solo redirigir a /medical si el usuario está autenticado
    // if (!loading && user) {
    //   console.log('🏠 HomePage: Usuario autenticado, redirigiendo a /medical');
    //   router.push('/medical');
    // }
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

  // TEMPORALMENTE DESHABILITADO PARA TESTING - Siempre mostrar la landing page
  // if (loading) {
  //   return (
  //     <div style={{
  //       fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  //       background: '#F5F5F7',
  //       minHeight: '100vh',
  //       display: 'flex',
  //       alignItems: 'center',
  //       justifyContent: 'center',
  //       position: 'relative',
  //       overflow: 'hidden'
  //     }}>
  //       {/* Background decorations */}
  //       <div style={{
  //         position: 'absolute',
  //         top: '-50%',
  //         left: '-50%',
  //         width: '200%',
  //         height: '200%',
  //         background: 'radial-gradient(ellipse at center, rgba(91, 156, 255, 0.1) 0%, transparent 50%)',
  //         animation: 'pulse 4s ease-in-out infinite'
  //       }} />
        
  //       {/* Loading content */}
  //       <div style={{
  //         position: 'relative',
  //         zIndex: 10,
  //         textAlign: 'center',
  //         color: '#2C2C2E'
  //       }}>
  //         <div style={{
  //           width: '60px',
  //           height: '60px',
  //           border: '3px solid rgba(91, 156, 255, 0.3)',
  //           borderTop: '3px solid #5B9CFF',
  //           borderRadius: '50%',
  //           margin: '0 auto 1.5rem auto',
  //           animation: 'spin 1s linear infinite'
  //         }} />
  //         <h2 style={{
  //           fontSize: '1.5rem',
  //           fontWeight: '600',
  //           marginBottom: '0.5rem'
  //         }}>
  //           Medical AI
  //         </h2>
  //         <p style={{
  //           fontSize: '1rem',
  //           color: '#6B7280'
  //         }}>
  //           Cargando...
  //         </p>
  //       </div>

  //       <style jsx>{`
  //         @keyframes pulse {
  //           0%, 100% { opacity: 1; }
  //           50% { opacity: 0.5; }
  //         }
  //         @keyframes spin {
  //           0% { transform: rotate(0deg); }
  //           100% { transform: rotate(360deg); }
  //         }
  //       `}</style>
  //     </div>
  //   );
  // }

  // TEMPORALMENTE COMENTADO PARA TESTING
  // Si hay usuario autenticado, redirigir (pero permitir ver la landing primero)
  // if (user) {
  //   // Redirigir después de un pequeño delay para permitir ver la landing
  //   setTimeout(() => {
  //     router.push('/medical');
  //   }, 1000);
  //   // Mostrar la landing page mientras tanto
  // }

  return (
    <div style={{
      fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      background: 'transparent',
      color: '#2C2C2E',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Debug Info - TEMPORAL */}
      <div style={{
        position: 'fixed',
        top: '60px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        Loading: {loading ? 'true' : 'false'}<br/>
        User: {user ? 'exists' : 'null'}
      </div>

      {/* Navigation - Estilo original flotante y redondeado */}
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

      {/* Main Content - All Modular Components */}
      <main style={{ 
        position: 'relative', 
        zIndex: 10
      }}>
        <HeroSection onGetStartedClick={handleGetStartedClick} />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection onGetStartedClick={handleGetStartedClick} />
        <FAQSection />
        <CTASection onSignupClick={handleGetStartedClick} />
        <FooterSection onScrollToSection={scrollToSection} />
      </main>

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