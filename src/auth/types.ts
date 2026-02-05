/**
 * Authentication types
 */

import { UserRole } from '@/config/constants';

// JWT Payload
export interface JWTPayload {
  readonly sub: string; // User ID
  username: string; // Username
  role: UserRole; // User role
  iat?: number; // Issued at
  exp?: number; // Expiration
}

// Login credentials
export interface LoginCredentials {
  username: string;
  password: string;
}

// Login response
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: string;
    username: string;
    role: UserRole;
  };
}

// Token refresh request
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Token refresh response
export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: string;
}

// Auth context (available in request after middleware)
export interface AuthContext {
  user: JWTPayload | { username: string; auth: 'basic' };
}
