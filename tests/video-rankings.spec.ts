import { test, expect } from '@playwright/test';
import { mockYouTubeApi } from './mocks';

async function waitForVideoData(page: any, timeout = 20000) {
  await expect(page.locator('tbody tr p.font-medium').first()).toBeVisible({ timeout });
}

test.describe('Video Rankings Page', () => {
  test('페이지 로드 → 영상 최소 5개, 각각 제목 텍스트 있음', async ({ page }) => {
    await mockYouTubeApi(page);
    await page.goto('/video-rankings');
    await waitForVideoData(page);

    const titleCells = page.locator('tbody tr p.font-medium');
    const count = await titleCells.count();
    expect(count).toBeGreaterThanOrEqual(5);

    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = await titleCells.nth(i).textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('Weekly 클릭 → 데이터 최소 1개', async ({ page }) => {
    await mockYouTubeApi(page);
    await page.goto('/video-rankings');
    await waitForVideoData(page);

    await page.getByRole('button', { name: 'Weekly' }).click();
    await expect(page.locator('tbody tr p.font-medium').first()).toBeVisible({ timeout: 5000 });

    const count = await page.locator('tbody tr p.font-medium').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('Monthly 클릭 → 데이터 최소 1개', async ({ page }) => {
    await mockYouTubeApi(page);
    await page.goto('/video-rankings');
    await waitForVideoData(page);

    await page.getByRole('button', { name: 'Monthly' }).click();
    await expect(page.locator('tbody tr p.font-medium').first()).toBeVisible({ timeout: 5000 });

    const count = await page.locator('tbody tr p.font-medium').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
