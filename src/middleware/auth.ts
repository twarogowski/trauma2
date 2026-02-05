/**
 * Authentication middleware for Elysia
 *
 * Provides two authentication strategies:
 * 1. Basic Auth - For simple username/password authentication
 * 2. JWT - For token-based authentication
 */

import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { config } from '@/config';
import { UnauthorizedError } from '@/utils/errors';
import type { JWTPayload } from '@/auth/types';

/**
 * Basic Auth middleware
 *
 * Validates HTTP Basic Authentication credentials.
 * Header format: Authorization: Basic <base64(username:password)>
 *
 * @example
 * ```bash
 * curl -u admin:password http://localhost:3000/api/protected
 * ```
 */
export const basicAuth = new Elysia({ name: 'basicAuth' }).derive(
  async ({ request }) => {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Basic ')) {
      throw new UnauthorizedError('Missing Basic Auth credentials');
    }

    const base64 = authHeader.slice(6);
    const decoded = atob(base64);
    const [username, password] = decoded.split(':');

    if (
      username !== config.auth.basic.username ||
      password !== config.auth.basic.password
    ) {
      throw new UnauthorizedError('Invalid credentials');
    }

    return { user: { username, auth: 'basic' as const } };
  }
);

/**
 * JWT Auth middleware
 *
 * Validates JWT tokens from Authorization header.
 * Header format: Authorization: Bearer <token>
 *
 * @example
 * ```bash
 * curl -H "Authorization: Bearer <token>" http://localhost:3000/api/protected
 * ```
 */
export const jwtAuth = new Elysia({ name: 'jwtAuth' })
  .use(
    jwt({
      name: 'jwt',
      secret: config.auth.jwt.secret,
    })
  )
  .derive(async ({ request, jwt }) => {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing JWT token');
    }

    const token = authHeader.slice(7);
    const payload = await jwt.verify(token);

    if (!payload) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    return { user: payload as unknown as JWTPayload };
  });

/**
 * Optional JWT Auth middleware
 *
 * Same as jwtAuth, but doesn't throw if token is missing.
 * Sets user to null if no valid token is provided.
 * Useful for endpoints that work with or without authentication.
 */
export const optionalAuth = new Elysia({ name: 'optionalAuth' })
  .use(
    jwt({
      name: 'jwt',
      secret: config.auth.jwt.secret,
    })
  )
  .derive(async ({ request, jwt }) => {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return { user: null };
    }

    const token = authHeader.slice(7);
    const payload = await jwt.verify(token);

    return { user: payload ? (payload as unknown as JWTPayload) : null };
  });
