import { test, expect } from '@playwright/test';

test('playwright is configured correctly', async ({ page }) => {
	// This test just verifies the E2E setup works
	// Real tests will be added in subsequent user stories
	expect(true).toBe(true);
});
