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
    const service = getOpenAIService();
    const analysis = await service.generateMedicalAnalysis();
    
    if (analysis) {
      return NextResponse.json({
        status: 'success',
        analysis,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'No hay suficientes datos para generar análisis'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error generating medical analysis:', error);
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
