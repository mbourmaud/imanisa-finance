/**
 * Global test setup for Vitest
 *
 * This file runs before all tests and sets up the test environment.
 */

import { vi, beforeAll, afterEach, afterAll } from 'vitest';

// Mock environment variables for tests
beforeAll(() => {
	// Use in-memory database for tests by default
	process.env.TEST_MODE = 'true';
});

// Clean up after each test
afterEach(() => {
	vi.clearAllMocks();
});

// Global cleanup
afterAll(() => {
	vi.restoreAllMocks();
});

// Mock fetch for API tests (optional - can be overridden in specific tests)
// global.fetch = vi.fn();

// Suppress console output during tests (optional)
// Uncomment if tests are too noisy
// vi.spyOn(console, 'log').mockImplementation(() => {});
// vi.spyOn(console, 'warn').mockImplementation(() => {});
// vi.spyOn(console, 'error').mockImplementation(() => {});
