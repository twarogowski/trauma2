/**
 * Centralized error handling middleware for Elysia
 *
 * Catches all errors and formats them as JSON responses.
 */

import { Elysia } from 'elysia';
import { logger } from '@/utils/logger';
import {
  UnauthorizedError,
  NotFoundError,
  ValidationError,
  DatabaseError,
} from '@/utils/errors';

export const errorHandler = new Elysia({ name: 'errorHandler' }).onError(
  ({ code, error, set }) => {
    // Handle known custom errors
    if (error instanceof UnauthorizedError) {
      set.status = 401;
      return {
        error: 'Unauthorized',
        message: error.message,
      };
    }

    if (error instanceof NotFoundError) {
      set.status = 404;
      return {
        error: 'Not Found',
        message: error.message,
      };
    }

    if (error instanceof ValidationError) {
      set.status = 400;
      return {
        error: 'Validation Error',
        message: error.message,
        details: error.details,
      };
    }

    if (error instanceof DatabaseError) {
      set.status = 500;
      logger.error({ error }, 'Database error');
      return {
        error: 'Database Error',
        message: 'An error occurred while accessing the database',
      };
    }

    // Handle Elysia validation errors
    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        error: 'Validation Error',
        message: error.message,
      };
    }

    // Handle not found errors
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        error: 'Not Found',
        message: 'The requested resource was not found',
      };
    }

    // Generic error handler
    logger.error({ error, code }, 'Unhandled error');
    set.status = 500;
    return {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    };
  }
);
