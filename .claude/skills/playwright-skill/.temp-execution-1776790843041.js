const { chromium } = require('playwright');
const TARGET_URL = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForSelector('header', { timeout: 15000 });

  // 1. Screenshot popular channels section
  await page.screenshot({ path: 'c:/tmp/vb-popular-channels.png', clip: { x: 208, y: 260, width: 900, height: 420 } });
  console.log('📸 Popular channels: c:/tmp/vb-popular-channels.png');

  // 2. Click language button and screenshot modal
  const langBtn = await page.$('button:has(i.ri-global-line)');
  if (langBtn) {
    await langBtn.click();
    await page.waitForSelector('button:has(.ri-check-line)', { timeout: 3000 }).catch(() => {});
    await page.screenshot({ path: 'c:/tmp/vb-lang-modal.png' });
    console.log('📸 Language modal: c:/tmp/vb-lang-modal.png');
    // close modal
    await page.keyboard.press('Escape');
  }

  await context.close();
  await browser.close();
  console.log('✅ Done');
})();
