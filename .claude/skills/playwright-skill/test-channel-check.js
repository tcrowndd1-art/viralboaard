const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: 'dark' });

  // CHANNEL RANKINGS
  console.log('Going to channel rankings...');
  try {
    await page.goto(`${TARGET_URL}/rankings`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'C:/tmp/review-channel-rankings.png', fullPage: true });
    console.log('Screenshot saved: C:/tmp/review-channel-rankings.png');

    const avgViews = await page.locator('th:has-text("평균 조회수")').isVisible().catch(() => false);
    console.log('평균 조회수 column header visible:', avgViews);

    const vidSpeed = await page.locator('th:has-text("영상당 속도")').isVisible().catch(() => false);
    console.log('영상당 속도 column header visible:', vidSpeed);

    // Get all th text
    const headers = await page.locator('th').allTextContents();
    console.log('Table headers:', headers);

    // Shorts category tabs on home page
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/tmp/review-dark-shorts.png', fullPage: false, clip: { x: 0, y: 200, width: 1440, height: 600 } });
    console.log('Shorts area: C:/tmp/review-dark-shorts.png');

    // Check shorts buttons
    const shortsBtns = await page.locator('button').allTextContents();
    console.log('All button texts:', shortsBtns.slice(0, 20));

  } catch (err) {
    console.log('Error:', err.message);
  }

  console.log('\nConsole errors:', consoleErrors.slice(0, 5));

  await browser.close();
})();
