import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { searchChannel, searchVideos } from '@/services/youtube';
import type { ChannelResult } from '@/services/youtube';
import TopHeader from '@/pages/home/components/TopHeader';
import GlobalSidebar from '@/components/feature/GlobalSidebar';
import SearchFilterTabs from './components/SearchFilterTabs';
import ChannelCard from './components/ChannelCard';
import VideoCard from './components/VideoCard';
import { supabase } from '@/services/supabase';
import kwTranslations from '@/lib/keyword-translations.json';

/* ── Keyword video search result type ── */
interface KwVideoItem {
  videoId: string;
  title: string;
  channelName: string;
  channelId: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
  thumbnail: string;
  country: string;
  subscriberCount: number;
  viralScore: number | null;
}

const fmtViews = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};
const timeAgo = (iso: string) => {
  if (!iso) return '';
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (d === 0) return '오늘';
  if (d < 7) return `${d}일 전`;
  if (d < 30) return `${Math.floor(d / 7)}주 전`;
  if (d < 365) return `${Math.floor(d / 30)}개월 전`;
  return `${Math.floor(d / 365)}년 전`;
};

const ALL_KEYWORDS = Object.keys(kwTranslations);

type SortMode = 'viral' | 'views' | 'likes';

/* ── Keyword video card ── */
const KwVideoCard = ({ v }: { v: KwVideoItem }) => {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <a
      href={`https://www.youtube.com/watch?v=${v.videoId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-white/[0.07] hover:border-red-200 dark:hover:border-red-500/30 transition-all overflow-hidden"
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {imgFailed ? (
          <div className="w-full h-full bg-gray-100 dark:bg-white/8 flex items-center justify-center">
            <i className="ri-video-line text-gray-300 dark:text-white/20 text-2xl"></i>
          </div>
        ) : (
          <img
            src={v.thumbnail || `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`}
            alt={v.title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
            onError={() => setImgFailed(true)}
          />
        )}
        <div className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5">
          <span className="text-white/90 text-[9px] font-mono font-bold">{fmtViews(v.views)}</span>
        </div>
        {v.country && (
          <div className="absolute top-1.5 left-1.5 bg-black/60 rounded px-1.5 py-0.5">
            <span className="text-white/70 text-[8px] font-mono">{v.country}</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[12px] font-semibold text-gray-900 dark:text-white/90 line-clamp-2 leading-snug mb-1.5 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
          {v.title}
        </p>
        <div className="flex items-center justify-between gap-1 text-[10px] text-gray-400 dark:text-white/40">
          <span className="truncate">{v.channelName}</span>
          <span className="font-mono flex-shrink-0">{timeAgo(v.publishedAt)}</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5 text-[9px] text-gray-400 dark:text-white/35 font-mono">
          <span className="flex items-center gap-0.5"><i className="ri-thumb-up-line"></i>{fmtViews(v.likes)}</span>
          <span className="flex items-center gap-0.5"><i className="ri-chat-3-line"></i>{fmtViews(v.comments)}</span>
          {v.viralScore !== null && v.viralScore >= 5 && (
            <span className="text-amber-500 font-bold">×{Math.round(v.viralScore)}</span>
          )}
        </div>
      </div>
    </a>
  );
};

/* ── Keyword search section ── */
const KeywordSearchSection = ({ initialKw }: { initialKw: string }) => {
  const [selectedKw, setSelectedKw] = useState(initialKw || ALL_KEYWORDS[0]);
  const [sortMode, setSortMode] = useState<SortMode>('viral');
  const [results, setResults] = useState<KwVideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const runSearch = useCallback(async (kw: string) => {
    setLoading(true);
    setResults([]);
    setPage(1);
    try {
      const terms: string[] = (kwTranslations as Record<string, string[]>)[kw] ?? [kw];
      // Build OR filter using ilike across title for each translation
      const orFilter = terms.map(t => `title.ilike.%${t}%`).join(',');
      const { data, error } = await supabase
        .from('viralboard_data')
        .select('video_id, title, channel, channel_id, views, likes, comments, published_at, thumbnail_url, country, subscriber_count')
        .or(orFilter)
        .order('views', { ascending: false })
        .limit(200);
      if (error || !data) return;
      // Dedup by video_id
      const seen = new Set<string>();
      const deduped: KwVideoItem[] = [];
      for (const v of data as any[]) {
        if (!v.video_id || seen.has(v.video_id)) continue;
        seen.add(v.video_id);
        const viral = v.subscriber_count > 0 ? v.views / v.subscriber_count : null;
        deduped.push({
          videoId: v.video_id,
          title: v.title ?? '',
          channelName: v.channel ?? '',
          channelId: v.channel_id ?? '',
          views: v.views ?? 0,
          likes: v.likes ?? 0,
          comments: v.comments ?? 0,
          publishedAt: v.published_at ?? '',
          thumbnail: (v.thumbnail_url ?? '').replace(/\/(hq|mq|sd)default\.jpg/, '/mqdefault.jpg'),
          country: v.country ?? '',
          subscriberCount: v.subscriber_count ?? 0,
          viralScore: viral,
        });
      }
      setResults(deduped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(selectedKw);
  }, [selectedKw, runSearch]);

  const sorted = useMemo(() => {
    const arr = [...results];
    if (sortMode === 'views') arr.sort((a, b) => b.views - a.views);
    else if (sortMode === 'likes') arr.sort((a, b) => b.likes - a.likes);
    else arr.sort((a, b) => (b.viralScore ?? 0) - (a.viralScore ?? 0));
    return arr;
  }, [results, sortMode]);

  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));

  return (
    <div>
      {/* Keyword grid */}
      <div className="mb-5">
        <p className="text-[10px] font-bold text-gray-400 dark:text-white/35 uppercase tracking-widest mb-2">키워드 선택</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_KEYWORDS.map((kw) => (
            <button
              key={kw}
              onClick={() => { setSelectedKw(kw); }}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedKw === kw
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/55 hover:bg-gray-200 dark:hover:bg-white/18'
              }`}
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* Sort + count header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400 dark:text-white/40">{loading ? '검색 중...' : `${sorted.length}개 결과`}</span>
        </div>
        <div className="flex items-center gap-1">
          {(['viral', 'views', 'likes'] as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                sortMode === mode
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/18'
              }`}
            >
              {mode === 'viral' ? '바이럴' : mode === 'views' ? '조회수' : '좋아요'}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5">
              <div className="w-full bg-gray-200 dark:bg-white/10" style={{ aspectRatio: '16/9' }} />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <i className="ri-search-line text-gray-300 dark:text-white/20 text-3xl mb-3"></i>
          <p className="text-sm text-gray-400 dark:text-white/40">이 키워드로 수집된 영상이 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {paged.map((v) => <KwVideoCard key={v.videoId} v={v} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/8 cursor-pointer text-sm">
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .map((p, i, arr) => (
              <>
                {i > 0 && arr[i - 1] !== p - 1 && <span key={`e${p}`} className="text-gray-300 dark:text-white/20 text-xs">…</span>}
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-xs font-semibold cursor-pointer ${
                    page === p ? 'bg-red-600 text-white' : 'border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/8'
                  }`}>{p}</button>
              </>
            ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/8 cursor-pointer text-sm">
            ›
          </button>
        </div>
      )}
    </div>
  );
};

/* ════════════════ MAIN PAGE ════════════════ */
const SearchPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const typeParam = searchParams.get('type') ?? '';
  const kwParam = searchParams.get('kw') ?? '';
  const isKeywordMode = typeParam === 'keyword';

  const [activeTab, setActiveTab] = useState<'all' | 'channels' | 'videos'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [results, setResults] = useState<{ channels: any[], videos: any[] }>({ channels: [], videos: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isKeywordMode || !query.trim()) return;
    setLoading(true);
    Promise.all([
      searchChannel(query).catch((): ChannelResult[] => []),
      searchVideos(query).catch(() => []),
    ])
      .then(([channels, videos]) => {
        setResults({ channels, videos });
      })
      .finally(() => setLoading(false));
  }, [query, isKeywordMode]);

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
      <div className="lg:ml-52 pt-12 pb-16 lg:pb-0">
        <div className="px-4 md:px-6 py-6 max-w-7xl">

          {/* Mode toggle */}
          <div className="flex items-center gap-2 mb-5">
            <a
              href="/search"
              className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all ${!isKeywordMode ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/55 hover:bg-gray-200 dark:hover:bg-white/18'}`}
            >
              <i className="ri-user-line mr-1"></i>채널 검색
            </a>
            <a
              href="/search?type=keyword"
              className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all ${isKeywordMode ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/55 hover:bg-gray-200 dark:hover:bg-white/18'}`}
            >
              <i className="ri-hashtag mr-1"></i>키워드 영상
            </a>
          </div>

          {isKeywordMode ? (
            <>
              <div className="mb-4">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">키워드 영상 탐색</h1>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">DB에서 키워드 매핑 영상을 다국가로 탐색 · 바이럴 점수 순 정렬</p>
              </div>
              <KeywordSearchSection initialKw={kwParam} />
            </>
          ) : (
            <>
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
                      {loading ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 border border-gray-300 dark:border-gray-600 border-t-red-500 rounded-full animate-spin inline-block"></span>
                          검색 중...
                        </span>
                      ) : (
                        <>{t('search_found')} {filteredChannels.length} {t('search_channels_count')} {filteredVideos.length} {t('search_videos_count')}</>
                      )}
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
              ) : !query.trim() ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-full mb-4">
                    <i className="ri-search-line text-gray-400 dark:text-gray-500 text-2xl"></i>
                  </div>
                  <h2 className="text-gray-800 dark:text-white font-semibold text-lg mb-2">채널명 또는 영상 제목을 검색하세요</h2>
                  <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs">검색창에 채널명이나 영상 제목을 입력하면 관련 결과를 보여드립니다.</p>
                </div>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
