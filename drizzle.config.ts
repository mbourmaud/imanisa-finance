import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/infrastructure/database/schema/index.ts',
	out: './drizzle',
	dialect: 'turso',
	dbCredentials: {
		url: process.env.TURSO_URL || `file:${process.cwd()}/data/imanisa.db`,
		authToken: process.env.TURSO_AUTH_TOKEN
	}
});
