import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const RECORDINGS_DIR = path.join(process.cwd(), 'temp/recordings');

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Nombre de archivo requerido' },
        { status: 400 }
      );
    }

    const filePath = path.join(RECORDINGS_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Archivo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el archivo esté dentro del directorio permitido
    const resolvedPath = path.resolve(filePath);
    const resolvedDir = path.resolve(RECORDINGS_DIR);
    
    if (!resolvedPath.startsWith(resolvedDir)) {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    // Determinar tipo de contenido
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.wav') {
      contentType = 'audio/wav';
    } else if (ext === '.pcm') {
      contentType = 'audio/pcm';
    } else if (ext === '.mp3') {
      contentType = 'audio/mpeg';
    }

    // Leer archivo
    const fileBuffer = fs.readFileSync(filePath);
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Error sirviendo archivo de grabación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
