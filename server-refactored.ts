import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import { logger, serviceLogger, httpLogger } from './src/server/utils/logger';
import { WebSocketManager } from './src/server/handlers/WebSocketManager';
import DeepgramService from './src/lib/services/deepgramService';
import OpenAIService from './src/lib/services/openaiService';

// Environment configuration
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Global variables
let deepgramService: DeepgramService | null = null;
let openaiService: OpenAIService | null = null;
let wsManager: WebSocketManager | null = null;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

/**
 * Initialize all services
 */
async function initializeServices(): Promise<{ deepgram: boolean; openai: boolean }> {
  logger.info('🔧 Initializing services...');
  
  const results = { deepgram: false, openai: false };

  // Verify environment variables
  const envCheck = {
    hasDeepgramKey: !!process.env.DEEPGRAM_API_KEY,
    deepgramKeyLength: process.env.DEEPGRAM_API_KEY?.length || 0,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    openaiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    wsUrl: process.env.NEXT_PUBLIC_WS_URL
  };

  logger.info('Environment check', envCheck);

  // Initialize Deepgram service
  try {
    if (!process.env.DEEPGRAM_API_KEY) {
      throw new Error('DEEPGRAM_API_KEY not found in environment variables');
    }

    deepgramService = new DeepgramService();
    results.deepgram = true;
    
    serviceLogger.initialization('Deepgram', true, {
      hasApiKey: !!process.env.DEEPGRAM_API_KEY
    });

  } catch (error) {
    serviceLogger.initialization('Deepgram', false, { error: error.message });
    logger.error('Failed to initialize Deepgram service', { error });
  }

  // Initialize OpenAI service
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found in environment variables');
    }

    openaiService = new OpenAIService();
    results.openai = true;

    // Expose globally for API routes
    (global as any).openaiService = openaiService;

    serviceLogger.initialization('OpenAI', true, {
      hasApiKey: !!process.env.OPENAI_API_KEY,
      exposedGlobally: true
    });

  } catch (error) {
    serviceLogger.initialization('OpenAI', false, { error: error.message });
    logger.error('Failed to initialize OpenAI service', { error });
  }

  const successCount = Object.values(results).filter(Boolean).length;
  logger.info(`Services initialization completed: ${successCount}/2 services ready`, results);

  return results;
}

/**
 * Create and configure HTTP server with WebSocket support
 */
function createHttpServer() {
  logger.info('🌐 Creating HTTP server...');

  const server = createServer((req, res) => {
    // Add HTTP logging
    httpLogger(req, res, () => {});
    
    // Handle Next.js requests
    handle(req, res);
  });

  // Create Socket.IO server
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || []
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  logger.info('Socket.IO server created with CORS configuration', {
    environment: process.env.NODE_ENV,
    allowedOrigins: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS?.split(',') 
      : ['http://localhost:3000', 'http://127.0.0.1:3000']
  });

  return { server, io };
}

/**
 * Setup WebSocket management
 */
function setupWebSocketManager(io: Server): void {
  logger.info('🔌 Setting up WebSocket manager...');

  wsManager = new WebSocketManager(io, deepgramService || undefined, openaiService || undefined);

  logger.info('WebSocket manager initialized', {
    handlersRegistered: [
      deepgramService ? 'AudioWebSocketHandler' : null,
      openaiService ? 'MedicalWebSocketHandler' : null
    ].filter(Boolean)
  });
}

/**
 * Setup graceful shutdown
 */
function setupGracefulShutdown(server: any): void {
  const gracefulShutdown = async (signal: string) => {
    logger.info(`🛑 Received ${signal}, starting graceful shutdown...`);

    try {
      // Close WebSocket manager
      if (wsManager) {
        await wsManager.shutdown();
        logger.info('WebSocket manager shut down');
      }

      // Close services
      if (deepgramService) {
        await deepgramService.disconnect();
        logger.info('Deepgram service disconnected');
      }

      // Close HTTP server
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force exit after timeout
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);

    } catch (error) {
      logger.error('Error during graceful shutdown', { error });
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon
}

/**
 * Setup error handling
 */
function setupErrorHandling(): void {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise });
    process.exit(1);
  });
}

/**
 * Setup health monitoring
 */
function setupHealthMonitoring(): void {
  // Memory monitoring
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const memoryMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };

    // Log if memory usage is high
    if (memoryMB.heapUsed > 500) { // 500MB threshold
      logger.warn('High memory usage detected', memoryMB);
    } else {
      logger.debug('Memory usage', memoryMB);
    }
  }, 60000); // Every minute

  // Service health check
  setInterval(() => {
    const healthStatus = {
      deepgram: deepgramService?.connected || false,
      openai: !!openaiService,
      websocketClients: wsManager?.getConnectedClientsCount() || 0,
      uptime: Math.round(process.uptime())
    };

    logger.info('Health check', healthStatus);
  }, 300000); // Every 5 minutes
}

/**
 * Main server startup function
 */
async function startServer(): Promise<void> {
  try {
    logger.info('🚀 Starting Medical AI Server...', {
      environment: process.env.NODE_ENV,
      port,
      hostname,
      nodeVersion: process.version
    });

    // Setup error handling first
    setupErrorHandling();

    // Prepare Next.js
    logger.info('📦 Preparing Next.js application...');
    await app.prepare();
    logger.info('✅ Next.js application ready');

    // Initialize services
    const serviceResults = await initializeServices();
    
    if (!serviceResults.deepgram && !serviceResults.openai) {
      logger.error('❌ No services could be initialized. Server cannot start.');
      process.exit(1);
    }

    // Create HTTP server and Socket.IO
    const { server, io } = createHttpServer();

    // Setup WebSocket management
    setupWebSocketManager(io);

    // Setup graceful shutdown
    setupGracefulShutdown(server);

    // Setup health monitoring
    setupHealthMonitoring();

    // Start listening
    server.listen(port, hostname, () => {
      logger.info('🎉 Medical AI Server started successfully', {
        url: `http://${hostname}:${port}`,
        environment: process.env.NODE_ENV,
        services: serviceResults,
        pid: process.pid
      });

      // Log startup summary
      logger.info('📊 Startup Summary', {
        deepgramService: !!deepgramService,
        openaiService: !!openaiService,
        webSocketManager: !!wsManager,
        nextJsReady: true,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      });
    });

  } catch (error) {
    logger.error('💥 Failed to start server', { error });
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  logger.error('Fatal error starting server', { error });
  process.exit(1);
});
