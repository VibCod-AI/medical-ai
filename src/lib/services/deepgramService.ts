import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { DeepgramConfig, TranscriptionResult } from '../types/audio';

// Tipos para Deepgram que no están completamente tipados
interface DeepgramClient {
  listen: {
    live: (config: Record<string, unknown>) => LiveConnection;
  };
}

interface LiveConnection {
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  send: (data: ArrayBuffer | Buffer) => void;
  finish: () => void;
  removeAllListeners: () => void;
}

interface DeepgramTranscriptionData {
  channel?: {
    alternatives?: Array<{
      transcript?: string;
      confidence?: number;
      words?: Array<{
        speaker?: number;
        word?: string;
        start?: number;
        end?: number;
      }>;
    }>;
  };
  is_final?: boolean;
  start?: number;
  end?: number;
}

class DeepgramService {
  private deepgram: DeepgramClient;
  private connection: LiveConnection | null = null;
  private isConnected: boolean = false;
  private config: DeepgramConfig;
  private keepAliveInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = {
      model: 'nova-2', // Modelo Nova-2 confirmado funcionando perfecto
      language: 'es', // Español
      smart_format: true, // Formateo inteligente según docs
      punctuate: true, // Puntuación automática
      diarize: true, // ✅ ACTIVADO - Identificar hablantes (médico vs paciente)
      interim_results: true, // Resultados parciales para tiempo real
      endpointing: 500, // 500ms más conservador
      vad_events: false, // Desactivar VAD events que pueden interferir
      sample_rate: 16000, // 16kHz - obligatorio con encoding
      channels: 1, // Mono
      encoding: 'linear16', // PCM 16-bit según docs
      filler_words: false, // Desactivar "um", "uh" por ahora
      profanity_filter: false // Sin filtro para pruebas médicas
    };

    // Inicializar cliente Deepgram
    this.deepgram = createClient(process.env.DEEPGRAM_API_KEY) as DeepgramClient;
  }

  // Conectar a Deepgram Live Transcription - Exactamente igual que medical-main backend
  async connect(): Promise<boolean> {
    try {

      // Configuración cargada silenciosamente - Exactamente igual que medical-main

      // Configurar conexión WebSocket con Deepgram - Exactamente igual que medical-main
      const connectionConfig = {
        model: this.config.model,
        language: this.config.language,
        smart_format: this.config.smart_format,
        punctuate: this.config.punctuate,
        diarize: this.config.diarize,
        interim_results: this.config.interim_results,
        endpointing: this.config.endpointing,
        vad_events: this.config.vad_events,
        sample_rate: this.config.sample_rate,
        channels: this.config.channels,
        ...(this.config.encoding && { encoding: this.config.encoding })
      };
      
      // Conectando con configuración optimizada - Exactamente igual que medical-main
      this.connection = this.deepgram.listen.live(connectionConfig);

      // Event listeners - Exactamente igual que medical-main
      this.connection.on(LiveTranscriptionEvents.Open, () => {
        // Deepgram conectado - Exactamente igual que medical-main
        this.isConnected = true;
        
        // Enviar keepalive cada 5 segundos para mantener la conexión - Exactamente igual que medical-main
        this.startKeepAlive();
      });

      this.connection.on(LiveTranscriptionEvents.Transcript, (data: unknown) => {

        this.handleTranscription(data);
      });

      this.connection.on(LiveTranscriptionEvents.Error, (error: unknown) => {
        console.error('❌ Error Deepgram:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        this.isConnected = false;
      });

      this.connection.on(LiveTranscriptionEvents.Metadata, () => {
        
        this.isConnected = false;
        this.stopKeepAlive();
      });

      // Esperar a que se conecte (con timeout) - Exactamente igual que medical-main
      // Esperando conexión - Exactamente igual que medical-main
      const connected = await this.waitForConnection(5000); // 5 segundos timeout
      
      if (connected) {
        // Deepgram conectado - Exactamente igual que medical-main
        return true;
      } else {
        // Error: timeout conexión - Exactamente igual que medical-main
        return false;
      }

    } catch (error) {
      console.error('❌ Error conectando a Deepgram:', error);
      return false;
    }
  }

  private waitForConnection(timeout: number): Promise<boolean> {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve(false);
      }, timeout);

      const checkConnection = () => {
        if (this.isConnected) {
          clearTimeout(timeoutId);
          resolve(true);
        } else {
          setTimeout(checkConnection, 100);
        }
      };

      checkConnection();
    });
  }

  // Mantener la conexión activa con keepalive - Exactamente igual que medical-main
  private startKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }
    
    this.keepAliveInterval = setInterval(() => {
      if (this.connection && this.isConnected) {
        try {
          // Enviar un buffer silencioso como keepalive - Exactamente igual que medical-main
          const silentBuffer = Buffer.alloc(1024, 0);
          this.connection.send(silentBuffer);
          // Keepalive enviado - Exactamente igual que medical-main
        } catch (error) {
          console.error('❌ Error enviando keepalive:', error);
        }
      }
    }, 10000); // Cada 10 segundos - Exactamente igual que medical-main
  }

  // Detener keepalive - Exactamente igual que medical-main
  private stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
      // Keepalive detenido - Exactamente igual que medical-main
    }
  }

  // Enviar chunk de audio a Deepgram - Exactamente igual que medical-main
  sendAudioChunk(audioBuffer: ArrayBuffer): boolean {
    if (!this.isConnected || !this.connection) {
      console.warn('⚠️ Deepgram no conectado, no se puede enviar audio');
      return false;
    }

    try {
      // Convertir ArrayBuffer a Buffer para Deepgram - Exactamente igual que medical-main
      const buffer = Buffer.from(audioBuffer);
      
      
      
      
      // Enviar a Deepgram - Exactamente igual que medical-main
      this.connection.send(buffer);
      
      
      
      return true;
    } catch (error) {
      console.error('❌ Error enviando audio a Deepgram:', error);
      return false;
    }
  }

  // Procesar transcripción recibida - Exactamente igual que medical-main backend
  private handleTranscription(data: unknown) {
    const transcriptionData = data as DeepgramTranscriptionData;
    if (!transcriptionData.channel?.alternatives?.[0]) {
      return;
    }

    const result = transcriptionData.channel.alternatives[0];
    
    // Extraer speaker del primer word (donde realmente está el speaker en Deepgram) - Exactamente igual que medical-main
    const firstWord = result.words?.[0];
    const speakerNumber = firstWord?.speaker;
    
    // Extraer información de la transcripción - Exactamente igual que medical-main
    const transcriptionResult: TranscriptionResult = {
      transcript: result.transcript || '',
      confidence: result.confidence || 0,
      words: (result.words || []).map(word => ({
        word: word.word || '',
        start: word.start || 0,
        end: word.end || 0,
        confidence: 1.0, // Deepgram doesn't always provide word-level confidence
        speaker: word.speaker
      })),
      is_final: transcriptionData.is_final || false,
      speaker: speakerNumber, // ✅ AHORA sí extrae el speaker correcto - Exactamente igual que medical-main
      start: transcriptionData.start,
      end: transcriptionData.end
    };

    // Speaker extraído correctamente del primer word - Exactamente igual que medical-main

    // Log de transcripción recibida - Exactamente igual que medical-main
    if (transcriptionResult.transcript.trim()) {
      const status = transcriptionResult.is_final ? '✅ FINAL' : '🔄 INTERIM';
      
      // Mapear speakers a roles médicos - Exactamente igual que medical-main
      let speakerLabel = 'Sin identificar';
      if (transcriptionResult.speaker !== undefined) {
        const speakerMap: {[key: number]: string} = {
          0: '👨‍⚕️ Médico',
          1: '🧑‍🦱 Paciente',
          2: '👥 Hablante 3',
          3: '👥 Hablante 4'
        };
        speakerLabel = speakerMap[transcriptionResult.speaker] || `👤 Hablante ${transcriptionResult.speaker}`;
      }
      
      console.log(`📝 DEEPGRAM → TRANSCRIPCIÓN ${status}:`);
      console.log(`   🎙️ ${speakerLabel}: "${transcriptionResult.transcript}"`);
      console.log(`   🎯 Confianza: ${Math.round(transcriptionResult.confidence * 100)}%`);
      if (transcriptionResult.start !== undefined && transcriptionResult.end !== undefined) {
        console.log(`   ⏱️ Tiempo: ${transcriptionResult.start}s - ${transcriptionResult.end}s`);
      }
    }

    // Emitir evento para que otros servicios puedan procesarlo - Exactamente igual que medical-main
    this.onTranscriptionReceived?.(transcriptionResult);
  }

  public onTranscriptionReceived?: (result: TranscriptionResult) => void;

  // Finalizar streaming - Exactamente igual que medical-main
  finish(): void {
    if (this.connection && this.isConnected) {
      // Finalizando streaming - Exactamente igual que medical-main
      this.connection.finish();
    }
  }

  // Desconectar - Exactamente igual que medical-main
  disconnect(): void {
    if (this.connection) {
      // Desconectando - Exactamente igual que medical-main
      this.stopKeepAlive();
      this.connection.removeAllListeners();
      this.connection = null;
      this.isConnected = false;
    }
  }

  // Estado de conexión - Exactamente igual que medical-main
  get connected(): boolean {
    return this.isConnected;
  }

  // Configuración actual - Exactamente igual que medical-main
  getConfig(): DeepgramConfig {
    return { ...this.config };
  }
}

export default DeepgramService;
