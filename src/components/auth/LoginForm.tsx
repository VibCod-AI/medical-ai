'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface LoginFormProps {
  onSwitchToSignUp: () => void
}

export default function LoginForm({ onSwitchToSignUp }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    const { error } = await signInWithGoogle()

    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // No need to redirect here, auth state change will handle it
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '420px',
      margin: '0 auto',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      padding: 'clamp(24px, 5vw, 40px)',
      fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        background: 'rgba(91, 156, 255, 0.1)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'pulse 4s infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        left: '-30px',
        width: '120px',
        height: '120px',
        background: 'rgba(74, 144, 226, 0.1)',
        borderRadius: '50%',
        filter: 'blur(30px)',
        animation: 'pulse 4s infinite 2s'
      }}></div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 6vw, 40px)', position: 'relative', zIndex: 10 }}>
        <span style={{
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: 'clamp(24px, 5vw, 32px)',
          textDecoration: 'none',
          fontSize: 'clamp(28px, 6vw, 36px)',
          fontWeight: '700',
          color: '#2C2C2E',
          letterSpacing: '-0.5px'
        }}>
          Medical AI
        </span>

        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 28px)',
          fontWeight: '700',
          color: '#2C2C2E',
          marginBottom: '8px',
          lineHeight: '1.2',
          letterSpacing: '-0.3px'
        }}>
          Iniciar Sesión
        </h1>
        <p style={{
          color: '#6C6C70',
          fontSize: 'clamp(14px, 3.5vw, 16px)',
          lineHeight: '1.5',
          fontWeight: '400',
          margin: '0'
        }}>
          Accede a tu cuenta para usar Medical AI
        </p>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {error && (
          <div style={{
            marginBottom: '24px',
            padding: '16px 20px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)'
          }}>
            <p style={{ 
              color: '#DC2626', 
              fontSize: '15px', 
              margin: 0, 
              fontWeight: '500',
              textAlign: 'center'
            }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="email" style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '600',
              color: '#2C2C2E',
              marginBottom: '8px'
            }}>
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: 'calc(100% - 36px)',
                maxWidth: '340px',
                padding: '14px 18px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                fontSize: '15px',
                color: '#2C2C2E',
                outline: 'none',
                transition: 'all 0.3s ease',
                fontWeight: '400',
                margin: '0 auto',
                display: 'block'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#5B9CFF'
                e.target.style.background = 'rgba(91, 156, 255, 0.05)'
                e.target.style.boxShadow = '0 0 0 4px rgba(91, 156, 255, 0.1)'
                e.target.style.transform = 'translateY(-1px)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)'
                e.target.style.background = 'rgba(255, 255, 255, 0.8)'
                e.target.style.boxShadow = 'none'
                e.target.style.transform = 'translateY(0)'
              }}
              placeholder="tu@medical-ai.com"
              required
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '600',
              color: '#2C2C2E',
              marginBottom: '8px'
            }}>
              Contraseña *
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: 'calc(100% - 36px)',
                maxWidth: '340px',
                padding: '14px 18px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                fontSize: '15px',
                color: '#2C2C2E',
                outline: 'none',
                transition: 'all 0.3s ease',
                fontWeight: '400',
                margin: '0 auto',
                display: 'block'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#5B9CFF'
                e.target.style.background = 'rgba(91, 156, 255, 0.05)'
                e.target.style.boxShadow = '0 0 0 4px rgba(91, 156, 255, 0.1)'
                e.target.style.transform = 'translateY(-1px)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)'
                e.target.style.background = 'rgba(255, 255, 255, 0.8)'
                e.target.style.boxShadow = 'none'
                e.target.style.transform = 'translateY(0)'
              }}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading 
                ? 'rgba(91, 156, 255, 0.5)' 
                : '#5B9CFF',
              color: 'white',
              padding: '18px 24px',
              borderRadius: '20px',
              border: 'none',
              fontSize: '17px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 25px rgba(91, 156, 255, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '24px'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#4A90E2'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(91, 156, 255, 0.4)'
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#5B9CFF'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(91, 156, 255, 0.3)'
              }
            }}
          >
            {loading && (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            )}
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          position: 'relative',
          marginBottom: '24px'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{
              width: '100%',
              borderTop: '1px solid rgba(0, 0, 0, 0.1)'
            }}></div>
          </div>
          <div style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            fontSize: '15px'
          }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '0 16px',
              color: '#6C6C70',
              fontWeight: '500'
            }}>
              O iniciar sesión con
            </span>
          </div>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.8)',
            color: '#2C2C2E',
            padding: '16px 24px',
            borderRadius: '20px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            fontSize: '17px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '32px'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'
              e.currentTarget.style.borderColor = '#5B9CFF'
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'translateY(0)'
            }
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        {/* Switch Form */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: '16px',
            color: '#6C6C70',
            margin: 0
          }}>
            ¿No tienes cuenta?{' '}
            <button
              onClick={onSwitchToSignUp}
              style={{
                color: '#5B9CFF',
                fontWeight: '600',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '16px',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#4A90E2'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#5B9CFF'
              }}
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>

      {/* Keyframes for animations */}
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
  )
}
