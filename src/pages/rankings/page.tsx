import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RankingChannelItem } from '@/services/youtube';
import { countries } from '@/mocks/channelRankings';
import TopHeader from '@/pages/home/components/TopHeader';
import GlobalSidebar from '@/components/feature/GlobalSidebar';
import FilterBar from './components/FilterBar';
import RankingsTable from './components/RankingsTable';
import type { SortKey, SortDir } from './components/RankingsTable';
import Pagination from './components/Pagination';
import { useSavedChannels } from '@/hooks/useSavedChannels';
import { fetchChannelRankings } from '@/services/youtube';
import { cacheGet, cacheSet } from '@/services/cache';

const PAGE_SIZE = 10;

type ViewTab = 'all' | 'saved';

const REGION_MAP: Record<string, string> = {
  ALL: 'KR',
  ...countries.reduce((acc, c) => ({ ...acc, [c.code]: c.code }), {}),
};

const RankingsPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { channels: savedChannels } = useSavedChannels();

  const [allChannels, setAllChannels] = useState<RankingChannelItem[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<ViewTab>('all');
  const [country, setCountry] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [period, setPeriod] = useState('Daily');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const regionCode = REGION_MAP[country] ?? 'KR';
    let publishedAfter = '';
    if (period === 'Weekly') {
      const d = new Date(); d.setDate(d.getDate() - 7);
      publishedAfter = d.toISOString();
    } else if (period === 'Monthly') {
      const d = new Date(); d.setDate(d.getDate() - 30);
      publishedAfter = d.toISOString();
    }
    const cacheKey = `vb_ch_rankings_v2_${regionCode}_${period}`;
    const cached = cacheGet<RankingChannelItem[]>(cacheKey);

    if (cached) {
      setAllChannels(cached);
      setApiLoading(false);
      setApiError(null);
      return;
    }

    setApiLoading(true);
    setApiError(null);
    setAllChannels([]);

    fetchChannelRankings(regionCode, publishedAfter)
      .then((data) => {
        const channels = data as RankingChannelItem[];
        setAllChannels(channels);
        cacheSet(cacheKey, channels);
      })
      .catch((err) => {
        console.error('RankingsPage Error:', err);
        setAllChannels([]);
        setApiError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.');
      })
      .finally(() => setApiLoading(false));
  }, [country, period]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'rank' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  const savedIds = useMemo(() => new Set(savedChannels.map((c) => c.id)), [savedChannels]);

  const filtered = useMemo(() => {
    let data = [...allChannels];

    if (viewTab === 'saved') {
      data = data.filter((c) => savedIds.has(String(c.rank)));
    }

    if (category !== 'ALL') data = data.filter((c) => c.category === category);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter((c) => c.name.toLowerCase().includes(q));
    }
    data.sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      return (a[sortKey] > b[sortKey] ? 1 : -1) * mul;
    });
    return data;
  }, [allChannels, category, sortKey, sortDir, viewTab, savedIds]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  const handleTabChange = (tab: ViewTab) => {
    setViewTab(tab);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-base flex flex-col transition-colors">
      <TopHeader onMobileMenuToggle={() => setSidebarOpen((v) => !v)} />
      <GlobalSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-52 pt-12 flex-1">
        <div className="px-4 lg:px-6 py-6 space-y-5">

          {/* Page title + view tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('rankings_title')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('rankings_desc')}</p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              {/* All / Saved tab switcher */}
              <div className="flex items-center bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-1 gap-1">
                <button
                  onClick={() => handleTabChange('all')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    viewTab === 'all'
                      ? 'bg-white dark:bg-dark-base text-gray-900 dark:text-off-white'
                      : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
                  }`}
                >
                  <i className="ri-bar-chart-line w-3 h-3 flex items-center justify-center"></i>
                  All Channels
                </button>
                <button
                  onClick={() => handleTabChange('saved')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    viewTab === 'saved'
                      ? 'bg-white dark:bg-dark-base text-red-600 dark:text-red-400'
                      : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
                  }`}
                >
                  <i className={`${viewTab === 'saved' ? 'ri-bookmark-fill' : 'ri-bookmark-line'} w-3 h-3 flex items-center justify-center`}></i>
                  Saved
                  {savedChannels.length > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      viewTab === 'saved'
                        ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                        : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-white/40'
                    }`}>
                      {savedChannels.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Channel count badge */}
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg px-4 py-2">
                <i className="ri-youtube-line text-red-500 w-4 h-4 flex items-center justify-center"></i>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="text-gray-900 dark:text-white font-semibold">{filtered.length}</span> {t('rankings_channels')}
                </span>
              </div>
            </div>
          </div>

          {/* Saved empty state */}
          {viewTab === 'saved' && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-base mb-4">
                <i className="ri-bookmark-line text-2xl text-gray-300 dark:text-white/20"></i>
              </div>
              <p className="text-sm font-semibold text-gray-600 dark:text-off-white mb-1">No saved channels yet</p>
              <p className="text-xs text-gray-400 dark:text-white/30 max-w-xs">
                Hover over any channel row and click the bookmark icon to save it here for quick access.
              </p>
              <button
                onClick={() => handleTabChange('all')}
                className="mt-4 text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer transition-colors"
              >
                Browse all channels â†’
              </button>
            </div>
          )}

          {/* Filter bar â€” only show when there are results */}
          {(viewTab === 'all' || filtered.length > 0) && (
            <div className="bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg px-4 py-3">
              <FilterBar
                country={country}
                category={category}
                period={period}
                onCountryChange={handleFilterChange(setCountry)}
                onCategoryChange={handleFilterChange(setCategory)}
                onPeriodChange={handleFilterChange(setPeriod)}
              />
            </div>
          )}

          {/* Loading skeleton */}
          {apiLoading && (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
              <table className="w-full min-w-[740px]">
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border bg-white dark:bg-dark-base">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="px-4 py-3">
                      <td className="px-4 py-3 w-12"><div className="w-6 h-6 bg-gray-100 dark:bg-white/10 rounded-full animate-pulse mx-auto" /></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 animate-pulse flex-shrink-0" /><div className="h-3 w-32 bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></div></td>
                      <td className="px-4 py-3 hidden md:table-cell"><div className="h-3 w-20 bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><div className="h-3 w-12 bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></td>
                      <td className="px-4 py-3 text-right"><div className="h-3 w-14 bg-gray-100 dark:bg-white/10 rounded animate-pulse ml-auto" /></td>
                      <td className="px-4 py-3 text-right"><div className="h-3 w-14 bg-gray-100 dark:bg-white/10 rounded animate-pulse ml-auto" /></td>
                      <td className="px-4 py-3 text-right"><div className="h-3 w-10 bg-gray-100 dark:bg-white/10 rounded animate-pulse ml-auto" /></td>
                      <td className="px-3 py-3 w-10" />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Error state */}
          {!apiLoading && apiError && (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-900/10">
              <i className="ri-error-warning-line text-3xl text-red-400 mb-3"></i>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">데이터를 불러오지 못했습니다</p>
              <p className="text-xs text-red-400 dark:text-red-500/70 max-w-xs mb-4">{apiError}</p>
              <button
                onClick={() => {
                  const regionCode = REGION_MAP[country] ?? 'KR';
                  let publishedAfter = '';
                  if (period === 'Weekly') { const d = new Date(); d.setDate(d.getDate() - 7); publishedAfter = d.toISOString(); }
                  else if (period === 'Monthly') { const d = new Date(); d.setDate(d.getDate() - 30); publishedAfter = d.toISOString(); }
                  setApiError(null);
                  setApiLoading(true);
                  fetchChannelRankings(regionCode, publishedAfter)
                    .then((data) => { setAllChannels(data as RankingChannelItem[]); })
                    .catch((err) => setApiError(err instanceof Error ? err.message : '오류가 발생했습니다.'))
                    .finally(() => setApiLoading(false));
                }}
                className="text-xs text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/40 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* Empty state for filters */}
          {!apiLoading && !apiError && filtered.length === 0 && viewTab !== 'saved' && allChannels.length > 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-base mb-4">
                <i className="ri-search-line text-2xl text-gray-300 dark:text-white/20"></i>
              </div>
              <p className="text-sm font-semibold text-gray-600 dark:text-off-white mb-1">해당 카테고리 채널이 없습니다</p>
              <p className="text-xs text-gray-400 dark:text-white/30 max-w-xs mb-4">
                현재 기간/지역 트렌드에서 선택한 카테고리의 채널이 없습니다.
              </p>
              <button
                onClick={() => { setCategory('ALL'); setPage(1); }}
                className="text-xs text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/40 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                카테고리 초기화
              </button>
            </div>
          )}

          {/* Table */}
          {!apiLoading && filtered.length > 0 && (
            <RankingsTable
              channels={paginated}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
            />
          )}

          {/* Pagination */}
          {!apiLoading && filtered.length > 0 && (
            <div className="bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg px-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingsPage;
