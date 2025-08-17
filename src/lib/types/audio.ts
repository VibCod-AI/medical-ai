// Tipos para el sistema de audio
export interface AudioSession {
  id: string;
  socketId: string;
  startTime: number;
  chunksReceived: number;
  totalBytes: number;
  isActive: boolean;
}

export interface AudioChunk {
  id: string;
  timestamp: number;
  data: ArrayBuffer;
  size: number;
  sequence: number;
  sessionId: string;
}

export interface AudioStats {
  sessions: number;
  totalChunks: number;
  totalBytes: number;
  avgChunkSize: number;
}

// Configuración de Deepgram
export interface DeepgramConfig {
  model: string;
  language: string;
  smart_format: boolean;
  punctuate: boolean;
  diarize: boolean;
  interim_results: boolean;
  endpointing: number | boolean;
  vad_events: boolean;
  utterance_end_ms?: number;
  sample_rate: number;
  channels: number;
  encoding?: string;
  filler_words?: boolean;
  profanity_filter?: boolean;
}

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
    speaker?: number;
  }>;
  is_final: boolean;
  speaker?: number;
  start?: number;
  end?: number;
}
