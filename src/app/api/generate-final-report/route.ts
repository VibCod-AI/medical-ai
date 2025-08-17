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

export async function POST() {
  try {
    const service = getOpenAIService();
    const finalReport = await service.generateFinalReport();
    
    if (finalReport) {
      return NextResponse.json({ 
        success: true, 
        report: finalReport,
        message: 'Informe final generado exitosamente'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'No se pudo generar el informe final. Consulta muy corta o sin suficiente información.'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error generando informe final:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error interno del servidor al generar informe',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
