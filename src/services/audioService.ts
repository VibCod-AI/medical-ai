'use client';

import socketService from './socketService';

// Definir tipos directamente aquí para evitar dependencias
interface AudioConfig {
  sampleRate: number;
  channels: number;
  chunkDuration: number;
  vadThreshold: number;
  vadMinVoiceDuration: number;
  vadMinSilenceDuration: number;
}

interface AudioStats {
  isRecording: boolean;
  volume: number;
  chunksCount: number;
  chunksSent: number;
  chunksSkipped: number;
  vadConfidence: number;
  isVoiceActive: boolean;
  voiceActiveDuration: number;
  silenceDuration: number;
  voiceActiveTotalTime: number;
  silenceTotalTime: number;
}

export type { AudioConfig, AudioStats };

export class AudioService {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private config: AudioConfig;
  private stats: AudioStats;
  
  // Callbacks
  private onVolumeUpdate?: (volume: number, peak?: number) => void;
  private onStatsUpdate?: (stats: AudioStats) => void;
  private onError?: (error: string) => void;

  constructor() {
    this.config = {
      sampleRate: 16000,
      channels: 1,
      chunkDuration: 250, // 250ms chunks simples
      vadThreshold: 0.02,
      vadMinVoiceDuration: 100,
      vadMinSilenceDuration: 200
    };

    this.stats = {
      isRecording: false,
      volume: 0,
      chunksCount: 0,
      chunksSent: 0,
      chunksSkipped: 0,
      vadConfidence: 0,
      isVoiceActive: false,
      voiceActiveDuration: 0,
      silenceDuration: 0,
      voiceActiveTotalTime: 0,
      silenceTotalTime: 0
    };

    this.processPCMChunk = this.processPCMChunk.bind(this);
  }

  async initialize(): Promise<boolean> {
    try {
      // Verificar que estamos en el cliente
      if (typeof window === 'undefined') {
        console.error('AudioService solo funciona en el cliente');
        return false;
      }

      // Conectar WebSocket primero
      if (!socketService.isConnected) {
        await socketService.connect();
      }

      // Configurar AudioContext
      this.audioContext = new AudioContext({ sampleRate: 48000 });
      await this.audioContext.resume();

      // Obtener micrófono con configuración optimizada
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          sampleRate: 48000,
          channelCount: 1
        }
      });

      // Configurar nodos de audio
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.gainNode = this.audioContext.createGain();
      this.analyser = this.audioContext.createAnalyser();
      
      this.analyser.fftSize = 256;
      
      // Conectar: source -> gain -> analyser
      source.connect(this.gainNode);
      this.gainNode.connect(this.analyser);

      // Configurar procesador PCM
      this.setupSimplePCMCapture();
      
      return true;

    } catch (error) {
      this.onError?.(`Error iniciando audio: ${error}`);
      console.error('Error inicializando AudioService:', error);
      return false;
    }
  }

  private setupSimplePCMCapture() {
    if (!this.audioContext || !this.gainNode) return;

    // Usar buffer optimizado para estabilidad
    const bufferSize = 4096;
    this.processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
    
    this.processor.onaudioprocess = (event) => {
      if (!this.stats.isRecording) return;

      const inputBuffer = event.inputBuffer;
      const inputData = inputBuffer.getChannelData(0);
      
      // Resampling simple a 16kHz
      const realSampleRate = this.audioContext!.sampleRate;
      const targetSampleRate = 16000;
      const ratio = realSampleRate / targetSampleRate;
      const outputLength = Math.floor(inputData.length / ratio);
      const resampledData = new Float32Array(outputLength);
      
      // Resampling básico optimizado
      for (let i = 0; i < outputLength; i++) {
        const srcIndex = Math.floor(i * ratio);
        resampledData[i] = inputData[srcIndex];
      }
      
      // Convertir a PCM 16-bit
      const pcmData = new Int16Array(resampledData.length);
      for (let i = 0; i < resampledData.length; i++) {
        const sample = Math.max(-1, Math.min(1, resampledData[i]));
        pcmData[i] = Math.round(sample * 32767);
      }
      
      // Calcular volumen para el callback
      let sum = 0;
      let peak = 0;
      for (let i = 0; i < resampledData.length; i++) {
        const abs = Math.abs(resampledData[i]);
        sum += abs * abs;
        peak = Math.max(peak, abs);
      }
      const rms = Math.sqrt(sum / resampledData.length);
      
      // Actualizar stats de volumen
      this.stats.volume = rms;
      this.onVolumeUpdate?.(rms, peak);
      
      // Enviar solo si tiene contenido significativo
      const hasContent = pcmData.some(s => Math.abs(s) > 100);
      if (hasContent) {
        const arrayBuffer = pcmData.buffer.slice(pcmData.byteOffset, pcmData.byteOffset + pcmData.byteLength) as ArrayBuffer;
        this.processPCMChunk(arrayBuffer);
      }
    };
    
    // Conectar procesador al pipeline de audio
    this.gainNode.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  private processPCMChunk(arrayBuffer: ArrayBuffer) {
    this.stats.chunksCount++;
    
    if (socketService.isConnected) {
      socketService.sendAudioChunk(arrayBuffer);
      this.stats.chunksSent++;
    } else {
      this.stats.chunksSkipped++;
    }
    
    this.onStatsUpdate?.(this.stats);
  }

  async startRecording(): Promise<boolean> {
    try {
      if (!this.audioContext || !this.stream) {
        console.error('AudioService no inicializado correctamente');
        return false;
      }

      // Reset stats
      this.stats.chunksCount = 0;
      this.stats.chunksSent = 0;
      this.stats.chunksSkipped = 0;
      this.stats.isRecording = true;

      // Notificar backend
      socketService.emit('start-recording', {
        timestamp: Date.now(),
        config: this.config
      });

      console.log('✅ Grabación de audio iniciada');
      return true;

    } catch (error) {
      this.stats.isRecording = false;
      console.error('Error iniciando grabación:', error);
      return false;
    }
  }

  stopRecording() {
    this.stats.isRecording = false;
    
    // Notificar backend
    socketService.emit('stop-recording', {
      timestamp: Date.now(),
      stats: this.stats
    });

    console.log('⏹️ Grabación de audio detenida');
  }

  cleanup() {
    this.stats.isRecording = false;
    
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    console.log('🧹 AudioService limpiado');
  }

  // Setters para callbacks
  setVolumeCallback(callback: (volume: number, peak?: number) => void) {
    this.onVolumeUpdate = callback;
  }

  setStatsCallback(callback: (stats: AudioStats) => void) {
    this.onStatsUpdate = callback;
  }

  setErrorCallback(callback: (error: string) => void) {
    this.onError = callback;
  }

  getStats(): AudioStats {
    return { ...this.stats };
  }
}

// Crear instancia única del servicio (solo en el cliente)
let audioService: AudioService | null = null;

if (typeof window !== 'undefined') {
  audioService = new AudioService();
}

export default audioService!;
