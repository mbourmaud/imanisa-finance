import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tsconfigPaths(), react()],
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/tests/setup.ts'],
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			include: ['src/**/*.{ts,tsx}'],
			exclude: ['src/**/*.test.{ts,tsx}', 'src/tests/**', 'src/generated/**'],
		},
	},
});
