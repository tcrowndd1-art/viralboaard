import { test, expect } from '@playwright/test';

test.describe('Dark Mode Toggle', () => {
  test('다크/라이트 토글 클릭 → 테마 전환', async ({ page }) => {
    await page.goto('/');

    // The toggle button title changes depending on current mode
    const toggle = page.locator('button[title="Switch to Dark Mode"], button[title="Switch to Light Mode"]');
    await expect(toggle).toBeVisible();

    // Get initial state
    const htmlEl = page.locator('html');
    const initialClasses = await htmlEl.getAttribute('class') ?? '';
    const wasInitiallyDark = initialClasses.includes('dark');

    // Click toggle
    await toggle.click();

    // Verify state changed
    const newClasses = await htmlEl.getAttribute('class') ?? '';
    const isNowDark = newClasses.includes('dark');
    expect(isNowDark).toBe(!wasInitiallyDark);
  });

  test('body 또는 html에 transition CSS 속성 존재', async ({ page }) => {
    await page.goto('/');

    // The main layout div has "transition-colors" which applies CSS transitions
    const hasTransition = await page.evaluate(() => {
      const candidates = [
        document.querySelector('.transition-colors'),
        document.querySelector('[class*="transition"]'),
      ];
      for (const el of candidates) {
        if (!el) continue;
        const style = window.getComputedStyle(el);
        if (style.transitionProperty && style.transitionProperty !== 'none') return true;
      }
      return false;
    });
    expect(hasTransition).toBe(true);
  });
});
