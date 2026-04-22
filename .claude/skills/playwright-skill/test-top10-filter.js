const { chromium } = require('playwright');
const TARGET_URL = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Find TOP10 badge
  const top10Box = await page.locator('text=TOP10').first().boundingBox();
  if (top10Box) {
    await page.screenshot({ path: 'C:/tmp/top10-gold.png', clip: { x: 180, y: top10Box.y - 10, width: 800, height: 60 } });
    console.log('TOP10 area: C:/tmp/top10-gold.png');
  }

  // Find category filter bar
  const catFilter = await page.locator('button:has-text("전체")').first().boundingBox();
  if (catFilter) {
    await page.screenshot({ path: 'C:/tmp/cat-filter.png', clip: { x: 180, y: catFilter.y - 5, width: 1100, height: 55 } });
    console.log('Category filter: C:/tmp/cat-filter.png');
  }

  await browser.close();
})();
