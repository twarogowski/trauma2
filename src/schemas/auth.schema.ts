/**
 * TypeBox validation schemas for authentication endpoints
 */

import { Type, Static } from '@sinclair/typebox';

// Login request schema
export const LoginRequestSchema = Type.Object({
  username: Type.String({ minLength: 3, maxLength: 50 }),
  password: Type.String({ minLength: 8, maxLength: 100 }),
});

export type LoginRequest = Static<typeof LoginRequestSchema>;

// Login response schema
export const LoginResponseSchema = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String(),
  expiresIn: Type.String(),
  user: Type.Object({
    id: Type.String(),
    username: Type.String(),
    role: Type.Union([Type.Literal('admin'), Type.Literal('user')]),
  }),
});

export type LoginResponse = Static<typeof LoginResponseSchema>;

// Refresh token request schema
export const RefreshTokenRequestSchema = Type.Object({
  refreshToken: Type.String(),
});

export type RefreshTokenRequest = Static<typeof RefreshTokenRequestSchema>;

// Refresh token response schema
export const RefreshTokenResponseSchema = Type.Object({
  accessToken: Type.String(),
  expiresIn: Type.String(),
});

export type RefreshTokenResponse = Static<typeof RefreshTokenResponseSchema>;
