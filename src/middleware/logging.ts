/**
 * Logging middleware for Elysia
 *
 * Logs all incoming requests with their HTTP method and URL.
 */

import { Elysia } from 'elysia';
import { logger } from '@/utils/logger';

export const loggingMiddleware = new Elysia({ name: 'logging' })
  .onRequest(({ request }) => {
    const start = Date.now();

    logger.info(
      {
        method: request.method,
        url: request.url,
        timestamp: new Date().toISOString(),
      },
      'Incoming request'
    );

    // Store start time in request for duration calculation (if needed later)
    return { _startTime: start };
  })
  .onError(({ request, error }) => {
    // Error might be various types, safely extract properties
    const errorInfo = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : {
          name: 'Unknown',
          message: String(error),
          stack: undefined,
        };

    logger.error(
      {
        method: request.method,
        url: request.url,
        error: errorInfo,
      },
      'Request error'
    );
  });
