/**
 * SurrealDB connection pool
 *
 * Manages a pool of SurrealDB connections for better performance under load.
 * Use this instead of the singleton client for high-concurrency scenarios.
 */

import Surreal from 'surrealdb';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { DatabaseError } from '@/utils/errors';

interface PoolConnection {
  client: Surreal;
  inUse: boolean;
  lastUsed: number;
}

class SurrealDBPool {
  private readonly pool: PoolConnection[] = [];
  private readonly maxSize: number;
  private readonly timeout: number;
  private initialized = false;

  constructor(maxSize: number, timeout: number) {
    this.maxSize = maxSize;
    this.timeout = timeout;
  }

  /**
   * Initialize connection pool
   *
   * Creates {maxSize} connections to SurrealDB.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.debug('Connection pool already initialized');
      return;
    }

    logger.info({ poolSize: this.maxSize }, 'Initializing SurrealDB connection pool');

    try {
      for (let i = 0; i < this.maxSize; i++) {
        const client = await this.createConnection();
        this.pool.push({
          client,
          inUse: false,
          lastUsed: Date.now(),
        });
      }

      this.initialized = true;
      logger.info(
        { poolSize: this.maxSize },
        'SurrealDB connection pool initialized'
      );
    } catch (error) {
      logger.error({ error }, 'Failed to initialize connection pool');
      throw new DatabaseError('Failed to initialize connection pool', error);
    }
  }

  /**
   * Create a new SurrealDB connection
   */
  private async createConnection(): Promise<Surreal> {
    const client = new Surreal();

    await client.connect(config.database.url);
    await client.signin({
      username: config.database.auth.user,
      password: config.database.auth.pass,
    });
    await client.use({
      namespace: config.database.namespace,
      database: config.database.database,
    });

    return client;
  }

  /**
   * Acquire a connection from pool
   *
   * Waits up to {timeout}ms for an available connection.
   * @throws {DatabaseError} If no connection available within timeout
   */
  async acquire(): Promise<Surreal> {
    if (!this.initialized) {
      await this.initialize();
    }

    const start = Date.now();

    while (Date.now() - start < this.timeout) {
      const available = this.pool.find((conn) => !conn.inUse);

      if (available) {
        available.inUse = true;
        available.lastUsed = Date.now();
        logger.debug('Connection acquired from pool');
        return available.client;
      }

      // Wait briefly before retrying
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    throw new DatabaseError(
      `Failed to acquire connection within ${this.timeout}ms timeout`
    );
  }

  /**
   * Release a connection back to pool
   */
  release(client: Surreal): void {
    const conn = this.pool.find((c) => c.client === client);
    if (conn) {
      conn.inUse = false;
      conn.lastUsed = Date.now();
      logger.debug('Connection released to pool');
    }
  }

  /**
   * Execute query with automatic connection management
   *
   * Acquires a connection, executes the function, and releases it.
   * This is the recommended way to use the pool.
   *
   * @example
   * ```ts
   * const users = await dbPool.withConnection(async (db) => {
   *   return await db.query('SELECT * FROM user WHERE active = $active', { active: true });
   * });
   * ```
   */
  async withConnection<T>(fn: (client: Surreal) => Promise<T>): Promise<T> {
    const client = await this.acquire();
    try {
      return await fn(client);
    } finally {
      this.release(client);
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    total: number;
    inUse: number;
    available: number;
  } {
    const inUse = this.pool.filter((c) => c.inUse).length;
    return {
      total: this.pool.length,
      inUse,
      available: this.pool.length - inUse,
    };
  }

  /**
   * Close all connections in pool
   *
   * Gracefully shuts down the connection pool.
   */
  async closeAll(): Promise<void> {
    logger.info('Closing all SurrealDB connections');

    try {
      for (const conn of this.pool) {
        await conn.client.close();
      }

      this.pool.length = 0;
      this.initialized = false;
      logger.info('All SurrealDB connections closed');
    } catch (error) {
      logger.error({ error }, 'Error closing connection pool');
      throw new DatabaseError('Failed to close connection pool', error);
    }
  }
}

// Export singleton instance
export const dbPool = new SurrealDBPool(
  config.database.pool.size,
  config.database.pool.timeout
);
