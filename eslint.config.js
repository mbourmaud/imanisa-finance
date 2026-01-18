import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import localRules from './eslint-rules/index.js';

export default tseslint.config(
	// Ignore patterns
	{
		ignores: [
			'node_modules/**',
			'.next/**',
			'coverage/**',
			'*.config.js',
			'*.config.mjs',
			'*.config.ts',
			'eslint-rules/**',
			'public/**',
		],
	},

	// Base config for all files
	js.configs.recommended,

	// TypeScript config
	...tseslint.configs.recommended,

	// Custom rules for our UI architecture
	{
		files: ['src/**/*.{ts,tsx}'],
		plugins: {
			'local': { rules: localRules.rules },
		},
		rules: {
			// Disable rules that conflict with Biome (Biome handles these)
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-explicit-any': 'off', // Biome handles this
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-require-imports': 'off',

			// Our custom rules - ERROR level to block commits
			'local/no-direct-shadcn-import': 'error',
			'local/no-inline-classname': 'error',
		},
	},
);
