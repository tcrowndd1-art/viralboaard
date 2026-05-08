import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import TopHeader from '@/pages/home/components/TopHeader';
import GlobalSidebar from '@/components/feature/GlobalSidebar';
import { fetchYouTubeComments } from '@/utils/ytComments';
import type { Comment } from '@/utils/ytComments';

interface ViralTitle {
  video_id: string;
  title: string;
  channel: string;
  views: number;
  subscriber_count: number;
  viral_ratio: number;
  published_at: string;
  days_since_published: number | null;
  category: string;
  thumbnail_url?: string;
  is_shorts?: boolean;
}

// DB(viral_title_archive) 실제 카테고리: autos_vehicles, film_animation, pets_animals,
// howto_style, sports, entertainment, science_tech, music, comedy, people_blogs, news_politics
// 존재하지 않는 키(mukbang, how_to, education, health)는 제거 — 클릭 시 0건 방지
const CATEGORIES = [
  { value: 'all',        label: '전체',       dbValues: [] as string[] },
  { value: 'mukbang',    label: '먹방',        dbValues: ['people_blogs'] },
  { value: 'entertain',  label: '예능·드라마', dbValues: ['entertainment'] },
  { value: 'comedy',     label: '개그·유머',   dbValues: ['comedy'] },
  { value: 'pets',       label: '반려동물',    dbValues: ['pets_animals'] },
  { value: 'sports',     label: '야구·축구',   dbValues: ['sports'] },
  { value: 'finance',    label: '재테크·주식', dbValues: ['news_politics'] },
  { value: 'music',      label: '음악·댄스',   dbValues: ['music'] },
  { value: 'cooking',    label: '요리레시피',  dbValues: ['howto_style'] },
  { value: 'beauty',     label: '뷰티·패션',   dbValues: ['howto_style'] },
  { value: 'daily',      label: '육아·일상',   dbValues: ['people_blogs'] },
  { value: 'eduscience', label: '교육·과학',   dbValues: ['science_tech'] },
  { value: 'gaming',     label: '게임',        dbValues: ['gaming'] },
  { value: 'science',    label: '과학',        dbValues: ['science_tech'] },
  { value: 'health',     label: '건강',        dbValues: ['howto_style'] },
];

const DB_CATEGORY_LABELS: Record<string, string> = {
  people_blogs: '브이로그/일상',
  entertainment: '예능/드라마',
  music: '음악',
  gaming: '게임',
  how_to: '요리/DIY',
  howto_style: '스타일',
  education: '교육',
  sports: '스포츠',
  news_politics: '뉴스',
  science_tech: '테크/과학',
  comedy: '코미디',
  travel: '여행',
  pets_animals: '반려동물',
  health: '건강',
};

const FINANCE_KEYWORDS = ['주식', '코인', '재테크', '투자', '비트코인', '부동산', 'ETF', '경제', '펀드'];

const PERIODS = [
  { value: 7,  label: '7일 이내' },
  { value: 30, label: '30일 이내' },
  { value: 90, label: '90일 이내' },
];

const CHANNEL_SIZES = [
  { value: 'all',    label: '전체' },
  { value: 'micro',  label: '마이크로 (1K~10K)' },
  { value: 'normal', label: '일반채널 (10K~1M)' },
];

const VIDEO_TYPES = [
  { value: 'all',       label: '전체' },
  { value: 'landscape', label: '📺 가로 영상' },
  { value: 'shorts',    label: '📱 Shorts' },
];

const formatViews = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
};

const formatSubs = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return Math.round(n / 1_000) + 'K';
  return n.toString();
};

const formatRevenue = (views: number) => {
  const monetized = views * 0.45;
  const low = (monetized / 1000) * 1;
  const high = (monetized / 1000) * 5;
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toFixed(0)}`;
  return `${fmt(low)} ~ ${fmt(high)}`;
};

const getThumbnail = (video: ViralTitle) =>
  video.thumbnail_url || `https://i.ytimg.com/vi/${video.video_id}/mqdefault.jpg`;

const ViralBadge = ({ ratio }: { ratio: number }) => {
  if (ratio >= 100) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 whitespace-nowrap">
        {Math.round(ratio)}x
      </span>
    );
  }
  if (ratio >= 50) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 whitespace-nowrap">
        50x+
      </span>
    );
  }
  if (ratio >= 20) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 whitespace-nowrap">
        20x+
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/40 whitespace-nowrap">
      5x+
    </span>
  );
};

const FreshnessBadge = ({ days }: { days: number | null }) => {
  if (days == null) return null;
  if (days <= 7) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 whitespace-nowrap">
        🔥 HOT NOW
      </span>
    );
  }
  if (days <= 30) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 whitespace-nowrap">
        📈 TRENDING
      </span>
    );
  }
  if (days <= 90) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/40 whitespace-nowrap">
        ✅ PROVEN
      </span>
    );
  }
  return null;
};

const CreatorInsightsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState<ViralTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('all');
  const [period, setPeriod] = useState(90);
  const [channelSize, setChannelSize] = useState('all');
  const [videoType, setVideoType] = useState('all');

  // Modal state
  const [selectedVideo, setSelectedVideo] = useState<ViralTitle | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'comments'>('info');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentsDisabled, setCommentsDisabled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const cat = CATEGORIES.find(c => c.value === category);
        const dbValues = cat?.dbValues ?? [];
        const hasCategory = category !== 'all' && dbValues.length > 0;

        const base = supabase
          .from('viral_title_archive')
          .select('video_id,title,channel,views,subscriber_count,viral_ratio,published_at,days_since_published,category,thumbnail_url,is_shorts')
          .eq('country', 'KR')
          .gte('viral_ratio', 5)
          .order('viral_ratio', { ascending: false });

        const { data: rows, error: err } = await (
          hasCategory
            ? base.in('category', dbValues).limit(200)
            : base.limit(500)
        );

        if (err) throw err;
        setData(rows ?? []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '데이터 로드 실패');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category]);

  // Reset modal state when video changes
  useEffect(() => {
    if (!selectedVideo) {
      setActiveTab('info');
      setComments([]);
      setCommentsError(null);
      setCommentsDisabled(false);
      setCommentsLoading(false);
    }
  }, [selectedVideo]);

  const fetchComments = useCallback(async (videoId: string) => {
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const result = await fetchYouTubeComments(videoId);
      if (!result.ok) {
        if (result.disabled) setCommentsDisabled(true);
        else setCommentsError(result.error);
        return;
      }
      setComments(result.comments);
    } catch {
      setCommentsError('댓글을 불러올 수 없습니다');
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const handleTabChange = (tab: 'info' | 'comments') => {
    setActiveTab(tab);
    if (tab === 'comments' && comments.length === 0 && !commentsLoading && !commentsDisabled && selectedVideo) {
      fetchComments(selectedVideo.video_id);
    }
  };

  const openModal = (video: ViralTitle) => {
    setSelectedVideo(video);
    setActiveTab('info');
    setComments([]);
    setCommentsError(null);
    setCommentsDisabled(false);
  };

  const filtered = useMemo(() => {
    let rows = data;
    if (category !== 'all') {
      const cat = CATEGORIES.find(c => c.value === category);
      if (cat) {
        rows = rows.filter(r => cat?.dbValues?.includes(r.category));
        if (category === 'finance') {
          rows = rows.filter(r => FINANCE_KEYWORDS.some(kw => r.title?.includes(kw)));
        }
      }
    }
    rows = rows.filter(r => (r.days_since_published ?? 999) <= period);
    if (channelSize === 'micro') rows = rows.filter(r => r.subscriber_count >= 1000 && r.subscriber_count <= 10000);
    else if (channelSize === 'normal') rows = rows.filter(r => r.subscriber_count >= 10000 && r.subscriber_count <= 1000000);
    if (videoType === 'landscape') rows = rows.filter(r => r.is_shorts === false);
    else if (videoType === 'shorts') rows = rows.filter(r => r.is_shorts === true);
    return rows.slice(0, 100);
  }, [data, category, period, channelSize, videoType]);

  const filterSummary = useMemo(() => {
    const catLabel = CATEGORIES.find(c => c.value === category)?.label ?? '전체';
    const periodLabel = PERIODS.find(p => p.value === period)?.label ?? '';
    const sizeLabel = channelSize === 'micro' ? '마이크로 기준' : channelSize === 'normal' ? '일반채널 기준' : null;
    const typeLabel = videoType === 'landscape' ? '가로 영상' : videoType === 'shorts' ? 'Shorts' : null;
    const parts = [catLabel, periodLabel, ...(sizeLabel ? [sizeLabel] : []), ...(typeLabel ? [typeLabel] : [])];
    return `${parts.join(' · ')} — 총 ${filtered.length}건`;
  }, [category, period, channelSize, videoType, filtered.length]);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-base transition-colors flex flex-col">
      <TopHeader onMobileMenuToggle={() => setSidebarOpen(v => !v)} />
      <GlobalSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-52 pt-12 pb-16 lg:pb-0 flex-1">
        <div className="px-4 lg:px-6 py-6 space-y-5 max-w-7xl mx-auto">

          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-off-white flex items-center gap-2">
              <i className="ri-bar-chart-box-ai-line text-red-500"></i>
              크리에이터 인사이트
            </h1>
            <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5">
              터진 영상 제목 패턴 분석 — 90일 이내 viral ratio 5x 이상 KR 영상
            </p>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  category === cat.value
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-sm'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Period + Channel size + Video type filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-1 gap-0.5">
              {PERIODS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`text-xs px-3 py-1.5 rounded-md cursor-pointer whitespace-nowrap transition-colors ${
                    period === p.value
                      ? 'bg-white dark:bg-dark-base text-gray-900 dark:text-off-white font-semibold shadow-sm'
                      : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-1 gap-0.5">
              {CHANNEL_SIZES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setChannelSize(s.value)}
                  className={`text-xs px-3 py-1.5 rounded-md cursor-pointer whitespace-nowrap transition-colors ${
                    channelSize === s.value
                      ? 'bg-white dark:bg-dark-base text-gray-900 dark:text-off-white font-semibold shadow-sm'
                      : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex items-center bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-1 gap-0.5">
              {VIDEO_TYPES.map(vt => (
                <button
                  key={vt.value}
                  onClick={() => setVideoType(vt.value)}
                  className={`text-xs px-3 py-1.5 rounded-md cursor-pointer whitespace-nowrap transition-colors ${
                    videoType === vt.value
                      ? 'bg-white dark:bg-dark-base text-gray-900 dark:text-off-white font-semibold shadow-sm'
                      : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
                  }`}
                >
                  {vt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden">
              <table className="w-full min-w-[780px]">
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 w-10"><div className="w-5 h-3 bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></td>
                      <td className="px-3 py-2 w-16"><div className="w-[60px] h-[45px] bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-3 w-64 bg-gray-100 dark:bg-white/10 rounded animate-pulse mb-1.5" /><div className="h-2.5 w-32 bg-gray-100 dark:bg-white/5 rounded animate-pulse" /></td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell"><div className="h-3 w-16 bg-gray-100 dark:bg-white/10 rounded animate-pulse ml-auto" /></td>
                      <td className="px-4 py-3 text-right"><div className="h-3 w-12 bg-gray-100 dark:bg-white/10 rounded animate-pulse ml-auto" /></td>
                      <td className="px-4 py-3 text-right"><div className="h-3 w-10 bg-gray-100 dark:bg-white/10 rounded animate-pulse ml-auto" /></td>
                      <td className="px-4 py-3 text-right"><div className="h-5 w-10 bg-red-100 dark:bg-red-500/10 rounded animate-pulse ml-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-900/10">
              <i className="ri-error-warning-line text-3xl text-red-400 mb-3"></i>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">데이터를 불러오지 못했습니다</p>
              <p className="text-xs text-red-400 dark:text-red-500/70 max-w-xs">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
              <i className="ri-search-line text-3xl text-gray-300 dark:text-white/20 mb-3"></i>
              <p className="text-sm font-semibold text-gray-600 dark:text-off-white mb-1">해당 조건의 영상이 없습니다</p>
              <button
                onClick={() => { setCategory('all'); setPeriod(90); setChannelSize('all'); setVideoType('all'); }}
                className="mt-3 text-xs text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/40 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                필터 초기화
              </button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && filtered.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 dark:text-white/30 mb-2">{filterSummary}</p>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
                <table className="w-full min-w-[780px]">
                  <thead className="bg-gray-50 dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-center w-10">#</th>
                      <th className="px-3 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-left w-16">썸네일</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-left">제목 / 채널</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-right hidden sm:table-cell">이 영상 1편 추정 수익</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-right">조회수</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-right">구독자</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider text-right">배수</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {filtered.map((row, idx) => (
                      <tr
                        key={row.video_id}
                        onClick={() => openModal(row)}
                        className="cursor-pointer group hover:bg-red-50/40 dark:hover:bg-red-600/5 transition-colors"
                      >
                        <td className="px-4 py-3 text-center w-10">
                          <span className="text-sm text-gray-400 dark:text-white/30 font-mono">{idx + 1}</span>
                        </td>

                        <td className="px-3 py-2 w-16">
                          <div className="w-[60px] h-[45px] rounded overflow-hidden bg-gray-100 dark:bg-dark-card flex-shrink-0 relative">
                            <img
                              src={getThumbnail(row)}
                              alt={row.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                              <i className="ri-play-fill text-white text-lg"></i>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-800 dark:text-white/80 font-medium group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1 leading-snug">
                            {row.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-xs text-gray-400 dark:text-white/30">{row.channel}</span>
                            {row.days_since_published != null && (
                              <>
                                <span className="text-xs text-gray-300 dark:text-white/15">·</span>
                                <span className="text-xs text-gray-400 dark:text-white/30">{row.days_since_published}일 전</span>
                              </>
                            )}
                            {row.category && (
                              <>
                                <span className="text-xs text-gray-300 dark:text-white/15">·</span>
                                <span className="text-[10px] px-1.5 py-px rounded bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/25">
                                  {DB_CATEGORY_LABELS[row.category] ?? row.category}
                                </span>
                              </>
                            )}
                            {row.is_shorts && (
                              <span className="text-[10px] px-1.5 py-px rounded bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400">
                                Shorts
                              </span>
                            )}
                            <FreshnessBadge days={row.days_since_published} />
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right hidden sm:table-cell">
                          <span className="text-xs text-green-600 dark:text-green-400 font-mono font-semibold whitespace-nowrap">
                            {formatRevenue(row.views)}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-gray-700 dark:text-white/70 font-mono">{formatViews(row.views)}</span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-gray-500 dark:text-white/40 font-mono">{formatSubs(row.subscriber_count)}</span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <ViralBadge ratio={row.viral_ratio} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── 중앙 모달 ── */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-white dark:bg-dark-base rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-dark-border flex-shrink-0">
              <h2 className="text-sm font-bold text-gray-900 dark:text-off-white truncate flex-1 mr-4 leading-snug">
                {selectedVideo.title}
              </h2>
              <button
                onClick={() => setSelectedVideo(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
              >
                <i className="ri-close-line text-lg text-gray-500 dark:text-white/50"></i>
              </button>
            </div>

            {/* Modal body: left iframe + right panel */}
            <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">

              {/* Left: YouTube iframe */}
              <div className="md:w-[55%] bg-black flex-shrink-0 flex items-center justify-center">
                {selectedVideo.is_shorts ? (
                  <div className="w-full flex justify-center">
                    <div className="aspect-[9/16] max-h-[400px] w-auto" style={{ width: 'min(100%, calc(400px * 9 / 16))' }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${selectedVideo.video_id}?autoplay=1`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedVideo.video_id}?autoplay=1`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              {/* Right: info panel */}
              <div className="md:w-[45%] flex flex-col min-h-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-dark-border">

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-dark-border flex-shrink-0">
                  {(['info', 'comments'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => handleTabChange(tab)}
                      className={`flex-1 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                        activeTab === tab
                          ? 'text-gray-900 dark:text-off-white border-b-2 border-gray-900 dark:border-white -mb-px'
                          : 'text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60'
                      }`}
                    >
                      {tab === 'info' ? '📊 영상 정보' : '💬 댓글'}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto">

                  {/* 영상 정보 탭 */}
                  {activeTab === 'info' && (
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 flex-wrap">
                        <span>{selectedVideo.channel}</span>
                        {selectedVideo.days_since_published != null && (
                          <>
                            <span>·</span>
                            <span>{selectedVideo.days_since_published}일 전 업로드</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <FreshnessBadge days={selectedVideo.days_since_published} />
                        <ViralBadge ratio={selectedVideo.viral_ratio} />
                        {selectedVideo.is_shorts && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 whitespace-nowrap">
                            📱 Shorts
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 dark:bg-dark-card rounded-lg p-3">
                          <p className="text-xs text-gray-400 dark:text-white/30 mb-1">조회수</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-off-white">{formatViews(selectedVideo.views)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark-card rounded-lg p-3">
                          <p className="text-xs text-gray-400 dark:text-white/30 mb-1">구독자</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-off-white">{formatSubs(selectedVideo.subscriber_count)}</p>
                        </div>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-500/20 rounded-lg p-3">
                        <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1">💰 이 영상 1편 추정 수익</p>
                        <p className="text-lg font-bold text-green-700 dark:text-green-400">{formatRevenue(selectedVideo.views)}</p>
                        <p className="text-[10px] text-green-500/60 dark:text-green-500/40 mt-1 font-mono">
                          {formatViews(selectedVideo.views)} 조회 × 45% 수익화율 × CPM $1~$5 ÷ 1,000
                        </p>
                        <p className="text-xs text-green-500/70 dark:text-green-500/50 mt-0.5">낮은 CPM~높은 CPM 범위 추산</p>
                      </div>

                      <a
                        href={`https://youtube.com/watch?v=${selectedVideo.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-gray-300 dark:border-dark-border text-sm font-semibold text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <i className="ri-youtube-line text-red-500 text-base"></i>
                        유튜브에서 보기
                      </a>
                    </div>
                  )}

                  {/* 댓글 탭 */}
                  {activeTab === 'comments' && (
                    <div className="p-4">
                      {commentsLoading && (
                        <div className="flex items-center justify-center py-12">
                          <div className="w-6 h-6 border-2 border-gray-200 dark:border-white/20 border-t-red-500 rounded-full animate-spin" />
                        </div>
                      )}
                      {commentsDisabled && (
                        <div className="text-center py-12 text-gray-400 dark:text-white/30 text-sm">
                          댓글이 비활성화된 영상입니다
                        </div>
                      )}
                      {commentsError && !commentsDisabled && (
                        <div className="text-center py-12 text-red-400 dark:text-red-500/60 text-sm">
                          {commentsError}
                        </div>
                      )}
                      {!commentsLoading && !commentsDisabled && !commentsError && (
                        <div className="space-y-4">
                          {comments.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 dark:text-white/30 text-sm">
                              댓글이 없습니다
                            </div>
                          ) : (
                            comments.map((c, i) => (
                              <div key={i} className="flex gap-2.5">
                                <img
                                  src={c.authorProfileImageUrl}
                                  alt={c.author}
                                  className="w-7 h-7 rounded-full flex-shrink-0 object-cover bg-gray-100 dark:bg-dark-card"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-semibold text-gray-700 dark:text-white/70 truncate">{c.author}</span>
                                    {c.likeCount > 0 && (
                                      <span className="text-[10px] text-gray-400 dark:text-white/30 flex items-center gap-0.5 flex-shrink-0">
                                        <i className="ri-thumb-up-line text-[9px]"></i>
                                        {c.likeCount}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-white/60 leading-relaxed whitespace-pre-line">
                                    {c.text}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorInsightsPage;
