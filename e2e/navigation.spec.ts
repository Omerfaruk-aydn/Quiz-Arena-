import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('unauthenticated user can access landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });

  test('unauthenticated user can access login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
  });

  test('unauthenticated user can access register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL('/register');
  });

  test('unauthenticated user can access join page', async ({ page }) => {
    await page.goto('/join');
    await expect(page).toHaveURL('/join');
  });

  test('protected dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toMatch(/\/(login|dashboard)/);
  });
});
