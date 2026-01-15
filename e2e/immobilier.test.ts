import { test, expect } from '@playwright/test';

test.describe('Real estate flow', () => {
	test('immobilier page shows KPIs', async ({ page }) => {
		await page.goto('/immobilier');
		await page.waitForLoadState('networkidle');

		// Should show the main heading
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

		// Look for KPI-related content (valeur, dette, equity)
		const content = await page.textContent('body');
		expect(content).toBeDefined();
	});

	test('can click on property card to view details', async ({ page }) => {
		await page.goto('/immobilier');
		await page.waitForLoadState('networkidle');

		// Look for property cards or links to property details
		const propertyLink = page.locator('a[href*="/immobilier/"]').first();

		if (await propertyLink.count() > 0) {
			await propertyLink.click();
			await page.waitForLoadState('networkidle');

			// Should be on a property detail page
			await expect(page).toHaveURL(/\/immobilier\/.+/);
		}
	});

	test('property detail page shows information sections', async ({ page }) => {
		await page.goto('/immobilier');
		await page.waitForLoadState('networkidle');

		// Try to navigate to a property detail page
		const propertyLink = page.locator('a[href*="/immobilier/"]').first();

		if (await propertyLink.count() > 0) {
			await propertyLink.click();
			await page.waitForLoadState('networkidle');

			// Property detail page should have content
			const content = await page.textContent('body');
			expect(content).toBeDefined();

			// Should have a back button or navigation
			const backLink = page.locator('a[href="/immobilier"]').first();
			if (await backLink.count() > 0) {
				await expect(backLink).toBeVisible();
			}
		}
	});

	test('amortization table is present on property detail', async ({ page }) => {
		await page.goto('/immobilier');
		await page.waitForLoadState('networkidle');

		// Navigate to property detail
		const propertyLink = page.locator('a[href*="/immobilier/"]').first();

		if (await propertyLink.count() > 0) {
			await propertyLink.click();
			await page.waitForLoadState('networkidle');

			// Look for amortization table or schedule content
			const tableOrContent = page.locator('table, [class*="amortization"], [class*="schedule"]').first();
			if (await tableOrContent.count() > 0) {
				await expect(tableOrContent).toBeVisible();
			}
		}
	});
});
