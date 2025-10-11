import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { WebSocketHandler } from './BaseWebSocketHandler';
import { AudioWebSocketHandler } from './AudioWebSocketHandler';
import { MedicalWebSocketHandler } from './MedicalWebSocketHandler';
import DeepgramService from '../../lib/services/deepgramService';
import OpenAIService from '../../lib/services/openaiService';

export class WebSocketManager {
  private io: Server;
  private handlers: WebSocketHandler[] = [];
  private connectedClients: Map<string, Socket> = new Map();

  constructor(io: Server, deepgramService?: DeepgramService, openaiService?: OpenAIService) {
    this.io = io;
    this.initializeHandlers(deepgramService, openaiService);
    this.setupConnectionHandling();
  }

  private initializeHandlers(deepgramService?: DeepgramService, openaiService?: OpenAIService): void {
    logger.info('Initializing WebSocket handlers');

    // Register handlers
    if (deepgramService) {
      this.handlers.push(new AudioWebSocketHandler(deepgramService));
      logger.info('Audio WebSocket handler registered');
    } else {
      logger.warn('Audio WebSocket handler not registered - Deepgram service unavailable');
    }

    if (openaiService) {
      this.handlers.push(new MedicalWebSocketHandler(openaiService));
      logger.info('Medical WebSocket handler registered');
    } else {
      logger.warn('Medical WebSocket handler not registered - OpenAI service unavailable');
    }

    logger.info(`WebSocket manager initialized with ${this.handlers.length} handlers`);
  }

  private setupConnectionHandling(): void {
    this.io.on('connection', (socket: Socket) => {
      this.handleClientConnection(socket);
    });

    // Setup periodic health checks
    setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds
  }

  private handleClientConnection(socket: Socket): void {
    const clientInfo = {
      id: socket.id,
      address: socket.handshake.address,
      userAgent: socket.handshake.headers['user-agent'],
      connectedAt: new Date().toISOString()
    };

    logger.info(`Client connected: ${socket.id}`, clientInfo);

    // Store client reference
    this.connectedClients.set(socket.id, socket);

    // Register all handlers for this socket
    this.handlers.forEach(handler => {
      try {
        handler.register(this.io, socket);
        logger.debug(`Handler registered for socket ${socket.id}`, {
          handler: handler.constructor.name
        });
      } catch (error) {
        logger.error(`Failed to register handler for socket ${socket.id}`, {
          handler: handler.constructor.name,
          error
        });
      }
    });

    // Setup disconnect handling
    socket.on('disconnect', (reason) => {
      this.handleClientDisconnection(socket, reason);
    });

    // Setup error handling
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}`, { error });
    });

    // Send welcome message
    socket.emit('welcome', {
      message: 'Connected to Medical AI WebSocket server',
      socketId: socket.id,
      timestamp: new Date().toISOString(),
      availableHandlers: this.handlers.map(h => h.constructor.name)
    });

    // Update client count
    this.broadcastClientCount();
  }

  private handleClientDisconnection(socket: Socket, reason: string): void {
    logger.info(`Client disconnected: ${socket.id}`, { reason });

    // Cleanup handlers
    this.handlers.forEach(handler => {
      try {
        if (handler.cleanup) {
          handler.cleanup(socket);
          logger.debug(`Handler cleanup completed for socket ${socket.id}`, {
            handler: handler.constructor.name
          });
        }
      } catch (error) {
        logger.error(`Failed to cleanup handler for socket ${socket.id}`, {
          handler: handler.constructor.name,
          error
        });
      }
    });

    // Remove client reference
    this.connectedClients.delete(socket.id);

    // Update client count
    this.broadcastClientCount();
  }

  private performHealthCheck(): void {
    const connectedCount = this.connectedClients.size;
    const healthInfo = {
      connectedClients: connectedCount,
      handlersCount: this.handlers.length,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };

    logger.debug('WebSocket health check', healthInfo);

    // Broadcast health info to all clients (optional)
    if (connectedCount > 0) {
      this.io.emit('health-check', healthInfo);
    }
  }

  private broadcastClientCount(): void {
    const count = this.connectedClients.size;
    this.io.emit('client-count-update', {
      count,
      timestamp: new Date().toISOString()
    });
    
    logger.debug(`Client count updated: ${count}`);
  }

  // Public methods for external use
  public getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  public getConnectedClients(): string[] {
    return Array.from(this.connectedClients.keys());
  }

  public broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data);
    logger.info(`Broadcast event ${event} to all clients`, {
      clientCount: this.connectedClients.size,
      data
    });
  }

  public sendToClient(socketId: string, event: string, data: any): boolean {
    const socket = this.connectedClients.get(socketId);
    if (socket) {
      socket.emit(event, data);
      logger.debug(`Event ${event} sent to client ${socketId}`, { data });
      return true;
    } else {
      logger.warn(`Attempted to send event to non-existent client ${socketId}`);
      return false;
    }
  }

  public disconnectClient(socketId: string, reason?: string): boolean {
    const socket = this.connectedClients.get(socketId);
    if (socket) {
      socket.disconnect(true);
      logger.info(`Client ${socketId} disconnected by server`, { reason });
      return true;
    } else {
      logger.warn(`Attempted to disconnect non-existent client ${socketId}`);
      return false;
    }
  }

  public getServerStats(): any {
    return {
      connectedClients: this.connectedClients.size,
      handlersCount: this.handlers.length,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  // Graceful shutdown
  public async shutdown(): Promise<void> {
    logger.info('Shutting down WebSocket manager');

    // Disconnect all clients
    for (const [socketId, socket] of this.connectedClients) {
      try {
        socket.emit('server-shutdown', {
          message: 'Server is shutting down',
          timestamp: new Date().toISOString()
        });
        socket.disconnect(true);
      } catch (error) {
        logger.error(`Error disconnecting client ${socketId}`, { error });
      }
    }

    // Clear references
    this.connectedClients.clear();
    this.handlers.length = 0;

    logger.info('WebSocket manager shutdown completed');
  }
}
