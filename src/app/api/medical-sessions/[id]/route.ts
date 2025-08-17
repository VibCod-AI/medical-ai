import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { final_report, status } = body;

    const supabase = await createClient();

    // Verificar que el usuario esté autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'No autenticado' 
      }, { status: 401 });
    }

    // Actualizar la sesión médica
    const { data, error } = await supabase
      .from('medical_sessions')
      .update({
        final_report,
        status: status || 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('patient_id', user.id) // Asegurar que solo el propietario pueda actualizar
      .select()
      .single();

    if (error) {
      console.error('Error updating medical session:', error);
      return NextResponse.json({ 
        error: 'Error actualizando sesión médica',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      session: data 
    });

  } catch (error) {
    console.error('Error in medical sessions PATCH API:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const supabase = await createClient();

    // Verificar que el usuario esté autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'No autenticado' 
      }, { status: 401 });
    }

    // Obtener la sesión específica
    const { data, error } = await supabase
      .from('medical_sessions')
      .select('*, profiles!patient_id(full_name, email, role)')
      .eq('id', id)
      .eq('patient_id', user.id) // Asegurar que solo el propietario pueda ver
      .single();

    if (error) {
      console.error('Error fetching medical session:', error);
      return NextResponse.json({ 
        error: 'Sesión médica no encontrada',
        details: error.message 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      session: data 
    });

  } catch (error) {
    console.error('Error in medical sessions GET API:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
