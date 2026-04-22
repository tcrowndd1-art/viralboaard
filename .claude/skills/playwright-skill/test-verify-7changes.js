const { chromium } = require('playwright');
const TARGET_URL = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // Light mode home
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/tmp/v7-home-light.png', fullPage: false });
  console.log('Home light: C:/tmp/v7-home-light.png');

  // Dark mode home
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/tmp/v7-home-dark.png', fullPage: false });
  console.log('Home dark: C:/tmp/v7-home-dark.png');

  // Full page dark
  await page.screenshot({ path: 'C:/tmp/v7-home-dark-full.png', fullPage: true });
  console.log('Home dark full: C:/tmp/v7-home-dark-full.png');

  // Check TOП10 gold
  const top10 = await page.locator('text=TOP10').first();
  const top10Style = await top10.evaluate(el => window.getComputedStyle(el).background);
  console.log('TOP10 background:', top10Style.substring(0, 80));

  // Check no CatTabs inside Shorts (no buttons with 교육·기술 in Shorts area)
  const dupTabs = await page.locator('button:has-text("📚 교육·기술")').count();
  console.log('Duplicate 교육·기술 tabs (should be 0):', dupTabs);

  // Check country select
  const countrySelect = await page.locator('select').count();
  console.log('Country select dropdowns:', countrySelect);

  // Check new TopViews section
  const topViewsSection = await page.locator('text=전체 조회수 TOP').isVisible().catch(() => false);
  console.log('전체 조회수 TOP section visible:', topViewsSection);

  // Check viral legend labels
  const superViral = await page.locator('text=초바이럴').isVisible().catch(() => false);
  console.log('초바이럴 legend visible:', superViral);

  await browser.close();
  console.log('\nDone.');
})();
