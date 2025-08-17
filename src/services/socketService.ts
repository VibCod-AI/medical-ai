import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

  connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.serverUrl, {
          transports: ['websocket'],
          autoConnect: true
        });

        this.socket.on('connect', () => {
          console.log('✅ Conectado al servidor:', this.socket?.id);
          resolve(true);
        });

        this.socket.on('disconnect', () => {
          console.log('❌ Desconectado del servidor');
        });

        this.socket.on('connect_error', (error) => {
          console.error('Error de conexión:', error);
          reject(error);
        });

        // Timeout de conexión
        setTimeout(() => {
          if (!this.socket?.connected) {
            reject(new Error('Timeout de conexión'));
          }
        }, 5000);

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Test de conexión
  testConnection(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket no conectado'));
        return;
      }

      this.socket.emit('test-connection', { 
        message: 'Test desde frontend NextJS',
        timestamp: new Date().toISOString()
      });

      this.socket.once('test-response', (data) => {
        resolve(data);
      });

      // Timeout para respuesta
      setTimeout(() => {
        reject(new Error('Timeout de respuesta del servidor'));
      }, 3000);
    });
  }

  // Enviar chunk de audio
  sendAudioChunk(audioData: ArrayBuffer) {
    console.log('📡 SOCKET SERVICE - Enviando chunk:', {
      connected: this.socket?.connected,
      socketId: this.socket?.id,
      dataSize: audioData.byteLength,
      dataType: audioData.constructor.name
    });

    if (this.socket?.connected) {
      // Convertir ArrayBuffer a Uint8Array para Socket.IO
      const uint8Array = new Uint8Array(audioData);
      console.log('🔄 Convirtiendo ArrayBuffer a Uint8Array...', {
        originalSize: audioData.byteLength,
        convertedSize: uint8Array.length
      });
      
      this.socket.emit('audio-chunk', uint8Array);
      console.log('✅ Chunk emitido por socket como Uint8Array');
    } else {
      console.error('❌ Socket no conectado, no se puede enviar chunk');
    }
  }

  // Escuchar eventos
  on(event: string, callback: (...args: unknown[]) => void) {
    this.socket?.on(event, callback);
  }

  // Remover listeners
  off(event: string, callback?: (...args: unknown[]) => void) {
    this.socket?.off(event, callback);
  }

  // Emitir evento genérico
  emit(event: string, data?: unknown): void {
    if (this.socket && this.socket.connected) {
      console.log(`🚀 SOCKET EMIT: ${event}`, data ? 'con datos' : 'sin datos');
      this.socket.emit(event, data);
    } else {
      console.warn(`⚠️ Socket no conectado, no se puede enviar evento: ${event}`);
    }
  }

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Crear instancia única del servicio
const socketService = new SocketService();

export default socketService;
