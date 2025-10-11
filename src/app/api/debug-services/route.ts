import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const globalThis = global as any;
    
    const debugInfo = {
      hasGlobal: !!globalThis,
      hasOpenaiService: !!globalThis.openaiService,
      globalKeys: Object.keys(globalThis).filter(k => k.toLowerCase().includes('openai')),
      allGlobalKeys: Object.keys(globalThis).slice(0, 20), // Solo primeras 20 para no saturar
      timestamp: new Date().toISOString()
    };
    
    if (globalThis.openaiService) {
      try {
        const stats = globalThis.openaiService.getStats();
        debugInfo.openaiStats = stats;
      } catch (error) {
        debugInfo.openaiError = error.message;
      }
    }
    
    console.log('🔍 DEBUG SERVICES:', debugInfo);
    
    return NextResponse.json({
      status: 'success',
      debug: debugInfo
    });

  } catch (error) {
    console.error('❌ DEBUG SERVICES ERROR:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error en debug de servicios',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
