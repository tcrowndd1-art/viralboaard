import { test, expect } from '@playwright/test';
import { mockYouTubeApi } from './mocks';

async function waitForChannelData(page: any, timeout = 20000) {
  await expect(page.locator('tbody tr td span.font-medium').first()).toBeVisible({ timeout });
}

test.describe('Rankings Page', () => {
  test('페이지 로드 → 채널 최소 5개, 각각 채널명 텍스트 있음', async ({ page }) => {
    await mockYouTubeApi(page);
    await page.goto('/rankings');
    await waitForChannelData(page);

    const nameSpans = page.locator('tbody tr td span.font-medium');
    const count = await nameSpans.count();
    expect(count).toBeGreaterThanOrEqual(5);

    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = await nameSpans.nth(i).textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('Weekly 클릭 → 데이터 최소 1개', async ({ page }) => {
    await mockYouTubeApi(page);
    await page.goto('/rankings');
    await waitForChannelData(page);

    await page.getByRole('button', { name: 'Weekly' }).click();
    await expect(page.locator('tbody tr td span.font-medium').first()).toBeVisible({ timeout: 5000 });

    const count = await page.locator('tbody tr td span.font-medium').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('Monthly 클릭 → 데이터 최소 1개', async ({ page }) => {
    await mockYouTubeApi(page);
    await page.goto('/rankings');
    await waitForChannelData(page);

    await page.getByRole('button', { name: 'Monthly' }).click();
    await expect(page.locator('tbody tr td span.font-medium').first()).toBeVisible({ timeout: 5000 });

    const count = await page.locator('tbody tr td span.font-medium').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
