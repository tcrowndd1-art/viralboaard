const { chromium } = require('playwright');
const TARGET_URL = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Billboard close-up (top right area)
  await page.screenshot({ path: 'C:/tmp/closeup-billboard.png', clip: { x: 780, y: 48, width: 660, height: 160 } });
  console.log('Billboard: C:/tmp/closeup-billboard.png');

  // TOP10 + category filter row
  await page.screenshot({ path: 'C:/tmp/closeup-top10.png', clip: { x: 0, y: 170, width: 1440, height: 130 } });
  console.log('TOP10: C:/tmp/closeup-top10.png');

  // Shorts rows close-up
  const shortsEl = await page.locator('text=Shorts').first().boundingBox();
  if (shortsEl) {
    await page.screenshot({ path: 'C:/tmp/closeup-shorts.png', clip: { x: 0, y: shortsEl.y - 5, width: 1440, height: 700 } });
    console.log('Shorts: C:/tmp/closeup-shorts.png');
  }

  await browser.close();
})();
