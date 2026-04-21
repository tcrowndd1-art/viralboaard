import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { searchChannels, searchVideos } from '@/services/youtube';
import TopHeader from '@/pages/home/components/TopHeader';
import GlobalSidebar from '@/components/feature/GlobalSidebar';
import SearchFilterTabs from './components/SearchFilterTabs';
import ChannelCard from './components/ChannelCard';
import VideoCard from './components/VideoCard';

const SearchPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [activeTab, setActiveTab] = useState<'all' | 'channels' | 'videos'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [results, setResults] = useState<{ channels: any[], videos: any[] }>({ channels: [], videos: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    Promise.all([searchChannels(query), searchVideos(query)])
      .then(([channels, videos]) => {
        setResults({
          channels: channels ?? [],
          videos: videos ?? []
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  const filteredChannels = results.channels;
  const filteredVideos = results.videos;

  const displayedResults = useMemo(() => {
    if (activeTab === 'channels') return filteredChannels.map(c => ({ ...c, type: 'channel' as const }));
    if (activeTab === 'videos') return filteredVideos.map(v => ({ ...v, type: 'video' as const }));
    const mixed = [];
    const maxLen = Math.max(filteredChannels.length, filteredVideos.length);
    for (let i = 0; i < maxLen; i++) {
      if (filteredChannels[i]) mixed.push({ ...filteredChannels[i], type: 'channel' as const });
      if (filteredVideos[i]) mixed.push({ ...filteredVideos[i], type: 'video' as const });
    }
    return mixed;
  }, [activeTab, filteredChannels, filteredVideos]);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-base transition-colors">
      <TopHeader onMobileMenuToggle={() => setSidebarOpen((v) => !v)} />
      <GlobalSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-52 pt-12">
        <div className="px-4 md:px-6 py-6 max-w-7xl">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-3 flex-wrap">
              <Link to="/" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer">{t('search_home')}</Link>
              <i className="ri-arrow-right-s-line w-4 h-4 flex items-center justify-center"></i>
              <span className="text-gray-600 dark:text-gray-300">{t('search_results_label')}</span>
            </div>
            {query ? (
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('search_results_for')} &ldquo;<span className="text-red-500">{query}</span>&rdquo;
                </h1>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  {t('search_found')} {filteredChannels.length} {t('search_channels_count')} {filteredVideos.length} {t('search_videos_count')}
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('search_explore_all')}</h1>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">{t('search_browse_all')}</p>
              </div>
            )}
          </div>
          <div className="mb-6">
            <SearchFilterTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              totalCount={filteredChannels.length + filteredVideos.length}
              channelCount={filteredChannels.length}
              videoCount={filteredVideos.length}
            />
          </div>
          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div></div>
          ) : displayedResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-full mb-4">
                <i className="ri-search-line text-gray-400 dark:text-gray-500 text-2xl"></i>
              </div>
              <h2 className="text-gray-800 dark:text-white font-semibold text-lg mb-2">{t('search_no_results')}</h2>
              <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs">{t('search_no_results_desc')}</p>
              <button onClick={() => setActiveTab('all')} className="mt-4 px-4 py-2 min-h-[44px] bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">
                {t('search_show_all')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedResults.map((result, i) =>
                result.type === 'channel' ? <ChannelCard key={`ch-${i}`} channel={result} /> : <VideoCard key={`vid-${i}`} video={result} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
