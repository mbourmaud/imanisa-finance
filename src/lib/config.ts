/**
 * Application configuration
 * Centralized config with environment variable handling
 */

export const config = {
	/**
	 * Database URL for Prisma
	 */
	databaseUrl: process.env.DATABASE_URL,

	/**
	 * Application environment
	 */
	isProduction: process.env.NODE_ENV === 'production',
	isDevelopment: process.env.NODE_ENV === 'development',
} as const;

/**
 * Type-safe config access
 */
export type AppConfig = typeof config;
