/**
 * Structured logger using Pino
 *
 * Configured based on environment variables:
 * - LOG_LEVEL: Logging level (default: 'info')
 * - LOG_PRETTY: Pretty print for development (default: false in production)
 */

import pino from 'pino';

// Get log config from env (before full config is loaded)
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_PRETTY = process.env.LOG_PRETTY === 'true';

const loggerOptions: pino.LoggerOptions = {
  level: LOG_LEVEL,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

if (LOG_PRETTY) {
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  };
}

export const logger = pino(loggerOptions);
