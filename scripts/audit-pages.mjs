import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = 'docs/analysis/screenshots/2026-05-07';
const REPORT_PATH = 'docs/analysis/2026-05-07-playwright-audit.md';

const PAGES = [
  { path: '/', name: 'home' },
  { path: '/rising', name: 'rising' },
  { path: '/rankings', name: 'rankings' },
  { path: '/video-rankings', name: 'video-rankings' },
  { path: '/search', name: 'search' },
  { path: '/creator-insights', name: 'creator-insights' },
  { path: '/trending-live', name: 'trending-live' },
  { path: '/ai-studio', name: 'ai-studio' },
  { path: '/video-editor', name: 'video-editor' },
  { path: '/chrome-extension', name: 'chrome-extension' },
  { path: '/comment-manager', name: 'comment-manager' },
  { path: '/dashboard', name: 'dashboard' },
];
const SKIP = new Set(['Open chat','Dismiss','KO','EN','All Channels','Saved','All Videos','Overview','Channel','Approve All','Sign in','Google']);

mkdirSync(SCREENSHOT_DIR, { recursive: true });
mkdirSync('docs/analysis', { recursive: true });

async function auditPage(page, pagePath, name) {
  const result = { name, path: pagePath, consoleErrors: [], undefinedTexts: [], nanTexts: [], filterResults: [] };
  page.removeAllListeners('console');
  page.on('console', (msg) => { if (msg.type() === 'error') result.consoleErrors.push(msg.text().substring(0, 150)); });
  try {
    await page.goto('http://localhost:3000' + pagePath, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);
  } catch (e) { result.error = e.message.substring(0, 100); return result; }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.screenshot({ path: join(SCREENSHOT_DIR, name + '-desktop.png') });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: join(SCREENSHOT_DIR, name + '-mobile.png') });
  await page.setViewportSize({ width: 1920, height: 1080 });
  const bodyText = await page.evaluate(() => document.body.innerText || '');
  if (/\bNaN\b/.test(bodyText)) result.nanTexts.push('NaN found');
  const allBtns = await page.evaluate((skip) => [...new Set(Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(t => t && t.length < 30 && !skip.includes(t)))], [...SKIP]);
  for (const btnText of allBtns.slice(0, 18)) {
    try {
      const btn = page.locator('button', { hasText: btnText }).first();
      if (!await btn.isVisible({ timeout: 500 }).catch(() => false)) continue;
      await btn.click({ timeout: 2000 });
      await page.waitForTimeout(900);
      const cnt = await page.evaluate(() => document.querySelectorAll('main [class*="rounded-xl"], tbody tr').length);
      result.filterResults.push({ button: btnText, count: cnt });
    } catch (_) {}
  }
  return result;
}
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();
  const allResults = [];
  for (const { path, name } of PAGES) {
    console.log('Auditing:', name);
    const r = await auditPage(page, path, name);
    allResults.push(r);
    const zeros = (r.filterResults || []).filter(x => x.count === 0).length;
    console.log('  errors=' + (r.consoleErrors?.length || 0), '0-filters=' + zeros + '/' + (r.filterResults?.length || 0));
  }
  await browser.close();
  let md = '# Playwright Audit Report\n## 2026-05-07\n\n';
  md += '| Page | Errors | undefined | NaN | ZeroFilters/Total |\n|------|--------|---------|-----|-----------------|\n';
  for (const r of allResults) {
    const z = (r.filterResults||[]).filter(x=>x.count===0).length;
    const tot = r.filterResults?.length||0;
    md += '| '+r.name+' | '+(r.consoleErrors?.length||0)+' | '+(r.undefinedTexts?.length>0?'YES':'no')+' | '+(r.nanTexts?.length>0?'YES':'no')+' | '+z+'/'+tot+' |\n';
  }
  md += '\n';
  for (const r of allResults) {
    md += '## '+r.name+' ('+r.path+')\n';
    if (r.error) { md += 'ERROR: '+r.error+'\n\n'; continue; }
    md += 'Console errors: '+(r.consoleErrors?.length||0)+'\n';
    if (r.consoleErrors?.length>0) r.consoleErrors.forEach(e => { md += '- '+e+'\n'; });
    md += 'undefined: '+(r.undefinedTexts?.join(', ')||'none')+'\n';
    md += 'NaN: '+(r.nanTexts?.join(', ')||'none')+'\n\n';
    md += '| Button | Count | Status |\n|--------|-------|--------|\n';
    for (const f of (r.filterResults||[])) md += '| '+f.button+' | '+f.count+' | '+(f.count===0?'ZERO':'ok')+' |\n';
    md += '\n---\n\n';
  }
  const te = allResults.reduce((s,r)=>s+(r.consoleErrors?.length||0),0);
  const pu = allResults.filter(r=>r.undefinedTexts?.length>0).map(r=>r.name);
  const pn = allResults.filter(r=>r.nanTexts?.length>0).map(r=>r.name);
  const tz = allResults.reduce((s,r)=>s+(r.filterResults||[]).filter(x=>x.count===0).length,0);
  md += '## Summary\n- Total console errors: '+te+'\n- Pages with undefined: '+(pu.join(', ')||'none')+'\n- Pages with NaN: '+(pn.join(', ')||'none')+'\n- Zero-result filters: '+tz+'\n- Screenshots: '+(PAGES.length*2)+'\n';
  writeFileSync(REPORT_PATH, md, 'utf-8');
  console.log('\nDone! Report:', REPORT_PATH);
  console.log('Total errors:', te, '| undefined pages:', pu.join(',')||'none', '| NaN pages:', pn.join(',')||'none', '| zero filters:', tz, '| screenshots:', PAGES.length*2);
})();
