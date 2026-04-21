/** D-1/D-2: Quota state tracker + exponential backoff fetch wrapper */

const QUOTA_KEY = 'vb_quota_exhausted_until';

export function isQuotaExhausted(): boolean {
  try {
    const until = localStorage.getItem(QUOTA_KEY);
    if (!until) return false;
    if (Date.now() > Number(until)) { localStorage.removeItem(QUOTA_KEY); return false; }
    return true;
  } catch { return false; }
}

export function markQuotaExhausted(durationMs = 60 * 60 * 1000): void {
  try {
    localStorage.setItem(QUOTA_KEY, String(Date.now() + durationMs));
    window.dispatchEvent(new CustomEvent('vb-quota-exhausted'));
  } catch {}
}

export function clearQuotaFlag(): void {
  try { localStorage.removeItem(QUOTA_KEY); } catch {}
}

export function getQuotaResetTime(): Date | null {
  try {
    const until = localStorage.getItem(QUOTA_KEY);
    return until ? new Date(Number(until)) : null;
  } catch { return null; }
}

/** D-5: Fetch with exponential backoff on 429/403 */
export async function fetchWithBackoff(
  url: string,
  maxRetries = 2,
  baseDelay = 800,
): Promise<Response> {
  let lastErr: Error = new Error('unknown');
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, baseDelay * 2 ** (attempt - 1)));
    let res: Response;
    try { res = await fetch(url); } catch (e) { lastErr = e as Error; continue; }
    if (res.status === 429 || res.status === 403) {
      markQuotaExhausted();
      lastErr = new Error(`YouTube API error: ${res.status}`);
      if (attempt === maxRetries) throw lastErr;
      continue;
    }
    if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
    return res;
  }
  throw lastErr;
}
