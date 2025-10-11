import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each log level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

// Add colors to winston
winston.addColors(logColors);

// Custom format for structured logging
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += ` | ${JSON.stringify(meta)}`;
    }
    
    return logMessage;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    
    let logMessage = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present (formatted for readability)
    if (Object.keys(meta).length > 0) {
      logMessage += `\n  └─ ${JSON.stringify(meta, null, 2).replace(/\n/g, '\n     ')}`;
    }
    
    return logMessage;
  })
);

// Create transports
const transports: winston.transport[] = [];

// Console transport (always enabled in development)
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'debug',
      format: consoleFormat
    })
  );
}

// File transports for production
const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

// General application logs
transports.push(
  new DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat
  })
);

// Error logs (separate file)
transports.push(
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: customFormat
  })
);

// HTTP request logs
transports.push(
  new DailyRotateFile({
    filename: path.join(logDir, 'http-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '7d',
    level: 'http',
    format: customFormat
  })
);

// Create the logger
export const logger = winston.createLogger({
  levels: logLevels,
  transports,
  exitOnError: false,
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: customFormat
    })
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: customFormat
    })
  ]
});

// Create specialized loggers for different modules
export const createModuleLogger = (moduleName: string) => {
  return logger.child({ module: moduleName });
};

// HTTP request logger middleware
export const httpLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  // Log request
  logger.http('HTTP Request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.http('HTTP Response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
      timestamp: new Date().toISOString()
    });
  });
  
  next();
};

// WebSocket event logger
export const wsLogger = {
  connection: (socketId: string, clientInfo: any) => {
    logger.info('WebSocket Connection', {
      socketId,
      ...clientInfo,
      event: 'connection'
    });
  },
  
  disconnection: (socketId: string, reason: string) => {
    logger.info('WebSocket Disconnection', {
      socketId,
      reason,
      event: 'disconnection'
    });
  },
  
  event: (socketId: string, eventName: string, data?: any) => {
    logger.debug('WebSocket Event', {
      socketId,
      eventName,
      data: data ? JSON.stringify(data).substring(0, 200) : undefined,
      event: 'websocket_event'
    });
  },
  
  error: (socketId: string, error: any, context?: string) => {
    logger.error('WebSocket Error', {
      socketId,
      error: error.message || error,
      stack: error.stack,
      context,
      event: 'websocket_error'
    });
  }
};

// Service logger
export const serviceLogger = {
  initialization: (serviceName: string, success: boolean, details?: any) => {
    const level = success ? 'info' : 'error';
    logger[level]('Service Initialization', {
      serviceName,
      success,
      details,
      event: 'service_init'
    });
  },
  
  connection: (serviceName: string, success: boolean, details?: any) => {
    const level = success ? 'info' : 'warn';
    logger[level]('Service Connection', {
      serviceName,
      success,
      details,
      event: 'service_connection'
    });
  },
  
  operation: (serviceName: string, operation: string, success: boolean, duration?: number, details?: any) => {
    const level = success ? 'info' : 'error';
    logger[level]('Service Operation', {
      serviceName,
      operation,
      success,
      duration: duration ? `${duration}ms` : undefined,
      details,
      event: 'service_operation'
    });
  }
};

// Medical AI specific loggers
export const medicalLogger = {
  transcription: (socketId: string, transcript: string, confidence: number, speaker?: string) => {
    logger.info('Medical Transcription', {
      socketId,
      transcript: transcript.substring(0, 100) + (transcript.length > 100 ? '...' : ''),
      confidence,
      speaker,
      length: transcript.length,
      event: 'medical_transcription'
    });
  },
  
  analysis: (socketId: string, analysisType: string, success: boolean, duration?: number, details?: any) => {
    const level = success ? 'info' : 'error';
    logger[level]('Medical Analysis', {
      socketId,
      analysisType,
      success,
      duration: duration ? `${duration}ms` : undefined,
      details,
      event: 'medical_analysis'
    });
  },
  
  report: (socketId: string, reportType: string, success: boolean, details?: any) => {
    const level = success ? 'info' : 'error';
    logger[level]('Medical Report', {
      socketId,
      reportType,
      success,
      details,
      event: 'medical_report'
    });
  }
};

// Performance monitoring
export const performanceLogger = {
  measure: (operation: string, duration: number, metadata?: any) => {
    logger.info('Performance Measurement', {
      operation,
      duration: `${duration}ms`,
      metadata,
      event: 'performance'
    });
  },
  
  memory: () => {
    const memUsage = process.memoryUsage();
    logger.debug('Memory Usage', {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
      event: 'memory_usage'
    });
  }
};

// Error tracking
export const errorLogger = {
  track: (error: Error, context?: string, metadata?: any) => {
    logger.error('Error Tracked', {
      message: error.message,
      stack: error.stack,
      context,
      metadata,
      event: 'error_tracked'
    });
  },
  
  apiError: (endpoint: string, method: string, statusCode: number, error: any, metadata?: any) => {
    logger.error('API Error', {
      endpoint,
      method,
      statusCode,
      error: error.message || error,
      stack: error.stack,
      metadata,
      event: 'api_error'
    });
  }
};

// Startup logging
logger.info('Logger initialized', {
  environment: process.env.NODE_ENV,
  logLevel: process.env.LOG_LEVEL || 'info',
  logDir,
  transports: transports.length,
  event: 'logger_init'
});

export default logger;
