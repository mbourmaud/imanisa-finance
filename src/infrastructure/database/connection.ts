// Re-export from turso.ts for backward compatibility
export { getDatabase, closeDatabase, execute, executeMany } from './turso';
export type { Client, ResultSet, InArgs } from './turso';
