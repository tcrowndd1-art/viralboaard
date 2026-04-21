/** Step D: Verify quota banner appears when 403 mock fires */
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ko-KR' });
  const page = await ctx.newPage();

  // Force ALL googleapis calls to return 403
  await page.route('**/googleapis.com/**', route =>
    route.fulfill({ status: 403, body: '{"error":{"code":403,"message":"quota"}}' })
  );

  await page.goto('http://localhost:5173/rankings', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(4000);

  const bannerVisible = !!(await page.$('.ri-database-2-line'));
  const bannerText = await page.$eval('.ri-database-2-line', el =>
    el.closest('div')?.innerText?.trim().substring(0, 80) ?? ''
  ).catch(() => '');
  const errorUI = !!(await page.$('.ri-error-warning-line'));
  const retryBtn = !!(await page.$('button:has-text("다시 시도")'));

  console.log('quota_banner_visible:', bannerVisible);
  console.log('banner_text:', bannerText);
  console.log('error_ui_visible:', errorUI);
  console.log('retry_button_visible:', retryBtn);

  // Verify localStorage was written
  const quotaKey = await page.evaluate(() => localStorage.getItem('vb_quota_exhausted_until'));
  console.log('quota_localStorage_set:', !!quotaKey);
  console.log('quota_expires_at:', quotaKey ? new Date(Number(quotaKey)).toISOString() : 'not set');

  await page.screenshot({ path: 'C:/Ai_Wiki/viralboard/reports/quota-banner-test.png' });

  const result = {
    bannerVisible, bannerText, errorUI, retryBtn,
    quotaLocalStorageSet: !!quotaKey,
    verdict: bannerVisible && errorUI ? 'PASS' : 'PARTIAL'
  };
  fs.writeFileSync('C:/Ai_Wiki/viralboard/reports/step-d-results.json', JSON.stringify(result, null, 2));
  console.log('\nverdict:', result.verdict);
  await browser.close();
})();
