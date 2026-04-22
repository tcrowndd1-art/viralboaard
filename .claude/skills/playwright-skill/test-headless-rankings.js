const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch({ headless: true }); // headless to avoid GPU crash
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text());
    if (msg.type() === 'warning') errors.push('WARN: ' + msg.text());
  });
  page.on('pageerror', err => errors.push('PAGE: ' + err.message));

  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Testing channel rankings (headless)...');
  await page.goto(`${TARGET_URL}/rankings`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'C:/tmp/channel-headless.png', fullPage: true });
  console.log('Screenshot: C:/tmp/channel-headless.png');

  const avgViews = await page.locator('th:has-text("평균 조회수")').isVisible().catch(() => false);
  const vidSpeed = await page.locator('th:has-text("영상당 속도")').isVisible().catch(() => false);
  console.log('평균 조회수 header:', avgViews);
  console.log('영상당 속도 header:', vidSpeed);

  const rows = await page.locator('tbody tr').count();
  console.log('Table rows:', rows);

  console.log('Errors:', errors);

  await browser.close();
})();
