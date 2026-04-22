const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.setViewportSize({ width: 1440, height: 900 });

  // HOME PAGE
  console.log('\n=== HOME PAGE ===');
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/tmp/review-home.png', fullPage: true });
  console.log('Screenshot: C:/tmp/review-home.png');

  // Check #1: Shorts 8-per-row grid
  const shortsGrid = await page.locator('[style*="repeat(8"]').count();
  console.log('Shorts 8-col grid found:', shortsGrid);

  // Check #2: TOP10 label
  const top10 = await page.locator('text=TOP10').isVisible().catch(() => false);
  console.log('TOP10 label visible:', top10);

  // Check popular channels split
  const subOrder = await page.locator('text=구독자순').isVisible().catch(() => false);
  const viewOrder = await page.locator('text=조회수순').isVisible().catch(() => false);
  console.log('구독자순 visible:', subOrder, '/ 조회수순 visible:', viewOrder);

  // Check Shorts category tabs text visible
  const catTab1 = await page.locator('button:has-text("엔터/음악")').first().isVisible().catch(() => false);
  console.log('Category tab text visible (엔터/음악):', catTab1);

  // Check #3: Ad billboards - count anchor elements in the right panel area
  const billboards = await page.locator('a[target="_blank"][rel="noopener noreferrer"]').count();
  console.log('External ad links (billboards):', billboards);

  // Check #6: scrollbar hidden
  const noScrollbar = await page.evaluate(() => {
    const style = document.querySelector('style') || {};
    return document.documentElement.scrollWidth <= window.innerWidth + 20;
  });
  console.log('No horizontal overflow:', noScrollbar);

  // DARK MODE HOME
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/tmp/review-dark-home.png', fullPage: true });
  console.log('Dark home screenshot: C:/tmp/review-dark-home.png');

  // Check Revenue Calc hidden in dark mode
  const revCalc = await page.locator('a[href*="revenue"]').isVisible().catch(() => false);
  console.log('Revenue Calc tab hidden:', !revCalc);

  // VIDEO RANKINGS
  console.log('\n=== VIDEO RANKINGS ===');
  await page.goto(`${TARGET_URL}/video-rankings`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/tmp/review-dark-video-rankings.png', fullPage: true });
  console.log('Dark mode video rankings: C:/tmp/review-dark-video-rankings.png');

  // Check category pills text visible
  const allButtons = await page.locator('button').allTextContents();
  const catVisible = allButtons.some(t => t.includes('전체') || t.includes('음악'));
  console.log('Category pill text visible:', catVisible);

  // Check unified table structure - revenue column
  const revenueCol = await page.locator('text=수익 추정').isVisible().catch(() => false);
  console.log('Revenue column visible:', revenueCol);

  const vphCol = await page.locator('text=VPH').isVisible().catch(() => false);
  console.log('VPH column visible:', vphCol);

  // Check multiplier text
  const multiText = await page.locator('text=×').count();
  console.log('× multiplier badges count:', multiText);

  // CHANNEL RANKINGS
  console.log('\n=== CHANNEL RANKINGS ===');
  await page.goto(`${TARGET_URL}/rankings`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/tmp/review-dark-channel-rankings.png', fullPage: true });
  console.log('Dark channel rankings: C:/tmp/review-dark-channel-rankings.png');

  const avgViews = await page.locator('text=평균 조회수').isVisible().catch(() => false);
  console.log('평균 조회수 column visible:', avgViews);

  const vidSpeed = await page.locator('text=영상당 속도').isVisible().catch(() => false);
  console.log('영상당 속도 column visible:', vidSpeed);

  // LOGO CHECK
  console.log('\n=== LOGO POSITION ===');
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  const logoEl = await page.locator('text=VIRALBOARD').first();
  const logoBox = await logoEl.boundingBox().catch(() => null);
  if (logoBox) console.log('Logo bounding box:', JSON.stringify(logoBox));

  console.log('\n=== CONSOLE ERRORS ===');
  if (consoleErrors.length === 0) {
    console.log('No console errors!');
  } else {
    consoleErrors.slice(0, 10).forEach(e => console.log('ERROR:', e));
  }

  console.log('\nAll checks done.');
  await browser.close();
})();
