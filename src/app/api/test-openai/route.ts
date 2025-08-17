import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return NextResponse.json({
        status: 'not_configured',
        message: 'OpenAI API key no configurada'
      }, { status: 400 });
    }

    // Verificar que la key tenga formato válido de OpenAI
    if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
      return NextResponse.json({
        status: 'invalid_key',
        message: 'OpenAI API key inválida (debe empezar con sk-)'
      }, { status: 400 });
    }

    return NextResponse.json({
      status: 'configured',
      message: 'OpenAI API key configurada correctamente',
      hasKey: !!apiKey,
      keyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 7) + '...'
    });

  } catch (error) {
    console.error('Error testing OpenAI:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error verificando OpenAI API' 
      },
      { status: 500 }
    );
  }
}
