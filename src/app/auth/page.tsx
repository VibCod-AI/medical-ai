'use client'

import React, { useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import SignUpForm from '@/components/auth/SignUpForm'
import { BackButton } from '@/design-system'

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
      {/* Botón de Volver Elegante */}
      <BackButton 
        to="/" 
        label="Volver al Inicio"
        variant="glass"
        size="md"
        position="top-left"
      />
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
