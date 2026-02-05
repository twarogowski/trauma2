/**
 * SurrealDB client singleton
 *
 * Provides a single connection to SurrealDB that is shared across the application.
 * For connection pooling, use pool.ts instead.
 */

import Surreal from 'surrealdb';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { DatabaseError } from '@/utils/errors';

let db: Surreal | null = null;

/**
 * Initialize SurrealDB connection (singleton)
 *
 * Connects to SurrealDB, authenticates, and selects namespace/database.
 * Only creates one connection per application lifecycle.
 */
export async function initDatabase(): Promise<Surreal> {
  if (db) {
    logger.debug('Database already initialized, returning existing instance');
    return db;
  }

  try {
    logger.info(
      { url: config.database.url },
      'Initializing SurrealDB connection'
    );

    db = new Surreal();

    // Connect to SurrealDB
    await db.connect(config.database.url);

    // Authenticate with root credentials
    await db.signin({
      username: config.database.auth.user,
      password: config.database.auth.pass,
    });

    // Select namespace and database
    await db.use({
      namespace: config.database.namespace,
      database: config.database.database,
    });

    logger.info(
      {
        namespace: config.database.namespace,
        database: config.database.database,
      },
      'SurrealDB connection established'
    );

    return db;
  } catch (error) {
    logger.error({ error }, 'Failed to connect to SurrealDB');
    throw new DatabaseError('Failed to initialize database connection', error);
  }
}

/**
 * Get existing database connection
 *
 * @throws {DatabaseError} If database is not initialized
 */
export function getDatabase(): Surreal {
  if (!db) {
    throw new DatabaseError(
      'Database not initialized. Call initDatabase() first.'
    );
  }
  return db;
}

/**
 * Close database connection
 *
 * Closes the connection and resets the singleton instance.
 * Useful for graceful shutdown.
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    try {
      await db.close();
      db = null;
      logger.info('SurrealDB connection closed');
    } catch (error) {
      logger.error({ error }, 'Error closing database connection');
      throw new DatabaseError('Failed to close database connection', error);
    }
  }
}

/**
 * Ping database to check connection health
 */
export async function pingDatabase(): Promise<boolean> {
  try {
    const db = getDatabase();
    await db.query('SELECT 1;');
    return true;
  } catch {
    return false;
  }
}
