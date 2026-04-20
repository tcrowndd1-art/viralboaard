import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { videoCategories } from '@/mocks/videoRankings';
import { countries } from '@/mocks/channelRankings';
import { RankingVideoItem } from '@/services/youtube';
import { fetchVideoRankings } from '@/services/youtube';
import { cacheGet, cacheSet } from '@/services/cache';
import TopHeader from '@/pages/home/components/TopHeader';
import GlobalSidebar from '@/components/feature/GlobalSidebar';
import HoverPopup from '@/components/feature/HoverPopup';
import type { VideoPopupData } from '@/components/feature/HoverPopup';

type SortKey = 'rank' | 'views' | 'uploadDate';
type SortDir = 'asc' | 'desc';
type ViewTab = 'all' | 'saved';

const PAGE_SIZE = 10;
const SAVED_VIDEOS_KEY = 'viralboard_saved_videos';

const REGION_MAP: Record<string, string> = {
  ...countries.reduce((acc, c) => ({ ...acc, [c.code]: c.code }), {} as Record<string, string>),
};

const loadSavedVideos = (): Set<string> => {
  try {
    const raw = localStorage.getItem(SAVED_VIDEOS_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch { /* ignore */ }
  return new Set();
};

const persistSavedVideos = (ids: Set<string>) => {
  localStorage.setItem(SAVED_VIDEOS_KEY, JSON.stringify([...ids]));
};

const formatViews = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
};

const formatDate = (d: string) => {
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const daysAgo = (d: string) => {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
};

const CPM_BY_CATEGORY: Record<string, number> = {
  Entertainment: 3.2, Music: 2.8, Technology: 7.4, Gaming: 4.1,
  Sports: 5.2, News: 4.8, Education: 6.5, Kids: 2.1,
};

const HOOK_TYPES = [
  'Question Hook', 'Shock Statement', 'Story Hook', 'How-To Hook',
  'Controversy Hook', 'List Hook', 'Challenge Hook', 'Curiosity Gap',
];

const seededRand = (seed: number, offset = 0) => {
  const x = Math.sin(seed * 9301 + offset * 49297 + 233) * 10000;
  return x - Math.floor(x);
};

const buildVideoPopup = (video: VideoItem): VideoPopupData => {
  const cpm = CPM_BY_CATEGORY[video.category] ?? 3.5;
  const revenueBase = (video.views / 1000) * cpm;
  const r = seededRand(video.rank);
  const sparkline = Array.from({ length: 30 }, (_, i) => {
    const base = video.views * (0.3 + (i / 29) * 0.7);
    const noise = (seededRand(video.rank, i + 5) - 0.5) * video.views * 0.15;
    return Math.max(0, base + noise);
  });
  return {
    type: 'video',
    revenueMin: Math.round(revenueBase * 0.55),
    revenueMax: Math.round(revenueBase * 1.45),
    cpm: parseFloat((cpm * (0.85 + r * 0.3)).toFixed(2)),
    viewToSubRatio: parseFloat((0.02 + seededRand(video.rank, 1) * 0.12).toFixed(3)),
    engagementRate: parseFloat((0.03 + seededRand(video.rank, 2) * 0.08).toFixed(3)),
    hookType: HOOK_TYPES[Math.floor(seededRand(video.rank, 3) * HOOK_TYPES.length)],
    sparkline,
  };
};

interface DropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  icon: string;
}

const Dropdown = ({ value, options, onChange, icon }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const selected = options.find(o => o.value === value);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-white/70 text-sm px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap transition-colors min-w-[140px]"
      >
        <i className={`${icon} text-gray-400 dark:text-white/30 w-4 h-4 flex items-center justify-center`}></i>
        <span className="flex-1 text-left">{selected?.label}</span>
        <i className={`ri-arrow-down-s-line text-gray-400 dark:text-white/30 w-4 h-4 flex items-center justify-center transition-transform ${open ? 'rotate-180' : ''}`}></i>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg py-1 z-50 min-w-full max-h-60 overflow-y-auto">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm cursor-pointer whitespace-nowrap transition-colors ${
                value === opt.value
                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-600/10 font-medium'
                  : 'text-gray-700 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface ThProps {
  label: string;
  colKey: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  align?: string;
}

const Th = ({ label, colKey, sortKey, sortDir, onSort, align = 'text-left' }: ThProps) => {
  const active = colKey === sortKey;
  return (
    <th
      onClick={() => onSort(colKey)}
      className={`px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 dark:hover:text-white/60 transition-colors ${align}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="flex flex-col w-3 h-3 items-center justify-center">
          <i className={`ri-arrow-up-s-line text-xs leading-none ${active && sortDir === 'asc' ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-white/20'}`}></i>
          <i className={`ri-arrow-down-s-line text-xs leading-none ${active && sortDir === 'desc' ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-white/20'}`}></i>
        </span>
      </span>
    </th>
  );
};

const BookmarkBtn = ({
  videoId,
  savedIds,
  onToggle,
}: {
  videoId: string;
  savedIds: Set<string>;
  onToggle: (id: string) => void;
}) => {
  const saved = savedIds.has(videoId);
  const [flash, setFlash] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(videoId);
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  };

  return (
    <button
      onClick={handleClick}
      title={saved ? 'Remove from saved' : 'Save video'}
      className={`
        w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer flex-shrink-0
        ${flash ? 'scale-125' : 'scale-100'}
        ${saved
          ? 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/15 hover:bg-red-100 dark:hover:bg-red-500/25'
          : 'text-gray-300 dark:text-white/20 hover:text-red-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100'
        }
      `}
    >
      <i className={`${saved ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-sm`}></i>
    </button>
  );
};

const VideoRankingsPage = () => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [allVideos, setAllVideos] = useState<RankingVideoItem[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [viewTab, setViewTab] = useState<ViewTab>('all');
  const [savedIds, setSavedIds] = useState<Set<string>>(() => loadSavedVideos());

  const [country, setCountry] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [period, setPeriod] = useState('Daily');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRowEnter = useCallback((videoId: string, e: React.MouseEvent<HTMLTableRowElement>) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setAnchorRect(e.currentTarget.getBoundingClientRect());
    setHoveredVideoId(videoId);
  }, []);

  const handleRowLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => {
      setHoveredVideoId(null);
      setAnchorRect(null);
    }, 80);
  }, []);

  const handleToggleSave = useCallback((videoId: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      persistSavedVideos(next);
      return next;
    });
  }, []);

  const doFetch = useCallback((regionCode: string) => {
    setApiLoading(true);
    setApiError(null);
    fetchVideoRankings(regionCode, 25)
      .then((data) => {
        const videos = data as RankingVideoItem[];
        setAllVideos(videos);
        cacheSet(`vb_vid_rankings_${regionCode}`, videos);
      })
      .catch((err: unknown) => {
        setApiError(err instanceof Error ? err.message : 'Unknown error');
      })
      .finally(() => setApiLoading(false));
  }, []);

  useEffect(() => {
  const regionCode = REGION_MAP[country] ?? 'KR';
    const cacheKey = `vb_vid_rankings_${regionCode}`;
    const cached = cacheGet<RankingVideoItem[]>(cacheKey);
    if (cached) { setAllVideos(cached); setApiLoading(false); setApiError(null); return; }
    doFetch(regionCode);
  }, [country, doFetch]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir(key === 'rank' ? 'asc' : 'desc'); }
    setPage(1);
  };

  const handleTabChange = (tab: ViewTab) => {
    setViewTab(tab);
    setPage(1);
  };

  const filtered = useMemo(() => {
    let data = [...allVideos];
    if (viewTab === 'saved') data = data.filter(v => savedIds.has(v.videoId));
    if (category !== 'ALL') data = data.filter(v => v.category === category);
    data.sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'uploadDate') return (new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()) * mul;
      return (a[sortKey] > b[sortKey] ? 1 : -1) * mul;
    });
    return data;
  }, [allVideos, category, sortKey, sortDir, viewTab, savedIds]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hoveredVideo = paginated.find(v => v.videoId === hoveredVideoId) ?? null;

  const countryOptions = [{ value: 'ALL', label: 'All Countries' }, ...countries.filter(c => c.code !== 'ALL').map(c => ({ value: c.code, label: c.label }))];
  const categoryOptions = videoCategories.map(c => ({ value: c === 'All Categories' ? 'ALL' : c, label: c }));
  const periodOptions = [
    { value: 'Daily', label: t('rankings_period_daily') },
    { value: 'Weekly', label: t('rankings_period_weekly') },
    { value: 'Monthly', label: t('rankings_period_monthly') },
  ];

  const getPages = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-base flex flex-col transition-colors">
      <TopHeader onMobileMenuToggle={() => setSidebarOpen((v) => !v)} />
      <GlobalSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-52 pt-12 flex-1">
        <div className="px-4 lg:px-6 py-6 space-y-5">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-off-white">{t('video_rankings_title')}</h1>
              <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5">{t('video_rankings_desc')}</p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="flex items-center bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-1 gap-1">
                <button
                  onClick={() => handleTabChange('all')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    viewTab === 'all'
                      ? 'bg-white dark:bg-dark-base text-gray-900 dark:text-off-white'
                      : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
                  }`}
                >
                  <i className="ri-play-circle-line w-3 h-3 flex items-center justify-center"></i>
                  All Videos
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
                  {savedIds.size > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      viewTab === 'saved'
                        ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                        : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-white/40'
                    }`}>
                      {savedIds.size}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg px-4 py-2">
                <i className="ri-play-circle-line text-red-500 w-4 h-4 flex items-center justify-center"></i>
                <span className="text-sm text-gray-500 dark:text-white/40">
                  <span className="text-gray-900 dark:text-off-white font-semibold">{filtered.length}</span> {t('video_rankings_videos')}
                </span>
              </div>
            </div>
          </div>

          {viewTab === 'saved' && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-base mb-4">
                <i className="ri-bookmark-line text-2xl text-gray-300 dark:text-white/20"></i>
              </div>
              <p className="text-sm font-semibold text-gray-600 dark:text-off-white mb-1">No saved videos yet</p>
              <p className="text-xs text-gray-400 dark:text-white/30 max-w-xs">
                Hover over any video row and click the bookmark icon to save it here for quick access.
              </p>
              <button
                onClick={() => handleTabChange('all')}
                className="mt-4 text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer transition-colors"
              >
                Browse all videos →
              </button>
            </div>
          )}

          {(viewTab === 'all' || filtered.length > 0) && (
            <div className="bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg px-4 py-3 flex flex-wrap items-center gap-3">
              <Dropdown value={country} options={countryOptions} onChange={v => { setCountry(v); setPage(1); }} icon="ri-map-pin-line" />
              <Dropdown value={category} options={categoryOptions} onChange={v => { setCategory(v); setPage(1); }} icon="ri-apps-line" />
              <div className="flex items-center bg-white dark:bg-dark-base border border-gray-200 dark:border-dark-border rounded-lg p-1">
                {periodOptions.map(p => (
                  <button
                    key={p.value}
                    onClick={() => { setPeriod(p.value); setPage(1); }}
                    className={`text-sm px-3 py-1 rounded-md cursor-pointer whitespace-nowrap transition-colors ${
                      period === p.value
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium'
                        : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/25">
                <i className="ri-bar-chart-box-line w-3 h-3 flex items-center justify-center"></i>
                Hover rows for AI insights
              </div>
            </div>
          )}

          {apiLoading && (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
              <table className="w-full min-w-[760px]">
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border bg-white dark:bg-dark-base">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 w-12"><div className="w-6 h-6 bg-gray-100 dark:bg-white/10 rounded-full animate-pulse mx-auto" /></td>
                      <td className="px-4 py-3 w-28"><div className="w-20 h-[45px] bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-3 w-48 bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><div className="h-3 w-28 bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></td>
                      <td className="px-4 py-3 text-right"><div className="h-3 w-14 bg-gray-100 dark:bg-white/10 rounded animate-pulse ml-auto" /></td>
                      <td className="px-4 py-3 text-right"><div className="h-3 w-20 bg-gray-100 dark:bg-white/10 rounded animate-pulse ml-auto" /></td>
                      <td className="px-3 py-3 w-10" />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!apiLoading && apiError && (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-900/10">
              <i className="ri-error-warning-line text-3xl text-red-400 mb-3"></i>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">데이터를 불러오지 못했습니다</p>
              <p className="text-xs text-red-400 dark:text-red-500/70 max-w-xs mb-4">{apiError}</p>
              <button
                onClick={() => doFetch(REGION_MAP[country] ?? 'KR')}
                className="text-xs text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/40 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                다시 시도
              </button>
            </div>
          )}

          {!apiLoading && !apiError && filtered.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
              <table className="w-full min-w-[760px]">
                <thead className="bg-gray-50 dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
                  <tr>
                    <Th label={t('rankings_col_rank')} colKey="rank" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-center" />
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-left w-24">{t('video_rankings_col_thumbnail')}</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-left">{t('video_rankings_col_title')}</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-left hidden md:table-cell">{t('video_rankings_col_channel')}</th>
                    <Th label={t('video_rankings_col_views')} colKey="views" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-right" />
                    <Th label={t('video_rankings_col_date')} colKey="uploadDate" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-right" />
                    <th className="px-3 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {paginated.map((video, idx) => {
                    const globalIdx = (page - 1) * PAGE_SIZE + idx;
                    const isHovered = hoveredVideoId === video.videoId;
                    return (
                      <tr
                        key={video.videoId}
                        onMouseEnter={(e) => handleRowEnter(video.videoId, e)}
                        onMouseLeave={handleRowLeave}
                        className={`transition-colors cursor-pointer group ${
                          isHovered
                            ? 'bg-red-50/60 dark:bg-red-600/5'
                            : 'hover:bg-gray-50 dark:hover:bg-white/3'
                        }`}
                      >
                        <td className="px-4 py-3 text-center w-12">
                          {globalIdx < 3 ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              globalIdx === 0 ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                              globalIdx === 1 ? 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50' :
                              'bg-orange-100 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400'
                            }`}>
                              {video.rank}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-white/30 font-mono">{video.rank}</span>
                          )}
                        </td>

                        <td className="px-4 py-3 w-28">
                          <div className="relative w-20 h-[45px] rounded overflow-hidden bg-gray-100 dark:bg-white/5 flex-shrink-0">
                            <img
                              src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                              alt={video.title}
                              className="w-full h-full object-cover object-top"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                              <i className="ri-play-fill text-white text-lg w-5 h-5 flex items-center justify-center"></i>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 max-w-xs">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-800 dark:text-white/80 font-medium group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">{video.title}</p>
                            <i className="ri-bar-chart-box-line text-red-400 dark:text-red-400 text-xs w-3 h-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"></i>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5 md:hidden">{video.channelName}</p>
                        </td>

                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 dark:bg-white/5 flex-shrink-0">
                              <img src={video.channelAvatar} alt={video.channelName} className="w-full h-full object-cover object-top" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            </div>
                            <span className="text-sm text-gray-500 dark:text-white/50 truncate max-w-[140px]">{video.channelName}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-gray-800 dark:text-white/80 font-mono">{formatViews(video.views)}</span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-white/60">{formatDate(video.uploadDate)}</p>
                            <p className="text-xs text-gray-400 dark:text-white/30">{daysAgo(video.uploadDate)}</p>
                          </div>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <BookmarkBtn
                            videoId={video.videoId}
                            savedIds={savedIds}
                            onToggle={handleToggleSave}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!apiLoading && filtered.length > 0 && (
            <div className="bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg px-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3">
                <p className="text-xs text-gray-400 dark:text-white/30">
                  {t('rankings_showing')} <span className="text-gray-600 dark:text-white/60">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> {t('rankings_of')} <span className="text-gray-600 dark:text-white/60">{filtered.length}</span> {t('video_rankings_videos')}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <i className="ri-arrow-left-s-line"></i>
                  </button>
                  {getPages().map((p, i) =>
                    p === '...' ? (
                      <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-300 dark:text-white/20 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap ${
                          page === p
                            ? 'bg-red-600 text-white font-semibold'
                            : 'text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <i className="ri-arrow-right-s-line"></i>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {hoveredVideo && (
        <HoverPopup
          data={buildVideoPopup(hoveredVideo)}
          anchorRect={anchorRect}
          visible={!!hoveredVideoId}
        />
      )}
    </div>
  );
};

export default VideoRankingsPage;
