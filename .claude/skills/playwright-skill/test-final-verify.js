const { chromium } = require('playwright');
const TARGET_URL = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Full viewport
  await page.screenshot({ path: 'C:/tmp/final-home.png', fullPage: false });
  console.log('Final home: C:/tmp/final-home.png');

  // Country filter bar (top area)
  const firstBtn = await page.locator('button:has-text("🌏 전체")').first().boundingBox();
  if (firstBtn) {
    await page.screenshot({ path: 'C:/tmp/final-filter.png', clip: { x: 180, y: firstBtn.y - 8, width: 1100, height: 60 } });
    console.log('Filter bar: C:/tmp/final-filter.png');
    console.log('Country 전체 btn x position:', firstBtn.x, '(should be leftmost ~190px)');
  }

  // Test country filter click
  await page.locator('button:has-text("🇰🇷KR")').first().click().catch(() => {
    console.log('KR button not found directly - checking available country buttons');
  });
  const countryBtns = await page.locator('button').filter({ hasText: /🌏|🇰🇷|🇺🇸/ }).allTextContents();
  console.log('Country buttons visible:', countryBtns.slice(0, 5));

  await browser.close();
})();
