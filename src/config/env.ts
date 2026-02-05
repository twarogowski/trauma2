/**
 * Environment variable validation using TypeBox
 *
 * All environment variables are parsed and validated at startup.
 * If validation fails, the application exits with detailed error messages.
 */

import { Type, Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

// ENV Schema with TypeBox validation
const EnvSchema = Type.Object({
  // Server Configuration
  NODE_ENV: Type.Union([
    Type.Literal('development'),
    Type.Literal('production'),
    Type.Literal('test'),
  ]),
  PORT: Type.Number({ minimum: 1, maximum: 65535 }),
  HOST: Type.String(),

  // SurrealDB Configuration
  SURREALDB_URL: Type.String({ pattern: '^(ws|wss)://' }),
  SURREALDB_NAMESPACE: Type.String({ minLength: 1 }),
  SURREALDB_DATABASE: Type.String({ minLength: 1 }),
  SURREALDB_ROOT_USER: Type.String({ minLength: 1 }),
  SURREALDB_ROOT_PASSWORD: Type.String({ minLength: 1 }),
  SURREALDB_POOL_SIZE: Type.Number({ minimum: 1, maximum: 100 }),
  SURREALDB_POOL_TIMEOUT: Type.Number({ minimum: 1000 }),

  // Authentication - Basic Auth
  BASIC_AUTH_USERNAME: Type.String({ minLength: 3 }),
  BASIC_AUTH_PASSWORD: Type.String({ minLength: 8 }),

  // Authentication - JWT
  JWT_SECRET: Type.String({ minLength: 32 }),
  JWT_EXPIRES_IN: Type.String(),
  JWT_REFRESH_EXPIRES_IN: Type.String(),

  // Logging
  LOG_LEVEL: Type.Union([
    Type.Literal('fatal'),
    Type.Literal('error'),
    Type.Literal('warn'),
    Type.Literal('info'),
    Type.Literal('debug'),
    Type.Literal('trace'),
  ]),
  LOG_PRETTY: Type.Boolean(),

  // CORS
  CORS_ORIGIN: Type.String(),
  CORS_CREDENTIALS: Type.Boolean(),

  // Swagger/OpenAPI
  SWAGGER_ENABLED: Type.Boolean(),
  SWAGGER_PATH: Type.String({ pattern: '^/' }),
});

export type Env = Static<typeof EnvSchema>;

/**
 * Parse and validate environment variables
 */
function parseEnv(): Env {
  const raw = {
    // Server
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    HOST: process.env.HOST || '0.0.0.0',

    // SurrealDB
    SURREALDB_URL: process.env.SURREALDB_URL || 'ws://localhost:8000/rpc',
    SURREALDB_NAMESPACE: process.env.SURREALDB_NAMESPACE || 'trauma2',
    SURREALDB_DATABASE: process.env.SURREALDB_DATABASE || 'main',
    SURREALDB_ROOT_USER: process.env.SURREALDB_ROOT_USER || 'root',
    SURREALDB_ROOT_PASSWORD: process.env.SURREALDB_ROOT_PASSWORD || 'root',
    SURREALDB_POOL_SIZE: parseInt(
      process.env.SURREALDB_POOL_SIZE || '10',
      10
    ),
    SURREALDB_POOL_TIMEOUT: parseInt(
      process.env.SURREALDB_POOL_TIMEOUT || '5000',
      10
    ),

    // Auth - Basic
    BASIC_AUTH_USERNAME: process.env.BASIC_AUTH_USERNAME || 'admin',
    BASIC_AUTH_PASSWORD: process.env.BASIC_AUTH_PASSWORD || 'changeme',

    // Auth - JWT
    JWT_SECRET:
      process.env.JWT_SECRET ||
      'your-super-secret-jwt-key-change-in-production-min-32-chars',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    LOG_PRETTY: process.env.LOG_PRETTY === 'true',

    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',

    // Swagger
    SWAGGER_ENABLED: process.env.SWAGGER_ENABLED !== 'false',
    SWAGGER_PATH: process.env.SWAGGER_PATH || '/docs',
  };

  // Validate against schema
  if (!Value.Check(EnvSchema, raw)) {
    const errors = [...Value.Errors(EnvSchema, raw)];
    console.error('❌ Environment validation failed:');
    errors.forEach((err) =>
      console.error(`  - ${err.path}: ${err.message}`)
    );
    process.exit(1);
  }

  return raw as Env;
}

// Parse and export validated environment
export const env = parseEnv();
