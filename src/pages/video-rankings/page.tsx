import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { videoCategories } from '@/mocks/videoRankings';
import { countries } from '@/mocks/channelRankings';
import { RankingVideoItem, ViralVideoItem } from '@/services/youtube';
import { fetchVideoRankings, fetchViralVideos } from '@/services/youtube';
import { viralMockData } from '@/mocks/viralData';
import { cacheGet, cacheSet } from '@/services/cache';
import TopHeader from '@/pages/home/components/TopHeader';
import GlobalSidebar from '@/components/feature/GlobalSidebar';
import HoverPopup from '@/components/feature/HoverPopup';
import type { VideoPopupData } from '@/components/feature/HoverPopup';

type SortKey = 'rank' | 'views' | 'uploadDate';
type SortDir = 'asc' | 'desc';
type ViewTab = 'all' | 'saved';
type PageMode = 'rankings' | 'viral';

const PAGE_SIZE = 10;
const SAVED_VIDEOS_KEY = 'viralboard_saved_videos';

const REGION_MAP: Record<string, string> = {
  ALL: 'KR',
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

const buildVideoPopup = (video: RankingVideoItem): VideoPopupData => {
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

const CPM_MAP: Record<string, number> = {
  Technology: 10.5, Education: 8.2, Gaming: 4.5,
  Entertainment: 3.5, Music: 3.0, Sports: 6.0,
  News: 7.0, Kids: 2.0, Comedy: 3.8,
};

const formatViralScore = (score: number): string => {
  if (score >= 100) return `×${score.toFixed(0)}`;
  if (score >= 10) return `×${score.toFixed(1)}`;
  return `×${score.toFixed(2)}`;
};

const viralScoreColor = (score: number): string => {
  if (score >= 50) return 'text-red-500 dark:text-red-400 font-bold';
  if (score >= 20) return 'text-orange-500 dark:text-orange-400 font-semibold';
  if (score >= 10) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-gray-500 dark:text-white/40';
};

const calcRevenue = (views: number, category: string): { min: number; max: number } => {
  const cpm = CPM_MAP[category] ?? 4.0;
  const base = (views / 1000) * cpm * 0.55;
  return { min: Math.round(base * 0.6), max: Math.round(base * 1.4) };
};

const fmtMoney = (n: number): string => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
};

const calcVPH = (views: number, uploadDate: string): number => {
  const hours = Math.max(1, (Date.now() - new Date(uploadDate).getTime()) / 3_600_000);
  return Math.round(views / Math.min(hours, 72));
};

const calcVideoScore = (viral: ViralVideoItem): number => {
  const viralNorm = Math.min(viral.viralScore / 200, 1) * 40;
  const viewsNorm = Math.min(viral.views / 20_000_000, 1) * 30;
  const recencyDays = (Date.now() - new Date(viral.uploadDate).getTime()) / 86_400_000;
  const recencyNorm = Math.max(0, 1 - recencyDays / 7) * 30;
  return Math.round(viralNorm + viewsNorm + recencyNorm);
};

const VideoRankingsPage = () => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageMode, setPageMode] = useState<PageMode>('rankings');

  const [allVideos, setAllVideos] = useState<RankingVideoItem[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [viralVideos, setViralVideos] = useState<ViralVideoItem[]>([]);
  const [viralLoading, setViralLoading] = useState(false);
  const [viralError, setViralError] = useState<string | null>(null);

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

  const doFetch = useCallback((regionCode: string, publishedAfter: string, periodKey: string) => {
    setApiLoading(true);
    setApiError(null);
    setAllVideos([]);
    fetchVideoRankings(regionCode, 50, publishedAfter)
      .then((data) => {
        const videos = data as RankingVideoItem[];
        setAllVideos(videos);
        cacheSet(`vb_vid_rankings_v2_${regionCode}_${periodKey}`, videos);
      })
      .catch((err: unknown) => {
        setAllVideos([]);
        setApiError(err instanceof Error ? err.message : 'Unknown error');
      })
      .finally(() => setApiLoading(false));
  }, []);

  useEffect(() => {
    const regionCode = REGION_MAP[country] ?? 'KR';
    const periodKey = period.toLowerCase();
    let publishedAfter = '';
    if (period === 'Weekly') {
      const d = new Date(); d.setDate(d.getDate() - 7);
      publishedAfter = d.toISOString();
    } else if (period === 'Monthly') {
      const d = new Date(); d.setDate(d.getDate() - 30);
      publishedAfter = d.toISOString();
    }
    const cacheKey = `vb_vid_rankings_v2_${regionCode}_${periodKey}`;
    const cached = cacheGet<RankingVideoItem[]>(cacheKey);
    if (cached) { setAllVideos(cached); setApiLoading(false); setApiError(null); return; }
    doFetch(regionCode, publishedAfter, periodKey);
  }, [country, period, doFetch]);

  const [viralIsDemo, setViralIsDemo] = useState(false);

  const doFetchViral = useCallback((regionCode: string) => {
    const cacheKey = `vb_viral_v1_${regionCode}`;
    const cached = cacheGet<ViralVideoItem[]>(cacheKey);
    if (cached) {
      setViralVideos(cached); setViralLoading(false); setViralError(null); setViralIsDemo(false); return;
    }
    setViralLoading(true);
    setViralError(null);
    setViralVideos([]);
    setViralIsDemo(false);
    fetchViralVideos(regionCode)
      .then((data) => {
        setViralVideos(data);
        setViralIsDemo(false);
        cacheSet(cacheKey, data);
      })
      .catch(() => {
        // API quota exhausted — show demo data so UI is functional
        setViralVideos(viralMockData);
        setViralIsDemo(true);
        setViralError(null);
      })
      .finally(() => setViralLoading(false));
  }, []);

  useEffect(() => {
    if (pageMode === 'viral') {
      doFetchViral(REGION_MAP[country] ?? 'KR');
    }
  }, [pageMode, country, doFetchViral]);

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
  }, [allVideos, category, period, sortKey, sortDir, viewTab, savedIds]);

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
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-off-white">
                  {pageMode === 'viral' ? '🔥 떡상 탐지' : t('video_rankings_title')}
                </h1>
                <div className="flex items-center bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-0.5">
                  <button
                    onClick={() => setPageMode('rankings')}
                    className={`text-xs px-3 py-1.5 rounded-md cursor-pointer whitespace-nowrap transition-all ${
                      pageMode === 'rankings'
                        ? 'bg-white dark:bg-dark-base text-gray-900 dark:text-off-white font-semibold shadow-sm'
                        : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
                    }`}
                  >
                    인기 순위
                  </button>
                  <button
                    onClick={() => setPageMode('viral')}
                    className={`text-xs px-3 py-1.5 rounded-md cursor-pointer whitespace-nowrap transition-all ${
                      pageMode === 'viral'
                        ? 'bg-red-600 text-white font-semibold shadow-sm'
                        : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
                    }`}
                  >
                    🔥 떡상 탐지
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-white/40">
                {pageMode === 'viral'
                  ? '구독자 대비 조회수 폭발 중인 영상 — 작은 채널이 터지는 순간'
                  : t('video_rankings_desc')}
              </p>
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

          {pageMode === 'rankings' && viewTab === 'saved' && filtered.length === 0 && (
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

          {pageMode === 'rankings' && (viewTab === 'all' || filtered.length > 0) && (
            <div className="space-y-3">
              {/* Filters row */}
              <div className="bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg px-4 py-3 flex flex-wrap items-center gap-3">
                <Dropdown value={country} options={countryOptions} onChange={v => { setCountry(v); setPage(1); }} icon="ri-map-pin-line" />
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

              {/* Category pill tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {categoryOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setCategory(opt.value); setPage(1); }}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      category === opt.value
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-sm'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ====== 떡상 탐지 모드 ====== */}
          {pageMode === 'viral' && (
            <>
              <div className="bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg px-4 py-3 flex flex-wrap items-center gap-3">
                <Dropdown
                  value={country}
                  options={countryOptions}
                  onChange={v => { setCountry(v); setPage(1); }}
                  icon="ri-map-pin-line"
                />
                <span className="text-xs text-gray-400 dark:text-white/30 ml-1">국가별 인기 영상 중 구독자 대비 조회수 폭발 순위</span>
              </div>
              {viralLoading && (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
                  <table className="w-full min-w-[760px]">
                    <tbody className="divide-y divide-gray-100 dark:divide-dark-border bg-white dark:bg-dark-base">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3 w-12"><div className="w-6 h-6 bg-gray-100 dark:bg-white/10 rounded-full animate-pulse mx-auto" /></td>
                          <td className="px-4 py-3 w-28"><div className="w-20 h-[45px] bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></td>
                          <td className="px-4 py-3"><div className="h-3 w-48 bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></td>
                          <td className="px-4 py-3"><div className="h-3 w-28 bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></td>
                          <td className="px-4 py-3 text-right"><div className="h-3 w-14 bg-red-100 dark:bg-red-500/10 rounded animate-pulse ml-auto" /></td>
                          <td className="px-4 py-3 text-right"><div className="h-3 w-14 bg-gray-100 dark:bg-white/10 rounded animate-pulse ml-auto" /></td>
                          <td className="px-4 py-3 text-right"><div className="h-3 w-16 bg-gray-100 dark:bg-white/10 rounded animate-pulse ml-auto" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!viralLoading && viralError && (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-900/10">
                  <i className="ri-error-warning-line text-3xl text-red-400 mb-3"></i>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">데이터를 불러오지 못했습니다</p>
                  <p className="text-xs text-red-400 dark:text-red-500/70 max-w-xs mb-4">{viralError}</p>
                  <button
                    onClick={() => doFetchViral(REGION_MAP[country] ?? 'KR')}
                    className="text-xs text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/40 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    다시 시도
                  </button>
                </div>
              )}

              {!viralLoading && !viralError && viralVideos.length > 0 && (
                <>
                  {viralIsDemo && (
                    <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600/30 rounded-lg px-4 py-2.5">
                      <i className="ri-information-line text-yellow-500 text-sm flex-shrink-0"></i>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        YouTube API 쿼터 소진 — 데모 데이터 표시 중. 쿼터 리셋 후 실제 데이터로 자동 전환됩니다.
                      </p>
                    </div>
                  )}
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
                    <table className="w-full min-w-[1000px]">
                      <thead className="bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-500/20">
                        <tr>
                          <th className="px-4 py-3 text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider text-center w-10">#</th>
                          <th className="px-4 py-3 text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider text-left w-20">썸네일</th>
                          <th className="px-4 py-3 text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider text-left">제목 / 채널</th>
                          <th className="px-4 py-3 text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider text-right">🔥 떡상</th>
                          <th className="px-4 py-3 text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider text-right hidden md:table-cell">💰 수익 추정</th>
                          <th className="px-4 py-3 text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider text-right hidden lg:table-cell">⚡ VPH</th>
                          <th className="px-4 py-3 text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider text-right">📊 점수</th>
                          <th className="px-4 py-3 text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider text-right hidden xl:table-cell">구독자</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                        {viralVideos.map((video, idx) => {
                          const rev = calcRevenue(video.views, video.category);
                          const vph = calcVPH(video.views, video.uploadDate);
                          const score = calcVideoScore(video);
                          return (
                            <tr
                              key={video.videoId}
                              onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')}
                              className="transition-colors cursor-pointer group hover:bg-red-50/40 dark:hover:bg-red-600/5"
                            >
                              <td className="px-4 py-3 text-center w-10">
                                {idx < 3 ? (
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                    idx === 0 ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' :
                                    idx === 1 ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400' :
                                    'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                                  }`}>{video.rank}</span>
                                ) : (
                                  <span className="text-sm text-gray-400 dark:text-white/30 font-mono">{video.rank}</span>
                                )}
                              </td>

                              <td className="px-4 py-3 w-20">
                                <div className="relative w-16 h-[36px] rounded overflow-hidden bg-gray-100 dark:bg-white/5 flex-shrink-0">
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-full object-cover object-top"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                    <i className="ri-play-fill text-white text-sm"></i>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                <p className="text-sm text-gray-800 dark:text-white/80 font-medium group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1 leading-snug">{video.title}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-xs text-gray-400 dark:text-white/30">{video.channelName}</span>
                                  <span className="text-xs text-gray-300 dark:text-white/15">·</span>
                                  <span className="text-xs text-gray-400 dark:text-white/25">{formatViews(video.views)} 조회</span>
                                  <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/25">{video.category}</span>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-right">
                                <span className={`text-sm font-mono ${viralScoreColor(video.viralScore)}`}>
                                  {formatViralScore(video.viralScore)}
                                </span>
                                <p className="text-[10px] text-gray-400 dark:text-white/25 mt-0.5">구독자 대비</p>
                              </td>

                              <td className="px-4 py-3 text-right hidden md:table-cell">
                                <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                                  {fmtMoney(rev.min)}–{fmtMoney(rev.max)}
                                </p>
                                <p className="text-[10px] text-gray-400 dark:text-white/25 mt-0.5">추정 수익</p>
                              </td>

                              <td className="px-4 py-3 text-right hidden lg:table-cell">
                                <p className="text-sm text-blue-500 dark:text-blue-400 font-mono">
                                  {vph >= 10000 ? `${(vph/1000).toFixed(1)}K` : vph.toLocaleString()}
                                </p>
                                <p className="text-[10px] text-gray-400 dark:text-white/25 mt-0.5">조회/시간</p>
                              </td>

                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <div className="w-12 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-orange-400' : 'bg-gray-300 dark:bg-white/20'}`}
                                      style={{ width: `${score}%` }}
                                    />
                                  </div>
                                  <span className={`text-sm font-bold ${score >= 70 ? 'text-red-500 dark:text-red-400' : score >= 40 ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 dark:text-white/30'}`}>
                                    {score}
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-right hidden xl:table-cell">
                                <span className="text-sm text-gray-500 dark:text-white/40 font-mono">{formatViews(video.subscribers)}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

          {pageMode === 'rankings' && apiLoading && (
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

          {pageMode === 'rankings' && !apiLoading && apiError && (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-900/10">
              <i className="ri-error-warning-line text-3xl text-red-400 mb-3"></i>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">데이터를 불러오지 못했습니다</p>
              <p className="text-xs text-red-400 dark:text-red-500/70 max-w-xs mb-4">{apiError}</p>
              <button
                onClick={() => {
                  const rc = REGION_MAP[country] ?? 'KR';
                  doFetch(rc, '', period.toLowerCase());
                }}
                className="text-xs text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/40 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                다시 시도
              </button>
            </div>
          )}

          {pageMode === 'rankings' && !apiLoading && !apiError && filtered.length === 0 && viewTab !== 'saved' && (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-base mb-4">
                <i className="ri-search-line text-2xl text-gray-300 dark:text-white/20"></i>
              </div>
              <p className="text-sm font-semibold text-gray-600 dark:text-off-white mb-1">데이터가 없습니다</p>
              <p className="text-xs text-gray-400 dark:text-white/30 max-w-xs mb-4">
                선택한 국가 / 카테고리 / 기간 조합으로 조회된 영상이 없습니다.
              </p>
              <button
                onClick={() => { setCategory('ALL'); setCountry('ALL'); setPeriod('Daily'); setPage(1); }}
                className="text-xs text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/40 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                필터 초기화
              </button>
            </div>
          )}

          {pageMode === 'rankings' && !apiLoading && !apiError && filtered.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
                  <tr>
                    <Th label={t('rankings_col_rank')} colKey="rank" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-center" />
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-left w-24">썸네일</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-left">제목 / 채널</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-right cursor-pointer select-none" onClick={() => handleSort('views')}>
                      <span className="inline-flex items-center gap-1">
                        조회수 <span className="text-[9px] text-gray-300 dark:text-white/20 normal-case">× 배수</span>
                        <span className="flex flex-col w-3 h-3"><i className={`ri-arrow-up-s-line text-xs leading-none ${sortKey==='views'&&sortDir==='asc'?'text-gray-900 dark:text-white':'text-gray-300 dark:text-white/20'}`}></i><i className={`ri-arrow-down-s-line text-xs leading-none ${sortKey==='views'&&sortDir==='desc'?'text-gray-900 dark:text-white':'text-gray-300 dark:text-white/20'}`}></i></span>
                      </span>
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-right hidden md:table-cell">💰 수익 추정</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-right hidden lg:table-cell">⚡ VPH</th>
                    <Th label="업로드" colKey="uploadDate" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-right" />
                    <th className="px-3 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {paginated.map((video, idx) => {
                    const globalIdx = (page - 1) * PAGE_SIZE + idx;
                    const isHovered = hoveredVideoId === video.videoId;
                    const rev = calcRevenue(video.views, video.category);
                    const vph = calcVPH(video.views, video.uploadDate);
                    return (
                      <tr key={video.videoId}
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')}
                        onMouseEnter={(e) => handleRowEnter(video.videoId, e)}
                        onMouseLeave={handleRowLeave}
                        className={`transition-colors cursor-pointer group ${isHovered ? 'bg-red-50/60 dark:bg-red-600/5' : 'hover:bg-gray-50 dark:hover:bg-white/[0.03]'}`}>

                        <td className="px-4 py-3 text-center w-12">
                          {globalIdx < 3 ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              globalIdx===0?'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400':
                              globalIdx===1?'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50':
                              'bg-orange-100 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400'}`}>{video.rank}</span>
                          ) : <span className="text-sm text-gray-400 dark:text-white/30 font-mono">{video.rank}</span>}
                        </td>

                        <td className="px-4 py-3 w-24">
                          <div className="relative w-20 h-[45px] rounded overflow-hidden bg-gray-100 dark:bg-white/5">
                            <img src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} alt={video.title}
                              className="w-full h-full object-cover object-top"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                              <i className="ri-play-fill text-white text-lg"></i>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-800 dark:text-white/80 font-medium group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1">{video.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-100 dark:bg-white/5 flex-shrink-0">
                              <img src={video.channelAvatar || undefined} alt={video.channelName} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            </div>
                            <span className="text-xs text-gray-400 dark:text-white/30">{video.channelName}</span>
                            <span className="text-xs text-gray-300 dark:text-white/15">·</span>
                            <span className={`text-[10px] px-1.5 py-px rounded font-medium ${
                              { Entertainment:'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
                                Music:'bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400',
                                Education:'bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400',
                                Gaming:'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
                                Sports:'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400',
                                News:'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
                              }[video.category] ?? 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-white/30'}`}>
                              {video.category}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-gray-800 dark:text-white/80 font-mono">{formatViews(video.views)}</span>
                          {video.channelSubscribers > 0 && (() => {
                            const ratio = video.views / video.channelSubscribers;
                            const text = ratio>=100?`×${Math.round(ratio)}`:ratio>=10?`×${ratio.toFixed(1)}`:`×${ratio.toFixed(2)}`;
                            const cls = ratio>=100?'bg-amber-400 text-black':ratio>=30?'bg-green-400/90 text-black':ratio>=10?'bg-sky-400/90 text-black':'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50';
                            return <span className={`ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded leading-none ${cls}`}>{text}</span>;
                          })()}
                        </td>

                        <td className="px-4 py-3 text-right hidden md:table-cell">
                          <p className="text-sm text-green-600 dark:text-green-400 font-semibold">{fmtMoney(rev.min)}–{fmtMoney(rev.max)}</p>
                          <p className="text-[10px] text-gray-400 dark:text-white/25 mt-0.5">추정</p>
                        </td>

                        <td className="px-4 py-3 text-right hidden lg:table-cell">
                          <p className="text-sm text-blue-500 dark:text-blue-400 font-mono">{vph>=10000?`${(vph/1000).toFixed(1)}K`:vph.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 dark:text-white/25 mt-0.5">조회/h</p>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <p className="text-sm text-gray-600 dark:text-white/60">{formatDate(video.uploadDate)}</p>
                          <p className="text-xs text-gray-400 dark:text-white/30">{daysAgo(video.uploadDate)}</p>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <BookmarkBtn videoId={video.videoId} savedIds={savedIds} onToggle={handleToggleSave} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {pageMode === 'rankings' && !apiLoading && filtered.length > 0 && (
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
