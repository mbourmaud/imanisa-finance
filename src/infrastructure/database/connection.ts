// Re-export from turso.ts for backward compatibility (raw SQL)
export { getDatabase, closeDatabase, execute, executeMany } from './turso';
export type { Client, ResultSet, InArgs } from './turso';

// Re-export from drizzle.ts for type-safe ORM access
export { getDb, closeDb, schema } from './drizzle';
export type { DrizzleDb } from './drizzle';
