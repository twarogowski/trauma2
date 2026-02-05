/**
 * Trauma2 API Entry Point
 *
 * Main application server using Elysia framework.
 * Initializes database, applies middleware, and starts the HTTP server.
 */

import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { initDatabase, closeDatabase } from '@/database/client';
import { errorHandler } from '@/middleware/error-handler';
import { loggingMiddleware } from '@/middleware/logging';
import { routes } from '@/routes';
import { APP_NAME, APP_VERSION, APP_DESCRIPTION } from '@/config/constants';

/**
 * Bootstrap the application
 *
 * 1. Initialize database connection
 * 2. Create Elysia app with middleware
 * 3. Start HTTP server
 * 4. Set up graceful shutdown handlers
 */
async function bootstrap(): Promise<void> {
  try {
    // Initialize database
    logger.info('Initializing database connection...');
    await initDatabase();
    logger.info('Database connected successfully');

    // Create Elysia app
    const app = new Elysia()
      // Swagger documentation
      .use(
        swagger({
          documentation: {
            info: {
              title: APP_NAME,
              version: APP_VERSION,
              description: APP_DESCRIPTION,
            },
            tags: [
              { name: 'health', description: 'Health check endpoints' },
              { name: 'auth', description: 'Authentication endpoints' },
              { name: 'meta', description: 'Meta-schema management (upcoming)' },
            ],
          },
          path: config.swagger.path,
          exclude: config.swagger.enabled ? [] : ['/**'],
        })
      )
      // CORS
      .use(
        cors({
          origin: config.cors.origin,
          credentials: config.cors.credentials,
        })
      )
      // Global middleware
      .use(loggingMiddleware)
      .use(errorHandler)
      // Routes
      .use(routes)
      // Start server
      .listen({
        hostname: config.server.host,
        port: config.server.port,
      });

    logger.info({
      msg: 'Server started successfully',
      url: `http://${config.server.host}:${config.server.port}`,
      swagger: config.swagger.enabled
        ? `http://${config.server.host}:${config.server.port}${config.swagger.path}`
        : 'disabled',
      env: config.server.env,
    });

    // Graceful shutdown handlers
    const shutdownSignals = ['SIGINT', 'SIGTERM'] as const;
    for (const signal of shutdownSignals) {
      process.on(signal, () => shutdown(app, signal));
    }
  } catch (error) {
    logger.error({ error }, 'Failed to start application');
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 *
 * Closes database connections and stops the server.
 */
async function shutdown(app: unknown, signal: string): Promise<void> {
  logger.info({ signal }, 'Received shutdown signal, closing gracefully...');

  try {
    // Close database
    await closeDatabase();

    // Stop server
    if (app && typeof app === 'object' && 'stop' in app && typeof app.stop === 'function') {
      await app.stop();
    }

    logger.info('Application shut down successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during shutdown');
    process.exit(1);
  }
}

// Start the application
bootstrap();
