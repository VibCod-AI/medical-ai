import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { CreateMedicalReportData } from '@/types/medical';

// Crear cliente de Supabase para el servidor
async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

// GET - Obtener reportes del usuario
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const urgent_only = searchParams.get('urgent_only') === 'true';

    // Construir consulta
    let query = supabase
      .from('medical_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtrar solo urgentes si se solicita
    if (urgent_only) {
      query = query.eq('requires_immediate_attention', true);
    }

    const { data: reports, error } = await query;

    if (error) {
      console.error('Error obteniendo reportes:', error);
      return NextResponse.json(
        { success: false, error: 'Error obteniendo reportes' },
        { status: 500 }
      );
    }

    // Obtener conteo total
    const { count } = await supabase
      .from('medical_reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      reports: reports || [],
      total: count || 0,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error en GET /api/medical-reports:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo reporte médico
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener datos del cuerpo de la petición
    const reportData: CreateMedicalReportData = await request.json();

    // Validaciones básicas
    if (!reportData.session_id || !reportData.transcriptions || reportData.transcriptions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos: se requiere session_id y transcriptions' },
        { status: 400 }
      );
    }

    // Preparar datos para insertar
    const insertData = {
      user_id: user.id,
      session_id: reportData.session_id,
      session_duration: reportData.session_duration,
      total_transcriptions: reportData.total_transcriptions,
      consultation_phase: reportData.consultation_phase,
      transcriptions: reportData.transcriptions,
      medical_analysis: reportData.medical_analysis,
      symptoms: reportData.symptoms,
      diagnoses: reportData.diagnoses,
      recommendations: reportData.recommendations,
      red_flags: reportData.red_flags,
      follow_up: reportData.follow_up,
      alternative_treatments: reportData.alternative_treatments,
      emergency_criteria: reportData.emergency_criteria,
      suggested_questions: reportData.suggested_questions,
      summary: reportData.summary,
      confidence_level: reportData.confidence_level,
      requires_immediate_attention: reportData.requires_immediate_attention,
      final_report: reportData.final_report,
      tags: reportData.tags || [],
      notes: reportData.notes
    };

    // Insertar en la base de datos
    const { data: report, error } = await supabase
      .from('medical_reports')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error insertando reporte:', error);
      return NextResponse.json(
        { success: false, error: 'Error guardando reporte en la base de datos' },
        { status: 500 }
      );
    }

    console.log('✅ Reporte médico guardado exitosamente:', report.id);

    return NextResponse.json({
      success: true,
      report,
      message: 'Reporte médico guardado exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /api/medical-reports:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar reporte médico
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');

    if (!reportId) {
      return NextResponse.json(
        { success: false, error: 'ID de reporte requerido' },
        { status: 400 }
      );
    }

    // Eliminar reporte (RLS se encarga de verificar que sea del usuario)
    const { error } = await supabase
      .from('medical_reports')
      .delete()
      .eq('id', reportId);

    if (error) {
      console.error('Error eliminando reporte:', error);
      return NextResponse.json(
        { success: false, error: 'Error eliminando reporte' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reporte eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error en DELETE /api/medical-reports:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
