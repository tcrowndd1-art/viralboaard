const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string;
const BASE = 'https://www.googleapis.com/youtube/v3';

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
  views: number;
  uploadDate: string;
  thumbnail: string;
  duration: string;
}

async function get<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}/${endpoint}`);
  url.searchParams.set('key', API_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
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

export interface PopularChannelItem {
  rank: number;
  name: string;
  score: string;
  avatar: string;
  channelId: string;
}

function fmtSubs(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export async function fetchPopularChannels(regionCode = 'KR'): Promise<PopularChannelItem[]> {
  const videosData = await get<any>('videos', {
    part: 'snippet',
    chart: 'mostPopular',
    regionCode,
    maxResults: '30',
  });

  const seen = new Set<string>();
  const channelIds: string[] = [];
  for (const item of videosData.items ?? []) {
    const cid: string = item.snippet.channelId;
    if (!seen.has(cid)) { seen.add(cid); channelIds.push(cid); }
    if (channelIds.length >= 10) break;
  }
  if (channelIds.length === 0) return [];

  const channelData = await get<any>('channels', {
    part: 'snippet,statistics',
    id: channelIds.join(','),
  });

  const sorted = [...(channelData.items ?? [])].sort(
    (a: any, b: any) => parseInt(b.statistics.subscriberCount ?? '0') - parseInt(a.statistics.subscriberCount ?? '0')
  );

  return sorted.slice(0, 10).map((ch: any, i: number) => ({
    rank: i + 1,
    name: ch.snippet.title,
    score: fmtSubs(parseInt(ch.statistics.subscriberCount ?? '0')),
    avatar: ch.snippet.thumbnails?.default?.url ?? '',
    channelId: ch.id,
  }));
}

export interface TrendingVideoItem {
  rank: number;
  title: string;
  score: string;
  thumbnail: string;
  channelName: string;
  channelAvatar: string;
  videoId: string;
}

function fmtViews(n: number): string {
  if (n >= 1_000_000) return `+${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `+${(n / 1_000).toFixed(0)}K`;
  return `+${n}`;
}

export async function fetchTrendingVideos(regionCode = 'KR', maxResults = 10): Promise<TrendingVideoItem[]> {
  const data = await get<any>('videos', {
    part: 'snippet,statistics',
    chart: 'mostPopular',
    regionCode,
    maxResults: String(maxResults),
  });
  const items: any[] = data.items ?? [];
  if (items.length === 0) return [];

  // 채널 아바타 일괄 조회
  const channelIds = [...new Set(items.map((v: any) => v.snippet.channelId))].join(',');
  const chData = await get<any>('channels', { part: 'snippet', id: channelIds });
  const avatarMap = new Map<string, string>(
    chData.items?.map((ch: any) => [ch.id, ch.snippet.thumbnails?.default?.url ?? ''])
  );

  return items.map((v: any, i: number) => ({
    rank: i + 1,
    title: v.snippet.title,
    score: fmtViews(parseInt(v.statistics.viewCount ?? '0')),
    thumbnail: `https://img.youtube.com/vi/${v.id}/mqdefault.jpg`,
    channelName: v.snippet.channelTitle,
    channelAvatar: avatarMap.get(v.snippet.channelId) ?? '',
    videoId: v.id,
  }));
}

export async function fetchLiveVideos(): Promise<TrendingVideoItem[]> {
  const data = await get<any>('search', {
    part: 'snippet',
    type: 'video',
    eventType: 'live',
    order: 'viewCount',
    maxResults: '5',
    regionCode: 'KR',
  });
  const items: any[] = data.items ?? [];
  return items.map((v: any, i: number) => ({
    rank: i + 1,
    title: v.snippet.title,
    score: 'watching now',
    thumbnail: `https://img.youtube.com/vi/${v.id.videoId}/mqdefault.jpg`,
    channelName: v.snippet.channelTitle,
    channelAvatar: v.snippet.thumbnails?.default?.url ?? '',
    videoId: v.id.videoId,
  }));
}

export async function searchChannel(query: string): Promise<ChannelResult | null> {
  // 1. 채널 검색
  const searchData = await get<any>('search', {
    part: 'snippet',
    type: 'channel',
    q: query,
    maxResults: '1',
  });
  const item = searchData.items?.[0];
  if (!item) return null;
  const channelId: string = item.id.channelId;

  // 2. 채널 상세 정보
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
  // 1. 최근 영상 5개 검색
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

  // 2. 조회수 + 재생시간 병렬 조회
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
    views: parseInt(statsMap.get(v.id.videoId)?.viewCount ?? '0'),
    uploadDate: v.snippet.publishedAt?.slice(0, 10) ?? '',
    thumbnail: `https://img.youtube.com/vi/${v.id.videoId}/mqdefault.jpg`,
    duration: durationMap.get(v.id.videoId) ?? '0:00',
  }));
}

const VIDEO_CAT_MAP: Record<string, string> = {
  '1': 'Entertainment', '2': 'Entertainment', '10': 'Music', '15': 'Entertainment',
  '17': 'Sports', '19': 'Entertainment', '20': 'Gaming', '22': 'Entertainment',
  '23': 'Comedy', '24': 'Entertainment', '25': 'News', '26': 'Education',
  '27': 'Education', '28': 'Education', '29': 'Education',
};

export interface RankingVideoItem {
  rank: number;
  videoId: string;
  title: string;
  channelName: string;
  channelAvatar: string;
  views: number;
  uploadDate: string;
  category: string;
  country: string;
}

export async function fetchVideoRankings(regionCode = 'KR', maxResults = 25): Promise<RankingVideoItem[]> {
  const data = await get<any>('videos', {
    part: 'snippet,statistics',
    chart: 'mostPopular',
    regionCode,
    maxResults: String(maxResults),
  });
  const items: any[] = data.items ?? [];
  if (items.length === 0) return [];

  const channelIds = [...new Set(items.map((v: any) => v.snippet.channelId))].join(',');
  const chData = await get<any>('channels', { part: 'snippet', id: channelIds });
  const avatarMap = new Map<string, string>(
    chData.items?.map((ch: any) => [ch.id, ch.snippet.thumbnails?.default?.url ?? ''])
  );

  return items.map((v: any, i: number) => ({
    rank: i + 1,
    videoId: v.id,
    title: v.snippet.title,
    channelName: v.snippet.channelTitle,
    channelAvatar: avatarMap.get(v.snippet.channelId) ?? '',
    views: parseInt(v.statistics.viewCount ?? '0'),
    uploadDate: v.snippet.publishedAt?.slice(0, 10) ?? '',
    category: VIDEO_CAT_MAP[v.snippet.categoryId] ?? 'Entertainment',
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

export interface RankingChannelItem {
  rank: number;
  name: string;
  avatar: string;
  category: string;
  country: string;
  subscribers: number;
  views: number;
  growthPercent: number;
}

export async function fetchChannelRankings(regionCode = 'KR'): Promise<RankingChannelItem[]> {
  const videosData = await get<any>('videos', {
    part: 'snippet',
    chart: 'mostPopular',
    regionCode,
    maxResults: '50',
  });

  const seen = new Set<string>();
  const channelIds: string[] = [];
  for (const item of videosData.items ?? []) {
    const cid: string = item.snippet.channelId;
    if (!seen.has(cid)) { seen.add(cid); channelIds.push(cid); }
    if (channelIds.length >= 25) break;
  }
  if (channelIds.length === 0) return [];

  const channelData = await get<any>('channels', {
    part: 'snippet,statistics,topicDetails',
    id: channelIds.join(','),
  });

  const sorted = [...(channelData.items ?? [])].sort(
    (a: any, b: any) => parseInt(b.statistics.subscriberCount ?? '0') - parseInt(a.statistics.subscriberCount ?? '0')
  );

  return sorted.map((ch: any, i: number) => ({
    rank: i + 1,
    name: ch.snippet.title,
    avatar: ch.snippet.thumbnails?.default?.url ?? '',
    category: extractCategory(ch.topicDetails?.topicCategories),
    country: ch.snippet.country ?? regionCode,
    subscribers: parseInt(ch.statistics.subscriberCount ?? '0'),
    views: parseInt(ch.statistics.viewCount ?? '0'),
    growthPercent: 0,
  }));
}
