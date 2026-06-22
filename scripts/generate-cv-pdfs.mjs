import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { resolve } from 'path';
import { mkdirSync } from 'fs';

const OUT_DIR = resolve('dist/cv');
const BASE = 'http://127.0.0.1:4173';

const VARIANTS = ['couleur', 'sombre', 'mono'];

function startPreview() {
  return new Promise((resolvePromise, reject) => {
    const proc = spawn('bun', ['x', 'vite', 'preview', '--host', '127.0.0.1', '--port', '4173'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let started = false;
    proc.stdout.on('data', (data) => {
      const text = data.toString();
      process.stdout.write(text);
      if (!started && (text.includes('localhost') || text.includes('4173'))) {
        started = true;
        resolvePromise(proc);
      }
    });
    proc.stderr.on('data', (data) => process.stderr.write(data));
    proc.on('error', reject);
    setTimeout(() => {
      if (!started) {
        started = true;
        resolvePromise(proc);
      }
    }, 5000);
  });
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  console.log('Starting preview server...');
  const server = await startPreview();

  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext();

    for (const variant of VARIANTS) {
      const page = await context.newPage();
      console.log(`Generating ${variant}...`);

      await page.goto(`${BASE}/index.html#/cv`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.a4-page', { timeout: 15000 });

      await page.evaluate((v) => {
        document.documentElement.setAttribute('data-cv-pills', v);
      }, variant);

      await page.emulateMedia({ media: 'print' });
      await page.waitForTimeout(500);

      const outPath = resolve(OUT_DIR, `cv-sofian-bll-${variant}.pdf`);
      await page.pdf({
        path: outPath,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });

      console.log(`  -> ${outPath}`);
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    server.kill();
    await new Promise(r => setTimeout(r, 500));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
