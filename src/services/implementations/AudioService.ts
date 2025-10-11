import { AbstractService } from '../base/AbstractService';
import { AudioService as IAudioService, AudioConfig, AudioStats } from '../interfaces';
import { socketService } from './SocketService';

export class AudioService extends AbstractService implements IAudioService {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private stats: AudioStats;
  
  // Callbacks
  private volumeCallbacks: Set<(volume: number, peak?: number) => void> = new Set();
  private statsCallbacks: Set<(stats: AudioStats) => void> = new Set();

  constructor(config: AudioConfig = {} as AudioConfig) {
    const defaultConfig: AudioConfig = {
      sampleRate: 16000,
      channels: 1,
      chunkDuration: 250,
      vadThreshold: 0.02,
      vadMinVoiceDuration: 500,
      vadMinSilenceDuration: 1000,
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 10000,
      enableLogging: true
    };

    super('AudioService', { ...defaultConfig, ...config });

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

    // Register health checks
    this.registerHealthCheck('audio_context', async () => !!this.audioContext);
    this.registerHealthCheck('media_stream', async () => !!this.stream);
    this.registerHealthCheck('recording_state', async () => this.stats.isRecording);
  }

  protected async doInitialize(): Promise<void> {
    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw this.createError(
        'UNSUPPORTED_BROWSER',
        'Browser does not support audio recording'
      );
    }

    if (!window.AudioContext && !window.webkitAudioContext) {
      throw this.createError(
        'UNSUPPORTED_AUDIO_CONTEXT',
        'Browser does not support AudioContext'
      );
    }

    this.log('Audio service initialized');
  }

  protected async doConnect(): Promise<void> {
    // Audio service doesn't need a persistent connection
    // Connection is established when starting recording
    this.log('Audio service ready for recording');
  }

  protected async doDisconnect(): Promise<void> {
    await this.stopRecording();
    this.cleanup();
  }

  async startRecording(): Promise<boolean> {
    try {
      if (this.stats.isRecording) {
        this.log('Recording already in progress', 'warn');
        return true;
      }

      this.log('Starting audio recording...');

      // Get user media
      await this.initializeMediaStream();
      
      // Setup audio processing
      await this.setupAudioProcessing();
      
      // Start processing
      this.startAudioProcessing();
      
      this.stats.isRecording = true;
      this.status.isConnected = true;
      this.notifyStatsUpdate();
      
      this.log('Audio recording started successfully');
      return true;

    } catch (error) {
      const serviceError = this.handleError(error);
      this.status.lastError = serviceError.message;
      return false;
    }
  }

  async stopRecording(): Promise<void> {
    try {
      this.log('Stopping audio recording...');

      this.stats.isRecording = false;
      this.status.isConnected = false;

      // Stop audio processing
      if (this.processor) {
        this.processor.disconnect();
        this.processor = null;
      }

      // Close audio context
      if (this.audioContext && this.audioContext.state !== 'closed') {
        await this.audioContext.close();
        this.audioContext = null;
      }

      // Stop media stream
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }

      this.notifyStatsUpdate();
      this.log('Audio recording stopped');

    } catch (error) {
      this.handleError(error);
    }
  }

  getStats(): AudioStats {
    return { ...this.stats };
  }

  onVolumeUpdate(callback: (volume: number, peak?: number) => void): void {
    this.volumeCallbacks.add(callback);
  }

  onStatsUpdate(callback: (stats: AudioStats) => void): void {
    this.statsCallbacks.add(callback);
  }

  // Private methods
  private async initializeMediaStream(): Promise<void> {
    const audioConfig = this.config as AudioConfig;
    
    const constraints: MediaStreamConstraints = {
      audio: {
        sampleRate: audioConfig.sampleRate,
        channelCount: audioConfig.channels,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.log('Media stream initialized');
    } catch (error) {
      throw this.createError(
        'MEDIA_ACCESS_DENIED',
        'Failed to access microphone',
        error
      );
    }
  }

  private async setupAudioProcessing(): Promise<void> {
    if (!this.stream) {
      throw this.createError('NO_STREAM', 'No media stream available');
    }

    const audioConfig = this.config as AudioConfig;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    
    this.audioContext = new AudioContextClass({
      sampleRate: audioConfig.sampleRate
    });

    // Create audio nodes
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.gainNode = this.audioContext.createGain();
    this.analyser = this.audioContext.createAnalyser();
    
    // Configure analyser
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    // Create processor for audio chunks
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    // Connect nodes
    source.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.processor);
    this.processor.connect(this.audioContext.destination);

    this.log('Audio processing setup complete');
  }

  private startAudioProcessing(): void {
    if (!this.processor || !this.analyser) {
      throw this.createError('PROCESSING_NOT_SETUP', 'Audio processing not properly setup');
    }

    const audioConfig = this.config as AudioConfig;
    let lastVadTime = Date.now();
    let voiceStartTime: number | null = null;
    let silenceStartTime: number | null = null;

    this.processor.onaudioprocess = (event) => {
      if (!this.stats.isRecording) return;

      const inputBuffer = event.inputBuffer;
      const inputData = inputBuffer.getChannelData(0);
      
      // Calculate volume
      const { volume, peak } = this.calculateVolume(inputData);
      this.stats.volume = volume;

      // Voice Activity Detection
      const isVoiceActive = volume > audioConfig.vadThreshold;
      const now = Date.now();

      if (isVoiceActive && !this.stats.isVoiceActive) {
        // Voice started
        if (silenceStartTime) {
          this.stats.silenceDuration = now - silenceStartTime;
          this.stats.silenceTotalTime += this.stats.silenceDuration;
          silenceStartTime = null;
        }
        voiceStartTime = now;
        this.stats.isVoiceActive = true;
      } else if (!isVoiceActive && this.stats.isVoiceActive) {
        // Voice stopped
        if (voiceStartTime) {
          this.stats.voiceActiveDuration = now - voiceStartTime;
          this.stats.voiceActiveTotalTime += this.stats.voiceActiveDuration;
          voiceStartTime = null;
        }
        silenceStartTime = now;
        this.stats.isVoiceActive = false;
      }

      // Send audio chunk if voice is active or recently active
      const timeSinceLastVad = now - lastVadTime;
      if (isVoiceActive || timeSinceLastVad < audioConfig.vadMinSilenceDuration) {
        this.sendAudioChunk(inputData);
        this.stats.chunksSent++;
        lastVadTime = now;
      } else {
        this.stats.chunksSkipped++;
      }

      this.stats.chunksCount++;
      this.stats.vadConfidence = isVoiceActive ? Math.min(volume / audioConfig.vadThreshold, 1) : 0;

      // Notify callbacks
      this.notifyVolumeUpdate(volume, peak);
      this.notifyStatsUpdate();
    };
  }

  private calculateVolume(samples: Float32Array): { volume: number; peak: number } {
    let sum = 0;
    let peak = 0;

    for (let i = 0; i < samples.length; i++) {
      const sample = Math.abs(samples[i]);
      sum += sample * sample;
      peak = Math.max(peak, sample);
    }

    const rms = Math.sqrt(sum / samples.length);
    return { volume: rms, peak };
  }

  private sendAudioChunk(audioData: Float32Array): void {
    try {
      // Convert Float32Array to Int16Array for transmission
      const int16Array = new Int16Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        int16Array[i] = Math.max(-32768, Math.min(32767, audioData[i] * 32768));
      }

      // Send via socket
      if (socketService.isSocketConnected()) {
        socketService.emit('audio-chunk', {
          audioData: Array.from(int16Array),
          sampleRate: (this.config as AudioConfig).sampleRate,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      this.handleError(this.createError('CHUNK_SEND_ERROR', 'Failed to send audio chunk', error));
    }
  }

  private notifyVolumeUpdate(volume: number, peak?: number): void {
    this.volumeCallbacks.forEach(callback => {
      try {
        callback(volume, peak);
      } catch (error) {
        this.log(`Error in volume callback: ${error}`, 'error');
      }
    });
  }

  private notifyStatsUpdate(): void {
    this.statsCallbacks.forEach(callback => {
      try {
        callback(this.getStats());
      } catch (error) {
        this.log(`Error in stats callback: ${error}`, 'error');
      }
    });
  }

  // Override cleanup
  async cleanup(): Promise<void> {
    this.volumeCallbacks.clear();
    this.statsCallbacks.clear();
    await super.cleanup();
  }
}

// Export singleton instance
export const audioService = new AudioService();
export default audioService;
