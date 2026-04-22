const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text());
  });
  page.on('pageerror', err => errors.push('PAGE: ' + err.message));
  page.on('crash', () => errors.push('BROWSER CRASHED'));

  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Navigating to channel rankings...');

  // Use navigation with timeout catch
  const navResult = await page.goto(`${TARGET_URL}/rankings`, {
    waitUntil: 'domcontentloaded',
    timeout: 20000,
  }).catch(e => ({ error: e.message }));

  if (navResult && navResult.error) {
    console.log('Navigation error:', navResult.error);
  } else {
    console.log('Navigation status:', navResult?.status?.());
  }

  // Wait a bit and capture state
  await new Promise(r => setTimeout(r, 3000));

  // Try screenshot
  try {
    await page.screenshot({ path: 'C:/tmp/channel-debug.png', fullPage: true });
    console.log('Screenshot saved');
  } catch(e) {
    console.log('Screenshot failed:', e.message);
  }

  console.log('Errors collected:', errors);

  await browser.close().catch(() => {});
})();
