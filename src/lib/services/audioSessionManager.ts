import { AudioSession, AudioChunk, AudioStats } from '../types/audio';

class AudioSessionManager {
  private sessions: Map<string, AudioSession> = new Map();
  private stats: AudioStats = {
    sessions: 0,
    totalChunks: 0,
    totalBytes: 0,
    avgChunkSize: 0
  };

  createSession(socketId: string): AudioSession {
    const session: AudioSession = {
      id: this.generateSessionId(),
      socketId,
      startTime: Date.now(),
      chunksReceived: 0,
      totalBytes: 0,
      isActive: true
    };

    this.sessions.set(session.id, session);
    this.stats.sessions++;
    
    console.log(`🎵 Nueva sesión de audio creada: ${session.id} (socket: ${socketId})`);
    return session;
  }

  processAudioChunk(socketId: string, audioData: ArrayBuffer): AudioChunk | null {
    const session = this.getSessionBySocketId(socketId);
    
    if (!session) {
      console.warn(`⚠️ No se encontró sesión para socket: ${socketId}`);
      return null;
    }

    const chunk: AudioChunk = {
      id: this.generateChunkId(),
      timestamp: Date.now(),
      data: audioData,
      size: audioData.byteLength,
      sequence: session.chunksReceived + 1,
      sessionId: session.id
    };

    session.chunksReceived++;
    session.totalBytes += chunk.size;

    this.stats.totalChunks++;
    this.stats.totalBytes += chunk.size;
    this.stats.avgChunkSize = this.stats.totalBytes / this.stats.totalChunks;

    this.logChunkInfo(chunk, session);

    return chunk;
  }

  endSession(socketId: string): boolean {
    const session = this.getSessionBySocketId(socketId);
    
    if (!session) {
      return false;
    }

    session.isActive = false;
    const duration = Date.now() - session.startTime;
    
    console.log(`🏁 Sesión finalizada: ${session.id}`);
    console.log(`📊 Duración: ${duration}ms, Chunks: ${session.chunksReceived}, Bytes: ${session.totalBytes}`);
    
    setTimeout(() => {
      this.sessions.delete(session.id);
    }, 60000);

    return true;
  }

  private getSessionBySocketId(socketId: string): AudioSession | undefined {
    for (const session of this.sessions.values()) {
      if (session.socketId === socketId && session.isActive) {
        return session;
      }
    }
    return undefined;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChunkId(): string {
    return `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logChunkInfo(chunk: AudioChunk, session: AudioSession) {
    // Log chunk info - can be expanded for debugging
    console.debug(`Chunk ${chunk.id} processed for session ${session.id}`);
  }

  getStats(): AudioStats {
    return { ...this.stats };
  }

  getActiveSessions(): AudioSession[] {
    return Array.from(this.sessions.values()).filter(s => s.isActive);
  }

  cleanup(): void {
    const now = Date.now();
    const timeout = 5 * 60 * 1000;

    for (const [id, session] of this.sessions.entries()) {
      if (!session.isActive && (now - session.startTime) > timeout) {
        this.sessions.delete(id);
        console.log(`🧹 Sesión limpiada: ${id}`);
      }
    }
  }

  getSessionInfo(sessionId: string): AudioSession | undefined {
    return this.sessions.get(sessionId);
  }

  validateAudioData(data: ArrayBuffer): boolean {
    if (!data || data.byteLength === 0) {
      console.warn('⚠️ Chunk de audio vacío');
      return false;
    }

    if (data.byteLength > 1024 * 1024) {
      console.warn('⚠️ Chunk de audio demasiado grande:', data.byteLength);
      return false;
    }

    return true;
  }

  getSessionStats(socketId: string): {
    sessionId: string;
    duration: number;
    chunksReceived: number;
    totalBytes: number;
    avgChunkSize: number;
    chunksPerSecond: number;
    isActive: boolean;
  } | null {
    const session = this.getSessionBySocketId(socketId);
    
    if (!session) {
      return null;
    }

    const duration = Date.now() - session.startTime;
    const avgChunkSize = session.totalBytes / session.chunksReceived || 0;
    const chunksPerSecond = session.chunksReceived / (duration / 1000) || 0;

    return {
      sessionId: session.id,
      duration,
      chunksReceived: session.chunksReceived,
      totalBytes: session.totalBytes,
      avgChunkSize: Math.round(avgChunkSize),
      chunksPerSecond: Math.round(chunksPerSecond * 100) / 100,
      isActive: session.isActive
    };
  }
}

const audioSessionManager = new AudioSessionManager();
export default audioSessionManager;
