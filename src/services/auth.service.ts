/**
 * Authentication service
 *
 * Business logic for user authentication and token management.
 * TODO: Implement actual user lookup from database
 */

import { UnauthorizedError } from '@/utils/errors';
import { signToken } from '@/auth/jwt';
import { config } from '@/config';
import type { LoginResponse } from '@/auth/types';
import { USER_ROLE } from '@/config/constants';

/**
 * Login user with username and password
 *
 * TODO: Replace with actual database user lookup
 * For now, this is a mock implementation for testing
 */
export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  // TODO: Query database for user
  // const user = await db.query('SELECT * FROM user WHERE email = $email', { email: username });
  // if (!user || !crypto.argon2.compare(user.password, password)) {
  //   throw new UnauthorizedError('Invalid credentials');
  // }

  // Mock user validation (REPLACE WITH REAL IMPLEMENTATION)
  if (username === 'admin' && password === 'admin123') {
    const userId = 'user:admin';
    const role = USER_ROLE.ADMIN;

    const accessToken = await signToken({
      sub: userId,
      username,
      role,
    });

    return {
      accessToken,
      refreshToken: 'refresh-token-placeholder', // TODO: Implement proper refresh token
      expiresIn: config.auth.jwt.expiresIn,
      user: {
        id: userId,
        username,
        role,
      },
    };
  }

  throw new UnauthorizedError('Invalid credentials');
}

/**
 * Refresh access token using refresh token
 *
 * TODO: Implement refresh token validation and rotation
 */
export async function refreshAccessToken(
  _refreshToken: string
): Promise<{ accessToken: string; expiresIn: string }> {
  // TODO: Verify refresh token and generate new access token
  // For now, this is a placeholder
  throw new Error('Not implemented');
}
