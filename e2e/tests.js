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

  test('Projects toolbar keeps filters and sorting in stable zones', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/index.html#/projets');
    await page.waitForSelector('.proj-gallery', { timeout: 5000 });

    await expect(page.locator('.filter-chips')).toBeVisible();
    await expect(page.locator('.filter-actions')).toBeVisible();
    await expect(page.locator('.sort-select')).toBeVisible();
    await expect(page.locator('.filter-result')).toBeVisible();

    const chipsBox = await page.locator('.filter-chips').boundingBox();
    const actionsBox = await page.locator('.filter-actions').boundingBox();
    expect(chipsBox).not.toBeNull();
    expect(actionsBox).not.toBeNull();
    expect(actionsBox.x).toBeGreaterThan(chipsBox.x);
    expect(Math.abs(actionsBox.y - chipsBox.y)).toBeLessThan(24);

    const shellMaxWidths = await page.evaluate(() => ({
      page: window.getComputedStyle(document.querySelector('.page-wrap')).maxWidth,
      nav: window.getComputedStyle(document.querySelector('.navbar')).maxWidth,
      footer: window.getComputedStyle(document.querySelector('.footer-inner')).maxWidth,
    }));
    expect(shellMaxWidths).toEqual({ page: '1440px', nav: '1440px', footer: '1440px' });
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

  test('Admin live preview renders content', async ({ page }) => {
    await page.goto(BASE + '/index.html#/admin');
    await page.fill('input[type="password"]', 'bento');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.dash-preview', { timeout: 5000 });
    // Preview should render the HomeView component directly
    await expect(page.locator('.dash-preview .cell--hero')).toBeVisible({ timeout: 5000 });
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

  test('Admin CV section opens without runtime errors', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto(BASE + '/index.html#/admin');
    await page.fill('input[type="password"]', 'bento');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.dashboard-v5', { timeout: 5000 });

    await page.locator('.dash-nav-item').filter({ hasText: 'CV' }).click();
    await expect(page.locator('.dashboard-v5')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('.ds-title')).toContainText('CV');
    expect(pageErrors).toEqual([]);
  });

  test('Admin appearance provides separate focal controls for home and CV', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto(BASE + '/index.html#/admin');
    await page.fill('input[type="password"]', 'bento');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.dashboard-v5', { timeout: 5000 });

    await page.locator('.dash-nav-item').filter({ hasText: 'Apparence' }).click();
    await expect(page.locator('.ds-title')).toContainText('Apparence');
    await expect(page.locator('[data-testid="focal-tab-home"]')).toBeVisible();
    await expect(page.locator('[data-testid="focal-tab-cv"]')).toBeVisible();

    const preview = page.locator('[data-testid="focal-preview"]');
    await expect(preview).toBeVisible();
    await preview.click({ position: { x: 24, y: 24 } });
    await expect(page.locator('[data-testid="focal-value"]')).toContainText('%');
    expect(pageErrors).toEqual([]);
  });

  test('Admin project editor exposes inline case study image upload', async ({ page }) => {
    await page.goto(BASE + '/index.html#/admin');
    await page.fill('input[type="password"]', 'bento');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.dashboard-v5', { timeout: 5000 });

    await expect(page.locator('.ds-sub').filter({ hasText: 'content/projects' })).toBeVisible({ timeout: 2000 });

    await page.locator('.ds-proj-row').first().locator('[title="Modifier"]').click();
    await expect(page.locator('.ds-title')).toContainText('Modifier');
    await expect(page.getByText('Insérer image étude de cas')).toBeVisible();
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
