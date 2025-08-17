import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'OK',
      message: 'Medical IA Backend API Running - Next.js Integration',
      timestamp: new Date().toISOString(),
      version: '2.0.0-nextjs'
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    );
  }
}
