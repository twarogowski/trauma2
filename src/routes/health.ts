/**
 * Health check routes
 *
 * Provides endpoints for monitoring application and database health.
 */

import { Elysia } from 'elysia';
import { getDatabase } from '@/database/client';
import { DatabaseError } from '@/utils/errors';

export const healthRoutes = new Elysia({ prefix: '/health' })
  .get(
    '/',
    () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }),
    {
      detail: {
        tags: ['health'],
        summary: 'Basic health check',
        description:
          'Returns the health status of the API including uptime information',
      },
    }
  )
  .get(
    '/db',
    async () => {
      try {
        const db = getDatabase();

        // Ping database with info query (works in SurrealDB)
        const result = await db.query('INFO FOR DB');

        return {
          status: 'ok',
          database: 'connected',
          timestamp: new Date().toISOString(),
          info: result ? 'available' : 'error',
        };
      } catch (error) {
        throw new DatabaseError('Database health check failed', error);
      }
    },
    {
      detail: {
        tags: ['health'],
        summary: 'Database health check',
        description:
          'Checks if the database connection is healthy by executing a test query',
      },
    }
  );
