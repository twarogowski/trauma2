/**
 * Authentication routes
 *
 * Provides endpoints for user login and token management.
 */

import { Elysia } from 'elysia';
import { login } from '@/services/auth.service';
import {
  LoginRequestSchema,
  LoginResponseSchema,
} from '@/schemas/auth.schema';

export const authRoutes = new Elysia({ prefix: '/auth' }).post(
  '/login',
  async ({ body }) => {
    const result = await login(body.username, body.password);
    return result;
  },
  {
    body: LoginRequestSchema,
    response: LoginResponseSchema,
    detail: {
      tags: ['auth'],
      summary: 'User login',
      description:
        'Authenticate with username/password and receive JWT tokens. Use credentials: username="admin", password="admin123" for testing.',
    },
  }
);
