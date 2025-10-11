import { ServiceError, RetryConfig } from '../interfaces';

// Error handling utilities
export class ServiceErrorHandler {
  private errorCallbacks: Set<(error: ServiceError) => void> = new Set();
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  createError(code: string, message: string, details?: unknown): ServiceError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
      service: this.serviceName
    };
  }

  handleError(error: ServiceError | Error | string): ServiceError {
    let serviceError: ServiceError;

    if (typeof error === 'string') {
      serviceError = this.createError('GENERIC_ERROR', error);
    } else if (error instanceof Error) {
      serviceError = this.createError('RUNTIME_ERROR', error.message, error);
    } else {
      serviceError = error;
    }

    // Log error
    console.error(`[${this.serviceName}] Error:`, serviceError);

    // Notify callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(serviceError);
      } catch (callbackError) {
        console.error(`[${this.serviceName}] Error in error callback:`, callbackError);
      }
    });

    return serviceError;
  }

  onError(callback: (error: ServiceError) => void): void {
    this.errorCallbacks.add(callback);
  }

  offError(callback: (error: ServiceError) => void): void {
    this.errorCallbacks.delete(callback);
  }

  clearErrorCallbacks(): void {
    this.errorCallbacks.clear();
  }
}

// Retry logic utilities
export class RetryManager {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxAttempts: config.maxAttempts ?? 3,
      baseDelay: config.baseDelay ?? 1000,
      maxDelay: config.maxDelay ?? 10000,
      backoffMultiplier: config.backoffMultiplier ?? 2
    };
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        if (attempt > 1) {
          console.log(`[RetryManager] ${context || 'Operation'} succeeded on attempt ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === this.config.maxAttempts) {
          console.error(`[RetryManager] ${context || 'Operation'} failed after ${attempt} attempts:`, lastError);
          break;
        }

        const delay = this.calculateDelay(attempt);
        console.warn(`[RetryManager] ${context || 'Operation'} failed on attempt ${attempt}, retrying in ${delay}ms:`, lastError.message);
        
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private calculateDelay(attempt: number): number {
    const exponentialDelay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
    const jitteredDelay = exponentialDelay + Math.random() * 1000; // Add jitter
    return Math.min(jitteredDelay, this.config.maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Connection manager for services that need persistent connections
export class ConnectionManager {
  private isConnected = false;
  private isConnecting = false;
  private connectionTime?: Date;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private connectionCallbacks: Set<(connected: boolean) => void> = new Set();

  constructor(
    private connectFn: () => Promise<void>,
    private disconnectFn: () => Promise<void>,
    private serviceName: string
  ) {}

  async connect(): Promise<boolean> {
    if (this.isConnected) {
      return true;
    }

    if (this.isConnecting) {
      // Wait for existing connection attempt
      return new Promise((resolve) => {
        const checkConnection = () => {
          if (!this.isConnecting) {
            resolve(this.isConnected);
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    this.isConnecting = true;

    try {
      await this.connectFn();
      this.isConnected = true;
      this.connectionTime = new Date();
      this.reconnectAttempts = 0;
      this.notifyConnectionChange(true);
      console.log(`[${this.serviceName}] Connected successfully`);
      return true;
    } catch (error) {
      console.error(`[${this.serviceName}] Connection failed:`, error);
      this.isConnected = false;
      this.notifyConnectionChange(false);
      return false;
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.disconnectFn();
    } catch (error) {
      console.error(`[${this.serviceName}] Disconnect error:`, error);
    } finally {
      this.isConnected = false;
      this.connectionTime = undefined;
      this.notifyConnectionChange(false);
      console.log(`[${this.serviceName}] Disconnected`);
    }
  }

  async reconnect(): Promise<boolean> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`[${this.serviceName}] Max reconnect attempts reached`);
      return false;
    }

    this.reconnectAttempts++;
    console.log(`[${this.serviceName}] Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

    await this.disconnect();
    await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
    
    return this.connect();
  }

  isConnectionHealthy(): boolean {
    return this.isConnected && !this.isConnecting;
  }

  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      connectionTime: this.connectionTime,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  onConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallbacks.add(callback);
  }

  offConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallbacks.delete(callback);
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error(`[${this.serviceName}] Error in connection callback:`, error);
      }
    });
  }
}

// Health check utilities
export class HealthChecker {
  private healthChecks: Map<string, () => Promise<boolean>> = new Map();
  private lastHealthCheck?: Date;
  private isHealthy = true;

  registerHealthCheck(name: string, checkFn: () => Promise<boolean>): void {
    this.healthChecks.set(name, checkFn);
  }

  unregisterHealthCheck(name: string): void {
    this.healthChecks.delete(name);
  }

  async performHealthCheck(): Promise<{ isHealthy: boolean; details: Record<string, boolean> }> {
    const details: Record<string, boolean> = {};
    let overallHealth = true;

    for (const [name, checkFn] of this.healthChecks) {
      try {
        const result = await checkFn();
        details[name] = result;
        if (!result) {
          overallHealth = false;
        }
      } catch (error) {
        console.error(`Health check '${name}' failed:`, error);
        details[name] = false;
        overallHealth = false;
      }
    }

    this.isHealthy = overallHealth;
    this.lastHealthCheck = new Date();

    return { isHealthy: overallHealth, details };
  }

  getLastHealthCheck(): { isHealthy: boolean; timestamp?: Date } {
    return {
      isHealthy: this.isHealthy,
      timestamp: this.lastHealthCheck
    };
  }
}
