import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
	plugins: [svelte({ hot: false })],
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['e2e/**/*', 'node_modules/**/*'],
		setupFiles: ['src/tests/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			include: ['src/**/*.{js,ts,svelte}'],
			exclude: [
				'src/tests/**/*',
				'src/**/*.test.ts',
				'src/**/*.spec.ts',
				'src/scripts/**/*',
				'src/routes/**/*' // API routes tested separately in integration tests
			]
		},
		// Run tests serially to avoid database state conflicts (Vitest 4 syntax)
		sequence: {
			concurrent: false
		},
		// Increase timeout for database tests
		testTimeout: 10000
	},
	resolve: {
		alias: {
			$lib: resolve('./src/lib'),
			'@domain': resolve('./src/domain'),
			'@application': resolve('./src/application'),
			'@infrastructure': resolve('./src/infrastructure'),
			'@lib': resolve('./src/lib'),
			'@tests': resolve('./src/tests')
		}
	}
});
