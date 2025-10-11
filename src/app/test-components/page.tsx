'use client';

import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import CTASection from '@/components/landing/CTASection';
import FooterSection from '@/components/landing/FooterSection';

export default function TestPage() {
  return (
    <div style={{
      fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      background: '#F5F5F7',
      color: '#2C2C2E',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        background: '#333', 
        color: 'white',
        margin: 0
      }}>
        🧪 Test de Componentes Modulares - Progreso: 7/7 ✅ COMPLETO
      </h1>
      
      {/* Test HeroSection */}
      <div style={{ 
        border: '2px solid #5B9CFF', 
        margin: '1rem', 
        borderRadius: '8px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '10px',
          background: '#5B9CFF',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          ✅ HeroSection.tsx
        </div>
        <HeroSection />
      </div>

      {/* Test FeaturesSection */}
      <div style={{ 
        border: '2px solid #10b981', 
        margin: '1rem', 
        borderRadius: '8px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '10px',
          background: '#10b981',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          ✅ FeaturesSection.tsx
        </div>
        <FeaturesSection />
      </div>

      {/* Test TestimonialsSection */}
      <div style={{ 
        border: '2px solid #f59e0b', 
        margin: '1rem', 
        borderRadius: '8px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '10px',
          background: '#f59e0b',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          🧪 TestimonialsSection.tsx (NUEVO)
        </div>
        <TestimonialsSection />
      </div>

      {/* Test PricingSection */}
      <div style={{ 
        border: '2px solid #8b5cf6', 
        margin: '1rem', 
        borderRadius: '8px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '10px',
          background: '#8b5cf6',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          🧪 PricingSection.tsx (NUEVO)
        </div>
        <PricingSection />
      </div>

      {/* Test FAQSection */}
      <div style={{ 
        border: '2px solid #ef4444', 
        margin: '1rem', 
        borderRadius: '8px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '10px',
          background: '#ef4444',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          🧪 FAQSection.tsx (NUEVO)
        </div>
        <FAQSection />
      </div>

      {/* Test CTASection */}
      <div style={{ 
        border: '2px solid #06b6d4', 
        margin: '1rem', 
        borderRadius: '8px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '10px',
          background: '#06b6d4',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          🧪 CTASection.tsx (NUEVO)
        </div>
        <CTASection />
      </div>

      {/* Test FooterSection */}
      <div style={{ 
        border: '2px solid #84cc16', 
        margin: '1rem', 
        borderRadius: '8px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '10px',
          background: '#84cc16',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          🧪 FooterSection.tsx (NUEVO)
        </div>
        <FooterSection />
      </div>
    </div>
  );
}
