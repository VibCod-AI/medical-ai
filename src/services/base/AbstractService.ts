import { 
  BaseService, 
  ServiceConfig, 
  ServiceStatus, 
  ServiceError 
} from '../interfaces';
import { 
  ServiceErrorHandler, 
  RetryManager, 
  ConnectionManager, 
  HealthChecker 
} from '../utils';

export abstract class AbstractService implements BaseService {
  protected config: ServiceConfig;
  protected status: ServiceStatus;
  protected errorHandler: ServiceErrorHandler;
  protected retryManager: RetryManager;
  protected connectionManager?: ConnectionManager;
  protected healthChecker: HealthChecker;
  protected serviceName: string;

  constructor(serviceName: string, config: ServiceConfig = {}) {
    this.serviceName = serviceName;
    this.config = {
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 10000,
      enableLogging: true,
      ...config
    };

    this.status = {
      isConnected: false,
      isInitialized: false,
      reconnectAttempts: 0
    };

    this.errorHandler = new ServiceErrorHandler(serviceName);
    this.retryManager = new RetryManager({
      maxAttempts: this.config.retryAttempts,
      baseDelay: this.config.retryDelay
    });
    this.healthChecker = new HealthChecker();

    // Register basic health checks
    this.healthChecker.registerHealthCheck('initialized', async () => this.status.isInitialized);
    this.healthChecker.registerHealthCheck('connected', async () => this.status.isConnected);
  }

  // Abstract methods that must be implemented by concrete services
  protected abstract doInitialize(): Promise<void>;
  protected abstract doConnect?(): Promise<void>;
  protected abstract doDisconnect(): Promise<void>;

  async initialize(config?: ServiceConfig): Promise<boolean> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      this.log('Initializing service...');
      
      await this.retryManager.executeWithRetry(
        () => this.doInitialize(),
        `${this.serviceName} initialization`
      );

      this.status.isInitialized = true;
      this.log('Service initialized successfully');
      
      return true;
    } catch (error) {
      const serviceError = this.errorHandler.handleError(error);
      this.status.lastError = serviceError.message;
      return false;
    }
  }

  async connect(): Promise<boolean> {
    if (!this.doConnect) {
      this.log('Connect method not implemented for this service');
      return true;
    }

    if (!this.status.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        return false;
      }
    }

    try {
      if (!this.connectionManager) {
        this.connectionManager = new ConnectionManager(
          () => this.doConnect!(),
          () => this.doDisconnect(),
          this.serviceName
        );
        
        this.connectionManager.onConnectionChange((connected) => {
          this.status.isConnected = connected;
          if (connected) {
            this.status.connectionTime = new Date();
            this.status.reconnectAttempts = 0;
          }
        });
      }

      const connected = await this.connectionManager.connect();
      return connected;
    } catch (error) {
      const serviceError = this.errorHandler.handleError(error);
      this.status.lastError = serviceError.message;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.connectionManager) {
        await this.connectionManager.disconnect();
      } else {
        await this.doDisconnect();
        this.status.isConnected = false;
      }
      
      this.log('Service disconnected');
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  getStatus(): ServiceStatus {
    return { ...this.status };
  }

  isHealthy(): boolean {
    const healthCheck = this.healthChecker.getLastHealthCheck();
    return healthCheck.isHealthy && this.status.isInitialized;
  }

  async performHealthCheck(): Promise<{ isHealthy: boolean; details: Record<string, boolean> }> {
    return this.healthChecker.performHealthCheck();
  }

  onError(callback: (error: ServiceError) => void): void {
    this.errorHandler.onError(callback);
  }

  offError(callback: (error: ServiceError) => void): void {
    this.errorHandler.offError(callback);
  }

  // Protected utility methods for concrete services
  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    if (!this.config.enableLogging) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.serviceName}] ${message}`;

    switch (level) {
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  protected createError(code: string, message: string, details?: unknown): ServiceError {
    return this.errorHandler.createError(code, message, details);
  }

  protected handleError(error: ServiceError | Error | string): ServiceError {
    return this.errorHandler.handleError(error);
  }

  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    return this.retryManager.executeWithRetry(operation, context);
  }

  protected registerHealthCheck(name: string, checkFn: () => Promise<boolean>): void {
    this.healthChecker.registerHealthCheck(name, checkFn);
  }

  protected async reconnect(): Promise<boolean> {
    if (!this.connectionManager) {
      return false;
    }

    this.status.reconnectAttempts = (this.status.reconnectAttempts || 0) + 1;
    return this.connectionManager.reconnect();
  }

  // Cleanup method for service shutdown
  async cleanup(): Promise<void> {
    try {
      await this.disconnect();
      this.errorHandler.clearErrorCallbacks();
      this.log('Service cleanup completed');
    } catch (error) {
      this.log(`Error during cleanup: ${error}`, 'error');
    }
  }
}
