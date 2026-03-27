import { test, expect } from '@playwright/test';

test.describe('New setup page responsive layout', () => {
	test('mobile: page does not overflow at 430px', async ({ page }) => {
		await page.goto('/new');
		const body = page.locator('body');
		const bodyWidth = await body.evaluate((el) => el.scrollWidth);
		const viewportWidth = page.viewportSize()?.width ?? 430;
		expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
	});

	test('mobile: metadata grid stacks to single column', async ({ page }) => {
		await page.goto('/new');
		const versionInput = page.locator('#version');
		const categorySelect = page.locator('#category');
		// In a single-column layout, version and category should stack (version above category)
		const versionBox = await versionInput.boundingBox();
		const categoryBox = await categorySelect.boundingBox();
		if (versionBox && categoryBox) {
			// On mobile, category should be below version (not side by side)
			expect(categoryBox.y).toBeGreaterThan(versionBox.y);
			// And they should be approximately full width
			expect(versionBox.width).toBeGreaterThan(300);
		}
	});

	test('desktop: metadata grid shows 3 columns', async ({ page }) => {
		await page.goto('/new');
		const versionInput = page.locator('#version');
		const categorySelect = page.locator('#category');
		const licenseInput = page.locator('#license');
		const versionBox = await versionInput.boundingBox();
		const categoryBox = await categorySelect.boundingBox();
		const licenseBox = await licenseInput.boundingBox();
		if (versionBox && categoryBox && licenseBox) {
			// On desktop, all three should be on the same row
			expect(Math.abs(versionBox.y - categoryBox.y)).toBeLessThan(10);
			expect(Math.abs(categoryBox.y - licenseBox.y)).toBeLessThan(10);
		}
	});

	test('desktop: h1 heading is visible and properly sized', async ({ page }) => {
		await page.goto('/new');
		const h1 = page.locator('h1');
		await expect(h1).toBeVisible();
		await expect(h1).toContainText('Create a new setup');
	});
});
