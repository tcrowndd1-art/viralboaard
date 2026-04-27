/**
 * verify-deploy.js
 * Usage: node scripts/verify-deploy.js [url]
 *   url defaults to https://viralboard-v2.vercel.app
 */

import puppeteer from 'puppeteer';

const BASE = process.argv[2] ?? 'https://viralboard-v2.vercel.app';

const PAGES = [
  {
    path: '/',
    label: 'Home',
    mustContain: ['ViralBoard'],
    noAdsInHero: true,
  },
  {
    path: '/search',
    label: 'Search',
    mustContain: ['search'],
  },
  {
    path: '/channel/UCX6OQ3DkcsbYNE6H8uQQuVA',
    label: 'Channel Detail (MrBeast)',
    mustContain: ['Country Rank'],
  },
  {
    path: '/video-rankings',
    label: 'Video Rankings',
    mustContain: [],
  },
  {
    path: '/channel-rankings',
    label: 'Channel Rankings',
    mustContain: [],
  },
];

const TIMEOUT = 15_000;

async function checkPage(page, { path, label, mustContain = [], noAdsInHero = false }) {
  const url = BASE + path;
  const errors = [];

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: TIMEOUT });
  } catch (e) {
    errors.push(`Navigation failed: ${e.message}`);
    return { label, url, passed: false, errors };
  }

  // Wait for React render
  await new Promise((r) => setTimeout(r, 1500));

  const bodyText = await page.evaluate(() => document.body?.innerText ?? '');

  // Text presence checks (case-insensitive)
  for (const text of mustContain) {
    if (!bodyText.toLowerCase().includes(text.toLowerCase())) {
      errors.push(`Missing text: "${text}"`);
    }
  }

  // Hero ad check: after issue #9, hero right-side should only have CreatorWall
  if (noAdsInHero) {
    const heroAdCount = await page.evaluate(() => {
      // SearchBanner hero section
      const hero = document.querySelector('[class*="border-b"][class*="py-6"]');
      if (!hero) return 0;
      // Ad cards have a CTA button + brand name pattern
      const btns = hero.querySelectorAll('button, a[class*="rounded"]');
      let adLike = 0;
      btns.forEach((el) => {
        const txt = (el.textContent ?? '').trim();
        if (txt.length > 0 && txt.length < 20 && /grow|launch|boost|start|try|get/i.test(txt)) adLike++;
      });
      return adLike;
    });
    if (heroAdCount > 0) {
      errors.push(`Hero area may still contain ${heroAdCount} ad CTA(s)`);
    }
  }

  // Filter out known-benign console noise
  const realErrors = consoleErrors.filter(
    (e) =>
      !e.includes('favicon') &&
      !e.includes('net::ERR_') &&
      !e.includes('ResizeObserver') &&
      !e.includes('Non-Error promise rejection') &&
      !e.includes('content-security-policy')
  );
  if (realErrors.length > 0) {
    errors.push(`Console errors (${realErrors.length}): ${realErrors.slice(0, 2).join(' | ')}`);
  }

  return { label, url, passed: errors.length === 0, errors };
}

async function run() {
  console.log(`\n🔍 Verifying: ${BASE}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = [];
  for (const spec of PAGES) {
    process.stdout.write(`   ${spec.label.padEnd(30)} ... `);
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    const result = await checkPage(page, spec);
    results.push(result);
    await page.close();
    console.log(result.passed ? '✅' : '❌');
    if (!result.passed) result.errors.forEach((e) => console.log(`     ↳ ${e}`));
  }

  await browser.close();

  const passed = results.filter((r) => r.passed).length;
  const allPassed = passed === results.length;
  console.log(`\n${allPassed ? '✅' : '❌'} ${passed}/${results.length} passed\n`);
  process.exit(allPassed ? 0 : 1);
}

run().catch((e) => {
  console.error('verify-deploy crashed:', e.message);
  process.exit(1);
});
