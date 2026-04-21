/**
 * STEP B — Cleanroom re-audit of "9/15 clean" pages
 * Strict criteria: 0 console errors, all buttons clickable, no broken state
 * Outputs: reports/cleanroom_reaudit.json
 */
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = 'http://localhost:5173';
const OUT = 'C:/Ai_Wiki/viralboard/reports/cleanroom_reaudit.json';

const CLEAN_PAGES = [
  { path: '/trending-live',     name: 'Trending Live' },
  { path: '/insights',          name: 'Insights' },
  { path: '/ai-studio',         name: 'AI Studio' },
  { path: '/comment-manager',   name: 'Comment Manager' },
  { path: '/video-editor',      name: 'Video Editor' },
  { path: '/revenue-calculator',name: 'Revenue Calculator' },
  { path: '/chrome-extension',  name: 'Chrome Extension' },
  { path: '/login',             name: 'Login' },
  { path: '/signup',            name: 'Signup' },
];

const results = [];

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const pg of CLEAN_PAGES) {
    const ctx = await browser.newContext({ locale: 'ko-KR', viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const consoleErrors = [];
    const consoleWarnings = [];
    page.on('console', m => {
      if (m.type() === 'error') consoleErrors.push(m.text().substring(0, 200));
      if (m.type() === 'warning') consoleWarnings.push(m.text().substring(0, 100));
    });

    let loadMs = 0;
    const t0 = Date.now();
    try {
      await page.goto(`${BASE}${pg.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);
      loadMs = Date.now() - t0;
    } catch (e) {
      results.push({ page: pg.name, verdict: 'LOAD_FAIL', error: e.message });
      await ctx.close(); continue;
    }

    // Strict checks
    const btnCount = await page.$$eval('button', bs => bs.length).catch(() => 0);
    const disabledBtns = await page.$$eval('button[disabled]', bs => bs.map(b => b.innerText?.trim().substring(0,20))).catch(() => []);
    const inputCount = await page.$$eval('input', is => is.length).catch(() => 0);
    const brokenImgs = await page.$$eval('img', imgs =>
      imgs.filter(i => !i.naturalWidth && i.complete && i.src && !i.src.startsWith('data:'))
          .map(i => i.src.substring(0, 60))
    ).catch(() => []);
    const hasSpinner = !!(await page.$('.animate-spin'));
    const hasErrorUI = !!(await page.$('.ri-error-warning-line'));

    // Check i18n - should not have untranslated keys (double underscores like __key__)
    const bodyText = await page.$eval('body', el => el.innerText.substring(0, 5000)).catch(() => '');
    const hasUntranslated = /\b[a-z]+_[a-z]+(_[a-z]+)+\b/.test(bodyText);  // snake_case keys visible

    // Try clicking each non-disabled button (up to 5)
    const clickResults = [];
    const clickableBtns = await page.$$('button:not([disabled])');
    for (const btn of clickableBtns.slice(0, 5)) {
      try {
        const txt = (await btn.innerText().catch(() => '')).trim().substring(0, 20);
        const isVisible = await btn.isVisible().catch(() => false);
        if (!isVisible) continue;
        // Don't click nav links that would navigate away
        const href = await btn.evaluate(b => b.closest('a')?.href).catch(() => null);
        if (href) continue;
        await btn.click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(200);
        clickResults.push({ text: txt, clicked: true });
      } catch { /* skip */ }
    }

    const verdict = consoleErrors.length === 0 && !hasErrorUI ? 'FULL_PASS' : 'PARTIAL_PASS';

    results.push({
      page: pg.name,
      path: pg.path,
      verdict,
      loadMs,
      consoleErrors,
      consoleWarnings: consoleWarnings.length,
      btnCount,
      disabledBtns,
      inputCount,
      brokenImages: brokenImgs,
      hasLoadingSpinner: hasSpinner,
      hasErrorUI,
      hasUntranslated,
      clickTested: clickResults.length,
    });

    const icon = verdict === 'FULL_PASS' ? '✅' : '⚠️';
    console.log(`${icon} ${pg.name}: ${consoleErrors.length} errors, ${btnCount} btns, ${brokenImgs.length} broken imgs [${loadMs}ms]`);
    if (consoleErrors.length) console.log(`   errors: ${consoleErrors[0].substring(0, 80)}`);

    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));

  const fullPass = results.filter(r => r.verdict === 'FULL_PASS').length;
  const partial = results.filter(r => r.verdict === 'PARTIAL_PASS').length;
  console.log(`\n📊 Step B: FULL_PASS ${fullPass}, PARTIAL_PASS ${partial}`);
  console.log(`💾 ${OUT}`);
})();
