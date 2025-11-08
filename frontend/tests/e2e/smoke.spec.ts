import { test, expect } from '@playwright/test';

test('home page renders and navigates', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'YatayApp' })).toBeVisible({ timeout: 5000 });
});
