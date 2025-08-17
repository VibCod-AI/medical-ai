'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client'
import { UserProfile } from '@/types/supabase'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<{ error?: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error?: AuthError | null }>
  signInWithGoogle: () => Promise<{ error?: AuthError | null }>
  signOut: () => Promise<{ error?: AuthError | null }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = getSupabaseClient()

  // Timeout de emergencia solo para la inicialización
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ AuthContext: Timeout de emergencia inicial - forzando loading = false')
        setLoading(false)
      }
    }, 5000) // 5 segundos

    return () => clearTimeout(emergencyTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('👤 AuthContext: Iniciando fetchUserProfile para userId:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('👤 AuthContext: Respuesta de profiles query:', { data, error })

      if (error && error.code !== 'PGRST116') {
        console.error('❌ AuthContext: Error fetching profile:', error)
        return
      }

      if (data) {
        console.log('✅ AuthContext: Perfil obtenido correctamente:', data)
        setProfile(data)
      } else {
        console.log('⚠️ AuthContext: No se encontró perfil para el usuario')
      }
    } catch (error) {
      console.error('❌ AuthContext: Error en fetchUserProfile:', error)
    }
  }, [supabase])

  useEffect(() => {
    console.log('🔄 AuthContext: useEffect iniciado')
    
    // Verificar configuración de Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ AuthContext: Variables de entorno de Supabase no configuradas')
      setLoading(false)
      return
    }
    
    console.log('✅ AuthContext: Variables de entorno OK')
    
    // Configurar listener de cambios de autenticación (más confiable que getSession)
    let isInitialized = false
    
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 AuthContext: Auth state changed:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('👤 AuthContext: Usuario encontrado, obteniendo perfil...')
          await fetchUserProfile(session.user.id)
        } else {
          console.log('👤 AuthContext: No hay usuario autenticado')
          setProfile(null)
        }
        
        // Solo configurar loading en false después de la primera inicialización
        if (!isInitialized) {
          console.log('✅ AuthContext: Inicialización completada - loading = false')
          setLoading(false)
          isInitialized = true
        }
      })

      // Timeout de seguridad para la inicialización
      setTimeout(() => {
        if (!isInitialized) {
          console.log('⚠️ AuthContext: Timeout de inicialización - loading = false')
          setLoading(false)
          isInitialized = true
        }
      }, 3000)

      return () => {
        console.log('🧹 AuthContext: Limpiando subscription')
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error('❌ AuthContext: Error configurando auth listener:', error)
      setLoading(false)
    }
  }, [supabase, fetchUserProfile])

  const signUp = async (email: string, password: string, userData?: Partial<UserProfile>) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.full_name || '',
            role: userData?.role || 'patient'
          }
        }
      })

      if (error) {
        return { error }
      }

      // Si el usuario se registra exitosamente, crear perfil
      if (data.user && !error) {
        const profileData = {
          id: data.user.id,
          email: data.user.email!,
          full_name: userData?.full_name || null,
          avatar_url: null,
          phone: userData?.phone || null,
          role: (userData?.role as 'patient' | 'doctor' | 'admin') || 'patient'
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([profileData])

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }

      return { error: undefined }
    } catch (error) {
      console.error('Signup error:', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    console.log('🚪 AuthContext: Iniciando signOut...')
    
    // Limpiar estado inmediatamente para evitar problemas
    setSession(null)
    setUser(null)
    setProfile(null)
    
    try {
      // Limpiar storage ANTES de llamar a supabase
      if (typeof window !== 'undefined') {
        console.log('🧹 AuthContext: Limpiando storage...')
        try {
          localStorage.clear()
          sessionStorage.clear()
          
          // Limpiar cookies manualmente
          document.cookie.split(";").forEach((c) => {
            const eqPos = c.indexOf("=")
            const name = eqPos > -1 ? c.substr(0, eqPos) : c
            document.cookie = name.trim() + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
          })
          
          console.log('✅ AuthContext: Storage y cookies limpiados')
        } catch (storageError) {
          console.warn('⚠️ AuthContext: Error limpiando storage:', storageError)
        }
      }
      
      // Crear timeout para evitar que se cuelgue
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          console.log('⏰ AuthContext: Timeout en signOut - continuando...')
          resolve({ error: null })
        }, 3000) // 3 segundos máximo
      })
      
      // SignOut de Supabase con timeout
      const signOutPromise = supabase.auth.signOut({ scope: 'local' }).then((result) => {
        console.log('✅ AuthContext: Supabase signOut completado')
        return result
      })
      
      // Race entre signOut y timeout
      await Promise.race([signOutPromise, timeoutPromise])
      
      console.log('✅ AuthContext: SignOut proceso completado')
      return { error: null }
      
    } catch (error) {
      console.error('❌ AuthContext: Error en signOut:', error)
      return { error: null } // Devolver éxito porque ya limpiamos el estado
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') }
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (!error) {
        setProfile(prev => prev ? { ...prev, ...updates } : null)
      }

      return { error: error as Error | null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}