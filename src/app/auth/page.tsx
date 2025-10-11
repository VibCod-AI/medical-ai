'use client'

import React, { useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import SignUpForm from '@/components/auth/SignUpForm'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F7',
      fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Botón Volver */}
      <button
        onClick={() => window.location.href = '/'}
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#4074a3',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'white';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5"/>
          <path d="M12 19l-7-7 7-7"/>
        </svg>
        Volver al Inicio
      </button>
      
      {/* Background decorations */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '300px',
        height: '300px',
        background: 'rgba(91, 156, 255, 0.1)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'pulse 4s infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '10%',
        width: '400px',
        height: '400px',
        background: 'rgba(74, 144, 226, 0.1)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'pulse 4s infinite 2s'
      }}></div>

      <div style={{ 
        width: '100%', 
        maxWidth: '450px',
        position: 'relative',
        zIndex: 10
      }}>
        {isLogin ? (
          <LoginForm onSwitchToSignUp={() => setIsLogin(false)} />
        ) : (
          <SignUpForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>

      {/* Keyframes for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
