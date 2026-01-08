import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
	if (!db) {
		const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'imanisa.db');
		db = new Database(dbPath);
		db.pragma('journal_mode = WAL');
		db.pragma('foreign_keys = ON');
		initializeSchema(db);
	}
	return db;
}

function initializeSchema(database: Database.Database): void {
	const schemaPath = join(__dirname, 'schema.sql');
	const schema = readFileSync(schemaPath, 'utf-8');
	database.exec(schema);
}

export function closeDatabase(): void {
	if (db) {
		db.close();
		db = null;
	}
}
