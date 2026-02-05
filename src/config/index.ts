/**
 * Application configuration
 *
 * Provides type-safe access to environment variables.
 * All configuration is validated at startup via env.ts
 */

import { env } from './env';

export const config = {
  server: {
    env: env.NODE_ENV,
    port: env.PORT,
    host: env.HOST,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },

  database: {
    url: env.SURREALDB_URL,
    namespace: env.SURREALDB_NAMESPACE,
    database: env.SURREALDB_DATABASE,
    auth: {
      user: env.SURREALDB_ROOT_USER,
      pass: env.SURREALDB_ROOT_PASSWORD,
    },
    pool: {
      size: env.SURREALDB_POOL_SIZE,
      timeout: env.SURREALDB_POOL_TIMEOUT,
    },
  },

  auth: {
    basic: {
      username: env.BASIC_AUTH_USERNAME,
      password: env.BASIC_AUTH_PASSWORD,
    },
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },
  },

  logging: {
    level: env.LOG_LEVEL,
    pretty: env.LOG_PRETTY,
  },

  cors: {
    origin: env.CORS_ORIGIN,
    credentials: env.CORS_CREDENTIALS,
  },

  swagger: {
    enabled: env.SWAGGER_ENABLED,
    path: env.SWAGGER_PATH,
  },
} as const;

// Re-export env for direct access if needed
export { env };
