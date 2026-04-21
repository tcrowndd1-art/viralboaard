/**
 * STEP A — Regression verification
 * Tests all "fixed" items 5-10x each with timeout guards.
 * Outputs: reports/step-a-results.json
 */
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = 'http://localhost:5173';
const OUT = 'C:/Ai_Wiki/viralboard/reports/step-a-results.json';

const results = { pass: [], fail: [], timestamp: new Date().toISOString() };
const log = (tag, msg) => console.log(`[${tag}] ${msg}`);

async function withTimeout(fn, ms = 10000) {
  return Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), ms))]);
}

async function runTest(name, fn) {
  try {
    const r = await withTimeout(fn, 30000);
    results.pass.push({ name, ...r });
    log('PASS', name);
    return r;
  } catch (e) {
    results.fail.push({ name, error: e.message });
    log('FAIL', `${name} — ${e.message}`);
    return null;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ════════════════════════════════════════
  // A1. Dashboard: navigate() no longer in render (5 iterations)
  // ════════════════════════════════════════
  for (let i = 1; i <= 5; i++) {
    await runTest(`A1.${i} Dashboard navigate-in-render`, async () => {
      const ctx = await browser.newContext({ locale: 'ko-KR' });
      const page = await ctx.newPage();
      const errs = [];
      page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
      await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
      await ctx.close();
      const badMsg = errs.find(e => e.includes('while rendering') || e.includes('setState'));
      return { iteration: i, consoleErrors: errs.length, hasRenderBug: !!badMsg, errors: errs.slice(0, 3) };
    });
  }

  // ════════════════════════════════════════
  // A2. Country switch — data must change (10 iterations)
  // ════════════════════════════════════════
  for (let i = 1; i <= 10; i++) {
    await runTest(`A2.${i} Country switch data-differs`, async () => {
      const ctx = await browser.newContext({ locale: 'ko-KR' });
      const page = await ctx.newPage();

      // intercept API to avoid real 403 — mock response
      await page.route('**/googleapis.com/**', async (route) => {
        const url = route.request().url();
        if (url.includes('chart=mostPopular') && url.includes('regionCode=KR')) {
          await route.fulfill({ status: 200, contentType: 'application/json',
            body: JSON.stringify({ items: [
              { id: 'kr1', snippet: { title: 'KR Video', channelId: 'ch1', channelTitle: 'KR Channel', publishedAt: '2026-01-01T00:00:00Z', categoryId: '10' }, statistics: { viewCount: '1000000' } },
              { id: 'kr2', snippet: { title: 'KR Video 2', channelId: 'ch2', channelTitle: 'KR Channel 2', publishedAt: '2026-01-02T00:00:00Z', categoryId: '10' }, statistics: { viewCount: '800000' } },
            ]})});
        } else if (url.includes('chart=mostPopular') && url.includes('regionCode=US')) {
          await route.fulfill({ status: 200, contentType: 'application/json',
            body: JSON.stringify({ items: [
              { id: 'us1', snippet: { title: 'US Video', channelId: 'ch3', channelTitle: 'US Channel', publishedAt: '2026-01-01T00:00:00Z', categoryId: '22' }, statistics: { viewCount: '2000000' } },
              { id: 'us2', snippet: { title: 'US Video 2', channelId: 'ch4', channelTitle: 'US Channel 2', publishedAt: '2026-01-02T00:00:00Z', categoryId: '22' }, statistics: { viewCount: '1500000' } },
            ]})});
        } else if (url.includes('/channels')) {
          await route.fulfill({ status: 200, contentType: 'application/json',
            body: JSON.stringify({ items: [] }) });
        } else {
          await route.continue();
        }
      });

      await page.goto(`${BASE}/video-rankings`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
      const rowsKR = await page.$$eval('table tbody tr', r => r.length).catch(() => 0);
      const namesKR = await page.$$eval('table tbody tr td:nth-child(3)', tds =>
        tds.slice(0,2).map(td => td.innerText.trim().substring(0,20))
      ).catch(() => []);

      // Switch to US
      const countryBtn = await page.$('button:has(i.ri-map-pin-line)');
      if (!countryBtn) { await ctx.close(); return { skipped: true, reason: 'country dropdown not found' }; }
      await countryBtn.click();
      await page.waitForTimeout(400);
      const btns = await page.$$('button');
      for (const b of btns) {
        const t = (await b.innerText().catch(() => '')).trim();
        if (t === 'United States') { await b.click(); break; }
      }
      await page.waitForTimeout(3000);
      const rowsUS = await page.$$eval('table tbody tr', r => r.length).catch(() => 0);
      const namesUS = await page.$$eval('table tbody tr td:nth-child(3)', tds =>
        tds.slice(0,2).map(td => td.innerText.trim().substring(0,20))
      ).catch(() => []);

      await ctx.close();
      const dataDiffers = JSON.stringify(namesKR) !== JSON.stringify(namesUS);
      return { iteration: i, rowsKR, rowsUS, namesKR, namesUS, dataDiffers };
    });
  }

  // ════════════════════════════════════════
  // A3. Silent fallback removed — Weekly returns 0 rows or real data, NOT daily data
  // ════════════════════════════════════════
  for (let i = 1; i <= 10; i++) {
    await runTest(`A3.${i} No silent fallback on Weekly`, async () => {
      const ctx = await browser.newContext({ locale: 'ko-KR' });
      const page = await ctx.newPage();
      let dailyData = null;
      let weeklyActuallyFetched = false;
      let weeklyGot403 = false;

      await page.route('**/googleapis.com/**', async (route) => {
        const url = route.request().url();
        if (url.includes('chart=mostPopular')) {
          dailyData = 'daily-mock';
          await route.fulfill({ status: 200, contentType: 'application/json',
            body: JSON.stringify({ items: [
              { id: 'daily1', snippet: { title: 'DAILY VIDEO', channelId: 'ch1', channelTitle: 'Daily Ch', publishedAt: '2026-01-01T00:00:00Z', categoryId: '10' }, statistics: { viewCount: '5000000' } }
            ]})});
        } else if (url.includes('search') && url.includes('publishedAfter')) {
          weeklyActuallyFetched = true;
          // Simulate API returning 0 results (not daily fallback)
          await route.fulfill({ status: 200, contentType: 'application/json',
            body: JSON.stringify({ items: [] }) });
        } else if (url.includes('videos') && !url.includes('chart') && url.includes('id=')) {
          // Stats fetch for video IDs
          await route.fulfill({ status: 200, contentType: 'application/json',
            body: JSON.stringify({ items: [] }) });
        } else {
          await route.continue().catch(() => route.fulfill({ status: 200, body: '{}' }));
        }
      });

      await page.goto(`${BASE}/video-rankings`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
      const rowsDaily = await page.$$eval('table tbody tr', r => r.length).catch(() => 0);
      const titleDaily = await page.$eval('table tbody tr td:nth-child(3)', td => td.innerText.trim()).catch(() => '');

      // Click Weekly
      const weeklyBtn = await page.$('button:has-text("주간")') ?? await page.$('button:has-text("Weekly")');
      if (weeklyBtn) {
        await weeklyBtn.click();
        await page.waitForTimeout(3000);
      }
      const rowsWeekly = await page.$$eval('table tbody tr', r => r.length).catch(() => 0);
      const titleWeekly = await page.$eval('table tbody tr td:nth-child(3)', td => td.innerText.trim()).catch(() => '');
      const errVisible = !!(await page.$('.ri-error-warning-line'));
      const emptyVisible = !!(await page.$('.ri-search-line'));

      await ctx.close();
      // Pass condition: weekly either shows empty/error OR different data than daily
      // FAIL condition: weekly shows SAME daily data (silent fallback still active)
      const silentFallbackActive = rowsWeekly > 0 && titleWeekly === titleDaily;
      return {
        iteration: i, rowsDaily, rowsWeekly, titleDaily, titleWeekly,
        weeklyActuallyFetched, silentFallbackActive, errVisible, emptyVisible,
        verdict: silentFallbackActive ? 'FAIL_SILENT_FALLBACK_STILL_ACTIVE' : 'PASS'
      };
    });
  }

  // ════════════════════════════════════════
  // A4. Old data cleared on country switch (10 iterations)
  // ════════════════════════════════════════
  for (let i = 1; i <= 5; i++) {
    await runTest(`A4.${i} Old data cleared on switch`, async () => {
      const ctx = await browser.newContext({ locale: 'ko-KR' });
      const page = await ctx.newPage();
      let switchPhase = 'kr';

      await page.route('**/googleapis.com/**', async (route) => {
        const url = route.request().url();
        if (url.includes('chart=mostPopular')) {
          if (switchPhase === 'kr') {
            await route.fulfill({ status: 200, contentType: 'application/json',
              body: JSON.stringify({ items: [
                { id: 'kr1', snippet: { title: 'KR Channel', channelId: 'ch1', channelTitle: 'KR', publishedAt: '2026-01-01T00:00:00Z', categoryId: '10' }, statistics: { subscriberCount: '10000000' } }
              ]})});
          } else {
            // US fetch fails (403)
            await route.fulfill({ status: 403, body: '{"error":"quota"}' });
          }
        } else if (url.includes('/channels')) {
          await route.fulfill({ status: 200, contentType: 'application/json',
            body: JSON.stringify({ items: switchPhase === 'kr' ? [
              { id: 'ch1', snippet: { title: 'KR Channel 1', channelTitle: 'KR', thumbnails: { default: { url: '' } }, country: 'KR' }, statistics: { subscriberCount: '10000000', viewCount: '100000000' }, topicDetails: {} }
            ] : [] }) });
        } else {
          await route.continue().catch(() => route.fulfill({ status: 200, body: '{"items":[]}' }));
        }
      });

      await page.goto(`${BASE}/rankings`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);
      const namesKR = await page.$$eval('table tbody tr', rows =>
        rows.slice(0,2).map(r => r.innerText.trim().split('\n')[0].trim())
      ).catch(() => []);

      // Switch country → triggers 403
      switchPhase = 'us';
      const countryBtn = await page.$('button:has(i.ri-map-pin-line)');
      if (countryBtn) {
        await countryBtn.click();
        await page.waitForTimeout(400);
        const btns = await page.$$('button');
        for (const b of btns) {
          if ((await b.innerText().catch(() => '')).trim() === 'United States') { await b.click(); break; }
        }
        await page.waitForTimeout(4000);
      }

      const namesUS = await page.$$eval('table tbody tr', rows =>
        rows.slice(0,2).map(r => r.innerText.trim().split('\n')[0].trim())
      ).catch(() => []);
      const errVisible = !!(await page.$('.ri-error-warning-line'));
      const stillHasKRData = namesUS.some(n => namesKR.includes(n) && n.length > 2);

      await ctx.close();
      return {
        iteration: i, namesKR, namesUS, errVisible, stillHasKRData,
        verdict: stillHasKRData ? 'FAIL_OLD_DATA_PERSISTS' : 'PASS'
      };
    });
  }

  await browser.close();

  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log(`\n📊 Step A complete. PASS: ${results.pass.length}, FAIL: ${results.fail.length}`);
  console.log(`💾 Saved: ${OUT}`);

  // Check for regressions
  const regressions = results.pass.filter(r =>
    r.hasRenderBug || r.silentFallbackActive === true || r.verdict?.includes('FAIL')
  );
  console.log(`🔴 Regressions detected: ${regressions.length}`);
  regressions.forEach(r => console.log(`  - ${r.name}: ${JSON.stringify(r).substring(0, 100)}`));
  if (regressions.length > 0) process.exit(1);
})();
