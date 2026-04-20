     1|import { useState, useEffect, useMemo } from 'react';
     2|import { useTranslation } from 'react-i18next';
     3|import TopHeader from './components/TopHeader';
     4|import GlobalSidebar from '@/components/feature/GlobalSidebar';
     5|import SearchBanner from './components/SearchBanner';
     6|import ChartWidget from './components/ChartWidget';
     7|import VideoWidget from './components/VideoWidget';
     8|import TopLivesWidget from './components/TopLivesWidget';
     9|import DataStats from './components/DataStats';
    10|import HomeFooter from './components/HomeFooter';
    11|import ChannelSearchResult from './components/ChannelSearchResult';
    12|import {
    13|  searchChannel, fetchRecentVideos, fetchPopularChannels,
    14|  fetchTrendingVideos, fetchLiveVideos,
    15|} from '@/services/youtube';
    16|import type { ChannelResult, VideoResult, PopularChannelItem, TrendingVideoItem } from '@/services/youtube';
    17|import { cacheGet, cacheSet, addSearchHistory } from '@/services/cache';
    18|
    19|const CACHE_KEY = (q: string) => `vb_channel_${q.toLowerCase().trim()}`;
    20|
    21|const HomePage = () => {
    22|  const { t } = useTranslation();
    23|  const [sidebarOpen, setSidebarOpen] = useState(false);
    24|
    25|  // Channel search
    26|  const [searching, setSearching] = useState(false);
    27|  const [channel, setChannel] = useState<ChannelResult | null>(null);
    28|  const [videos, setVideos] = useState<VideoResult[]>([]);
    29|  const [searchError, setSearchError] = useState<string | null>(null);
    30|
    31|  // API data
    32|  const [popularChannels, setPopularChannels] = useState<PopularChannelItem[]>([]);
    33|  const [usPopularChannels, setUsPopularChannels] = useState<PopularChannelItem[]>([]);
    34|  const [jpPopularChannels, setJpPopularChannels] = useState<PopularChannelItem[]>([]);
    35|  const [trendingVideos, setTrendingVideos] = useState<TrendingVideoItem[]>([]);
    36|  const [usTrendingVideos, setUsTrendingVideos] = useState<TrendingVideoItem[]>([]);
    37|  const [liveVideos, setLiveVideos] = useState<TrendingVideoItem[]>([]);
    38|  const [homeDataLoaded, setHomeDataLoaded] = useState(false);
    39|
    40|  useEffect(() => {
    41|    Promise.allSettled([
    42|      fetchPopularChannels('KR').then(setPopularChannels).catch(() => {}),
    43|      fetchPopularChannels('US').then(setUsPopularChannels).catch(() => {}),
    44|      fetchPopularChannels('JP').then(setJpPopularChannels).catch(() => {}),
    45|      fetchTrendingVideos('KR', 10).then(setTrendingVideos).catch(() => {}),
    46|      fetchTrendingVideos('US', 5).then(setUsTrendingVideos).catch(() => {}),
    47|      fetchLiveVideos().then(setLiveVideos).catch(() => {}),
    48|    ]).finally(() => setHomeDataLoaded(true));
    49|  }, []);
    50|
    51|  const handleSearch = async (query: string) => {
    52|    setSearching(true);
    53|    setSearchError(null);
    54|    setChannel(null);
    55|    setVideos([]);
    56|
    57|    const cacheKey = CACHE_KEY(query);
    58|    const cached = cacheGet<{ channel: ChannelResult; videos: VideoResult[] }>(cacheKey);
    59|    if (cached) {
    60|      setChannel(cached.channel);
    61|      setVideos(cached.videos);
    62|      setSearching(false);
    63|      addSearchHistory(query);
    64|      return;
    65|    }
    66|
    67|    try {
    68|      const result = await searchChannel(query);
    69|      if (!result) { setSearchError('채널을 찾을 수 없습니다.'); return; }
    70|      const recentVideos = await fetchRecentVideos(result.id);
    71|      setChannel(result);
    72|      setVideos(recentVideos);
    73|      cacheSet(cacheKey, { channel: result, videos: recentVideos });
    74|      addSearchHistory(query);
    75|    } catch {
    76|      setSearchError('검색 중 오류가 발생했습니다. API 키를 확인해주세요.');
    77|    } finally {
    78|      setSearching(false);
    79|    }
    80|  };
    81|
    82|  const toChartItem = (ch: PopularChannelItem) => ({
    83|    rank: ch.rank,
    84|    name: ch.name,
    85|    score: ch.score,
    86|    avatar: ch.avatar,
    87|    channelId: ch.channelId,
    88|  });
    89|
    90|  const liveForWidget = useMemo(() =>
    91|    liveVideos.slice(0, 5).map((v, i) => ({
    92|      rank: i + 1,
    93|      name: v.channelName,
    94|      score: 'LIVE',
    95|      avatar: v.channelAvatar,
    96|      channelId: v.videoId,
    97|    })),
    98|    [liveVideos]
    99|  );
   100|
   101|  const trendingForWidget = trendingVideos.map((v) => ({
   102|    rank: v.rank,
   103|    title: v.title,
   104|    score: v.score,
   105|    thumbnail: v.thumbnail,
   106|    channelName: v.channelName,
   107|    channelAvatar: v.channelAvatar,
   108|    videoId: v.videoId,
   109|  }));
   110|
   111|  const usTrendingForWidget = usTrendingVideos.map((v) => ({
   112|    rank: v.rank,
   113|    title: v.title,
   114|    score: v.score,
   115|    thumbnail: v.thumbnail,
   116|    channelName: v.channelName,
   117|    channelAvatar: v.channelAvatar,
   118|    videoId: v.videoId,
   119|  }));
   120|
   121|  return (
   122|    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] transition-colors">
   123|      <TopHeader onMobileMenuToggle={() => setSidebarOpen((v) => !v)} />
   124|      <GlobalSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
   125|
   126|      <div className="lg:ml-52 pt-12">
   127|        <SearchBanner onSearch={handleSearch} loading={searching} />
   128|
   129|        {/* Search result */}
   130|        {searchError && (
   131|          <div className="mx-4 mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-sm text-sm text-red-600 dark:text-red-400">
   132|            {searchError}
   133|          </div>
   134|        )}
   135|        {channel && (
   136|          <ChannelSearchResult
   137|            channel={channel}
   138|            videos={videos}
   139|            onClose={() => { setChannel(null); setVideos([]); setSearchError(null); }}
   140|          />
   141|        )}
   142|
   143|        <div className="px-4 py-4 space-y-4">
   144|          {/* Row 1 */}
   145|          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
   146|            <ChartWidget
   147|              titleKey="chart_most_super_chatted"
   148|              items={usPopularChannels.map(toChartItem)}
   149|              scoreType="plain"
   150|              loading={!homeDataLoaded && usPopularChannels.length === 0}
   151|            />
   152|            <ChartWidget
   153|              titleKey="chart_most_live_viewers"
   154|              items={liveForWidget}
   155|              scoreType="plain"
   156|              loading={!homeDataLoaded && liveVideos.length === 0}
   157|            />
   158|            <ChartWidget
   159|              titleKey="chart_most_popular"
   160|              items={popularChannels.map(toChartItem)}
   161|              scoreType="plain"
   162|              loading={!homeDataLoaded && popularChannels.length === 0}
   163|            />
   164|          </div>
   165|
   166|          {/* Row 2 */}
   167|          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
   168|            <ChartWidget
   169|              titleKey="chart_most_growth"
   170|              items={jpPopularChannels.map(toChartItem)}
   171|              scoreType="plain"
   172|              loading={!homeDataLoaded && jpPopularChannels.length === 0}
   173|            />
   174|            <VideoWidget
   175|              title="Most Viewed (KR)"
   176|              items={trendingForWidget.length > 0 ? trendingForWidget : []}
   177|            />
   178|            <VideoWidget
   179|              title="Most Viewed (US)"
   180|              items={usTrendingForWidget.length > 0 ? usTrendingForWidget : []}
   181|            />
   182|          </div>
   183|
   184|          <TopLivesWidget items={liveVideos.length > 0 ? liveVideos : undefined} />
   185|
   186|          <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-sm px-4 py-4 transition-colors">
   187|            <div className="mb-1">
   188|              <h3 className="text-base font-semibold text-gray-900 dark:text-white">| {t('chart_topic_charts')}</h3>
   189|              <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5">{t('chart_topic_desc')}</p>
   190|            </div>
   191|          </div>
   192|
   193|          <DataStats />
   194|        </div>
   195|
   196|        <HomeFooter />
   197|      </div>
   198|    </div>
   199|  );
   200|};
   201|
   202|export default HomePage;
   203|