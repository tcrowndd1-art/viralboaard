import { test, expect } from '@playwright/test';

test.describe('Video Editor Page', () => {
  test('/video-editor 페이지 로드', async ({ page }) => {
    await page.goto('/video-editor');
    await expect(page.locator('text=Scene Canvas')).toBeVisible();
  });

  test('Voice 드롭다운에서 다른 목소리 선택 → 선택값 실제로 변경됨', async ({ page }) => {
    // Inject mock SpeechSynthesis voices before page load
    await page.addInitScript(() => {
      const mockVoices: SpeechSynthesisVoice[] = [
        { name: 'Test Voice KO', lang: 'ko-KR', voiceURI: 'ko-KR', localService: true, default: true },
        { name: 'Test Voice EN', lang: 'en-US', voiceURI: 'en-US', localService: true, default: false },
        { name: 'Test Voice JA', lang: 'ja-JP', voiceURI: 'ja-JP', localService: true, default: false },
      ] as SpeechSynthesisVoice[];

      let voicesChangedListeners: EventListenerOrEventListenerObject[] = [];

      Object.defineProperty(window, 'speechSynthesis', {
        value: {
          getVoices: () => mockVoices,
          cancel: () => {},
          speak: () => {},
          pause: () => {},
          resume: () => {},
          addEventListener: (event: string, listener: EventListenerOrEventListenerObject) => {
            if (event === 'voiceschanged') {
              voicesChangedListeners.push(listener);
              // Fire immediately so React picks up the mock voices
              setTimeout(() => {
                const fn = typeof listener === 'function' ? listener : listener.handleEvent.bind(listener);
                fn(new Event('voiceschanged'));
              }, 50);
            }
          },
          removeEventListener: (_event: string, listener: EventListenerOrEventListenerObject) => {
            voicesChangedListeners = voicesChangedListeners.filter(l => l !== listener);
          },
          pending: false,
          speaking: false,
          paused: false,
          onvoiceschanged: null,
        },
        writable: true,
        configurable: true,
      });
    });

    await page.goto('/video-editor');

    // The Narration tab is default (rightTab = 'narration'), so Voice Settings is visible
    // Wait for the voice select to show real options (not "Loading...")
    const voiceSelect = page.locator('select').filter({ hasText: /Test Voice/ });
    await expect(voiceSelect).toBeVisible({ timeout: 5000 });

    // Get the initial selected value
    const initialValue = await voiceSelect.inputValue();

    // Select the second voice (different from whatever is selected first)
    const options = await voiceSelect.locator('option').allTextContents();
    expect(options.length).toBeGreaterThanOrEqual(2);

    // Find an option that's different from the current value
    const targetOption = options.find(opt => !opt.includes(initialValue.split('(')[0].trim()));
    expect(targetOption).toBeTruthy();

    await voiceSelect.selectOption({ label: targetOption! });

    const newValue = await voiceSelect.inputValue();
    expect(newValue).not.toBe(initialValue);
  });
});
