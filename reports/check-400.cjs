const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const failed = [];
  page.on('response', async r => {
    if (!r.ok()) failed.push({ status: r.status(), url: r.url().substring(0, 150) });
  });
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  console.log('Failed on /login:', JSON.stringify(failed, null, 2));
  await browser.close();
})();
