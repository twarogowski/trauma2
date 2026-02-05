/**
 * JWT utilities for token signing and verification
 *
 * Uses Bun's native crypto for JWT operations.
 */

import { config } from '@/config';
import type { JWTPayload } from './types';

/**
 * Sign a JWT token
 *
 * @param payload - JWT payload (user claims)
 * @param expiresIn - Token expiration time (default: from config)
 * @returns Signed JWT token
 */
export async function signToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  expiresIn?: string
): Promise<string> {
  const exp = parseExpiration(expiresIn ?? config.auth.jwt.expiresIn);

  const fullPayload: JWTPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + exp,
  };

  // Simple JWT implementation using base64 encoding
  // In production, use a proper JWT library or Bun's native crypto
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(fullPayload));

  const message = `${encodedHeader}.${encodedPayload}`;
  const signature = await signMessage(message, config.auth.jwt.secret);

  return `${message}.${signature}`;
}

/**
 * Verify a JWT token
 *
 * @param token - JWT token to verify
 * @returns Decoded payload if valid, null if invalid
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const encodedHeader = parts[0];
    const encodedPayload = parts[1];
    const signature = parts[2];

    if (!encodedHeader || !encodedPayload || !signature) {
      return null;
    }

    const message = `${encodedHeader}.${encodedPayload}`;

    // Verify signature
    const expectedSignature = await signMessage(message, config.auth.jwt.secret);
    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    const payload = JSON.parse(atob(encodedPayload)) as JWTPayload;

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Sign a message with HMAC-SHA256
 */
async function signMessage(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );

  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * Parse expiration time string (e.g., "1h", "7d") to seconds
 *
 * Supported units:
 * - s: seconds
 * - m: minutes
 * - h: hours
 * - d: days
 *
 * @example
 * ```ts
 * parseExpiration('1h') // 3600
 * parseExpiration('7d') // 604800
 * ```
 */
export function parseExpiration(exp: string): number {
  const match = exp.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid expiration format: ${exp}`);
  }

  const value = match[1];
  const unit = match[2];

  if (!value || !unit) {
    throw new Error(`Invalid expiration format: ${exp}`);
  }

  const num = parseInt(value, 10);

  switch (unit) {
    case 's':
      return num;
    case 'm':
      return num * 60;
    case 'h':
      return num * 60 * 60;
    case 'd':
      return num * 60 * 60 * 24;
    default:
      throw new Error(`Unknown time unit: ${unit}`);
  }
}
