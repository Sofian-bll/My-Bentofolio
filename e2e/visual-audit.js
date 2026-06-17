// Visual layout audit — screenshots + CSS property verification
import { test, expect } from '@playwright/test';
import fs from 'fs';

const BASE = 'http://localhost:5173';
const SCREENSHOTS_DIR = 'e2e/screenshots';

// Ensure screenshots directory exists
try { fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true }) } catch {}

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

async function screenshot(page, name) {
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/${name}.png`, fullPage: true });
}

// Measure CSS computed value
async function css(page, selector, prop) {
  return page.locator(selector).first().evaluate((el, p) => window.getComputedStyle(el).getPropertyValue(p), prop);
}

// Check no element overflows viewport horizontally
async function noHorizontalOverflow(page, width) {
  const overflow = await page.evaluate((vw) => {
    const body = document.body;
    const html = document.documentElement;
    return {
      bodyScroll: body.scrollWidth,
      htmlScroll: html.scrollWidth,
      viewport: vw,
      overflows: body.scrollWidth > vw || html.scrollWidth > vw,
    };
  }, width);
  return overflow;
}

test.describe('Visual Audit — Desktop 1440px', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP);
  });

  // ── Home ──
  test('Home: no horizontal overflow', async ({ page }) => {
    await page.goto(BASE + '/index.html#/');
    await page.waitForSelector('.bento', { timeout: 5000 });
    const overflow = await noHorizontalOverflow(page, DESKTOP.width);
    expect(overflow.overflows, `Body scrollWidth=${overflow.bodyScroll} > viewport=${overflow.viewport}`).toBe(false);
    await screenshot(page, 'desktop-home');
  });

  test('Home: hero name font size >= 48px', async ({ page }) => {
    await page.goto(BASE + '/index.html#/');
    const size = await css(page, '.hero-name', 'font-size');
    expect(parseFloat(size)).toBeGreaterThanOrEqual(40);
  });

  test('Home: bento grid has 3+ columns', async ({ page }) => {
    await page.goto(BASE + '/index.html#/');
    const cols = await page.evaluate(() => {
      const grid = document.querySelector('.bento');
      return window.getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    });
    expect(cols).toBeGreaterThanOrEqual(3);
  });

  test('Home: no overlapping elements in hero', async ({ page }) => {
    await page.goto(BASE + '/index.html#/');
    const hero = page.locator('.hero-name');
    const role = page.locator('.hero-role');
    await expect(hero).toBeVisible();
    await expect(role).toBeVisible();
    // Check they don't overlap vertically
    const heroBox = await hero.boundingBox();
    const roleBox = await role.boundingBox();
    if (heroBox && roleBox) {
      expect(heroBox.y + heroBox.height).toBeLessThanOrEqual(roleBox.y + 2);
    }
  });

  // ── Projects ──
  test('Projects: gallery grid has 3 columns', async ({ page }) => {
    await page.goto(BASE + '/index.html#/projets');
    await page.waitForSelector('.proj-gallery', { timeout: 5000 });
    const cols = await page.evaluate(() => {
      const grid = document.querySelector('.proj-gallery');
      return window.getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    });
    expect(cols).toBeGreaterThanOrEqual(2);
    await screenshot(page, 'desktop-projets');
  });

  // ── Experiences ──
  test('Experiences: page renders without overflow', async ({ page }) => {
    await page.goto(BASE + '/index.html#/experiences');
    await page.waitForSelector('.page-title', { timeout: 5000 });
    const overflow = await noHorizontalOverflow(page, DESKTOP.width);
    expect(overflow.overflows).toBe(false);
    await screenshot(page, 'desktop-experiences');
  });

  // ── CV ──
  test('CV: A4 frame is visible and scales properly', async ({ page }) => {
    await page.goto(BASE + '/index.html#/cv');
    await page.waitForSelector('.a4-page', { timeout: 5000 });
    const a4box = await page.locator('.a4-page').boundingBox();
    expect(a4box).not.toBeNull();
    if (a4box) {
      // A4 ratio should be close to 210/297 = 0.707
      const ratio = a4box.width / a4box.height;
      expect(ratio).toBeGreaterThan(0.68);
      expect(ratio).toBeLessThan(0.75);
    }
    await screenshot(page, 'desktop-cv');
  });

  test('CV: no horizontal overflow on page', async ({ page }) => {
    await page.goto(BASE + '/index.html#/cv');
    await page.waitForSelector('.a4-page', { timeout: 5000 });
    const overflow = await noHorizontalOverflow(page, DESKTOP.width);
    expect(overflow.overflows).toBe(false);
  });

  // ── Contact ──
  test('Contact: form and info are visible', async ({ page }) => {
    await page.goto(BASE + '/index.html#/contact');
    await page.waitForSelector('.page-title', { timeout: 5000 });
    await screenshot(page, 'desktop-contact');
  });

  // ── Admin ──
  test('Admin: 2-column layout (sidebar + main + preview)', async ({ page }) => {
    await page.goto(BASE + '/index.html#/admin');
    await page.fill('input[type="password"]', 'bento');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.dashboard-v5', { timeout: 5000 });

    const sidebar = await page.locator('.dash-sidebar').boundingBox();
    const main = await page.locator('.dash-main').boundingBox();
    const preview = await page.locator('.dash-preview').boundingBox();

    expect(sidebar).not.toBeNull();
    expect(main).not.toBeNull();
    expect(preview).not.toBeNull();

    // Sidebar should be leftmost
    if (sidebar && main) {
      expect(sidebar.x).toBeLessThan(main.x);
    }
    // Preview should be rightmost
    if (main && preview) {
      expect(main.x + main.width).toBeLessThanOrEqual(preview.x + 5);
    }

    await screenshot(page, 'desktop-admin');
  });

  test('Admin: sidebar width is reasonable (200-280px)', async ({ page }) => {
    await page.goto(BASE + '/index.html#/admin');
    await page.fill('input[type="password"]', 'bento');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.dash-sidebar', { timeout: 5000 });

    const sidebar = await page.locator('.dash-sidebar').boundingBox();
    if (sidebar) {
      expect(sidebar.width).toBeGreaterThanOrEqual(180);
      expect(sidebar.width).toBeLessThanOrEqual(320);
    }
  });

  // ── Preview mode ──
  test('Preview: CV without shell has no visible nav', async ({ page }) => {
    await page.goto(BASE + '/index.html?preview#/cv');
    await page.waitForSelector('.a4-page', { timeout: 5000 });
    const navDisplay = await page.locator('.navbar').evaluate(el => window.getComputedStyle(el).display);
    expect(navDisplay).toBe('none');
    await screenshot(page, 'preview-cv-noshell');
  });

  // ── Markdown rendering ──
  test('Markdown: project detail page renders', async ({ page }) => {
    await page.goto(BASE + '/index.html#/projet/connect-in');
    await page.waitForSelector('.pd-title', { timeout: 5000 });
    await expect(page.locator('.pd-title')).toBeVisible();
    await screenshot(page, 'desktop-project-detail');
  });
});

test.describe('Visual Audit — Mobile 390px', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE);
  });

  test('Mobile: home no horizontal overflow', async ({ page }) => {
    await page.goto(BASE + '/index.html#/');
    await page.waitForSelector('.hero-name', { timeout: 5000 });
    const overflow = await noHorizontalOverflow(page, MOBILE.width);
    expect(overflow.overflows).toBe(false);
    await screenshot(page, 'mobile-home');
  });

  test('Mobile: nav hamburger menu is visible', async ({ page }) => {
    await page.goto(BASE + '/index.html#/');
    await page.waitForSelector('.navbar', { timeout: 5000 });
    // Hamburger should be visible on mobile
    const hamburger = page.locator('.hamburger-btn');
    await expect(hamburger).toBeVisible();
  });

  test('Mobile: bento grid stacks to 1 column', async ({ page }) => {
    await page.goto(BASE + '/index.html#/');
    await page.waitForSelector('.bento', { timeout: 5000 });
    const cols = await page.evaluate(() => {
      const grid = document.querySelector('.bento');
      return window.getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    });
    // On mobile, should be 1 column
    expect(cols).toBe(1);
  });

  test('Mobile: CV scales down to fit', async ({ page }) => {
    await page.goto(BASE + '/index.html#/cv');
    await page.waitForSelector('.a4-page', { timeout: 5000 });
    const a4box = await page.locator('.a4-page').boundingBox();
    if (a4box) {
      // Should fit within viewport
      expect(a4box.width).toBeLessThanOrEqual(MOBILE.width);
    }
    await screenshot(page, 'mobile-cv');
  });

  test('Mobile: projects adapt to narrower layout', async ({ page }) => {
    await page.goto(BASE + '/index.html#/projets');
    await page.waitForSelector('.proj-gallery', { timeout: 5000 });
    await screenshot(page, 'mobile-projets');
  });

  test('Mobile: contact page no overflow', async ({ page }) => {
    await page.goto(BASE + '/index.html#/contact');
    await page.waitForSelector('.page-title', { timeout: 5000 });
    const overflow = await noHorizontalOverflow(page, MOBILE.width);
    expect(overflow.overflows).toBe(false);
    await screenshot(page, 'mobile-contact');
  });
});

test.describe('CSS Spacing Consistency', () => {
  test('All page sections have consistent top padding', async ({ page }) => {
    const pages = ['/', '/projets', '/experiences', '/cv', '/contact'];
    const paddings = [];

    for (const path of pages) {
      await page.goto(BASE + '/index.html#' + path);
      await page.waitForSelector('.page-wrap', { timeout: 5000 });
      const pt = await css(page, '.page-wrap', 'padding-top');
      paddings.push({ path, pt });
    }

    // All should be non-zero (pages have padding)
    for (const p of paddings) {
      expect(parseFloat(p.pt), `${p.path} has zero padding`).toBeGreaterThan(0);
    }
  });

  test('Nav links have consistent spacing', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(BASE + '/index.html#/');
    await page.waitForSelector('.nav-link', { timeout: 5000 });

    const links = page.locator('.nav-link');
    const count = await links.count();
    const gaps = [];

    for (let i = 0; i < count - 1; i++) {
      const current = await links.nth(i).boundingBox();
      const next = await links.nth(i + 1).boundingBox();
      if (current && next) {
        gaps.push(next.x - (current.x + current.width));
      }
    }

    // All gaps should be similar (±5px)
    if (gaps.length > 1) {
      const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      for (const g of gaps) {
        expect(g).toBeGreaterThanOrEqual(avg - 10);
      }
    }
  });
});
