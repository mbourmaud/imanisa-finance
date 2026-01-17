/**
 * Application configuration
 * Centralized config with environment variable handling
 */

export const config = {
	/**
	 * Demo mode - uses in-memory data and bypasses auth
	 */
	isDemoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',

	/**
	 * Database URL for Prisma
	 */
	databaseUrl: process.env.DATABASE_URL,

	/**
	 * Application environment
	 */
	isProduction: process.env.NODE_ENV === 'production',
	isDevelopment: process.env.NODE_ENV === 'development',

	/**
	 * Default demo user for DEMO_MODE
	 */
	demoUser: {
		id: 'demo-user-001',
		email: 'demo@imanisa.finance',
		name: 'Utilisateur Demo',
	},

	/**
	 * Default owner for DEMO_MODE
	 */
	demoOwner: {
		id: 'demo-owner-001',
		name: 'Moi',
		type: 'individual' as const,
	},
} as const;

/**
 * Type-safe config access
 */
export type AppConfig = typeof config;
