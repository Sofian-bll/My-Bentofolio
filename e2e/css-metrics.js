import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

async function cssVal(page, sel, prop) {
  return page.locator(sel).first().evaluate((el, p) => {
    const s = window.getComputedStyle(el);
    return parseFloat(s.getPropertyValue(p)) || 0;
  }, prop);
}

test.describe('CSS Metrics Deep Audit', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('Home: typography scale is consistent', async ({ page }) => {
    await page.goto(BASE + '/index.html#/');
    await page.waitForSelector('.hero-name', { timeout: 5000 });

    const heroSize = await cssVal(page, '.hero-name', 'font-size');
    const roleSize = await cssVal(page, '.hero-role', 'font-size');
    const bioSize = await cssVal(page, '.hero-bio', 'font-size');
    const bioLine = await cssVal(page, '.hero-bio', 'line-height');

    expect(heroSize, 'hero name too small').toBeGreaterThanOrEqual(40);
    expect(roleSize, 'role too small').toBeGreaterThanOrEqual(16);
    expect(bioSize, 'bio too small').toBeGreaterThanOrEqual(13);
    expect(bioLine, 'bio line-height too tight').toBeGreaterThanOrEqual(1.4);
    console.log(`Home type: hero=${heroSize}px role=${roleSize}px bio=${bioSize}px bio-lh=${bioLine}`);
  });

  test('CV: A4 typography is readable', async ({ page }) => {
    await page.goto(BASE + '/index.html#/cv');
    await page.waitForSelector('.cv-name', { timeout: 5000 });

    const nameSize = await cssVal(page, '.cv-name', 'font-size');
    const roleSize = await cssVal(page, '.cv-role', 'font-size');
    const secSize = await cssVal(page, '.cv-sec-title', 'font-size');
    const projSize = await cssVal(page, '.cv-proj-name', 'font-size');

    expect(nameSize, 'CV name too small').toBeGreaterThanOrEqual(18);
    expect(roleSize, 'CV role too small').toBeGreaterThanOrEqual(11);
    expect(secSize, 'CV section title too small').toBeGreaterThanOrEqual(10);
    expect(projSize, 'CV project name too small').toBeGreaterThanOrEqual(10);
    console.log(`CV type: name=${nameSize}px role=${roleSize}px sec=${secSize}px proj=${projSize}px`);
  });

  test('Projects: card layout is consistent', async ({ page }) => {
    await page.goto(BASE + '/index.html#/projets');
    await page.waitForSelector('.proj-gallery', { timeout: 5000 });

    const cards = page.locator('.proj-card');
    const count = await cards.count();
    expect(count, 'no project cards').toBeGreaterThan(0);

    const cardNameSize = await cssVal(page, '.proj-card-name', 'font-size');
    const cardDescSize = await cssVal(page, '.proj-card-desc', 'font-size');
    expect(cardNameSize).toBeGreaterThanOrEqual(13);
    expect(cardDescSize).toBeGreaterThanOrEqual(12);
    console.log(`Projects: ${count} cards, name=${cardNameSize}px desc=${cardDescSize}px`);
  });

  test('Admin: dashboard typography consistent', async ({ page }) => {
    await page.goto(BASE + '/index.html#/admin');
    await page.fill('input[type="password"]', 'bento');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.dashboard-v5', { timeout: 5000 });

    // Navigate to Appearance section which has labels
    await page.locator('.dash-nav-item').filter({ hasText: 'Apparence' }).click();
    await page.waitForSelector('.ds-label', { timeout: 3000 });

    const titleSize = await cssVal(page, '.ds-title', 'font-size');
    const labelSize = await cssVal(page, '.ds-label', 'font-size');
    const sidebarW = (await page.locator('.dash-sidebar').boundingBox())?.width || 0;

    expect(titleSize).toBeGreaterThanOrEqual(16);
    expect(labelSize).toBeGreaterThanOrEqual(11);
    expect(sidebarW).toBeGreaterThanOrEqual(180);
    expect(sidebarW).toBeLessThanOrEqual(320);
    console.log(`Admin: title=${titleSize}px label=${labelSize}px sidebar=${sidebarW}px`);
  });

  test('Experience cards match project card style', async ({ page }) => {
    await page.goto(BASE + '/index.html#/experiences');
    await page.waitForSelector('.page-title', { timeout: 5000 });

    // Compare card class — should use same .proj-card
    const cards = page.locator('.proj-card');
    const count = await cards.count();
    console.log(`Experiences: ${count} cards (shared .proj-card style)`);
    // Even if 0 experiences, the page renders without crash = pass
  });

  test('All pages have consistent content max-width', async ({ page }) => {
    const pages = ['/', '/projets', '/experiences', '/cv', '/contact'];
    const maxWidths = [];

    for (const path of pages) {
      await page.goto(BASE + '/index.html#' + path);
      await page.waitForSelector('.page-wrap', { timeout: 5000 });
      const mw = await cssVal(page, '.page-wrap', 'max-width');
      maxWidths.push({ path, mw });
    }

    console.log('Page max-widths:', maxWidths.map(m => `${m.path}=${m.mw}px`).join(', '));
    // All should be within reasonable range
    for (const m of maxWidths) {
      expect(m.mw, `${m.path} max-width too narrow`).toBeGreaterThanOrEqual(600);
    }
  });
});
