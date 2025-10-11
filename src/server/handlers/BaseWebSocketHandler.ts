import { Socket, Server } from 'socket.io';
import { logger } from '../utils/logger';

export interface WebSocketHandler {
  register(io: Server, socket: Socket): void;
  cleanup?(socket: Socket): void;
}

export abstract class BaseWebSocketHandler implements WebSocketHandler {
  protected logger = logger;

  abstract register(io: Server, socket: Socket): void;

  protected emitToSocket(socket: Socket, event: string, data: any): void {
    try {
      socket.emit(event, data);
      this.logger.debug(`Event ${event} emitted to socket ${socket.id}`, { data });
    } catch (error) {
      this.logger.error(`Failed to emit event ${event} to socket ${socket.id}`, { error });
    }
  }

  protected emitToAll(io: Server, event: string, data: any): void {
    try {
      io.emit(event, data);
      this.logger.debug(`Event ${event} emitted to all clients`, { data });
    } catch (error) {
      this.logger.error(`Failed to emit event ${event} to all clients`, { error });
    }
  }

  protected handleError(socket: Socket, error: any, context: string): void {
    this.logger.error(`Error in ${context} for socket ${socket.id}`, { error });
    this.emitToSocket(socket, 'error', {
      message: `Error in ${context}`,
      context,
      timestamp: new Date().toISOString()
    });
  }

  cleanup?(socket: Socket): void {
    // Default implementation - can be overridden
    this.logger.debug(`Cleaning up resources for socket ${socket.id}`);
  }
}
