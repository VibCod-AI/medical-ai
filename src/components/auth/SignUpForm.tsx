'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

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
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
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
            ¡Registro Exitoso!
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Te hemos enviado un email de confirmación. Por favor verifica tu correo para activar tu cuenta.
          </p>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Redirigiendo al dashboard...
          </p>
        </div>
      </div>
    )
  }

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
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '8px'
          }}>
            🏥 Medical IA
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Crear tu cuenta
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Nombre Completo *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Teléfono
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 234 567 8900"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Tipo de Usuario *
            </label>
            
            {/* Custom Dropdown */}
            <div style={{ position: 'relative' }} data-role-dropdown>
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${roleDropdownOpen ? '#667eea' : '#d1d5db'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}

              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{getRoleDisplayInfo(formData.role).icon}</span>
                  <div>
                    <div style={{ fontWeight: '600', color: '#374151' }}>
                      {getRoleDisplayInfo(formData.role).label}
                    </div>
                    {getRoleDisplayInfo(formData.role).description && (
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {getRoleDisplayInfo(formData.role).description}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{
                  transform: roleDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  color: '#6b7280'
                }}>
                  ▼
                </div>
              </button>

              {/* Dropdown Options */}
              {roleDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  marginTop: '4px',
                  overflow: 'hidden',
                  animation: 'dropdown-appear 0.2s ease-out'
                }}>
                  <style jsx>{`
                    @keyframes dropdown-appear {
                      from {
                        opacity: 0;
                        transform: translateY(-8px);
                      }
                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                  `}</style>

                  {/* Patient Option */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('patient')}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: 'none',
                      background: formData.role === 'patient' ? '#f3f4f6' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      fontSize: '16px',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (formData.role !== 'patient') {
                        e.currentTarget.style.background = '#f9fafb'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.role !== 'patient') {
                        e.currentTarget.style.background = 'white'
                      }
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>🧑‍🦱</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#374151', marginBottom: '2px' }}>
                        Paciente
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Recibir consultas médicas y análisis de IA
                      </div>
                    </div>
                    {formData.role === 'patient' && (
                      <div style={{ color: '#10b981', fontSize: '16px' }}>✓</div>
                    )}
                  </button>

                  {/* Doctor Option */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('doctor')}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: 'none',
                      background: formData.role === 'doctor' ? '#f3f4f6' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      fontSize: '16px',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (formData.role !== 'doctor') {
                        e.currentTarget.style.background = '#f9fafb'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.role !== 'doctor') {
                        e.currentTarget.style.background = 'white'
                      }
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>👨‍⚕️</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#374151', marginBottom: '2px' }}>
                        Médico
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Realizar consultas médicas y supervisar IA
                      </div>
                    </div>
                    {formData.role === 'doctor' && (
                      <div style={{ color: '#10b981', fontSize: '16px' }}>✓</div>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Contraseña *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginBottom: '16px'
            }}
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            flex: 1,
            height: '1px',
            background: '#e5e7eb'
          }}></div>
          <span style={{
            padding: '0 16px',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            o
          </span>
          <div style={{
            flex: 1,
            height: '1px',
            background: '#e5e7eb'
          }}></div>
        </div>

        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          style={{
            width: '100%',
            background: 'white',
            border: '1px solid #d1d5db',
            color: '#374151',
            padding: '14px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>
            ¿Ya tienes cuenta?{' '}
          </span>
          <button
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Inicia sesión aquí
          </button>
        </div>
      </div>
    </div>
  )
}
