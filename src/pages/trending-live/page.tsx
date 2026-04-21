import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchLiveVideos } from '@/services/youtube';
import { TrendingVideoItem } from '@/services/youtube';
import CountrySelector from './components/CountrySelector';
import CategoryTabs from './components/CategoryTabs';
import LiveCard from './components/LiveCard';
import Sidebar from '@/pages/home/components/Sidebar';
import TopHeader from '@/pages/home/components/TopHeader';

const TrendingLivePage = () => {
  const { t } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState('VN');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [sortBy, setSortBy] = useState('viewers');

  const filtered = useMemo(() => {
    let list = liveStreams;

    if (selectedCountry !== 'all') {
      list = list.filter((s) => s.country === selectedCountry);
    }

    if (activeCategory !== '전체') {
      list = list.filter((s) => s.category === activeCategory);
    }

    if (sortBy === 'viewers') {
      list = [...list].sort((a, b) => b.viewerCount - a.viewerCount);
    } else if (sortBy === 'superchat') {
      list = [...list].sort((a, b) => (b.superChatAmount || 0) - (a.superChatAmount || 0));
    } else if (sortBy === 'recent') {
      list = [...list].reverse();
    }

    return list;
  }, [selectedCountry, activeCategory, sortBy]);

  const currentSort = sortOptions.find((s) => s.value === sortBy);

  return (
    <div className="min-h-screen bg-white">
      <TopHeader />
      <Sidebar />

      <main className="lg:ml-48 pt-12">
        <div className="max-w-6xl mx-auto px-6 py-6">

          {/* Country Selector */}
          <div className="flex items-center gap-2 mb-4">
            <CountrySelector selected={selectedCountry} onChange={setSelectedCountry} />
          </div>

          {/* Category Tabs */}
          <div className="mb-6">
            <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
          </div>

          {/* Sort Label */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">
                {currentSort?.label}
              </span>
              <div className="flex items-center gap-1 ml-2">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`whitespace-nowrap text-xs px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                      sortBy === opt.value
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"></span>
              <span className="text-xs text-gray-500">{filtered.length} {t('trending_live_count')}</span>
            </div>
          </div>

          {/* Live Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <i className="ri-live-line text-5xl text-gray-300 w-14 h-14 flex items-center justify-center mx-auto mb-3"></i>
              <p className="text-sm text-gray-500">{t('trending_no_live')}</p>
              <button
                onClick={() => { setSelectedCountry('all'); setActiveCategory('전체'); }}
                className="whitespace-nowrap mt-3 text-xs text-gray-600 underline cursor-pointer hover:text-gray-900"
              >
                {t('trending_reset_filter')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((stream, idx) => (
                <LiveCard
                  key={stream.id}
                  stream={stream}
                  rank={sortBy === 'viewers' && idx === 0 ? 1 : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrendingLivePage;
