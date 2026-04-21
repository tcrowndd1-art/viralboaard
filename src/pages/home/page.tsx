import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TopHeader from './components/TopHeader';
import GlobalSidebar from '@/components/feature/GlobalSidebar';
import SearchBanner from './components/SearchBanner';
import ChartWidget from './components/ChartWidget';
import VideoWidget from './components/VideoWidget';
import TopLivesWidget from './components/TopLivesWidget';
import DataStats from './components/DataStats';
import HomeFooter from './components/HomeFooter';
import ChannelSearchResult from './components/ChannelSearchResult';
import {
  searchChannel, fetchRecentVideos, fetchPopularChannels,
  fetchTrendingVideos, fetchLiveVideos,
} from '@/services/youtube';
import type { ChannelResult, VideoResult, PopularChannelItem, TrendingVideoItem } from '@/services/youtube';
import { cacheGet, cacheSet, addSearchHistory } from '@/services/cache';

const CACHE_KEY = (q: string) => `vb_channel_${q.toLowerCase().trim()}`;

const HomePage = () => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Channel search
  const [searching, setSearching] = useState(false);
  const [channel, setChannel] = useState<ChannelResult | null>(null);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // API data
  const [popularChannels, setPopularChannels] = useState<PopularChannelItem[]>([]);
  const [usPopularChannels, setUsPopularChannels] = useState<PopularChannelItem[]>([]);
  const [jpPopularChannels, setJpPopularChannels] = useState<PopularChannelItem[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<TrendingVideoItem[]>([]);
  const [usTrendingVideos, setUsTrendingVideos] = useState<TrendingVideoItem[]>([]);
  const [liveVideos, setLiveVideos] = useState<TrendingVideoItem[]>([]);
  const [homeDataLoaded, setHomeDataLoaded] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      fetchPopularChannels('KR').then(setPopularChannels).catch(() => {}),
      fetchPopularChannels('US').then(setUsPopularChannels).catch(() => {}),
      fetchPopularChannels('JP').then(setJpPopularChannels).catch(() => {}),
      fetchTrendingVideos('KR', 10).then(setTrendingVideos).catch(() => {}),
      fetchTrendingVideos('US', 5).then(setUsTrendingVideos).catch(() => {}),
      fetchLiveVideos().then(setLiveVideos).catch(() => {}),
    ]).finally(() => setHomeDataLoaded(true));
  }, []);

  const handleSearch = async (query: string) => {
    setSearching(true);
    setSearchError(null);
    setChannel(null);
    setVideos([]);

    const cacheKey = CACHE_KEY(query);
    const cached = cacheGet<{ channel: ChannelResult; videos: VideoResult[] }>(cacheKey);
    if (cached) {
      setChannel(cached.channel);
      setVideos(cached.videos);
      setSearching(false);
      addSearchHistory(query);
      return;
    }

    try {
      const result = await searchChannel(query);
      if (!result) { setSearchError('채널을 찾을 수 없습니다.'); return; }
      const recentVideos = await fetchRecentVideos(result.id);
      setChannel(result);
      setVideos(recentVideos);
      cacheSet(cacheKey, { channel: result, videos: recentVideos });
      addSearchHistory(query);
    } catch {
      setSearchError('검색 중 오류가 발생했습니다. API 키를 확인해주세요.');
    } finally {
      setSearching(false);
    }
  };

  const toChartItem = (ch: PopularChannelItem) => ({
    rank: ch.rank,
    name: ch.name,
    score: ch.score,
    avatar: ch.avatar,
    channelId: ch.channelId,
  });

  const liveForWidget = useMemo(() =>
    liveVideos.slice(0, 5).map((v, i) => ({
      rank: i + 1,
      name: v.channelName,
      score: 'LIVE',
      avatar: v.channelAvatar,
      channelId: v.channelId,
    })),
    [liveVideos]
  );

  const trendingForWidget = trendingVideos.map((v) => ({
    rank: v.rank,
    title: v.title,
    score: v.score,
    thumbnail: v.thumbnail,
    channelName: v.channelName,
    channelAvatar: v.channelAvatar,
    videoId: v.videoId,
  }));

  const usTrendingForWidget = usTrendingVideos.map((v) => ({
    rank: v.rank,
    title: v.title,
    score: v.score,
    thumbnail: v.thumbnail,
    channelName: v.channelName,
    channelAvatar: v.channelAvatar,
    videoId: v.videoId,
  }));

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] transition-colors">
      <TopHeader onMobileMenuToggle={() => setSidebarOpen((v) => !v)} />
      <GlobalSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-52 pt-12">
        <SearchBanner onSearch={handleSearch} loading={searching} />

        {/* Search result */}
        {searchError && (
          <div className="mx-4 mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-sm text-sm text-red-600 dark:text-red-400">
            {searchError}
          </div>
        )}
        {channel && (
          <ChannelSearchResult
            channel={channel}
            videos={videos}
            onClose={() => { setChannel(null); setVideos([]); setSearchError(null); }}
          />
        )}

        <div className="px-4 py-4 space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <ChartWidget
              titleKey="chart_most_super_chatted"
              items={usPopularChannels.map(toChartItem)}
              scoreType="plain"
              loading={!homeDataLoaded && usPopularChannels.length === 0}
            />
            <ChartWidget
              titleKey="chart_most_live_viewers"
              items={liveForWidget}
              scoreType="plain"
              loading={!homeDataLoaded && liveVideos.length === 0}
            />
            <ChartWidget
              titleKey="chart_most_popular"
              items={popularChannels.map(toChartItem)}
              scoreType="plain"
              loading={!homeDataLoaded && popularChannels.length === 0}
            />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <ChartWidget
              titleKey="chart_most_growth"
              items={jpPopularChannels.map(toChartItem)}
              scoreType="plain"
              loading={!homeDataLoaded && jpPopularChannels.length === 0}
            />
            <VideoWidget
              title="Most Viewed (KR)"
              items={trendingForWidget.length > 0 ? trendingForWidget : []}
            />
            <VideoWidget
              title="Most Viewed (US)"
              items={usTrendingForWidget.length > 0 ? usTrendingForWidget : []}
            />
          </div>

          <TopLivesWidget items={liveVideos.length > 0 ? liveVideos : undefined} />

          <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-sm px-4 py-4 transition-colors">
            <div className="mb-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">| {t('chart_topic_charts')}</h3>
              <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5">{t('chart_topic_desc')}</p>
            </div>
          </div>

          <DataStats />
        </div>

        <HomeFooter />
      </div>
    </div>
  );
};

export default HomePage;
