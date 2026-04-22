/** Per-key quota tracker — supports up to N rotating API keys */

const QUOTA_PREFIX = 'vb_quota_until_';

export function isKeyExhausted(keyIndex: number): boolean {
  try {
    const until = localStorage.getItem(`${QUOTA_PREFIX}${keyIndex}`);
    if (!until) return false;
    if (Date.now() > Number(until)) {
      localStorage.removeItem(`${QUOTA_PREFIX}${keyIndex}`);
      return false;
    }
    return true;
  } catch { return false; }
}

export function markKeyExhausted(keyIndex: number, durationMs = 24 * 60 * 60 * 1000): void {
  try {
    localStorage.setItem(`${QUOTA_PREFIX}${keyIndex}`, String(Date.now() + durationMs));
    window.dispatchEvent(new CustomEvent('vb-quota-exhausted', { detail: { keyIndex } }));
  } catch {}
}

export function clearKeyQuota(keyIndex: number): void {
  try { localStorage.removeItem(`${QUOTA_PREFIX}${keyIndex}`); } catch {}
}

export function clearAllQuotas(totalKeys: number): void {
  for (let i = 0; i < totalKeys; i++) clearKeyQuota(i);
}

export function getFirstAvailableKeyIndex(totalKeys: number, startFrom = 0): number | null {
  for (let i = 0; i < totalKeys; i++) {
    const idx = (startFrom + i) % totalKeys;
    if (!isKeyExhausted(idx)) return idx;
  }
  return null;
}

export function getKeyResetTime(keyIndex: number): Date | null {
  try {
    const until = localStorage.getItem(`${QUOTA_PREFIX}${keyIndex}`);
    return until ? new Date(Number(until)) : null;
  } catch { return null; }
}

/** Backward-compat shims (treat key 0 as "the" key) */
export function isQuotaExhausted(): boolean {
  return isKeyExhausted(0);
}
export function markQuotaExhausted(durationMs = 24 * 60 * 60 * 1000): void {
  markKeyExhausted(0, durationMs);
}
export function clearQuotaFlag(): void {
  clearKeyQuota(0);
}
export function getQuotaResetTime(): Date | null {
  return getKeyResetTime(0);
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
