     1|import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
     2|import { useTranslation } from 'react-i18next';
     3|import { videoCategories } from '@/mocks/videoRankings';
     4|import { countries } from '@/mocks/channelRankings';
     5|import type { VideoItem } from '@/mocks/videoRankings';
     6|import { fetchVideoRankings } from '@/services/youtube';
     7|import { cacheGet, cacheSet } from '@/services/cache';
     8|import TopHeader from '@/pages/home/components/TopHeader';
     9|import GlobalSidebar from '@/components/feature/GlobalSidebar';
    10|import HoverPopup from '@/components/feature/HoverPopup';
    11|import type { VideoPopupData } from '@/components/feature/HoverPopup';
    12|
    13|type SortKey = 'rank' | 'views' | 'uploadDate';
    14|type SortDir = 'asc' | 'desc';
    15|type ViewTab = 'all' | 'saved';
    16|
    17|const PAGE_SIZE = 10;
    18|const SAVED_VIDEOS_KEY = 'viralboard_saved_videos';
    19|
    20|const REGION_MAP: Record<string, string> = {
    21|  ALL: 'KR',
    22|  ...countries.reduce((acc, c) => ({ ...acc, [c.code]: c.code }), {}),
    23|};
    24|
    25|/* ── Saved videos local storage ── */
    26|const loadSavedVideos = (): Set<string> => {
    27|  try {
    28|    const raw = localStorage.getItem(SAVED_VIDEOS_KEY);
    29|    if (raw) return new Set(JSON.parse(raw) as string[]);
    30|  } catch { /* ignore */ }
    31|  return new Set();
    32|};
    33|
    34|const persistSavedVideos = (ids: Set<string>) => {
    35|  localStorage.setItem(SAVED_VIDEOS_KEY, JSON.stringify([...ids]));
    36|};
    37|
    38|const formatViews = (n: number) => {
    39|  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    40|  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    41|  return n.toString();
    42|};
    43|
    44|const formatDate = (d: string) => {
    45|  const date = new Date(d);
    46|  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    47|};
    48|
    49|const daysAgo = (d: string) => {
    50|  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    51|  if (diff === 0) return 'Today';
    52|  if (diff === 1) return '1 day ago';
    53|  return `${diff} days ago`;
    54|};
    55|
    56|const CPM_BY_CATEGORY: Record<string, number> = {
    57|  Entertainment: 3.2, Music: 2.8, Technology: 7.4, Gaming: 4.1,
    58|  Sports: 5.2, News: 4.8, Education: 6.5, Kids: 2.1,
    59|};
    60|
    61|const HOOK_TYPES = [
    62|  'Question Hook', 'Shock Statement', 'Story Hook', 'How-To Hook',
    63|  'Controversy Hook', 'List Hook', 'Challenge Hook', 'Curiosity Gap',
    64|];
    65|
    66|const seededRand = (seed: number, offset = 0) => {
    67|  const x = Math.sin(seed * 9301 + offset * 49297 + 233) * 10000;
    68|  return x - Math.floor(x);
    69|};
    70|
    71|const buildVideoPopup = (video: VideoItem): VideoPopupData => {
    72|  const cpm = CPM_BY_CATEGORY[video.category] ?? 3.5;
    73|  const revenueBase = (video.views / 1000) * cpm;
    74|  const r = seededRand(video.rank);
    75|  const sparkline = Array.from({ length: 30 }, (_, i) => {
    76|    const base = video.views * (0.3 + (i / 29) * 0.7);
    77|    const noise = (seededRand(video.rank, i + 5) - 0.5) * video.views * 0.15;
    78|    return Math.max(0, base + noise);
    79|  });
    80|  return {
    81|    type: 'video',
    82|    revenueMin: Math.round(revenueBase * 0.55),
    83|    revenueMax: Math.round(revenueBase * 1.45),
    84|    cpm: parseFloat((cpm * (0.85 + r * 0.3)).toFixed(2)),
    85|    viewToSubRatio: parseFloat((0.02 + seededRand(video.rank, 1) * 0.12).toFixed(3)),
    86|    engagementRate: parseFloat((0.03 + seededRand(video.rank, 2) * 0.08).toFixed(3)),
    87|    hookType: HOOK_TYPES[Math.floor(seededRand(video.rank, 3) * HOOK_TYPES.length)],
    88|    sparkline,
    89|  };
    90|};
    91|
    92|/* ─── Dropdown ─── */
    93|interface DropdownProps {
    94|  value: string;
    95|  options: { value: string; label: string }[];
    96|  onChange: (v: string) => void;
    97|  icon: string;
    98|}
    99|
   100|const Dropdown = ({ value, options, onChange, icon }: DropdownProps) => {
   101|  const [open, setOpen] = useState(false);
   102|  const ref = useRef<HTMLDivElement>(null);
   103|  useEffect(() => {
   104|    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
   105|    document.addEventListener('mousedown', h);
   106|    return () => document.removeEventListener('mousedown', h);
   107|  }, []);
   108|  const selected = options.find(o => o.value === value);
   109|  return (
   110|    <div ref={ref} className="relative">
   111|      <button
   112|        onClick={() => setOpen(!open)}
   113|        className="flex items-center gap-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-white/70 text-sm px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap transition-colors min-w-[140px]"
   114|      >
   115|        <i className={`${icon} text-gray-400 dark:text-white/30 w-4 h-4 flex items-center justify-center`}></i>
   116|        <span className="flex-1 text-left">{selected?.label}</span>
   117|        <i className={`ri-arrow-down-s-line text-gray-400 dark:text-white/30 w-4 h-4 flex items-center justify-center transition-transform ${open ? 'rotate-180' : ''}`}></i>
   118|      </button>
   119|      {open && (
   120|        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg py-1 z-50 min-w-full max-h-60 overflow-y-auto">
   121|          {options.map(opt => (
   122|            <button
   123|              key={opt.value}
   124|              onClick={() => { onChange(opt.value); setOpen(false); }}
   125|              className={`w-full text-left px-4 py-2 text-sm cursor-pointer whitespace-nowrap transition-colors ${
   126|                value === opt.value
   127|                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-600/10 font-medium'
   128|                  : 'text-gray-700 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5'
   129|              }`}
   130|            >
   131|              {opt.label}
   132|            </button>
   133|          ))}
   134|        </div>
   135|      )}
   136|    </div>
   137|  );
   138|};
   139|
   140|/* ─── Sortable TH ─── */
   141|interface ThProps {
   142|  label: string;
   143|  colKey: SortKey;
   144|  sortKey: SortKey;
   145|  sortDir: SortDir;
   146|  onSort: (k: SortKey) => void;
   147|  align?: string;
   148|}
   149|
   150|const Th = ({ label, colKey, sortKey, sortDir, onSort, align = 'text-left' }: ThProps) => {
   151|  const active = colKey === sortKey;
   152|  return (
   153|    <th
   154|      onClick={() => onSort(colKey)}
   155|      className={`px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 dark:hover:text-white/60 transition-colors ${align}`}
   156|    >
   157|      <span className="inline-flex items-center gap-1">
   158|        {label}
   159|        <span className="flex flex-col w-3 h-3 items-center justify-center">
   160|          <i className={`ri-arrow-up-s-line text-xs leading-none ${active && sortDir === 'asc' ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-white/20'}`}></i>
   161|          <i className={`ri-arrow-down-s-line text-xs leading-none ${active && sortDir === 'desc' ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-white/20'}`}></i>
   162|        </span>
   163|      </span>
   164|    </th>
   165|  );
   166|};
   167|
   168|/* ── Bookmark button ── */
   169|const BookmarkBtn = ({
   170|  videoId,
   171|  savedIds,
   172|  onToggle,
   173|}: {
   174|  videoId: string;
   175|  savedIds: Set<string>;
   176|  onToggle: (id: string) => void;
   177|}) => {
   178|  const saved = savedIds.has(videoId);
   179|  const [flash, setFlash] = useState(false);
   180|
   181|  const handleClick = (e: React.MouseEvent) => {
   182|    e.stopPropagation();
   183|    onToggle(videoId);
   184|    setFlash(true);
   185|    setTimeout(() => setFlash(false), 600);
   186|  };
   187|
   188|  return (
   189|    <button
   190|      onClick={handleClick}
   191|      title={saved ? 'Remove from saved' : 'Save video'}
   192|      className={`
   193|        w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer flex-shrink-0
   194|        ${flash ? 'scale-125' : 'scale-100'}
   195|        ${saved
   196|          ? 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/15 hover:bg-red-100 dark:hover:bg-red-500/25'
   197|          : 'text-gray-300 dark:text-white/20 hover:text-red-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100'
   198|        }
   199|      `}
   200|    >
   201|      <i className={`${saved ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-sm`}></i>
   202|    </button>
   203|  );
   204|};
   205|
   206|/* ─── Main Page ─── */
   207|const VideoRankingsPage = () => {
   208|  const { t } = useTranslation();
   209|  const [searchQuery, setSearchQuery] = useState('');
   210|  const [sidebarOpen, setSidebarOpen] = useState(false);
   211|
   212|  const [allVideos, setAllVideos] = useState<VideoItem[]>([]);
   213|  const [apiLoading, setApiLoading] = useState(true);
   214|  const [apiError, setApiError] = useState<string | null>(null);
   215|
   216|  const [viewTab, setViewTab] = useState<ViewTab>('all');
   217|  const [savedIds, setSavedIds] = useState<Set<string>>(() => loadSavedVideos());
   218|
   219|  const [country, setCountry] = useState('ALL');
   220|  const [category, setCategory] = useState('ALL');
   221|  const [period, setPeriod] = useState('Daily');
   222|  const [sortKey, setSortKey] = useState<SortKey>('rank');
   223|  const [sortDir, setSortDir] = useState<SortDir>('asc');
   224|  const [page, setPage] = useState(1);
   225|
   226|  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
   227|  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
   228|  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
   229|
   230|  const handleRowEnter = useCallback((videoId: string, e: React.MouseEvent<HTMLTableRowElement>) => {
   231|    if (leaveTimer.current) clearTimeout(leaveTimer.current);
   232|    setAnchorRect(e.currentTarget.getBoundingClientRect());
   233|    setHoveredVideoId(videoId);
   234|  }, []);
   235|
   236|  const handleRowLeave = useCallback(() => {
   237|    leaveTimer.current = setTimeout(() => {
   238|      setHoveredVideoId(null);
   239|      setAnchorRect(null);
   240|    }, 80);
   241|  }, []);
   242|
   243|  const handleToggleSave = useCallback((videoId: string) => {
   244|    setSavedIds(prev => {
   245|      const next = new Set(prev);
   246|      if (next.has(videoId)) next.delete(videoId);
   247|      else next.add(videoId);
   248|      persistSavedVideos(next);
   249|      return next;
   250|    });
   251|  }, []);
   252|
   253|  useEffect(() => {
   254|    const regionCode = REGION_MAP[country] ?? 'KR';
   255|    const cacheKey = `vb_vid_rankings_${regionCode}`;
   256|    const cached = cacheGet<VideoItem[]>(cacheKey);
   257|    if (cached) { setAllVideos(cached); setApiLoading(false); setApiError(null); return; }
   258|    setApiLoading(true);
   259|    setApiError(null);
   260|    fetchVideoRankings(regionCode, 25)
   261|      .then((data) => {
   262|        const videos = data as unknown as VideoItem[];
   263|        setAllVideos(videos);
   264|        cacheSet(cacheKey, videos);
   265|      })
   266|      .catch((err: unknown) => {
   267|        const msg = err instanceof Error ? err.message : 'Unknown error';
   268|        setApiError(msg);
   269|      })
   270|      .finally(() => setApiLoading(false));
   271|  }, [country]);
   272|
   273|  const handleSort = (key: SortKey) => {
   274|    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
   275|    else { setSortKey(key); setSortDir(key === 'rank' ? 'asc' : 'desc'); }
   276|    setPage(1);
   277|  };
   278|
   279|  const handleTabChange = (tab: ViewTab) => {
   280|    setViewTab(tab);
   281|    setPage(1);
   282|  };
   283|
   284|  const filtered = useMemo(() => {
   285|    let data = [...allVideos];
   286|    if (viewTab === 'saved') data = data.filter(v => savedIds.has(v.videoId));
   287|    if (category !== 'ALL') data = data.filter(v => v.category === category);
   288|    if (searchQuery) {
   289|      const q = searchQuery.toLowerCase();
   290|      data = data.filter(v => v.title.toLowerCase().includes(q));
   291|    }
   292|    data.sort((a, b) => {
   293|      const mul = sortDir === 'asc' ? 1 : -1;
   294|      if (sortKey === 'uploadDate') return (new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()) * mul;
   295|      return (a[sortKey] > b[sortKey] ? 1 : -1) * mul;
   296|    });
   297|    return data;
   298|  }, [allVideos, category, sortKey, sortDir, viewTab, savedIds]);
   299|
   300|  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
   301|  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
   302|  const hoveredVideo = paginated.find(v => v.videoId === hoveredVideoId) ?? null;
   303|
   304|  const countryOptions = [{ value: 'ALL', label: 'All Countries' }, ...countries.filter(c => c.code !== 'ALL').map(c => ({ value: c.code, label: c.label }))];
   305|  const categoryOptions = videoCategories.map(c => ({ value: c === 'All Categories' ? 'ALL' : c, label: c }));
   306|  const periodOptions = [
   307|    { value: 'Daily', label: t('rankings_period_daily') },
   308|    { value: 'Weekly', label: t('rankings_period_weekly') },
   309|    { value: 'Monthly', label: t('rankings_period_monthly') },
   310|  ];
   311|
   312|  const getPages = () => {
   313|    const pages: (number | '...')[] = [];
   314|    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
   315|    else {
   316|      pages.push(1);
   317|      if (page > 3) pages.push('...');
   318|      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
   319|      if (page < totalPages - 2) pages.push('...');
   320|      pages.push(totalPages);
   321|    }
   322|    return pages;
   323|  };
   324|
   325|  return (
   326|    <div className="min-h-screen bg-white dark:bg-dark-base flex flex-col transition-colors">
   327|      <TopHeader onMobileMenuToggle={() => setSidebarOpen((v) => !v)} />
   328|      <GlobalSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
   329|
   330|      <div className="lg:ml-52 pt-12 flex-1">
   331|        <div className="px-4 lg:px-6 py-6 space-y-5">
   332|
   333|          {/* Title + tabs */}
   334|          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
   335|            <div>
   336|              <h1 className="text-xl font-bold text-gray-900 dark:text-off-white">{t('video_rankings_title')}</h1>
   337|              <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5">{t('video_rankings_desc')}</p>
   338|            </div>
   339|
   340|            <div className="flex items-center gap-3 self-start sm:self-auto">
   341|              {/* All / Saved tab switcher */}
   342|              <div className="flex items-center bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-1 gap-1">
   343|                <button
   344|                  onClick={() => handleTabChange('all')}
   345|                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
   346|                    viewTab === 'all'
   347|                      ? 'bg-white dark:bg-dark-base text-gray-900 dark:text-off-white'
   348|                      : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
   349|                  }`}
   350|                >
   351|                  <i className="ri-play-circle-line w-3 h-3 flex items-center justify-center"></i>
   352|                  All Videos
   353|                </button>
   354|                <button
   355|                  onClick={() => handleTabChange('saved')}
   356|                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
   357|                    viewTab === 'saved'
   358|                      ? 'bg-white dark:bg-dark-base text-red-600 dark:text-red-400'
   359|                      : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
   360|                  }`}
   361|                >
   362|                  <i className={`${viewTab === 'saved' ? 'ri-bookmark-fill' : 'ri-bookmark-line'} w-3 h-3 flex items-center justify-center`}></i>
   363|                  Saved
   364|                  {savedIds.size > 0 && (
   365|                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
   366|                      viewTab === 'saved'
   367|                        ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
   368|                        : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-white/40'
   369|                    }`}>
   370|                      {savedIds.size}
   371|                    </span>
   372|                  )}
   373|                </button>
   374|              </div>
   375|
   376|              {/* Video count */}
   377|              <div className="flex items-center gap-2 bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg px-4 py-2">
   378|                <i className="ri-play-circle-line text-red-500 w-4 h-4 flex items-center justify-center"></i>
   379|                <span className="text-sm text-gray-500 dark:text-white/40">
   380|                  <span className="text-gray-900 dark:text-off-white font-semibold">{filtered.length}</span> {t('video_rankings_videos')}
   381|                </span>
   382|              </div>
   383|            </div>
   384|          </div>
   385|
   386|          {/* Saved empty state */}
   387|          {viewTab === 'saved' && filtered.length === 0 && (
   388|            <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
   389|              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-base mb-4">
   390|                <i className="ri-bookmark-line text-2xl text-gray-300 dark:text-white/20"></i>
   391|              </div>
   392|              <p className="text-sm font-semibold text-gray-600 dark:text-off-white mb-1">No saved videos yet</p>
   393|              <p className="text-xs text-gray-400 dark:text-white/30 max-w-xs">
   394|                Hover over any video row and click the bookmark icon to save it here for quick access.
   395|              </p>
   396|              <button
   397|                onClick={() => handleTabChange('all')}
   398|                className="mt-4 text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer transition-colors"
   399|              >
   400|                Browse all videos →
   401|              </button>
   402|            </div>
   403|          )}
   404|
   405|          {/* Filter bar */}
   406|          {(viewTab === 'all' || filtered.length > 0) && (
   407|            <div className="bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg px-4 py-3 flex flex-wrap items-center gap-3">
   408|              <Dropdown value={country} options={countryOptions} onChange={v => { setCountry(v); setPage(1); }} icon="ri-map-pin-line" />
   409|              <Dropdown value={category} options={categoryOptions} onChange={v => { setCategory(v); setPage(1); }} icon="ri-apps-line" />
   410|              <div className="flex items-center bg-white dark:bg-dark-base border border-gray-200 dark:border-dark-border rounded-lg p-1">
   411|                {periodOptions.map(p => (
   412|                  <button
   413|                    key={p.value}
   414|                    onClick={() => { setPeriod(p.value); setPage(1); }}
   415|                    className={`text-sm px-3 py-1 rounded-md cursor-pointer whitespace-nowrap transition-colors ${
   416|                      period === p.value
   417|                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium'
   418|                        : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
   419|                    }`}
   420|                  >
   421|                    {p.label}
   422|                  </button>
   423|                ))}
   424|              </div>
   425|              <div className="ml-auto hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/25">
   426|                <i className="ri-bar-chart-box-line w-3 h-3 flex items-center justify-center"></i>
   427|                Hover rows for AI insights
   428|              </div>
   429|            </div>
   430|          )}
   431|
   432|          {/* Loading skeleton */}
   433|          {apiLoading && (
   434|            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
   435|              <table className="w-full min-w-[760px]">
   436|                <tbody className="divide-y divide-gray-100 dark:divide-dark-border bg-white dark:bg-dark-base">
   437|                  {Array.from({ length: 10 }).map((_, i) => (
   438|                    <tr key={i}>
   439|                      <td className="px-4 py-3 w-12"><div className="w-6 h-6 bg-gray-100 dark:bg-white/10 rounded-full animate-pulse mx-auto" /></td>
   440|                      <td className="px-4 py-3 w-28"><div className="w-20 h-[45px] bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></td>
   441|                      <td className="px-4 py-3"><div className="h-3 w-48 bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></td>
   442|                      <td className="px-4 py-3 hidden md:table-cell"><div className="h-3 w-28 bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></td>
   443|                      <td className="px-4 py-3 text-right"><div className="h-3 w-14 bg-gray-100 dark:bg-white/10 rounded animate-pulse ml-auto" /></td>
   444|                      <td className="px-4 py-3 text-right"><div className="h-3 w-20 bg-gray-100 dark:bg-white/10 rounded animate-pulse ml-auto" /></td>
   445|                      <td className="px-3 py-3 w-10" />
   446|                    </tr>
   447|                  ))}
   448|                </tbody>
   449|              </table>
   450|            </div>
   451|          )}
   452|
   453|          {/* API Error */}
   454|          {!apiLoading && apiError && (
   455|            <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-900/10">
   456|              <i className="ri-error-warning-line text-3xl text-red-400 mb-3"></i>
   457|              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">데이터를 불러오지 못했습니다</p>
   458|              <p className="text-xs text-red-400 dark:text-red-500/70 max-w-xs mb-4">{apiError}</p>
   459|              <button
   460|                onClick={() => { setApiError(null); setApiLoading(true); fetchVideoRankings(REGION_MAP[country] ?? 'KR', 25).then(d => { setAllVideos(d as unknown as VideoItem[]); }).catch((e: unknown) => setApiError(e instanceof Error ? e.message : 'Unknown error')).finally(() => setApiLoading(false)); }}
   461|                className="text-xs text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/40 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
   462|              >
   463|                다시 시도
   464|              </button>
   465|            </div>
   466|          )}
   467|
   468|          {/* Table */}
   469|          {!apiLoading && filtered.length > 0 && (
   470|            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
   471|              <table className="w-full min-w-[760px]">
   472|                <thead className="bg-gray-50 dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
   473|                  <tr>
   474|                    <Th label={t('rankings_col_rank')} colKey="rank" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-center" />
   475|                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-left w-24">{t('video_rankings_col_thumbnail')}</th>
   476|                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-left">{t('video_rankings_col_title')}</th>
   477|                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-left hidden md:table-cell">{t('video_rankings_col_channel')}</th>
   478|                    <Th label={t('video_rankings_col_views')} colKey="views" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-right" />
   479|                    <Th label={t('video_rankings_col_date')} colKey="uploadDate" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-right" />
   480|                    {/* Bookmark col */}
   481|                    <th className="px-3 py-3 w-10"></th>
   482|                  </tr>
   483|                </thead>
   484|                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
   485|                  {paginated.map((video, idx) => {
   486|                    const globalIdx = (page - 1) * PAGE_SIZE + idx;
   487|                    const isHovered = hoveredVideoId === video.videoId;
   488|                    return (
   489|                      <tr
   490|                        key={video.videoId}
   491|                        onMouseEnter={(e) => handleRowEnter(video.videoId, e)}
   492|                        onMouseLeave={handleRowLeave}
   493|                        className={`transition-colors cursor-pointer group ${
   494|                          isHovered
   495|                            ? 'bg-red-50/60 dark:bg-red-600/5'
   496|                            : 'hover:bg-gray-50 dark:hover:bg-white/3'
   497|                        }`}
   498|                      >
   499|                        <td className="px-4 py-3 text-center w-12">
   500|                          {globalIdx < 3 ? (
   501|