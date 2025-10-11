import { io, Socket } from 'socket.io-client';
import { AbstractService } from '../base/AbstractService';
import { SocketService as ISocketService, SocketConfig } from '../interfaces';

export class SocketService extends AbstractService implements ISocketService {
  private socket: Socket | null = null;
  private eventCallbacks: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  constructor(config: SocketConfig = {}) {
    super('SocketService', config);
    this.registerHealthCheck('socket_connected', async () => this.socket?.connected || false);
  }

  protected async doInitialize(): Promise<void> {
    // Socket.IO doesn't require initialization, just configuration validation
    const socketConfig = this.config as SocketConfig;
    
    if (!socketConfig.serverUrl && !process.env.NEXT_PUBLIC_WS_URL) {
      throw this.createError(
        'MISSING_CONFIG', 
        'Server URL is required for socket connection'
      );
    }

    this.log('Socket service initialized');
  }

  protected async doConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const socketConfig = this.config as SocketConfig;
        const serverUrl = socketConfig.serverUrl || process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

        this.socket = io(serverUrl, {
          transports: socketConfig.transports || ['websocket'],
          autoConnect: socketConfig.autoConnect ?? true,
          reconnection: socketConfig.reconnection ?? true,
          timeout: this.config.timeout || 10000
        });

        // Connection event handlers
        this.socket.on('connect', () => {
          this.log(`Connected to server: ${this.socket?.id}`);
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          this.log(`Disconnected from server: ${reason}`, 'warn');
          this.status.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
          this.log(`Connection error: ${error.message}`, 'error');
          this.handleError(this.createError('CONNECTION_ERROR', error.message, error));
          reject(error);
        });

        this.socket.on('reconnect', (attemptNumber) => {
          this.log(`Reconnected after ${attemptNumber} attempts`);
          this.status.reconnectAttempts = attemptNumber;
        });

        this.socket.on('reconnect_error', (error) => {
          this.log(`Reconnection error: ${error.message}`, 'error');
          this.handleError(this.createError('RECONNECTION_ERROR', error.message, error));
        });

        // Connection timeout
        setTimeout(() => {
          if (!this.socket?.connected) {
            reject(this.createError('CONNECTION_TIMEOUT', 'Connection timeout exceeded'));
          }
        }, this.config.timeout || 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  protected async doDisconnect(): Promise<void> {
    if (this.socket) {
      // Clear all event listeners
      this.eventCallbacks.clear();
      
      // Disconnect socket
      this.socket.disconnect();
      this.socket = null;
      
      this.log('Socket disconnected');
    }
  }

  emit(event: string, data: unknown): void {
    if (!this.socket?.connected) {
      const error = this.createError(
        'NOT_CONNECTED', 
        'Cannot emit event: socket not connected'
      );
      this.handleError(error);
      return;
    }

    try {
      this.socket.emit(event, data);
      this.log(`Emitted event: ${event}`);
    } catch (error) {
      this.handleError(this.createError('EMIT_ERROR', `Failed to emit event ${event}`, error));
    }
  }

  on(event: string, callback: (...args: unknown[]) => void): void {
    // Store callback for cleanup
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set());
    }
    this.eventCallbacks.get(event)!.add(callback);

    // Register with socket
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      this.log(`Event listener registered for '${event}' but socket not connected`, 'warn');
    }
  }

  off(event: string, callback?: (...args: unknown[]) => void): void {
    if (callback) {
      // Remove specific callback
      const callbacks = this.eventCallbacks.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.eventCallbacks.delete(event);
        }
      }
      
      if (this.socket) {
        this.socket.off(event, callback);
      }
    } else {
      // Remove all callbacks for event
      this.eventCallbacks.delete(event);
      
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  async testConnection(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(this.createError('NOT_CONNECTED', 'Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(this.createError('TEST_TIMEOUT', 'Connection test timeout'));
      }, 5000);

      this.socket.emit('test-connection', { timestamp: Date.now() }, (response: unknown) => {
        clearTimeout(timeout);
        this.log('Connection test successful');
        resolve(response);
      });
    });
  }

  // Additional utility methods
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  isSocketConnected(): boolean {
    return this.socket?.connected || false;
  }

  getTransport(): string | undefined {
    return this.socket?.io.engine?.transport?.name;
  }

  // Override cleanup to handle socket-specific cleanup
  async cleanup(): Promise<void> {
    try {
      // Clear all event callbacks
      this.eventCallbacks.clear();
      
      // Call parent cleanup
      await super.cleanup();
    } catch (error) {
      this.log(`Error during socket cleanup: ${error}`, 'error');
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
