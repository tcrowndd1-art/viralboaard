const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1440, height: 900 });

  // Light mode first
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);

  // Find Shorts section and screenshot it
  const shortsHeading = await page.locator('text=Shorts').first();
  const box = await shortsHeading.boundingBox().catch(() => null);
  if (box) {
    await page.screenshot({
      path: 'C:/tmp/shorts-light.png',
      clip: { x: 0, y: Math.max(0, box.y - 10), width: 1440, height: 550 }
    });
    console.log('Shorts area (light): C:/tmp/shorts-light.png');
  }

  // Get all button texts in the Shorts section area
  const allBtns = await page.locator('button').allTextContents();
  const catBtns = allBtns.filter(t => t.trim().length > 0 && t.trim().length < 20);
  console.log('Category-like buttons:', catBtns.slice(0, 25));

  // Dark mode
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const shortsHeading2 = await page.locator('text=Shorts').first();
  const box2 = await shortsHeading2.boundingBox().catch(() => null);
  if (box2) {
    await page.screenshot({
      path: 'C:/tmp/shorts-dark.png',
      clip: { x: 0, y: Math.max(0, box2.y - 10), width: 1440, height: 550 }
    });
    console.log('Shorts area (dark): C:/tmp/shorts-dark.png');
  }

  // Check text color of category buttons
  const firstCatBtn = await page.locator('button').filter({ hasText: /엔터|음악|교육|게임/ }).first();
  if (await firstCatBtn.count()) {
    const color = await firstCatBtn.evaluate(el => window.getComputedStyle(el).color);
    console.log('First category button color in dark mode:', color);
    const text = await firstCatBtn.textContent();
    console.log('First category button text:', text);
  } else {
    console.log('Category buttons not found with Korean text');
    // try to find them differently
    const firstBtn = await page.locator('button').nth(0).textContent().catch(() => '');
    console.log('First button text:', firstBtn);
  }

  await browser.close();
})();
