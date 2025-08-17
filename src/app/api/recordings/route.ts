import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const RECORDINGS_DIR = path.join(process.cwd(), 'temp/recordings');

// Crear directorio si no existe
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

export async function GET() {
  try {
    let recordings: {
      name: string;
      size: number;
      modified: string;
      created: string;
    }[] = [];
    
    if (fs.existsSync(RECORDINGS_DIR)) {
      const files = fs.readdirSync(RECORDINGS_DIR);
      recordings = files
        .filter(file => file.endsWith('.wav') || file.endsWith('.pcm'))
        .map(file => {
          const filePath = path.join(RECORDINGS_DIR, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            modified: stats.mtime.toISOString(),
            created: stats.birthtime.toISOString()
          };
        })
        .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
    }

    return NextResponse.json({
      recordings,
      recordingsDir: RECORDINGS_DIR,
      count: recordings.length
    });

  } catch (error) {
    console.error('Error obteniendo grabaciones:', error);
    return NextResponse.json(
      { 
        error: 'Error obteniendo lista de grabaciones',
        recordings: [],
        recordingsDir: RECORDINGS_DIR,
        count: 0
      },
      { status: 500 }
    );
  }
}
