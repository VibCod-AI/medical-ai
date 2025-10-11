import { Socket, Server } from 'socket.io';
import { BaseWebSocketHandler } from './BaseWebSocketHandler';
import DeepgramService from '../../lib/services/deepgramService';
import audioSessionManager from '../../lib/services/audioSessionManager';

export class AudioWebSocketHandler extends BaseWebSocketHandler {
  private deepgramService: DeepgramService | null = null;
  private sessions: Map<string, any> = new Map();

  constructor(deepgramService: DeepgramService | null) {
    super();
    this.deepgramService = deepgramService;
  }

  register(io: Server, socket: Socket): void {
    this.logger.info(`Registering audio handlers for socket ${socket.id}`);

    // Create audio session
    this.createAudioSession(socket);

    // Register event handlers
    socket.on('start-recording', (data) => this.handleStartRecording(io, socket, data));
    socket.on('audio-chunk', (audioData) => this.handleAudioChunk(io, socket, audioData));
    socket.on('stop-recording', () => this.handleStopRecording(io, socket));
    socket.on('test-connection', () => this.handleTestConnection(socket));
  }

  private createAudioSession(socket: Socket): void {
    try {
      if (audioSessionManager) {
        const session = audioSessionManager.createSession(socket.id);
        this.sessions.set(socket.id, session);
        this.logger.info(`Audio session created: ${session.id} for socket ${socket.id}`);
      }
    } catch (error) {
      this.logger.error(`Failed to create audio session for socket ${socket.id}`, { error });
    }
  }

  private async handleStartRecording(io: Server, socket: Socket, data: any): Promise<void> {
    this.logger.info(`Starting recording for socket ${socket.id}`, { data });

    try {
      if (!this.deepgramService) {
        throw new Error('Deepgram service not available');
      }

      // Connect to Deepgram if not connected
      if (!this.deepgramService.connected) {
        const connected = await this.deepgramService.connect();
        if (!connected) {
          throw new Error('Failed to connect to Deepgram');
        }
      }

      // Setup transcription callback
      this.deepgramService.onTranscriptionReceived = (transcriptionResult) => {
        this.handleTranscriptionReceived(io, socket, transcriptionResult);
      };

      this.emitToSocket(socket, 'recording-started', {
        message: 'Recording started successfully',
        timestamp: new Date().toISOString()
      });

      this.logger.info(`Recording started successfully for socket ${socket.id}`);

    } catch (error) {
      this.handleError(socket, error, 'start-recording');
    }
  }

  private handleAudioChunk(io: Server, socket: Socket, audioData: any): void {
    try {
      if (!audioData) {
        this.logger.warn(`Empty audio data received from socket ${socket.id}`);
        return;
      }

      this.logger.debug(`Audio chunk received from ${socket.id}`, {
        hasData: !!audioData,
        dataLength: audioData?.length || audioData?.byteLength || 0,
        deepgramConnected: this.deepgramService?.connected || false
      });

      // Send to Deepgram if available and connected
      if (this.deepgramService && this.deepgramService.connected) {
        // Convert array back to buffer if needed
        let audioBuffer: Buffer;
        
        if (Array.isArray(audioData)) {
          audioBuffer = Buffer.from(new Int16Array(audioData).buffer);
        } else if (audioData.audioData && Array.isArray(audioData.audioData)) {
          audioBuffer = Buffer.from(new Int16Array(audioData.audioData).buffer);
        } else {
          audioBuffer = Buffer.from(audioData);
        }

        this.deepgramService.sendAudio(audioBuffer);
        this.logger.debug(`Audio chunk sent to Deepgram from socket ${socket.id}`, {
          bufferSize: audioBuffer.length
        });
      } else {
        this.logger.warn(`Cannot send audio chunk - Deepgram not connected for socket ${socket.id}`);
      }

    } catch (error) {
      this.handleError(socket, error, 'audio-chunk');
    }
  }

  private handleStopRecording(io: Server, socket: Socket): void {
    this.logger.info(`Stopping recording for socket ${socket.id}`);

    try {
      // Finalize Deepgram session
      if (this.deepgramService && this.deepgramService.connected) {
        this.deepgramService.finishStream();
        this.logger.info(`Deepgram stream finished for socket ${socket.id}`);
      }

      // Clean up audio session
      if (audioSessionManager) {
        const session = this.sessions.get(socket.id);
        if (session) {
          audioSessionManager.endSession(session.id);
          this.sessions.delete(socket.id);
          this.logger.info(`Audio session ended for socket ${socket.id}`);
        }
      }

      this.emitToSocket(socket, 'recording-stopped', {
        message: 'Recording stopped successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.handleError(socket, error, 'stop-recording');
    }
  }

  private handleTestConnection(socket: Socket): void {
    this.logger.info(`Connection test for socket ${socket.id}`);
    
    this.emitToSocket(socket, 'test-response', {
      message: 'WebSocket connection working correctly',
      timestamp: new Date().toISOString(),
      socketId: socket.id,
      services: {
        deepgram: !!this.deepgramService,
        deepgramConnected: this.deepgramService?.connected || false,
        audioSession: this.sessions.has(socket.id)
      }
    });
  }

  private handleTranscriptionReceived(io: Server, socket: Socket, transcriptionResult: any): void {
    this.logger.info(`Transcription received from Deepgram for socket ${socket.id}`, {
      transcript: transcriptionResult.transcript,
      is_final: transcriptionResult.is_final,
      speaker: transcriptionResult.speaker,
      confidence: transcriptionResult.confidence,
      transcript_length: transcriptionResult.transcript?.length || 0
    });

    if (transcriptionResult.transcript.trim()) {
      const transcriptionData = {
        is_final: transcriptionResult.is_final,
        transcript: transcriptionResult.transcript,
        speaker: transcriptionResult.speaker,
        confidence: transcriptionResult.confidence,
        timestamp: new Date().toISOString()
      };

      // Emit to all clients (or could be socket-specific)
      this.emitToAll(io, 'transcription-update', transcriptionData);
      
      this.logger.info(`Transcription emitted to all clients`, { transcriptionData });

      // If final transcription, trigger medical analysis
      if (transcriptionResult.is_final && transcriptionResult.transcript.trim()) {
        this.triggerMedicalAnalysis(io, socket, transcriptionResult);
      }
    }
  }

  private async triggerMedicalAnalysis(io: Server, socket: Socket, transcriptionResult: any): Promise<void> {
    try {
      this.logger.info(`Triggering medical analysis for final transcription from socket ${socket.id}`);

      // Detect speaker based on content
      const speakerLabel = this.detectSpeaker(transcriptionResult.transcript);
      
      // Here you would typically call your medical analysis service
      // For now, just emit an event that analysis is needed
      this.emitToAll(io, 'analysis-needed', {
        transcript: transcriptionResult.transcript,
        speaker: speakerLabel,
        confidence: transcriptionResult.confidence,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error(`Error triggering medical analysis for socket ${socket.id}`, { error });
    }
  }

  private detectSpeaker(transcript: string): string {
    const text = transcript.toLowerCase();
    
    // Doctor phrases
    const doctorPhrases = [
      'cuáles son los síntomas', 'desde cuándo', 'podrías describir', 'cómo se siente',
      'qué tipo de dolor', 'se acompaña', 'has notado', 'tienes algún', 'mi nombre es',
      'acompañando en tu consulta', 'vamos a revisar'
    ];
    
    // Patient phrases
    const patientPhrases = [
      'me duele', 'siento dolor', 'tengo dolor', 'me siento mal', 'no puedo',
      'desde hace', 'empezó', 'me pasa', 'noto que', 'también tengo'
    ];

    const isDoctorPhrase = doctorPhrases.some(phrase => text.includes(phrase));
    const isPatientPhrase = patientPhrases.some(phrase => text.includes(phrase));

    if (isDoctorPhrase && !isPatientPhrase) {
      return 'Médico';
    } else if (isPatientPhrase && !isDoctorPhrase) {
      return 'Paciente';
    }

    // Default based on question pattern
    return text.includes('?') ? 'Médico' : 'Paciente';
  }

  cleanup(socket: Socket): void {
    super.cleanup(socket);

    try {
      // Clean up session
      const session = this.sessions.get(socket.id);
      if (session && audioSessionManager) {
        audioSessionManager.endSession(session.id);
        this.sessions.delete(socket.id);
        this.logger.info(`Audio session cleaned up for socket ${socket.id}`);
      }

      // Disconnect Deepgram if this was the last client
      // (You might want more sophisticated logic here)
      if (this.deepgramService && this.deepgramService.connected && this.sessions.size === 0) {
        this.deepgramService.disconnect();
        this.logger.info('Deepgram disconnected - no active sessions');
      }

    } catch (error) {
      this.logger.error(`Error cleaning up audio handler for socket ${socket.id}`, { error });
    }
  }
}
