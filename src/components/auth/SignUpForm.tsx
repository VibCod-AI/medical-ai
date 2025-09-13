'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface SignUpFormProps {
  onSwitchToLogin: () => void
}

export default function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: 'patient' as 'patient' | 'doctor'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)

  const { signUp, signInWithGoogle } = useAuth()

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownOpen) {
        const target = event.target as HTMLElement
        if (!target.closest('[data-role-dropdown]')) {
          setRoleDropdownOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [roleDropdownOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRoleSelect = (role: 'patient' | 'doctor') => {
    setFormData({
      ...formData,
      role
    })
    setRoleDropdownOpen(false)
  }

  const getRoleDisplayInfo = (role: 'patient' | 'doctor') => {
    switch (role) {
      case 'patient':
        return { icon: '🧑‍🦱', label: 'Paciente', description: 'Recibir consultas médicas' }
      case 'doctor':
        return { icon: '👨‍⚕️', label: 'Médico', description: 'Realizar consultas médicas' }
      default:
        return { icon: '👤', label: 'Seleccionar...', description: '' }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Por favor completa todos los campos obligatorios')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.fullName,
      phone: formData.phone || null,
      role: formData.role
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      // No auto-redirect since user needs to confirm email first
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError(null)

    const { error } = await signInWithGoogle()

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#dcfce7',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '40px'
          }}>
            ✅
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#16a34a',
            marginBottom: '16px'
          }}>
            ¡Cuenta Creada con Éxito!
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            Te hemos enviado un correo electrónico de confirmación a <strong>{formData.email}</strong>
          </p>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Por favor revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace de confirmación para activar tu cuenta.
          </p>
          <button
            onClick={onSwitchToLogin}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5a67d8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#667eea';
            }}
          >
            Volver al Inicio de Sesión
          </button>
        </div>
      </div>
    )
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
      <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 32px)', position: 'relative', zIndex: 10 }}>
        <span style={{
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: 'clamp(20px, 4vw, 24px)',
          textDecoration: 'none',
          fontSize: 'clamp(28px, 6vw, 36px)',
          fontWeight: '700',
          color: '#2C2C2E',
          letterSpacing: '-0.5px'
        }}>
          Medical AI
        </span>

          <h1 style={{
          fontSize: 'clamp(22px, 4.5vw, 26px)',
          fontWeight: '700',
          color: '#2C2C2E',
          marginBottom: '6px',
          lineHeight: '1.2',
          letterSpacing: '-0.3px'
        }}>
          Crear Cuenta
          </h1>
        <p style={{
          color: '#6C6C70',
          fontSize: 'clamp(13px, 3vw, 15px)',
          lineHeight: '1.5',
          fontWeight: '400',
          margin: '0'
        }}>
          Únete a miles de médicos que ya usan Medical AI
          </p>
        </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {error && (
          <div style={{
            marginBottom: '20px',
            padding: '16px 20px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)'
          }}>
            <p style={{ 
              color: '#DC2626', 
              fontSize: '14px', 
              margin: 0, 
              fontWeight: '500',
              textAlign: 'center'
            }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="fullName" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2E',
              marginBottom: '6px'
            }}>
              Nombre Completo *
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              style={{
                width: 'calc(100% - 32px)',
                maxWidth: '340px',
                padding: '13px 16px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                fontSize: '14px',
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
              placeholder="Dr. Juan Pérez"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="email" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2E',
              marginBottom: '6px'
            }}>
              Email *
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: 'calc(100% - 32px)',
                maxWidth: '340px',
                padding: '13px 16px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                fontSize: '14px',
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
              placeholder="doctor@medical-ai.com"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="phone" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2E',
              marginBottom: '6px'
            }}>
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{
                width: 'calc(100% - 32px)',
                maxWidth: '340px',
                padding: '13px 16px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                fontSize: '14px',
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
              placeholder="+34 123 456 789"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="role" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2E',
              marginBottom: '6px'
            }}>
              Tipo de Usuario *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
                style={{
                width: 'calc(100% - 32px)',
                maxWidth: '340px',
                padding: '13px 16px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                fontSize: '14px',
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
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)'
                e.target.style.background = 'rgba(255, 255, 255, 0.8)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <option value="doctor" style={{ background: '#FFFFFF', color: '#2C2C2E' }}>👨‍⚕️ Médico</option>
              <option value="patient" style={{ background: '#FFFFFF', color: '#2C2C2E' }}>🧑‍🦱 Paciente</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2E',
              marginBottom: '6px'
            }}>
              Contraseña *
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: 'calc(100% - 32px)',
                maxWidth: '340px',
                padding: '13px 16px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                fontSize: '14px',
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
            <p style={{
              fontSize: '12px',
              color: '#6C6C70',
              marginTop: '4px',
              margin: '4px 0 0 0'
            }}>
              Mínimo 6 caracteres
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="confirmPassword" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2E',
              marginBottom: '6px'
            }}>
              Confirmar Contraseña *
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{
                width: 'calc(100% - 32px)',
                maxWidth: '340px',
                padding: '13px 16px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                fontSize: '14px',
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
              padding: '16px 24px',
              borderRadius: '20px',
              border: 'none',
              fontSize: '16px',
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
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          position: 'relative',
          marginBottom: '20px'
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
            fontSize: '14px'
          }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '0 12px',
              color: '#6C6C70',
              fontWeight: '500'
            }}>
              O regístrate con
          </span>
          </div>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.8)',
            color: '#2C2C2E',
            padding: '14px 20px',
            borderRadius: '20px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '24px'
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
          <svg width="18" height="18" viewBox="0 0 24 24">
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
            fontSize: '15px',
            color: '#6C6C70',
            margin: '0 0 16px 0'
          }}>
            ¿Ya tienes cuenta?{' '}
          <button
            onClick={onSwitchToLogin}
            style={{
                color: '#5B9CFF',
                fontWeight: '600',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '15px',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#4A90E2'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#5B9CFF'
            }}
          >
            Inicia sesión aquí
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
