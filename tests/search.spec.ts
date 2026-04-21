import { test, expect } from '@playwright/test';
import { mockYouTubeApi } from './mocks';

async function waitForSearchResults(page: any) {
  await page.waitForFunction(
    () => {
      const spinner = document.querySelector('.animate-spin');
      const grid = document.querySelector('div.grid.gap-4');
      const emptyIcon = document.querySelector('i.ri-search-line');
      return !spinner && (grid !== null || emptyIcon !== null);
    },
    { timeout: 20000 }
  );
}

test.describe('Search Page', () => {
  test('페이지 로드', async ({ page }) => {
    await mockYouTubeApi(page);
    await page.goto('/search');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('"뉴진스" 한글 검색 → 결과 카드 최소 3개', async ({ page }) => {
    await mockYouTubeApi(page);
    await page.goto('/search?q=뉴진스');
    await waitForSearchResults(page);

    const grid = page.locator('div.grid.gap-4').first();
    await expect(grid).toBeVisible();
    const cards = grid.locator('h3');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('각 카드에 채널명 또는 영상 제목 텍스트 존재', async ({ page }) => {
    await mockYouTubeApi(page);
    await page.goto('/search?q=뉴진스');
    await waitForSearchResults(page);

    const cards = page.locator('div.grid.gap-4 h3');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < Math.min(count, 3); i++) {
      const text = await cards.nth(i).textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('All 탭 클릭 → 에러 없음 + 결과 있음', async ({ page }) => {
    await mockYouTubeApi(page);
    await page.goto('/search?q=뉴진스');
    await waitForSearchResults(page);
    await page.getByRole('button', { name: /^All/ }).click();
    await expect(page).not.toHaveURL(/error/);
    await expect(page.locator('div.grid.gap-4 h3').first()).toBeVisible();
  });

  test('Videos 탭 클릭 → 에러 없음 + 결과 있음', async ({ page }) => {
    await mockYouTubeApi(page);
    await page.goto('/search?q=뉴진스');
    await waitForSearchResults(page);
    await page.getByRole('button', { name: /^Videos/ }).click();
    await expect(page).not.toHaveURL(/error/);
    await expect(page.locator('div.grid.gap-4 h3').first()).toBeVisible();
  });

  test('Channels 탭 클릭 → 에러 없음 + 결과 있음', async ({ page }) => {
    await mockYouTubeApi(page);
    await page.goto('/search?q=뉴진스');
    await waitForSearchResults(page);
    await page.getByRole('button', { name: /^Channels/ }).click();
    await expect(page).not.toHaveURL(/error/);
    await expect(page.locator('div.grid.gap-4 h3').first()).toBeVisible();
  });
});
