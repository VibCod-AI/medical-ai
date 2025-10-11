// Base interfaces for all services
export interface ServiceConfig {
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
  enableLogging?: boolean;
}

export interface ServiceStatus {
  isConnected: boolean;
  isInitialized: boolean;
  lastError?: string;
  connectionTime?: Date;
  reconnectAttempts?: number;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
  service: string;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

// Base service interface that all services should implement
export interface BaseService {
  // Service lifecycle
  initialize(config?: ServiceConfig): Promise<boolean>;
  connect?(): Promise<boolean>;
  disconnect(): Promise<void>;
  
  // Service status
  getStatus(): ServiceStatus;
  isHealthy(): boolean;
  
  // Error handling
  onError(callback: (error: ServiceError) => void): void;
  offError(callback: (error: ServiceError) => void): void;
}

// Audio service specific interfaces
export interface AudioConfig extends ServiceConfig {
  sampleRate: number;
  channels: number;
  chunkDuration: number;
  vadThreshold: number;
  vadMinVoiceDuration: number;
  vadMinSilenceDuration: number;
}

export interface AudioStats {
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

export interface AudioService extends BaseService {
  startRecording(): Promise<boolean>;
  stopRecording(): Promise<void>;
  getStats(): AudioStats;
  onVolumeUpdate(callback: (volume: number, peak?: number) => void): void;
  onStatsUpdate(callback: (stats: AudioStats) => void): void;
}

// WebSocket service specific interfaces
export interface SocketConfig extends ServiceConfig {
  serverUrl?: string;
  transports?: string[];
  autoConnect?: boolean;
  reconnection?: boolean;
}

export interface SocketService extends BaseService {
  emit(event: string, data: unknown): void;
  on(event: string, callback: (...args: unknown[]) => void): void;
  off(event: string, callback?: (...args: unknown[]) => void): void;
  testConnection(): Promise<unknown>;
}

// Transcription service specific interfaces
export interface TranscriptionConfig extends ServiceConfig {
  model?: string;
  language?: string;
  smartFormat?: boolean;
  punctuate?: boolean;
  diarize?: boolean;
  diarizeVersion?: string;
}

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  speaker?: number;
  isFinal: boolean;
  startTime?: number;
  endTime?: number;
  words?: Array<{
    word: string;
    speaker?: number;
    start?: number;
    end?: number;
  }>;
}

export interface TranscriptionService extends BaseService {
  startTranscription(config?: TranscriptionConfig): Promise<void>;
  stopTranscription(): Promise<void>;
  sendAudio(audioData: ArrayBuffer | Buffer): void;
  onTranscription(callback: (result: TranscriptionResult) => void): void;
  onSpeakerChange(callback: (speaker: number) => void): void;
}

// AI Analysis service interfaces
export interface AnalysisConfig extends ServiceConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AnalysisService extends BaseService {
  analyzeTranscriptions(transcriptions: unknown[]): Promise<unknown>;
  generateReport(data: unknown): Promise<unknown>;
  onAnalysisComplete(callback: (result: unknown) => void): void;
}
