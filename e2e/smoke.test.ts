import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
	test('home page loads without error', async ({ page }) => {
		await page.goto('/');
		// Should not have any console errors
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		// Wait for page to be fully loaded
		await page.waitForLoadState('networkidle');

		// Page should have loaded successfully
		expect(errors).toHaveLength(0);
	});

	test('immobilier page loads without error', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		await page.goto('/immobilier');
		await page.waitForLoadState('networkidle');

		// Page should show real estate content
		await expect(page.locator('h1, h2').first()).toBeVisible();
		expect(errors).toHaveLength(0);
	});

	test('investissements page loads without error', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		await page.goto('/investissements');
		await page.waitForLoadState('networkidle');

		// Page should show investments content
		await expect(page.locator('h1, h2').first()).toBeVisible();
		expect(errors).toHaveLength(0);
	});

	test('import page loads without error', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		await page.goto('/import');
		await page.waitForLoadState('networkidle');

		// Page should show import content
		await expect(page.locator('h1, h2').first()).toBeVisible();
		expect(errors).toHaveLength(0);
	});

	test('budget page loads without error', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		await page.goto('/budget');
		await page.waitForLoadState('networkidle');

		// Page should show budget content
		await expect(page.locator('h1, h2').first()).toBeVisible();
		expect(errors).toHaveLength(0);
	});
});
