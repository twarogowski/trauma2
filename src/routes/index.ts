/**
 * Main router
 *
 * Aggregates all route modules and exports them as a single plugin.
 */

import { Elysia } from 'elysia';
import { healthRoutes } from './health';
import { authRoutes } from './auth';
import { metaRoutes } from './meta';

export const routes = new Elysia({ prefix: '/api' })
  .use(healthRoutes)
  .use(authRoutes)
  .use(metaRoutes);
