import { NextResponse } from 'next/server';

// Función para obtener la instancia global de OpenAI desde el servidor
function getGlobalOpenAIService() {
  // Acceder a la instancia global del servidor
  const globalThis = global as any;
  console.log('🔍 API: Buscando instancia global OpenAI:', {
    hasGlobalThis: !!globalThis,
    hasOpenaiService: !!globalThis.openaiService,
    globalKeys: Object.keys(globalThis).filter(k => k.includes('openai'))
  });
  return globalThis.openaiService || null;
}

export async function GET() {
  try {
    const service = getGlobalOpenAIService();
    
    if (!service) {
      return NextResponse.json({
        status: 'error',
        message: 'Servicio OpenAI no disponible'
      }, { status: 503 });
    }
    
    const analysis = service.getLatestAnalysis();
    const stats = service.getStats();
    
    return NextResponse.json({
      analysis,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting medical analysis:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error obteniendo análisis médico',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const service = getGlobalOpenAIService();
    
    if (!service) {
      return NextResponse.json({
        status: 'error',
        message: 'Servicio OpenAI no disponible - servidor no iniciado'
      }, { status: 503 });
    }
    
    console.log('🧪 API: Forzando análisis médico desde endpoint...');
    const analysis = await service.generateMedicalAnalysis();
    
    if (analysis) {
      console.log('✅ API: Análisis generado exitosamente');
      return NextResponse.json({
        status: 'success',
        analysis,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ API: No se pudo generar análisis');
      return NextResponse.json({
        status: 'error',
        message: 'No hay suficientes datos para generar análisis'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ API: Error generating medical analysis:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error generando análisis médico',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
