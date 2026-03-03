import winston from 'winston';
import path from 'path';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Custom format for console output (development)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaString = '';
    if (Object.keys(meta).length > 0) {
      metaString = '\n' + JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message}${metaString}`;
  })
);

// Format for file output (production)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, '../../logs');

// Configurar transports
const transports: winston.transport[] = [];

// Console transport (sempre ativo)
transports.push(
  new winston.transports.Console({
    format: consoleFormat,
    level: isDevelopment ? 'debug' : 'info',
  })
);

// File transports (apenas em produção)
if (isProduction) {
  // Log de erros
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Log combinado
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Criar logger
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  transports,
  // Não sair do processo em erros não capturados
  exitOnError: false,
});

// Helper functions para logging estruturado
export const logInfo = (message: string, meta?: Record<string, any>) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: Error | unknown, meta?: Record<string, any>) => {
  if (error instanceof Error) {
    logger.error(message, {
      ...meta,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    });
  } else {
    logger.error(message, { ...meta, error });
  }
};

export const logWarn = (message: string, meta?: Record<string, any>) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: Record<string, any>) => {
  if (isDevelopment) {
    logger.debug(message, meta);
  }
};

// Helper para sanitizar dados sensíveis antes de logar
export const sanitizeForLog = (data: any): any => {
  if (!data) return data;

  const sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'resetToken',
  ];

  if (typeof data === 'object') {
    const sanitized = { ...data };

    for (const key in sanitized) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitizeForLog(sanitized[key]);
      }
    }

    return sanitized;
  }

  return data;
};

export default logger;
