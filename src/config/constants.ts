/**
 * Application constants
 */

export const APP_NAME = 'Trauma2';
export const APP_VERSION = '0.1.0';
export const APP_DESCRIPTION = 'Meta-schema API for SurrealDB type system';

export const API_PREFIX = '/api';

// JWT Token types
export const TOKEN_TYPE = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const;

// User roles
export const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
