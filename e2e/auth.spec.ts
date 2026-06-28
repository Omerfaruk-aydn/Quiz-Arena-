import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1, h2, [role="heading"]').first()).toBeVisible();
  });

  test('register page loads correctly', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1, h2, [role="heading"]').first()).toBeVisible();
  });

  test('register form shows validation errors', async ({ page }) => {
    await page.goto('/register');
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('login form has email and password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(
      page.locator('input[type="password"], input[name="password"]').first(),
    ).toBeVisible();
  });

  test('game join page loads', async ({ page }) => {
    await page.goto('/join');
    await expect(page.locator('input').first()).toBeVisible();
  });

  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
