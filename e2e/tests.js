import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

test.describe('Bentofolio - Public UX', () => {
  test('Home page loads with hero, bento grid, nav', async ({ page }) => {
    await page.goto(BASE + '/index.html#/');
    await page.waitForSelector('.hero-name', { timeout: 5000 });
    await expect(page.locator('.hero-name')).toBeVisible();
    await expect(page.locator('.bento')).toBeVisible();
    await expect(page.locator('.navbar')).toBeVisible();
  });

  test('Projects page loads with gallery', async ({ page }) => {
    await page.goto(BASE + '/index.html#/projets');
    await page.waitForSelector('.proj-gallery', { timeout: 5000 });
    await expect(page.locator('.proj-card').first()).toBeVisible();
  });

  test('Experiences page loads', async ({ page }) => {
    await page.goto(BASE + '/index.html#/experiences');
    await page.waitForSelector('.page-title', { timeout: 5000 });
    await expect(page.locator('.page-title')).toContainText('Experiences');
  });

  test('CV page loads with A4 frame', async ({ page }) => {
    await page.goto(BASE + '/index.html#/cv');
    await page.waitForSelector('.a4-page', { timeout: 5000 });
    await expect(page.locator('.cv-name')).toBeVisible();
  });

  test('Contact page loads', async ({ page }) => {
    await page.goto(BASE + '/index.html#/contact');
    await page.waitForSelector('.page-title', { timeout: 5000 });
    await expect(page.locator('.page-title')).toContainText('Contact');
  });

  test('Navigation between pages works', async ({ page }) => {
    await page.goto(BASE + '/index.html#/');
    await page.waitForSelector('.navbar', { timeout: 5000 });

    await page.locator('.nav-link').filter({ hasText: 'Projets' }).click();
    await page.waitForSelector('.proj-gallery', { timeout: 5000 });

    await page.locator('.nav-link').filter({ hasText: 'Experiences' }).click();
    await page.waitForSelector('.page-title', { timeout: 5000 });
    await expect(page.locator('.page-title')).toContainText('Experiences');

    await page.locator('.nav-link').filter({ hasText: 'CV' }).click();
    await page.waitForSelector('.a4-page', { timeout: 5000 });

    await page.locator('.nav-link').filter({ hasText: 'Contact' }).click();
    await expect(page.locator('.page-title')).toContainText('Contact');
  });
});

test.describe('Bentofolio - Admin UX', () => {
  test('Admin login page shows password input', async ({ page }) => {
    await page.goto(BASE + '/index.html#/admin');
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Admin login with correct password enters dashboard', async ({ page }) => {
    await page.goto(BASE + '/index.html#/admin');
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    await page.fill('input[type="password"]', 'bento');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.dashboard-v5', { timeout: 5000 });
    await expect(page.locator('.dashboard-v5')).toBeVisible();
  });

  test('Admin sidebar shows all 8 sections', async ({ page }) => {
    await page.goto(BASE + '/index.html#/admin');
    await page.fill('input[type="password"]', 'bento');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.dash-sidebar', { timeout: 5000 });

    const sections = ['Projets', 'Experiences', 'Apparence', 'Profil', 'CV', 'Contact', 'Liens', 'Backup'];
    for (const s of sections) {
      await expect(page.locator('.dash-nav-item').filter({ hasText: s })).toBeVisible({ timeout: 2000 });
    }
  });

  test('Admin live preview is visible', async ({ page }) => {
    await page.goto(BASE + '/index.html#/admin');
    await page.fill('input[type="password"]', 'bento');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.dash-preview', { timeout: 5000 });
    await expect(page.locator('.live-preview')).toBeVisible();
  });

  test('Admin sections switch without crash', async ({ page }) => {
    await page.goto(BASE + '/index.html#/admin');
    await page.fill('input[type="password"]', 'bento');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.dashboard-v5', { timeout: 5000 });

    for (const section of ['Apparence', 'Profil', 'CV', 'Liens', 'Projets']) {
      await page.locator('.dash-nav-item').filter({ hasText: section }).click();
      await page.waitForTimeout(400);
    }
  });

  test('Admin preview tabs work', async ({ page }) => {
    await page.goto(BASE + '/index.html#/admin');
    await page.fill('input[type="password"]', 'bento');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.dash-preview', { timeout: 5000 });

    for (const tab of ['Accueil', 'Projets', 'CV', 'Contact']) {
      await page.locator('.ds-preview-tab').filter({ hasText: tab }).click();
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Bentofolio - Preview mode', () => {
  test('Preview mode hides nav', async ({ page }) => {
    await page.goto(BASE + '/index.html?preview#/cv');
    await page.waitForSelector('.a4-page', { timeout: 5000 });
    const navDisplay = await page.locator('.navbar').evaluate(el => window.getComputedStyle(el).display);
    expect(navDisplay).toBe('none');
  });
});
