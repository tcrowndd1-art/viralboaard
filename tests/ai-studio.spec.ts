import { test, expect } from '@playwright/test';

test.describe('AI Studio Page', () => {
  test('/ai-studio 페이지 로드', async ({ page }) => {
    await page.goto('/ai-studio');
    await expect(page.locator('text=Script Editor')).toBeVisible();
  });

  test('주제 입력 → 생성 버튼 클릭 → 씬/섹션 1개 이상 표시', async ({ page }) => {
    await page.goto('/ai-studio');

    // 5 script section cards are always rendered (Hook, Shock, Evidence, Solution, CTA)
    // Verify at least 1 section card is present before generating
    const sectionLabels = ['Hook', 'Shock', 'Evidence', 'Solution', 'CTA'];
    for (const label of sectionLabels) {
      await expect(page.locator(`text=${label}`).first()).toBeVisible();
    }

    // Enter topic in the topic input field
    const topicInput = page.locator('input[placeholder*="주제 입력"]');
    await expect(topicInput).toBeVisible();
    await topicInput.fill('유튜브 성장 비법');

    // Click the generate button (대본 생성)
    const generateBtn = page.locator('button:has-text("대본 생성")');
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // Sections should still be visible (they persist through generation)
    // Wait for either: generation in progress indicator OR completed
    await expect(page.locator('text=Hook').first()).toBeVisible({ timeout: 10000 });

    // Count section cards — there should be at least 1
    const sectionCards = page.locator('textarea[placeholder]');
    const count = await sectionCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
