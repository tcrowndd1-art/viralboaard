import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TopHeader from '@/pages/home/components/TopHeader';
import GlobalSidebar from '@/components/feature/GlobalSidebar';
import SearchFilterTabs from './components/SearchFilterTabs';
import ChannelCard from './components/ChannelCard';
import VideoCard from './components/VideoCard';
import { mockChannelResults, mockVideoResults } from '@/mocks/searchResults';
import type { SearchResult } from '@/mocks/searchResults';

const SearchPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [activeTab, setActiveTab] = useState<'all' | 'channels' | 'videos'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredChannels = useMemo(() => {
    if (!query.trim()) return mockChannelResults;
    const q = query.toLowerCase();
    return mockChannelResults.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [query]);

  const filteredVideos = useMemo(() => {
    if (!query.trim()) return mockVideoResults;
    const q = query.toLowerCase();
    return mockVideoResults.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.channelName.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
    );
  }, [query]);

  const displayedResults = useMemo((): SearchResult[] => {
    if (activeTab === 'channels') return filteredChannels;
    if (activeTab === 'videos') return filteredVideos;
    const mixed: SearchResult[] = [];
    const maxLen = Math.max(filteredChannels.length, filteredVideos.length);
    for (let i = 0; i < maxLen; i++) {
      if (filteredChannels[i]) mixed.push(filteredChannels[i]);
      if (filteredVideos[i]) mixed.push(filteredVideos[i]);
    }
    return mixed;
  }, [activeTab, filteredChannels, filteredVideos]);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-base transition-colors">
      <TopHeader onMobileMenuToggle={() => setSidebarOpen((v) => !v)} />
      <GlobalSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-52 pt-12">
        <div className="px-4 md:px-6 py-6 max-w-7xl">
          {/* Header */}
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

          {/* Filter Tabs */}
          <div className="mb-6">
            <SearchFilterTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              totalCount={filteredChannels.length + filteredVideos.length}
              channelCount={filteredChannels.length}
              videoCount={filteredVideos.length}
            />
          </div>

          {/* Results Grid */}
          {displayedResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-full mb-4">
                <i className="ri-search-line text-gray-400 dark:text-gray-500 text-2xl"></i>
              </div>
              <h2 className="text-gray-800 dark:text-white font-semibold text-lg mb-2">{t('search_no_results')}</h2>
              <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs">{t('search_no_results_desc')}</p>
              <button
                onClick={() => setActiveTab('all')}
                className="mt-4 px-4 py-2 min-h-[44px] bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                {t('search_show_all')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedResults.map((result) =>
                result.type === 'channel' ? (
                  <ChannelCard key={result.id} channel={result} />
                ) : (
                  <VideoCard key={result.id} video={result} />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
