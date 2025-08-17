import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      patient_id, 
      doctor_id = null, 
      session_data, 
      transcriptions = [], 
      analyses = [], 
      final_report = null,
      status = 'active' 
    } = body;

    if (!patient_id) {
      return NextResponse.json({ 
        error: 'patient_id es requerido' 
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Verificar que el usuario esté autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'No autenticado' 
      }, { status: 401 });
    }

    // Crear nueva sesión médica
    const { data, error } = await supabase
      .from('medical_sessions')
      .insert([{
        patient_id,
        doctor_id,
        session_data,
        transcriptions,
        analyses,
        final_report,
        status
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating medical session:', error);
      return NextResponse.json({ 
        error: 'Error creando sesión médica',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      session: data 
    });

  } catch (error) {
    console.error('Error in medical sessions API:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    const supabase = await createClient();

    // Verificar que el usuario esté autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'No autenticado' 
      }, { status: 401 });
    }

    let query = supabase
      .from('medical_sessions')
      .select('*, profiles!patient_id(full_name, email, role)')
      .order('created_at', { ascending: false });

    // Si se especifica user_id, filtrar por ese usuario
    if (userId) {
      query = query.eq('patient_id', userId);
    } else {
      // Sino, mostrar sesiones del usuario actual (como paciente) o todas si es doctor/admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'patient') {
        query = query.eq('patient_id', user.id);
      }
      // Doctors and admins can see all sessions
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error('Error fetching medical sessions:', error);
      return NextResponse.json({ 
        error: 'Error obteniendo sesiones médicas',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      sessions: data || [] 
    });

  } catch (error) {
    console.error('Error in medical sessions GET API:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
