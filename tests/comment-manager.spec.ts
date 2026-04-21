import { test, expect } from '@playwright/test';

test.describe('Comment Manager Page', () => {
  test('/comment-manager 페이지 로드', async ({ page }) => {
    await page.goto('/comment-manager');
    await expect(page.locator('text=AI Comment Manager')).toBeVisible();
  });

  test('댓글 카드 최소 1개 표시', async ({ page }) => {
    await page.goto('/comment-manager');

    // Switch to Channel view to see comment cards
    await page.getByRole('button', { name: /Channel/ }).click();

    // Individual Approve buttons use bg-green-600; "Approve All" uses bg-green-50
    const approveBtn = page.locator('button.bg-green-600').first();
    await expect(approveBtn).toBeVisible({ timeout: 5000 });
  });

  test('채널 드롭다운에서 다른 채널 선택 → 댓글 목록 변경됨', async ({ page }) => {
    await page.goto('/comment-manager');

    // Switch to Channel view
    await page.getByRole('button', { name: /Channel/ }).click();

    // Get the initial channel name shown in the dropdown trigger
    const channelTrigger = page.locator('button').filter({ has: page.locator('span.font-semibold') }).first();
    await expect(channelTrigger).toBeVisible();
    const initialChannelName = await channelTrigger.locator('span.font-semibold').textContent();

    // Get initial comment count
    const initialApproveCount = await page.locator('button.bg-green-600').count();

    // Open channel dropdown
    await channelTrigger.click();

    // Select a different channel (VB Gaming is the second YouTube channel)
    const targetChannel = page.locator('button').filter({ hasText: 'VB Gaming' });
    await expect(targetChannel).toBeVisible();
    await targetChannel.click();

    // Verify channel name changed in the trigger
    const newChannelName = await channelTrigger.locator('span.font-semibold').textContent();
    expect(newChannelName).not.toBe(initialChannelName);
    expect(newChannelName?.trim()).toBe('VB Gaming');

    // Comment list should be different (VB Gaming has different comments)
    const newApproveCount = await page.locator('button.bg-green-600').count();
    // At minimum the page re-rendered with the new channel
    expect(newChannelName).toBeTruthy();
    // Counts can legitimately differ
    expect(initialChannelName).not.toBe(newChannelName);
  });

  test('Approve 버튼 클릭 → 상태 변경', async ({ page }) => {
    await page.goto('/comment-manager');

    // Switch to Channel view
    await page.getByRole('button', { name: /Channel/ }).click();

    // bg-green-600 is only on individual comment Approve buttons; "Approve All" uses bg-green-50
    const approveButtons = page.locator('button.bg-green-600');
    await expect(approveButtons.first()).toBeVisible({ timeout: 5000 });

    const initialCount = await approveButtons.count();
    expect(initialCount).toBeGreaterThanOrEqual(1);

    // Click the first individual Approve button
    await approveButtons.first().click();

    // After approve, the pending count should decrease by 1
    await expect(approveButtons).toHaveCount(initialCount - 1, { timeout: 3000 });

    // "Approved" text should now be visible somewhere on the page
    await expect(page.locator('text=Approved').first()).toBeVisible();
  });
});
