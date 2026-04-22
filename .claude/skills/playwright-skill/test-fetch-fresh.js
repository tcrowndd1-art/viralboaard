const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  const apiCalls = [];
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('request', req => {
    if (req.url().includes('youtube.googleapis.com') || req.url().includes('www.googleapis.com')) {
      apiCalls.push(req.url().substring(0, 80) + '...');
    }
  });

  await page.setViewportSize({ width: 1440, height: 900 });

  // First: load the page to get access to localStorage
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

  // Clear ALL viralboard cache keys
  const cleared = await page.evaluate(() => {
    const keys = Object.keys(localStorage).filter(k =>
      k.startsWith('vb_') || k.startsWith('viralboard_') || k.startsWith('yt_')
    );
    keys.forEach(k => localStorage.removeItem(k));
    return keys;
  });
  console.log('Cleared cache keys:', cleared);

  // HOME PAGE - reload to trigger fresh API calls
  console.log('\n--- Loading Home page (fresh) ---');
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'C:/tmp/fresh-home.png', fullPage: false });
  console.log('Home screenshot: C:/tmp/fresh-home.png');
  console.log('API calls so far:', apiCalls.length);

  // VIDEO RANKINGS - clear and load
  console.log('\n--- Loading Video Rankings (fresh) ---');
  await page.goto(`${TARGET_URL}/video-rankings`, { waitUntil: 'domcontentloaded' });
  // Clear cache again in case it was re-set
  await page.evaluate(() => {
    Object.keys(localStorage).filter(k => k.startsWith('vb_')).forEach(k => localStorage.removeItem(k));
  });
  await page.goto(`${TARGET_URL}/video-rankings`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'C:/tmp/fresh-video-rankings.png', fullPage: false });
  console.log('Video rankings screenshot: C:/tmp/fresh-video-rankings.png');

  // CHANNEL RANKINGS
  console.log('\n--- Loading Channel Rankings (fresh) ---');
  await page.goto(`${TARGET_URL}/rankings`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    Object.keys(localStorage).filter(k => k.startsWith('vb_')).forEach(k => localStorage.removeItem(k));
  });
  await page.goto(`${TARGET_URL}/rankings`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'C:/tmp/fresh-channel-rankings.png', fullPage: false });
  console.log('Channel rankings screenshot: C:/tmp/fresh-channel-rankings.png');

  console.log('\n=== Summary ===');
  console.log('Total YouTube API calls:', apiCalls.length);
  if (apiCalls.length > 0) {
    console.log('API call examples:', apiCalls.slice(0, 5));
  }
  console.log('Console errors:', errors.slice(0, 5));

  await browser.close();
})();
