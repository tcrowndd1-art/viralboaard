     1|const API_KEY=import..._KEY as string;
     2|const BASE = 'https://www.googleapis.com/youtube/v3';
     3|
     4|async function get<T>(endpoint: string, params: Record<string, string>): Promise<T> {
     5|  const url = new URL(endpoint, BASE + '/');
     6|  url.searchParams.set('key', API_KEY);
     7|  for (const [k, v] of Object.entries(params)) {
     8|    url.searchParams.set(k, v);
     9|  }
    10|  const res = await fetch(url.toString());
    11|  if (!res.ok) throw new Error(await res.text());
    12|  return res.json();
    13|}
    14|
    15|export interface ChannelResult {
    16|  id: string;
    17|  name: string;
    18|  handle: string;
    19|  avatar: string;
    20|  banner: string;
    21|  subscribers: number;
    22|  totalViews: number;
    23|  videoCount: number;
    24|  country: string;
    25|  description: string;
    26|}
    27|
    28|export interface VideoResult {
    29|  videoId: string;
    30|  title: string;
    31|  views: number;
    32|  uploadDate: string;
    33|  thumbnail: string;
    34|  duration: string;
    35|}
    36|
    37|export interface RankingChannelItem {
    38|  rank: number;
    39|  name: string;
    40|  avatar: string;
    41|  category: string;
    42|  country: string;
    43|  subscribers: number;
    44|  views: number;
    45|  growthPercent: number;
    46|}
    47|
    48|export interface RankingVideoItem {
    49|  rank: number;
    50|  videoId: string;
    51|  title: string;
    52|  channelName: string;
    53|  channelAvatar: string;
    54|  views: number;
    55|  uploadDate: string;
    56|  category: string;
    57|  country: string;
    58|}
    59|
    60|function fmtSubs(n: number): string {
    61|  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    62|  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    63|  return String(n);
    64|}
    65|
    66|export async function fetchPopularChannels(regionCode = 'KR'): Promise<PopularChannelItem[]> {
    67|  const videosData = await get<any>('videos', {
    68|    part: 'snippet',
    69|    chart: 'mostPopular',
    70|    regionCode,
    71|    maxResults: '30',
    72|  });
    73|
    74|  const seen = new Set<string>();
    75|  const channelIds: string[] = [];
    76|  for (const item of videosData.items ?? []) {
    77|    const cid: string = item.snippet.channelId;
    78|    if (!seen.has(cid)) { seen.add(cid); channelIds.push(cid); }
    79|    if (channelIds.length >= 10) break;
    80|  }
    81|  if (channelIds.length === 0) return [];
    82|
    83|  const channelData = await get<any>('channels', {
    84|    part: 'snippet,statistics',
    85|    id: channelIds.join(','),
    86|  });
    87|
    88|  const sorted = [...(channelData.items ?? [])].sort(
    89|    (a: any, b: any) => parseInt(b.statistics.subscriberCount ?? '0') - parseInt(a.statistics.subscriberCount ?? '0')
    90|  );
    91|
    92|  return sorted.slice(0, 10).map((ch: any, i: number) => ({
    93|    rank: i + 1,
    94|    name: ch.snippet.title,
    95|    score: fmtSubs(parseInt(ch.statistics.subscriberCount ?? '0')),
    96|    avatar: ch.snippet.thumbnails?.default?.url ?? '',
    97|    channelId: ch.id,
    98|  }));
    99|}
   100|
   101|export interface TrendingVideoItem {
   102|  rank: number;
   103|  title: string;
   104|  score: string;
   105|  thumbnail: string;
   106|  channelName: string;
   107|  channelAvatar: string;
   108|  videoId: string;
   109|}
   110|
   111|function fmtViews(n: number): string {
   112|  if (n >= 1_000_000) return `+${(n / 1_000_000).toFixed(1)}M`;
   113|  if (n >= 1_000) return `+${(n / 1_000).toFixed(0)}K`;
   114|  return `+${n}`;
   115|}
   116|
   117|export async function fetchTrendingVideos(regionCode = 'KR', maxResults = 10): Promise<TrendingVideoItem[]> {
   118|  const data = await get<any>('videos', {
   119|    part: 'snippet,statistics',
   120|    chart: 'mostPopular',
   121|    regionCode,
   122|    maxResults: String(maxResults),
   123|  });
   124|  const items: any[] = data.items ?? [];
   125|  if (items.length === 0) return [];
   126|
   127|  // ì±„ë„ ì•„ë°”íƒ€ ì¼ê´„ ì¡°íšŒ
   128|  const channelIds = [...new Set(items.map((v: any) => v.snippet.channelId))].join(',');
   129|  const chData = await get<any>('channels', { part: 'snippet', id: channelIds });
   130|  const avatarMap = new Map<string, string>(
   131|    chData.items?.map((ch: any) => [ch.id, ch.snippet.thumbnails?.default?.url ?? ''])
   132|  );
   133|
   134|  return items.map((v: any, i: number) => ({
   135|    rank: i + 1,
   136|    title: v.snippet.title,
   137|    score: fmtViews(parseInt(v.statistics.viewCount ?? '0')),
   138|    thumbnail: `https://img.youtube.com/vi/${v.id}/mqdefault.jpg`,
   139|    channelName: v.snippet.channelTitle,
   140|    channelAvatar: avatarMap.get(v.snippet.channelId) ?? '',
   141|    videoId: v.id,
   142|  }));
   143|}
   144|
   145|export async function fetchLiveVideos(): Promise<TrendingVideoItem[]> {
   146|  const data = await get<any>('search', {
   147|    part: 'snippet',
   148|    type: 'video',
   149|    eventType: 'live',
   150|    order: 'viewCount',
   151|    maxResults: '5',
   152|    regionCode: 'KR',
   153|  });
   154|  const items: any[] = data.items ?? [];
   155|  return items.map((v: any, i: number) => ({
   156|    rank: i + 1,
   157|    title: v.snippet.title,
   158|    score: 'watching now',
   159|    thumbnail: `https://img.youtube.com/vi/${v.id.videoId}/mqdefault.jpg`,
   160|    channelName: v.snippet.channelTitle,
   161|    channelAvatar: v.snippet.thumbnails?.default?.url ?? '',
   162|    videoId: v.id.videoId,
   163|  }));
   164|}
   165|
   166|export async function searchChannel(query: string): Promise<ChannelResult | null> {
   167|  // 1. ì±„ë„ ê²€ìƒ‰
   168|  const searchData = await get<any>('search', {
   169|    part: 'snippet',
   170|    type: 'channel',
   171|    q: query,
   172|    maxResults: '1',
   173|  });
   174|  const item = searchData.items?.[0];
   175|  if (!item) return null;
   176|  const channelId: string = item.id.channelId;
   177|
   178|  // 2. ì±„ë„ ìƒì„¸ ì •ë³´
   179|  const channelData = await get<any>('channels', {
   180|    part: 'snippet,statistics,brandingSettings',
   181|    id: channelId,
   182|  });
   183|  const ch = channelData.items?.[0];
   184|  if (!ch) return null;
   185|
   186|  return {
   187|    id: channelId,
   188|    name: ch.snippet.title,
   189|    handle: ch.snippet.customUrl ?? `@${ch.snippet.title}`,
   190|    avatar: ch.snippet.thumbnails?.high?.url ?? ch.snippet.thumbnails?.default?.url ?? '',
   191|    banner: ch.brandingSettings?.image?.bannerExternalUrl ?? '',
   192|    subscribers: parseInt(ch.statistics.subscriberCount ?? '0'),
   193|    totalViews: parseInt(ch.statistics.viewCount ?? '0'),
   194|    videoCount: parseInt(ch.statistics.videoCount ?? '0'),
   195|    country: ch.snippet.country ?? '',
   196|    description: ch.snippet.description ?? '',
   197|  };
   198|}
   199|
   200|export async function fetchRecentVideos(channelId: string): Promise<VideoResult[]> {
   201|  // 1. ìµœê·¼ ì˜ìƒ 5ê°œ ê²€ìƒ‰
   202|  const searchData = await get<any>('search', {
   203|    part: 'snippet',
   204|    channelId,
   205|    type: 'video',
   206|    order: 'date',
   207|    maxResults: '5',
   208|  });
   209|  const items: any[] = searchData.items ?? [];
   210|  if (items.length === 0) return [];
   211|
   212|  const videoIds = items.map((v: any) => v.id.videoId).join(',');
   213|
   214|  // 2. ì¡°íšŒìˆ˜ + ìž¬ìƒì‹œê°„ ë³‘ë ¬ ì¡°íšŒ
   215|  const [statsData, detailData] = await Promise.all([
   216|    get<any>('videos', { part: 'statistics', id: videoIds }),
   217|    get<any>('videos', { part: 'contentDetails', id: videoIds }),
   218|  ]);
   219|
   220|  const statsMap = new Map<string, any>(statsData.items?.map((v: any) => [v.id, v.statistics]));
   221|  const durationMap = new Map<string, string>(
   222|    detailData.items?.map((v: any) => [v.id, parseDuration(v.contentDetails.duration)])
   223|  );
   224|
   225|  return items.map((v: any) => ({
   226|    videoId: v.id.videoId,
   227|    title: v.snippet.title,
   228|    views: parseInt(statsMap.get(v.id.videoId)?.viewCount ?? '0'),
   229|    uploadDate: v.snippet.publishedAt?.slice(0, 10) ?? '',
   230|    thumbnail: `https://img.youtube.com/vi/${v.id.videoId}/mqdefault.jpg`,
   231|    duration: durationMap.get(v.id.videoId) ?? '0:00',
   232|  }));
   233|}
   234|
   235|const VIDEO_CAT_MAP: Record<string, string> = {
   236|  '1': 'Entertainment', '2': 'Entertainment', '10': 'Music', '15': 'Entertainment',
   237|  '17': 'Sports', '19': 'Entertainment', '20': 'Gaming', '22': 'Entertainment',
   238|  '23': 'Comedy', '24': 'Entertainment', '25': 'News', '26': 'Education',
   239|  '27': 'Education', '28': 'Education', '29': 'Education',
   240|};
   241|
   242|export interface RankingVideoItem {
   243|  rank: number;
   244|  videoId: string;
   245|  title: string;
   246|  channelName: string;
   247|  channelAvatar: string;
   248|  views: number;
   249|  uploadDate: string;
   250|  category: string;
   251|  country: string;
   252|}
   253|
   254|export async function fetchVideoRankings(regionCode = 'KR', maxResults = 25): Promise<RankingVideoItem[]> {
   255|  try {
   256|    const data = await get<any>('videos', {
   257|      part: 'snippet,statistics',
   258|      chart: 'mostPopular',
   259|      regionCode,
   260|      maxResults: String(maxResults),
   261|    });
   262|    const items: any[] = data.items ?? [];
   263|    if (items.length === 0) return [];
   264|
   265|    const channelIds = [...new Set(items.map((v: any) => v.snippet.channelId))].join(',');
   266|    const chData = await get<any>('channels', { part: 'snippet', id: channelIds });
   267|    const avatarMap = new Map<string, string>(
   268|      chData.items?.map((ch: any) => [ch.id, ch.snippet.thumbnails?.default?.url ?? ''])
   269|    );
   270|
   271|    return items.map((v: any, i: number) => ({
   272|      rank: i + 1,
   273|      videoId: v.id,
   274|      title: v.snippet.title ?? 'Unknown Title',
   275|      channelName: v.snippet.channelTitle ?? 'Unknown Channel',
   276|      channelAvatar: avatarMap.get(v.snippet.channelId) ?? '',
   277|      views: parseInt(v.statistics.viewCount ?? '0'),
   278|      uploadDate: v.snippet.publishedAt?.slice(0, 10) ?? '',
   279|      category: VIDEO_CAT_MAP[v.snippet.categoryId] ?? 'Entertainment',
   280|      country: regionCode,
   281|    }));
   282|  } catch (error) {
   283|    console.error('Error fetching video rankings:', error);
   284|    throw error;
   285|  }
   286|}
   287|
   288|const TOPIC_TO_CATEGORY: Record<string, string> = {
   289|  'Music': 'Music', 'Entertainment': 'Entertainment', 'Sports': 'Sports',
   290|  'Gaming': 'Gaming', 'Games': 'Gaming', 'Technology': 'Technology',
   291|  'Knowledge': 'Education', 'Education': 'Education', 'Film': 'Entertainment',
   292|  'News': 'News', 'Comedy': 'Comedy', 'Kids': 'Kids', 'Anime': 'Entertainment',
   293|};
   294|
   295|function extractCategory(topicCategories?: string[]): string {
   296|  if (!topicCategories?.length) return 'Entertainment';
   297|  for (const url of topicCategories) {
   298|    const term = decodeURIComponent(url.split('/').pop() ?? '').replace(/_/g, ' ');
   299|    for (const [key, val] of Object.entries(TOPIC_TO_CATEGORY)) {
   300|      if (term.toLowerCase().includes(key.toLowerCase())) return val;
   301|    }
   302|  }
   303|  return 'Entertainment';
   304|}
   305|
   306|export interface RankingChannelItem {
   307|  rank: number;
   308|  name: string;
   309|  avatar: string;
   310|  category: string;
   311|  country: string;
   312|  subscribers: number;
   313|  views: number;
   314|  growthPercent: number;
   315|}
   316|
   317|export async function fetchChannelRankings(regionCode = 'KR'): Promise<RankingChannelItem[]> {
   318|  try {
   319|    const videosData = await get<any>('videos', {
   320|      part: 'snippet',
   321|      chart: 'mostPopular',
   322|      regionCode,
   323|      maxResults: '50',
   324|    });
   325|
   326|    const seen = new Set<string>();
   327|    const channelIds: string[] = [];
   328|    for (const item of videosData.items ?? []) {
   329|      const cid: string = item.snippet.channelId;
   330|      if (!seen.has(cid)) { seen.add(cid); channelIds.push(cid); }
   331|      if (channelIds.length >= 25) break;
   332|    }
   333|    if (channelIds.length === 0) return [];
   334|
   335|    const channelData = await get<any>('channels', {
   336|      part: 'snippet,statistics,topicDetails',
   337|      id: channelIds.join(','),
   338|    });
   339|
   340|    const sorted = [...(channelData.items ?? [])].sort(
   341|      (a: any, b: any) => parseInt(b.statistics.subscriberCount ?? '0') - parseInt(a.statistics.subscriberCount ?? '0')
   342|    );
   343|
   344|    return sorted.map((ch: any, i: number) => ({
   345|      rank: i + 1,
   346|      name: ch.snippet.title ?? 'Unknown Channel',
   347|      avatar: ch.snippet.thumbnails?.default?.url ?? '',
   348|      category: extractCategory(ch.topicDetails?.topicCategories),
   349|      country: ch.snippet.country ?? regionCode,
   350|      subscribers: parseInt(ch.statistics.subscriberCount ?? '0'),
   351|      views: parseInt(ch.statistics.viewCount ?? '0'),
   352|      growthPercent: 0,
   353|    }));
   354|  } catch (error) {
   355|    console.error('Error fetching channel rankings:', error);
   356|    throw error;
   357|  }
   358|}
   359|