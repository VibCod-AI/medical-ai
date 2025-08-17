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
      model: 'nova-2',
      language: 'es',
      smart_format: true,
      punctuate: true,
      diarize: true,
      interim_results: true,
      endpointing: 500,
      vad_events: false,
      sample_rate: 16000,
      channels: 1,
      encoding: 'linear16',
      filler_words: false,
      profanity_filter: false
    };

    // Inicializar cliente Deepgram
    this.deepgram = createClient(process.env.DEEPGRAM_API_KEY) as DeepgramClient;
  }

  async connect(): Promise<boolean> {
    try {
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
      
      this.connection = this.deepgram.listen.live(connectionConfig);

      this.connection.on(LiveTranscriptionEvents.Open, () => {
        this.isConnected = true;
        this.startKeepAlive();
      });

      this.connection.on(LiveTranscriptionEvents.Transcript, (data: unknown) => {
        this.handleTranscription(data);
      });

      this.connection.on(LiveTranscriptionEvents.Error, (error: unknown) => {
        console.error('❌ Error Deepgram:', error);
        this.isConnected = false;
      });

      this.connection.on(LiveTranscriptionEvents.Metadata, () => {
        this.isConnected = false;
        this.stopKeepAlive();
      });

      const connected = await this.waitForConnection(5000);
      return connected;

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

  private startKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }
    
    this.keepAliveInterval = setInterval(() => {
      if (this.connection && this.isConnected) {
        try {
          const silentBuffer = Buffer.alloc(1024, 0);
          this.connection.send(silentBuffer);
        } catch (error) {
          console.error('❌ Error enviando keepalive:', error);
        }
      }
    }, 10000);
  }

  private stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  sendAudioChunk(audioBuffer: ArrayBuffer): boolean {
    if (!this.isConnected || !this.connection) {
      console.warn('⚠️ Deepgram no conectado, no se puede enviar audio');
      return false;
    }

    try {
      const buffer = Buffer.from(audioBuffer);
      this.connection.send(buffer);
      return true;
    } catch (error) {
      console.error('❌ Error enviando audio a Deepgram:', error);
      return false;
    }
  }

  private handleTranscription(data: unknown) {
    const transcriptionData = data as DeepgramTranscriptionData;
    if (!transcriptionData.channel?.alternatives?.[0]) {
      return;
    }

    const result = transcriptionData.channel.alternatives[0];
    const firstWord = result.words?.[0];
    const speakerNumber = firstWord?.speaker;
    
    const transcriptionResult: TranscriptionResult = {
      transcript: result.transcript || '',
      confidence: result.confidence || 0,
      words: (result.words || []).map(word => ({
        word: word.word || '',
        start: word.start || 0,
        end: word.end || 0,
        confidence: 1.0, // Deepgram no always provide word-level confidence
        speaker: word.speaker
      })),
      is_final: transcriptionData.is_final || false,
      speaker: speakerNumber,
      start: transcriptionData.start,
      end: transcriptionData.end
    };

    if (transcriptionResult.transcript.trim()) {
      const status = transcriptionResult.is_final ? '✅ FINAL' : '🔄 INTERIM';
      
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
    }

    this.onTranscriptionReceived?.(transcriptionResult);
  }

  public onTranscriptionReceived?: (result: TranscriptionResult) => void;

  finish(): void {
    if (this.connection && this.isConnected) {
      this.connection.finish();
    }
  }

  disconnect(): void {
    if (this.connection) {
      this.stopKeepAlive();
      this.connection.removeAllListeners();
      this.connection = null;
      this.isConnected = false;
    }
  }

  get connected(): boolean {
    return this.isConnected;
  }

  getConfig(): DeepgramConfig {
    return { ...this.config };
  }
}

export default DeepgramService;
