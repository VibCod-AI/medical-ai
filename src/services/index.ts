// Main services exports
export { socketService, SocketService } from './implementations/SocketService';
export { audioService, AudioService } from './implementations/AudioService';

// Base classes and utilities
export { AbstractService } from './base/AbstractService';
export * from './interfaces';
export * from './utils';

// Service registry for centralized management
import { socketService } from './implementations/SocketService';
import { audioService } from './implementations/AudioService';
import { BaseService } from './interfaces';

class ServiceRegistry {
  private services: Map<string, BaseService> = new Map();

  constructor() {
    // Register default services
    this.register('socket', socketService);
    this.register('audio', audioService);
  }

  register(name: string, service: BaseService): void {
    this.services.set(name, service);
  }

  get<T extends BaseService>(name: string): T | undefined {
    return this.services.get(name) as T;
  }

  getAll(): Map<string, BaseService> {
    return new Map(this.services);
  }

  async initializeAll(): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const [name, service] of this.services) {
      try {
        const initialized = await service.initialize();
        if (initialized) {
          success.push(name);
        } else {
          failed.push(name);
        }
      } catch (error) {
        console.error(`Failed to initialize service ${name}:`, error);
        failed.push(name);
      }
    }

    return { success, failed };
  }

  async connectAll(): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const [name, service] of this.services) {
      try {
        if (service.connect) {
          const connected = await service.connect();
          if (connected) {
            success.push(name);
          } else {
            failed.push(name);
          }
        } else {
          success.push(name); // Services without connect method are considered successful
        }
      } catch (error) {
        console.error(`Failed to connect service ${name}:`, error);
        failed.push(name);
      }
    }

    return { success, failed };
  }

  async disconnectAll(): Promise<void> {
    const promises = Array.from(this.services.values()).map(service => 
      service.disconnect().catch(error => 
        console.error(`Error disconnecting service:`, error)
      )
    );

    await Promise.all(promises);
  }

  async healthCheckAll(): Promise<Record<string, { isHealthy: boolean; details?: Record<string, boolean> }>> {
    const results: Record<string, { isHealthy: boolean; details?: Record<string, boolean> }> = {};

    for (const [name, service] of this.services) {
      try {
        const isHealthy = service.isHealthy();
        let details: Record<string, boolean> | undefined;

        // Get detailed health check if available
        if ('performHealthCheck' in service && typeof service.performHealthCheck === 'function') {
          const healthCheck = await (service as any).performHealthCheck();
          details = healthCheck.details;
        }

        results[name] = { isHealthy, details };
      } catch (error) {
        console.error(`Health check failed for service ${name}:`, error);
        results[name] = { isHealthy: false };
      }
    }

    return results;
  }

  getServicesStatus(): Record<string, any> {
    const status: Record<string, any> = {};

    for (const [name, service] of this.services) {
      status[name] = service.getStatus();
    }

    return status;
  }
}

// Export singleton registry
export const serviceRegistry = new ServiceRegistry();
export default serviceRegistry;
