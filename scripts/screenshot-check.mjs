import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:3000';
const PAGES = [
  { url: '/creator-insights', name: 'creator-insights' },
  { url: '/video-rankings',   name: 'video-rankings'   },
];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

for (const { url, name } of PAGES) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2500);

  const path = `/tmp/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log(`[${name}] screenshot → ${path}`);
  if (errors.length) {
    console.log(`[${name}] ERRORS:`);
    errors.forEach(e => console.log('  ', e.slice(0, 200)));
  } else {
    console.log(`[${name}] no console errors`);
  }
  await page.close();
}

await browser.close();
