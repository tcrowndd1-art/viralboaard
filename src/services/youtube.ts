import { markKeyExhausted, getFirstAvailableKeyIndex } from './quotaGuard';

/* ── [MIGRATED] Keys moved to backend — frontend calls are stubs ── */
const API_KEYS: string[] = [];

const BASE = 'https://www.googleapis.com/youtube/v3';

/* Active key index — rotates in-memory; resets on page reload */
let activeKeyIdx = 0;

function getActiveKey(): string {
  const available = getFirstAvailableKeyIndex(API_KEYS.length, activeKeyIdx);
  if (available === null) throw new Error('All YouTube API keys exhausted. Resets at midnight PT.');
  activeKeyIdx = available;
  return API_KEYS[available];
}

async function get<T>(endpoint: string, params: Record<string, string>, _retry = false): Promise<T> {
  let key: string;
  try { key = getActiveKey(); } catch (e) { throw e; }

  const url = new URL(`${BASE}/${endpoint}`);
  url.searchParams.set('key', key);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString());

  if (res.status === 403 || res.status === 429) {
    /* Mark current key exhausted and rotate */
    markKeyExhausted(activeKeyIdx);
    const next = getFirstAvailableKeyIndex(API_KEYS.length, (activeKeyIdx + 1) % API_KEYS.length);
    if (next !== null && !_retry) {
      activeKeyIdx = next;
      return get<T>(endpoint, params, true); /* one retry with next key */
    }
    throw new Error(`YouTube API quota exhausted on all ${API_KEYS.length} key(s).`);
  }

  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  return res.json() as Promise<T>;
}

function parseDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return '0:00';
  const h = parseInt(m[1] ?? '0');
  const min = parseInt(m[2] ?? '0');
  const sec = parseInt(m[3] ?? '0');
  const mm = String(min).padStart(h > 0 ? 2 : 1, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export interface ChannelResult {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  banner: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  country: string;
  description: string;
}

export interface VideoResult {
  videoId: string;
  title: string;
  channelName: string;
  views: number;
  likes: number;
  uploadDate: string;
  thumbnail: string;
  duration: string;
}

export interface PopularChannelItem {
  rank: number;
  name: string;
  score: string;
  avatar: string;
  channelId: string;
  subscribers: number;
  totalViews: number;
}

export interface TrendingVideoItem {
  rank: number;
  title: string;
  score: string;
  thumbnail: string;
  channelName: string;
  channelAvatar: string;
  videoId: string;
  channelId: string;
}

export interface RankingVideoItem {
  rank: number;
  videoId: string;
  title: string;
  channelName: string;
  channelAvatar: string;
  channelSubscribers: number;
  views: number;
  uploadDate: string;
  category: string;
  country: string;
}

export interface ViralVideoItem {
  rank: number;
  videoId: string;
  title: string;
  channelName: string;
  channelAvatar: string;
  channelId: string;
  subscribers: number;
  views: number;
  viralScore: number | null;
  uploadDate: string;
  thumbnail: string;
  category: string;
  country: string;
  isShorts?: boolean;
  isRealShorts?: boolean;
  likes?: number;
  comments?: number;
}

export interface RankingChannelItem {
  rank: number;
  channelId: string;
  name: string;
  avatar: string;
  category: string;
  country: string;
  subscribers: number;
  views: number;
  videoCount: number;
  growthPercent: number;
}

function fmtSubs(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtViews(n: number): string {
  if (n >= 1_000_000) return `+${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `+${(n / 1_000).toFixed(0)}K`;
  return `+${n}`;
}

export async function fetchPopularChannels(_regionCode = 'KR'): Promise<PopularChannelItem[]> {
  console.warn('[MIGRATED] Supabase 읽기로 이전.');
  return [];
}

export async function fetchTrendingVideos(_regionCode = 'KR', _maxResults = 10): Promise<TrendingVideoItem[]> {
  console.warn('[MIGRATED] Supabase 읽기로 이전.');
  return [];
}

export async function fetchLiveVideos(): Promise<TrendingVideoItem[]> {
  console.warn('[MIGRATED] Supabase 읽기로 이전.');
  return [];
}

export async function searchChannels(_query: string, _maxResults = 5): Promise<ChannelResult[]> {
  console.warn('[MIGRATED] Supabase 읽기로 이전.');
  return [];
}

export async function searchVideos(query: string, maxResults = 10): Promise<VideoResult[]> {
  const searchData = await get<any>('search', {
    part: 'snippet', type: 'video', q: query,
    maxResults: String(maxResults), order: 'viewCount',
  });
  const items: any[] = searchData.items ?? [];
  if (!items.length) return [];
  const videoIds = items.map((v: any) => v.id.videoId).join(',');
  const [statsData, detailData] = await Promise.all([
    get<any>('videos', { part: 'statistics', id: videoIds }),
    get<any>('videos', { part: 'contentDetails', id: videoIds }),
  ]);
  const statsMap = new Map<string, any>(statsData.items?.map((v: any) => [v.id, v.statistics]));
  const durationMap = new Map<string, string>(
    detailData.items?.map((v: any) => [v.id, parseDuration(v.contentDetails.duration)])
  );
  return items.map((v: any) => ({
    videoId: v.id.videoId,
    title: v.snippet.title,
    channelName: v.snippet.channelTitle ?? '',
    views: parseInt(statsMap.get(v.id.videoId)?.viewCount ?? '0'),
    likes: parseInt(statsMap.get(v.id.videoId)?.likeCount ?? '0'),
    uploadDate: v.snippet.publishedAt?.slice(0, 10) ?? '',
    thumbnail: `https://img.youtube.com/vi/${v.id.videoId}/mqdefault.jpg`,
    duration: durationMap.get(v.id.videoId) ?? '0:00',
  }));
}

export async function searchChannel(query: string): Promise<ChannelResult | null> {
  const searchData = await get<any>('search', {
    part: 'snippet',
    type: 'channel',
    q: query,
    maxResults: '1',
  });
  const item = searchData.items?.[0];
  if (!item) return null;
  const channelId: string = item.id.channelId;

  const channelData = await get<any>('channels', {
    part: 'snippet,statistics,brandingSettings',
    id: channelId,
  });
  const ch = channelData.items?.[0];
  if (!ch) return null;

  return {
    id: channelId,
    name: ch.snippet.title,
    handle: ch.snippet.customUrl ?? `@${ch.snippet.title}`,
    avatar: ch.snippet.thumbnails?.high?.url ?? ch.snippet.thumbnails?.default?.url ?? '',
    banner: ch.brandingSettings?.image?.bannerExternalUrl ?? '',
    subscribers: parseInt(ch.statistics.subscriberCount ?? '0'),
    totalViews: parseInt(ch.statistics.viewCount ?? '0'),
    videoCount: parseInt(ch.statistics.videoCount ?? '0'),
    country: ch.snippet.country ?? '',
    description: ch.snippet.description ?? '',
  };
}

export async function fetchRecentVideos(channelId: string): Promise<VideoResult[]> {
  const searchData = await get<any>('search', {
    part: 'snippet',
    channelId,
    type: 'video',
    order: 'date',
    maxResults: '5',
  });
  const items: any[] = searchData.items ?? [];
  if (items.length === 0) return [];

  const videoIds = items.map((v: any) => v.id.videoId).join(',');

  const [statsData, detailData] = await Promise.all([
    get<any>('videos', { part: 'statistics', id: videoIds }),
    get<any>('videos', { part: 'contentDetails', id: videoIds }),
  ]);

  const statsMap = new Map<string, any>(statsData.items?.map((v: any) => [v.id, v.statistics]));
  const durationMap = new Map<string, string>(
    detailData.items?.map((v: any) => [v.id, parseDuration(v.contentDetails.duration)])
  );

  return items.map((v: any) => ({
    videoId: v.id.videoId,
    title: v.snippet.title,
    channelName: v.snippet.channelTitle ?? '',
    views: parseInt(statsMap.get(v.id.videoId)?.viewCount ?? '0'),
    likes: parseInt(statsMap.get(v.id.videoId)?.likeCount ?? '0'),
    uploadDate: v.snippet.publishedAt?.slice(0, 10) ?? '',
    thumbnail: `https://img.youtube.com/vi/${v.id.videoId}/mqdefault.jpg`,
    duration: durationMap.get(v.id.videoId) ?? '0:00',
  }));
}

export async function fetchViralVideos(regionCode = 'KR', maxResults = 50): Promise<ViralVideoItem[]> {
  console.warn('[MIGRATED] Supabase 읽기로 이전.');
  return [];
}

const VIDEO_CAT_MAP: Record<string, string> = {
  '1': 'Entertainment', '2': 'Entertainment', '10': 'Music', '15': 'Entertainment',
  '17': 'Sports', '19': 'Entertainment', '20': 'Gaming', '22': 'Entertainment',
  '23': 'Comedy', '24': 'Entertainment', '25': 'News', '26': 'Education',
  '27': 'Education', '28': 'Education', '29': 'Education',
};

async function searchVideoItems(regionCode: string, maxResults: number, publishedAfter: string, publishedBefore = ''): Promise<any[]> {
  // Try viewCount order first; YouTube search API sometimes returns 0 with this order,
  // so fall back to date order which is more reliable with publishedAfter.
  for (const order of ['viewCount', 'date'] as const) {
    const params: Record<string, string> = {
      part: 'snippet', type: 'video', order,
      regionCode, maxResults: String(maxResults), publishedAfter,
    };
    if (publishedBefore) params.publishedBefore = publishedBefore;
    const batch = await get<any>('search', params)
      .then((d) => d.items ?? []).catch(() => []);
    if (batch.length > 0) return batch;
  }
  return [];
}

export async function fetchVideoRankings(regionCode = 'KR', maxResults = 25, publishedAfter = ''): Promise<RankingVideoItem[]> {
  if (regionCode === 'ALL') regionCode = 'KR';

  let items: any[] = [];

  if (publishedAfter) {
    // Search ONLY the selected region — no cross-region merging, no silent fallback.
    const merged = await searchVideoItems(regionCode, maxResults + 10, publishedAfter);

    if (merged.length === 0) {
      return [];
    }

    const videoIds = merged.slice(0, maxResults).map((v: any) => v.id.videoId).join(',');
    const statsData = await get<any>('videos', { part: 'statistics,snippet', id: videoIds });
    const statsMap = new Map<string, any>((statsData.items ?? []).map((v: any) => [v.id, v]));

    items = merged.slice(0, maxResults).map((v: any) => {
      const full = statsMap.get(v.id.videoId);
      return {
        id: v.id.videoId,
        snippet: full?.snippet ?? v.snippet,
        statistics: full?.statistics ?? {},
      };
    });
    items.sort((a: any, b: any) => parseInt(b.statistics.viewCount ?? '0') - parseInt(a.statistics.viewCount ?? '0'));
  } else {
    const data = await get<any>('videos', {
      part: 'snippet,statistics', chart: 'mostPopular',
      regionCode, maxResults: String(maxResults),
    });
    items = (data.items ?? []).map((v: any) => ({ id: v.id, snippet: v.snippet, statistics: v.statistics }));
  }

  if (!items.length) return [];

  const channelIds = [...new Set(items.map((v: any) => v.snippet?.channelId).filter(Boolean))].join(',');
  const chData = await get<any>('channels', { part: 'snippet,statistics', id: channelIds }).catch(() => ({ items: [] }));
  const avatarMap = new Map<string, string>(
    (chData.items ?? []).map((ch: any) => [ch.id, ch.snippet?.thumbnails?.default?.url ?? ''])
  );
  const subsMap = new Map<string, number>(
    (chData.items ?? []).map((ch: any) => [ch.id, parseInt(ch.statistics?.subscriberCount ?? '0')])
  );

  return items.map((v: any, i: number) => ({
    rank: i + 1,
    videoId: v.id,
    title: v.snippet?.title ?? 'Unknown Title',
    channelName: v.snippet?.channelTitle ?? 'Unknown Channel',
    channelAvatar: avatarMap.get(v.snippet?.channelId) ?? '',
    channelSubscribers: subsMap.get(v.snippet?.channelId) ?? 0,
    views: parseInt(v.statistics?.viewCount ?? '0'),
    uploadDate: v.snippet?.publishedAt?.slice(0, 10) ?? '',
    category: VIDEO_CAT_MAP[v.snippet?.categoryId] ?? 'Entertainment',
    country: regionCode,
  }));
}

const TOPIC_TO_CATEGORY: Record<string, string> = {
  'Music': 'Music', 'Entertainment': 'Entertainment', 'Sports': 'Sports',
  'Gaming': 'Gaming', 'Games': 'Gaming', 'Technology': 'Technology',
  'Knowledge': 'Education', 'Education': 'Education', 'Film': 'Entertainment',
  'News': 'News', 'Comedy': 'Comedy', 'Kids': 'Kids', 'Anime': 'Entertainment',
};

function extractCategory(topicCategories?: string[]): string {
  if (!topicCategories?.length) return 'Entertainment';
  for (const url of topicCategories) {
    const term = decodeURIComponent(url.split('/').pop() ?? '').replace(/_/g, ' ');
    for (const [key, val] of Object.entries(TOPIC_TO_CATEGORY)) {
      if (term.toLowerCase().includes(key.toLowerCase())) return val;
    }
  }
  return 'Entertainment';
}

export async function fetchChannelRankings(regionCode = 'KR', publishedAfter = '', publishedBefore = '', countryFilter = ''): Promise<RankingChannelItem[]> {
  // For search API, use regionCode to get relevant content for that region
  const searchRegion = regionCode === 'ALL' ? 'US' : regionCode;

  if (publishedAfter) {
    const rawItems = await searchVideoItems(searchRegion, 50, publishedAfter, publishedBefore);

    if (rawItems.length === 0) return [];

    const videoIds = [...new Set(rawItems.map((v: any) => v.id?.videoId).filter(Boolean))];
    if (videoIds.length === 0) return [];

    const statsData = await get<any>('videos', {
      part: 'statistics,snippet',
      id: videoIds.slice(0, 50).join(','),
    });

    const channelViews = new Map<string, number>();
    for (const v of (statsData.items ?? [])) {
      const cid: string = v.snippet?.channelId ?? '';
      if (!cid) continue;
      const views = parseInt(v.statistics?.viewCount ?? '0');
      channelViews.set(cid, (channelViews.get(cid) ?? 0) + views);
    }

    const topChannelIds = [...channelViews.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([cid]) => cid);

    if (topChannelIds.length === 0) return [];

    const channelData = await get<any>('channels', {
      part: 'snippet,statistics,topicDetails',
      id: topChannelIds.join(','),
    });

    const sorted = (channelData.items ?? [])
      .sort((a: any, b: any) => (channelViews.get(b.id) ?? 0) - (channelViews.get(a.id) ?? 0));

    // Filter by actual channel country if specified
    const filtered = countryFilter
      ? sorted.filter((ch: any) => (ch.snippet?.country ?? '') === countryFilter)
      : sorted;

    return filtered.slice(0, 25).map((ch: any, i: number) => ({
      rank: i + 1,
      channelId: ch.id,
      name: ch.snippet?.title ?? 'Unknown Channel',
      avatar: ch.snippet?.thumbnails?.default?.url ?? '',
      category: extractCategory(ch.topicDetails?.topicCategories),
      country: ch.snippet?.country ?? searchRegion,
      subscribers: parseInt(ch.statistics?.subscriberCount ?? '0'),
      views: channelViews.get(ch.id) ?? 0,
      videoCount: parseInt(ch.statistics?.videoCount ?? '0'),
      growthPercent: 0,
    }));
  }

  // --- Daily mode: mostPopular videos → unique channels → sort by subscribers ---
  const dailyRegion = regionCode === 'ALL' ? 'US' : regionCode;
  const videosData = await get<any>('videos', {
    part: 'snippet', chart: 'mostPopular', regionCode: dailyRegion, maxResults: '50',
  });
  const rawItems = videosData.items ?? [];

  const seen = new Set<string>();
  const channelIds: string[] = [];
  for (const item of rawItems) {
    const cid: string = item.snippet?.channelId ?? '';
    if (cid && !seen.has(cid)) { seen.add(cid); channelIds.push(cid); }
    if (channelIds.length >= 25) break;
  }
  if (channelIds.length === 0) return [];

  const channelData = await get<any>('channels', {
    part: 'snippet,statistics,topicDetails',
    id: channelIds.join(','),
  });

  const dailySorted = [...(channelData.items ?? [])]
    .sort((a: any, b: any) =>
      parseInt(b.statistics?.subscriberCount ?? '0') - parseInt(a.statistics?.subscriberCount ?? '0')
    );

  const dailyFiltered = countryFilter
    ? dailySorted.filter((ch: any) => (ch.snippet?.country ?? '') === countryFilter)
    : dailySorted;

  return dailyFiltered.map((ch: any, i: number) => ({
      rank: i + 1,
      channelId: ch.id,
      name: ch.snippet?.title ?? 'Unknown Channel',
      avatar: ch.snippet?.thumbnails?.default?.url ?? '',
      category: extractCategory(ch.topicDetails?.topicCategories),
      country: ch.snippet?.country ?? dailyRegion,
      subscribers: parseInt(ch.statistics?.subscriberCount ?? '0'),
      views: parseInt(ch.statistics?.viewCount ?? '0'),
      videoCount: parseInt(ch.statistics?.videoCount ?? '0'),
      growthPercent: 0,
    }));
}
