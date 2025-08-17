import { NextResponse } from 'next/server';
import OpenAIService from '../../../lib/services/openaiService';

// Instancia global del servicio OpenAI
let openaiService: OpenAIService | null = null;

function getOpenAIService(): OpenAIService {
  if (!openaiService) {
    openaiService = new OpenAIService();
  }
  return openaiService;
}

export async function GET() {
  try {
    const service = getOpenAIService();
    const stats = service.getStats();
    
    return NextResponse.json({
      success: true,
      session_info: {
        duration: `${Math.round(stats.session_duration / 60000)} minutos`,
        transcriptions: stats.transcriptions_processed,
        analyses: stats.analyses_generated,
        phase: stats.consultation_phase
      },
      stats,
      message: 'Información de sesión obtenida'
    });

  } catch (error) {
    console.error('Error obteniendo información de sesión:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
