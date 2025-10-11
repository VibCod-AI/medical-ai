import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔧 API: Forzando inicialización de OpenAI...');
    
    // Intentar importar y crear una nueva instancia
    const { default: OpenAIService } = await import('../../../lib/services/openaiService');
    
    const globalThis = global as any;
    
    if (!globalThis.openaiService) {
      console.log('🔧 API: Creando nueva instancia de OpenAI...');
      try {
        globalThis.openaiService = new OpenAIService();
        console.log('✅ API: OpenAI inicializado exitosamente');
      } catch (error) {
        console.error('❌ API: Error inicializando OpenAI:', error);
        return NextResponse.json({
          status: 'error',
          message: 'Error inicializando OpenAI: ' + (error as Error).message
        }, { status: 500 });
      }
    }
    
    // Verificar que funciona
    const stats = globalThis.openaiService.getStats();
    
    return NextResponse.json({
      status: 'success',
      message: 'OpenAI inicializado correctamente',
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API: Error en force-init-openai:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error forzando inicialización de OpenAI',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
