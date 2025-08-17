import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status') || 'completed';
    
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // Verificar que el usuario esté autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'No autenticado' 
      }, { status: 401 });
    }

    // Obtener perfil del usuario para verificar permisos
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('medical_sessions')
      .select(`
        id,
        created_at,
        updated_at,
        status,
        session_data,
        final_report,
        profiles!patient_id(
          id,
          full_name,
          email,
          role
        )
      `)
      .not('final_report', 'is', null) // Solo sesiones con reporte final
      .eq('status', status)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Si es paciente, solo ver sus propios reportes
    if (profile?.role === 'patient') {
      query = query.eq('patient_id', user.id);
    }
    // Doctores y admins pueden ver todos los reportes

    const { data: sessions, error, count } = await query;

    if (error) {
      console.error('Error fetching reports history:', error);
      return NextResponse.json({ 
        error: 'Error obteniendo histórico de reportes',
        details: error.message 
      }, { status: 500 });
    }

    // Transformar datos para incluir información relevante del reporte
    const reportsHistory = sessions?.map(session => {
      const finalReport = session.final_report;
      const sessionData = session.session_data;
      
      return {
        id: session.id,
        created_at: session.created_at,
        updated_at: session.updated_at,
        status: session.status,
        patient: session.profiles,
        session_duration: sessionData?.duration || 0,
        
        // Datos del reporte
        report_summary: finalReport?.summary || '',
        diagnoses: finalReport?.diagnoses || [],
        cie10_codes: finalReport?.diagnoses?.map((d: { cie10_code?: string; name?: string; confidence_level?: number }) => ({
          code: d.cie10_code,
          description: d.name,
          confidence: d.confidence_level
        })) || [],
        requires_immediate_attention: finalReport?.requires_immediate_attention || false,
        confidence_level: finalReport?.confidence_level || 0,
        emergency_criteria: finalReport?.emergency_criteria || [],
        
        // Metadatos
        diagnoses_count: finalReport?.diagnoses?.length || 0,
        symptoms_count: finalReport?.symptoms?.length || 0,
        recommendations_count: finalReport?.recommendations?.length || 0,
        
        // Información del paciente desde el reporte
        patient_info: finalReport?.patient_info || {},
      };
    }) || [];

    // Obtener conteo total para paginación
    const { count: totalCount } = await supabase
      .from('medical_sessions')
      .select('*', { count: 'exact', head: true })
      .not('final_report', 'is', null)
      .eq('status', status)
      .eq(profile?.role === 'patient' ? 'patient_id' : 'id', profile?.role === 'patient' ? user.id : supabase.from('medical_sessions').select('id'));

    const totalPages = Math.ceil((totalCount || 0) / limit);

    return NextResponse.json({ 
      success: true,
      data: reportsHistory,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error in reports history API:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
