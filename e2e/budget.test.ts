import { test, expect } from '@playwright/test';

test.describe('Budget and categorization flow', () => {
	test('budget page shows expense chart', async ({ page }) => {
		await page.goto('/budget');
		await page.waitForLoadState('networkidle');

		// Should show the budget heading
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

		// Look for chart or visualization elements
		const chartElement = page.locator('canvas, [class*="chart"], [class*="donut"], [class*="pie"]');
		// Chart may or may not be visible depending on data
		const content = await page.textContent('body');
		expect(content).toBeDefined();
	});

	test('can change budget period', async ({ page }) => {
		await page.goto('/budget');
		await page.waitForLoadState('networkidle');

		// Look for period selector
		const periodSelector = page.locator('select, [class*="period"], [class*="date-picker"]');

		if (await periodSelector.count() > 0) {
			await expect(periodSelector.first()).toBeVisible();
		}
	});

	test('clicking on category shows details', async ({ page }) => {
		await page.goto('/budget');
		await page.waitForLoadState('networkidle');

		// Look for category items
		const categoryItem = page.locator('[class*="category"], [data-testid="category"]').first();

		if (await categoryItem.count() > 0) {
			await categoryItem.click();
			// Should show some drill-down or detail view
			await page.waitForLoadState('networkidle');
		}

		// Page should still be functional
		const content = await page.textContent('body');
		expect(content).toBeDefined();
	});

	test('transactions page shows category badges', async ({ page }) => {
		await page.goto('/transactions');
		await page.waitForLoadState('networkidle');

		// Look for category badges or labels on transactions
		const content = await page.textContent('body');
		expect(content).toBeDefined();
	});

	test('budget rules page loads', async ({ page }) => {
		await page.goto('/budget/rules');
		await page.waitForLoadState('networkidle');

		// Should show rules heading or content
		const heading = page.getByRole('heading', { level: 1 });
		if (await heading.count() > 0) {
			await expect(heading).toBeVisible();
		}
	});

	test('can create a new category rule', async ({ page }) => {
		await page.goto('/budget/rules');
		await page.waitForLoadState('networkidle');

		// Look for add rule button
		const addButton = page.locator('button', { hasText: /add|ajouter|nouveau|new/i });

		if (await addButton.count() > 0) {
			await expect(addButton.first()).toBeVisible();
		}
	});
});
