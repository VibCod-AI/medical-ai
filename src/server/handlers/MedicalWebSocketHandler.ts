import { Socket, Server } from 'socket.io';
import { BaseWebSocketHandler } from './BaseWebSocketHandler';
import OpenAIService from '../../lib/services/openaiService';

export class MedicalWebSocketHandler extends BaseWebSocketHandler {
  private openaiService: OpenAIService | null = null;
  private analysisQueue: Map<string, any[]> = new Map(); // Store transcriptions per socket

  constructor(openaiService: OpenAIService | null) {
    super();
    this.openaiService = openaiService;
  }

  register(io: Server, socket: Socket): void {
    this.logger.info(`Registering medical handlers for socket ${socket.id}`);

    // Initialize transcription queue for this socket
    this.analysisQueue.set(socket.id, []);

    // Register event handlers
    socket.on('request-medical-analysis', (data) => this.handleRequestAnalysis(io, socket, data));
    socket.on('generate-final-report', (data) => this.handleGenerateFinalReport(io, socket, data));
    socket.on('save-medical-session', (data) => this.handleSaveMedicalSession(io, socket, data));
    
    // Listen for transcription updates to build analysis queue
    socket.on('transcription-final', (data) => this.handleTranscriptionFinal(socket, data));
  }

  private handleTranscriptionFinal(socket: Socket, transcriptionData: any): void {
    try {
      const queue = this.analysisQueue.get(socket.id) || [];
      queue.push({
        ...transcriptionData,
        timestamp: new Date().toISOString()
      });
      
      this.analysisQueue.set(socket.id, queue);
      
      this.logger.debug(`Transcription added to analysis queue for socket ${socket.id}`, {
        queueLength: queue.length,
        transcript: transcriptionData.transcript
      });

      // Auto-trigger analysis if we have enough transcriptions
      if (queue.length >= 5 && queue.length % 3 === 0) {
        this.logger.info(`Auto-triggering medical analysis for socket ${socket.id} (${queue.length} transcriptions)`);
        this.performMedicalAnalysis(socket, queue);
      }

    } catch (error) {
      this.handleError(socket, error, 'transcription-final');
    }
  }

  private async handleRequestAnalysis(io: Server, socket: Socket, data: any): Promise<void> {
    this.logger.info(`Medical analysis requested for socket ${socket.id}`, { data });

    try {
      const transcriptions = data.transcriptions || this.analysisQueue.get(socket.id) || [];
      
      if (transcriptions.length < 3) {
        this.emitToSocket(socket, 'analysis-error', {
          message: 'At least 3 transcriptions are required for medical analysis',
          code: 'INSUFFICIENT_DATA'
        });
        return;
      }

      const analysis = await this.performMedicalAnalysis(socket, transcriptions);
      
      if (analysis) {
        this.emitToSocket(socket, 'medical-analysis', analysis);
        this.logger.info(`Medical analysis completed for socket ${socket.id}`);
      }

    } catch (error) {
      this.handleError(socket, error, 'request-medical-analysis');
    }
  }

  private async handleGenerateFinalReport(io: Server, socket: Socket, data: any): Promise<void> {
    this.logger.info(`Final report generation requested for socket ${socket.id}`, { data });

    try {
      if (!this.openaiService) {
        this.emitToSocket(socket, 'report-error', {
          message: 'OpenAI service not available',
          code: 'SERVICE_UNAVAILABLE'
        });
        return;
      }

      const transcriptions = data.transcriptions || this.analysisQueue.get(socket.id) || [];
      const currentAnalysis = data.currentAnalysis;

      if (transcriptions.length < 4) {
        this.emitToSocket(socket, 'report-error', {
          message: 'At least 4 transcriptions are required for final report generation',
          code: 'INSUFFICIENT_DATA'
        });
        return;
      }

      // Emit progress update
      this.emitToSocket(socket, 'report-progress', {
        stage: 'analyzing',
        message: 'Analyzing conversation...',
        progress: 25
      });

      const report = await this.generateFinalReport(transcriptions, currentAnalysis);

      if (report) {
        this.emitToSocket(socket, 'final-report-generated', report);
        this.logger.info(`Final report generated for socket ${socket.id}`);
      }

    } catch (error) {
      this.handleError(socket, error, 'generate-final-report');
    }
  }

  private async handleSaveMedicalSession(io: Server, socket: Socket, data: any): Promise<void> {
    this.logger.info(`Medical session save requested for socket ${socket.id}`, { data });

    try {
      const sessionData = {
        socketId: socket.id,
        transcriptions: data.transcriptions || this.analysisQueue.get(socket.id) || [],
        analysis: data.analysis,
        finalReport: data.finalReport,
        timestamp: new Date().toISOString(),
        duration: data.duration || 0
      };

      // Here you would typically save to database
      // For now, just emit success
      this.emitToSocket(socket, 'session-saved', {
        sessionId: `session-${socket.id}-${Date.now()}`,
        message: 'Medical session saved successfully',
        data: sessionData
      });

      this.logger.info(`Medical session saved for socket ${socket.id}`);

    } catch (error) {
      this.handleError(socket, error, 'save-medical-session');
    }
  }

  private async performMedicalAnalysis(socket: Socket, transcriptions: any[]): Promise<any | null> {
    try {
      if (!this.openaiService) {
        throw new Error('OpenAI service not available');
      }

      this.logger.info(`Performing medical analysis for socket ${socket.id}`, {
        transcriptionCount: transcriptions.length
      });

      // Emit progress update
      this.emitToSocket(socket, 'analysis-progress', {
        stage: 'processing',
        message: 'Processing transcriptions...',
        progress: 50
      });

      // Prepare conversation for analysis
      const conversation = transcriptions
        .filter(t => t.transcript && t.transcript.trim())
        .map(t => `${t.speaker || 'Unknown'}: ${t.transcript}`)
        .join('\n');

      // Call OpenAI for analysis
      const analysis = await this.openaiService.generateMedicalAnalysis(conversation);

      this.emitToSocket(socket, 'analysis-progress', {
        stage: 'completed',
        message: 'Analysis completed',
        progress: 100
      });

      return analysis;

    } catch (error) {
      this.logger.error(`Error performing medical analysis for socket ${socket.id}`, { error });
      
      this.emitToSocket(socket, 'analysis-error', {
        message: 'Failed to generate medical analysis',
        error: error.message
      });
      
      return null;
    }
  }

  private async generateFinalReport(transcriptions: any[], currentAnalysis?: any): Promise<any | null> {
    try {
      if (!this.openaiService) {
        throw new Error('OpenAI service not available');
      }

      this.logger.info('Generating final medical report', {
        transcriptionCount: transcriptions.length,
        hasAnalysis: !!currentAnalysis
      });

      // Prepare data for report generation
      const conversation = transcriptions
        .filter(t => t.transcript && t.transcript.trim())
        .map(t => `${t.speaker || 'Unknown'}: ${t.transcript}`)
        .join('\n');

      // Generate comprehensive final report
      const report = await this.openaiService.generateFinalReport(conversation, currentAnalysis);

      return report;

    } catch (error) {
      this.logger.error('Error generating final report', { error });
      throw error;
    }
  }

  cleanup(socket: Socket): void {
    super.cleanup(socket);

    try {
      // Clear analysis queue for this socket
      this.analysisQueue.delete(socket.id);
      this.logger.info(`Medical analysis queue cleared for socket ${socket.id}`);

    } catch (error) {
      this.logger.error(`Error cleaning up medical handler for socket ${socket.id}`, { error });
    }
  }
}
