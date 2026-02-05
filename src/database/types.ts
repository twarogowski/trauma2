/**
 * TypeScript types for SurrealDB records
 *
 * All database records follow SurrealDB's record ID format: table:id
 */

// SurrealDB Record ID type
export type RecordId<T extends string = string> = `${T}:${string}`;

// Base record interface (all DB records extend this)
export interface BaseRecord {
  readonly id: RecordId;
  readonly created_at: string;
  readonly updated_at: string;
}

// User record (example - for auth)
export interface UserRecord extends BaseRecord {
  readonly id: RecordId<'user'>;
  email: string;
  password: string; // Hashed with crypto::argon2
  role: 'admin' | 'user';
}

// Meta-schema types (placeholder for future type system)
export interface TypeDefinition extends BaseRecord {
  readonly id: RecordId<'type_definition'>;
  name: string;
  description: string;
  schema: unknown; // JSON Schema-like structure
  relations: readonly RecordId<'type_definition'>[];
}

// Generic query result wrapper
export interface QueryResult<T> {
  result: readonly T[];
  status: 'OK' | 'ERR';
  time: string;
}

// Connection status
export interface ConnectionStatus {
  connected: boolean;
  namespace?: string;
  database?: string;
}
