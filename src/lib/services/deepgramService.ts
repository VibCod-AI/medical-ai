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
      diarize: true, // ✅ HABILITADO para detectar múltiples speakers
      diarize_version: '2023-10-12', // Versión específica de diarización
      multichannel: false,
      alternatives: 1,
      numerals: true,
      search: [],
      replace: [],
      keywords: [],
      keyword_boost: 'legacy',
      interim_results: true,
      endpointing: 300,
      vad_events: true,
      sample_rate: 16000,
      channels: 1,
      encoding: 'linear16',
      filler_words: false,
      profanity_filter: false,
      utterances: true,
      utt_split: 0.8
    };

    // Verificar API key
    const apiKey = process.env.DEEPGRAM_API_KEY;
    console.log('🔑 DEEPGRAM: Verificando API Key:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyPrefix: apiKey?.substring(0, 8) || 'undefined'
    });

    if (!apiKey) {
      console.error('❌ DEEPGRAM: API Key no encontrada en variables de entorno!');
      console.error('💡 DEEPGRAM: Asegúrate de tener DEEPGRAM_API_KEY en tu archivo .env.local');
    }

    // Inicializar cliente Deepgram
    this.deepgram = createClient(apiKey) as DeepgramClient;
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
        filler_words: this.config.filler_words,
        utterances: this.config.utterances,
        utt_split: this.config.utt_split,
        ...(this.config.encoding && { encoding: this.config.encoding })
      };
      
      console.log('🔧 DEEPGRAM: Configuración de conexión:', connectionConfig);
      
      this.connection = this.deepgram.listen.live(connectionConfig);

      this.connection.on(LiveTranscriptionEvents.Open, () => {
        console.log('✅ DEEPGRAM: Conexión abierta exitosamente');
        this.isConnected = true;
        this.startKeepAlive();
      });

      this.connection.on(LiveTranscriptionEvents.Transcript, (data: unknown) => {
        this.handleTranscription(data);
      });

      this.connection.on(LiveTranscriptionEvents.Error, (error: unknown) => {
        console.error('❌ DEEPGRAM: Error en conexión:', error);
        this.isConnected = false;
      });

      this.connection.on(LiveTranscriptionEvents.Metadata, (metadata: unknown) => {
        console.log('📊 DEEPGRAM: Metadata recibida:', metadata);
        this.isConnected = false;
        this.stopKeepAlive();
      });

      this.connection.on(LiveTranscriptionEvents.Close, (event: unknown) => {
        console.log('🔒 DEEPGRAM: Conexión cerrada:', event);
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
    console.log('🎧 DEEPGRAM: handleTranscription llamado con data:', {
      hasData: !!data,
      dataType: typeof data,
      dataKeys: data ? Object.keys(data as object) : []
    });

    const transcriptionData = data as DeepgramTranscriptionData;
    console.log('🎧 DEEPGRAM: transcriptionData procesado:', {
      hasChannel: !!transcriptionData.channel,
      hasAlternatives: !!transcriptionData.channel?.alternatives,
      alternativesLength: transcriptionData.channel?.alternatives?.length || 0,
      hasFirstAlternative: !!transcriptionData.channel?.alternatives?.[0],
      is_final: transcriptionData.is_final
    });

    if (!transcriptionData.channel?.alternatives?.[0]) {
      console.log('⏭️ DEEPGRAM: Datos de transcripción inválidos, saltando...');
      return;
    }

    const result = transcriptionData.channel.alternatives[0];
    const firstWord = result.words?.[0];
    const speakerNumber = firstWord?.speaker;
    
    console.log('🔍 DEEPGRAM: Detalles del resultado:', {
      transcript: result.transcript,
      confidence: result.confidence,
      wordsCount: result.words?.length || 0,
      firstWord: firstWord?.word,
      speakerNumber: speakerNumber,
      hasTranscript: !!result.transcript,
      transcriptTrimmed: result.transcript?.trim()
    });
    
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
      const status = transcriptionResult.is_final ? 'FINAL' : 'INTERIM';
      
      let speakerLabel = 'Sin identificar';
      if (transcriptionResult.speaker !== undefined) {
        const speakerMap: {[key: number]: string} = {
          0: 'Médico',
          1: 'Paciente',
          2: 'Hablante 3',
          3: 'Hablante 4'
        };
        speakerLabel = speakerMap[transcriptionResult.speaker] || `Hablante ${transcriptionResult.speaker}`;
      }
      
      console.log(`📝 DEEPGRAM → TRANSCRIPCIÓN ${status}:`);
      console.log(`   🎙️ ${speakerLabel}: "${transcriptionResult.transcript}"`);
      console.log(`   🎯 Confianza: ${Math.round(transcriptionResult.confidence * 100)}%`);
    }

    console.log('🚀 DEEPGRAM: Llamando callback onTranscriptionReceived:', {
      hasCallback: !!this.onTranscriptionReceived,
      transcriptLength: transcriptionResult.transcript.length,
      is_final: transcriptionResult.is_final
    });
    
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

