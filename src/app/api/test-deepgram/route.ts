import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    
    if (!apiKey || apiKey === 'your_deepgram_api_key_here') {
      return NextResponse.json({
        status: 'not_configured',
        message: 'Deepgram API key no configurada'
      }, { status: 400 });
    }

    // Verificar que la key tenga formato válido
    if (apiKey.length < 20) {
      return NextResponse.json({
        status: 'invalid_key',
        message: 'Deepgram API key inválida'
      }, { status: 400 });
    }

    return NextResponse.json({
      status: 'configured',
      message: 'Deepgram API key configurada correctamente',
      hasKey: !!apiKey,
      keyLength: apiKey.length
    });

  } catch (error) {
    console.error('Error testing Deepgram:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error verificando Deepgram API' 
      },
      { status: 500 }
    );
  }
}
