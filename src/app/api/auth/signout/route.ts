import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    console.log('🚪 API SignOut: Iniciando limpieza del servidor...')
    
    const supabase = await createClient();
    
    // Forzar signOut del lado del servidor también
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    
    if (error) {
      console.error('❌ API SignOut: Error en servidor:', error)
      // Continuar aunque haya error
    }
    
    console.log('✅ API SignOut: Limpieza del servidor completada')
    
    // Crear respuesta con headers para limpiar cookies
    const response = NextResponse.json({ 
      success: true, 
      message: 'SignOut completado' 
    })
    
    // Limpiar cookies de Supabase manualmente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      const projectRef = supabaseUrl.split('//')[1]?.split('.')[0]
      if (projectRef) {
        response.cookies.delete(`sb-${projectRef}-auth-token`)
        response.cookies.delete(`sb-${projectRef}-auth-token.0`)
        response.cookies.delete(`sb-${projectRef}-auth-token.1`)
      }
    }
    
    return response
    
  } catch (error) {
    console.error('❌ API SignOut: Error inesperado:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}
