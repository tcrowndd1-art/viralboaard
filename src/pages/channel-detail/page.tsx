import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { useSavedChannels } from '@/hooks/useSavedChannels';
import type { SavedChannel } from '@/mocks/userDashboard';
import SubscriberChart from './components/SubscriberChart';
import ViewsBarChart from './components/ViewsBarChart';
import RevenueChart from './components/RevenueChart';
import RecentVideos from './components/RecentVideos';
import AIInsightsPanel from './components/AIInsightsPanel';
import CompetitorComparison from './components/CompetitorComparison';
import { useTheme } from '@/hooks/useTheme';
import i18n from '@/i18n';
import { useTranslation } from 'react-i18next';

const AUTH_KEY = 'viralboard_auth';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'ko', label: '한국어' },
];

const formatNum = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
};

interface ChInfo {
  channelId: string;
  name: string;
  avatar: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  category: string;
  country: string;
  dailyViews: number;
}

export interface EnhancedVideo {
  videoId: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  uploadDate: string;
  thumbnail: string;
  durationSeconds: number;
  duration: string;
}

interface SimilarChItem {
  channelId: string;
  name: string;
  avatar: string;
  subscribers: number;
  category: string;
  country: string;
}

const navItems = [
  { icon: 'ri-home-4-line', label: 'nav_home', path: '/' },
  { icon: 'ri-bar-chart-line', label: 'nav_charts', path: '/rankings' },
  { icon: 'ri-lightbulb-line', label: 'nav_insights', path: '/insights' },
  { icon: 'ri-live-line', label: 'nav_trending_live', path: '/trending-live' },
  { icon: 'ri-calculator-line', label: 'nav_revenue_calc', path: '/revenue-calculator' },
];

const ChannelDetailPage = () => {
  const navigate = useNavigate();
  const { channelId } = useParams<{ channelId: string }>();
  const { t } = useTranslation();
  const { isSaved, toggleChannel } = useSavedChannels();
  const { isDark, toggleTheme } = useTheme();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userInitial, setUserInitial] = useState('U');
  const [saveAnim, setSaveAnim] = useState(false);

  const [chData, setChData] = useState<ChInfo | null>(null);
  const [videos, setVideos] = useState<EnhancedVideo[]>([]);
  const [countryRank, setCountryRank] = useState<number | null>(null);
  const [similarChannels, setSimilarChannels] = useState<SimilarChItem[]>([]);
  const [loading, setLoading] = useState(true);

  const saved = isSaved(channelId ?? '');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        const email: string = data.email ?? '';
        const prefix = email.split('@')[0] ?? '';
        const displayName = prefix.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim() || 'User';
        setUserName(displayName);
        setUserInitial(displayName.charAt(0).toUpperCase());
        setIsLoggedIn(true);
      }
    } catch { setIsLoggedIn(false); }
  }, []);

  useEffect(() => {
    if (!channelId) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setChData(null);
    setVideos([]);
    setCountryRank(null);
    setSimilarChannels([]);

    async function load() {
      try {
        // 1. Channel rows — aggregate to build channel profile
        const { data: rows } = await supabase
          .from('viralboard_data')
          .select('channel_id, channel, channel_thumbnail_url, subscriber_count, views, category, country, published_at')
          .eq('channel_id', channelId)
          .limit(200);

        if (cancelled || !rows?.length) return;

        const anyRows = rows as any[];
        const subscribers = Math.max(...anyRows.map((r) => r.subscriber_count ?? 0));
        const totalViews = anyRows.reduce((s: number, r) => s + (r.views ?? 0), 0);
        const videoCount = rows.length;
        const category = anyRows[0]?.category ?? '';
        const country = anyRows[0]?.country ?? '';
        const name = anyRows[0]?.channel ?? '';
        const avatar = anyRows.find((r) => r.channel_thumbnail_url)?.channel_thumbnail_url ?? '';

        // Daily views: estimate from most recent 10 videos
        const recentRows = [...anyRows]
          .filter((r) => r.published_at)
          .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
          .slice(0, 10);
        const recentViews = recentRows.reduce((s: number, r) => s + (r.views ?? 0), 0);
        const oldestDate = recentRows[recentRows.length - 1]?.published_at;
        const daySpan = oldestDate ? Math.max(1, (Date.now() - new Date(oldestDate).getTime()) / 86400000) : 30;
        const dailyViews = Math.round(recentViews / daySpan);

        if (!cancelled) setChData({ channelId: channelId!, name, avatar, subscribers, totalViews, videoCount, category, country, dailyViews });

        // 2. Country rank
        if (!cancelled && country) {
          const { data: cRows } = await supabase
            .from('viralboard_data')
            .select('channel_id, subscriber_count')
            .eq('country', country)
            .order('subscriber_count', { ascending: false })
            .limit(500);
          if (!cancelled && cRows) {
            const cMap = new Map<string, number>();
            for (const r of cRows as any[]) {
              const subs = r.subscriber_count ?? 0;
              if (!cMap.has(r.channel_id) || subs > (cMap.get(r.channel_id) ?? 0)) cMap.set(r.channel_id, subs);
            }
            const sorted = [...cMap.entries()].sort((a, b) => b[1] - a[1]);
            const idx = sorted.findIndex(([id]) => id === channelId);
            if (!cancelled) setCountryRank(idx >= 0 ? idx + 1 : null);
          }
        }

        // 3. Similar channels (same category)
        if (!cancelled && category) {
          const { data: simRows } = await supabase
            .from('viralboard_data')
            .select('channel_id, channel, channel_thumbnail_url, subscriber_count, category, country')
            .eq('category', category)
            .neq('channel_id', channelId)
            .order('subscriber_count', { ascending: false })
            .limit(100);
          if (!cancelled && simRows) {
            const simMap = new Map<string, SimilarChItem>();
            for (const r of simRows as any[]) {
              if (!simMap.has(r.channel_id)) {
                simMap.set(r.channel_id, {
                  channelId: r.channel_id,
                  name: r.channel ?? '',
                  avatar: r.channel_thumbnail_url ?? '',
                  subscribers: r.subscriber_count ?? 0,
                  category: r.category ?? '',
                  country: r.country ?? '',
                });
              }
            }
            if (!cancelled) setSimilarChannels([...simMap.values()].sort((a, b) => b.subscribers - a.subscribers).slice(0, 6));
          }
        }

        // 4. Recent videos
        if (!cancelled) {
          // Fetch more than needed so dedup leaves us with 12 unique videos
          const { data: vidRows } = await supabase
            .from('viralboard_data')
            .select('video_id, title, views, likes, comments, published_at, thumbnail_url, duration_seconds')
            .eq('channel_id', channelId)
            .order('published_at', { ascending: false })
            .limit(60);
          if (!cancelled && vidRows) {
            const fmtDur = (sec: number) => {
              const h = Math.floor(sec / 3600);
              const m = Math.floor((sec % 3600) / 60);
              const s = sec % 60;
              const mm = String(m).padStart(h > 0 ? 2 : 1, '0');
              const ss = String(s).padStart(2, '0');
              return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
            };
            // Dedup by video_id — keep first occurrence (most recent published_at wins)
            const seen = new Set<string>();
            const unique = (vidRows as any[]).filter((v) => {
              const id = v.video_id ?? '';
              if (!id || seen.has(id)) return false;
              seen.add(id);
              return true;
            }).slice(0, 12);
            if (!cancelled) setVideos(unique.map((v) => ({
              videoId: v.video_id ?? '',
              title: v.title ?? '',
              views: v.views ?? 0,
              likes: v.likes ?? 0,
              comments: v.comments ?? 0,
              uploadDate: (v.published_at ?? '').slice(0, 10),
              thumbnail: (v.thumbnail_url ?? '').replace(/\/(hq|mq|sd)default\.jpg/, '/maxresdefault.jpg'),
              durationSeconds: v.duration_seconds ?? 0,
              duration: fmtDur(v.duration_seconds ?? 0),
            })));
          }
        }
      } catch (e) {
        console.error('[channel-detail] load FAIL:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [channelId]);

  const handleLangChange = (code: string) => {
    i18n.changeLanguage(code);
    setCurrentLang(code);
    setLangOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleSaveToggle = () => {
    if (!chData) return;
    const channelAsData: SavedChannel = {
      id: chData.channelId,
      name: chData.name,
      handle: `@${chData.name.replace(/\s+/g, '')}`,
      avatar: chData.avatar,
      category: chData.category,
      subscribers: chData.subscribers,
      weeklyGrowth: 0,
      isLive: false,
      lastVideo: '',
      lastVideoViews: 0,
    };
    toggleChannel(channelAsData);
    setSaveAnim(true);
    setTimeout(() => setSaveAnim(false), 600);
  };

  const currentLangLabel = LANGUAGES.find((l) => l.code === currentLang)?.label ?? 'English';

  const stats = [
    { label: 'Subscribers', value: chData ? formatNum(chData.subscribers) : '—', icon: 'ri-user-follow-line', color: 'text-red-500 dark:text-red-400' },
    { label: 'Total Views', value: chData ? formatNum(chData.totalViews) : '—', icon: 'ri-eye-line', color: 'text-orange-500 dark:text-orange-400' },
    { label: 'Videos', value: chData ? chData.videoCount.toLocaleString() : '—', icon: 'ri-video-line', color: 'text-green-500 dark:text-green-400' },
    { label: 'Country Rank', value: countryRank ? `#${countryRank}` : '—', icon: 'ri-trophy-line', color: 'text-yellow-500 dark:text-yellow-400' },
  ];

  const chartData = videos.slice(0, 7).map((v) => ({
    title: v.title.length > 20 ? v.title.slice(0, 20) + '…' : v.title,
    views: v.views,
  }));

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-white flex flex-col transition-colors">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#181818] border-b border-gray-200 dark:border-white/10 h-12 flex items-center px-4 lg:px-6 transition-colors">
        <div className="flex items-center gap-4 w-full">
          <Link
            to="/"
            className="font-black text-base tracking-widest text-gray-900 dark:text-white uppercase mr-2 whitespace-nowrap hidden lg:block hover:text-red-500 transition-colors"
          >
            ViralBoard
          </Link>
          <button
            className="lg:hidden text-gray-600 dark:text-white/60 w-8 h-8 flex items-center justify-center cursor-pointer"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            <i className="ri-menu-line text-lg"></i>
          </button>
          <div className="flex-1 flex items-center bg-gray-100 dark:bg-white/10 rounded-full px-3 py-1.5 max-w-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-white/15 transition-colors" onClick={() => navigate('/search')}>
            <i className="ri-search-line text-gray-400 dark:text-white/40 text-sm mr-2 w-4 h-4 flex items-center justify-center"></i>
            <span className="text-sm text-gray-400 dark:text-white/30 select-none">{t('search_placeholder')}</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden md:block relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 text-sm text-gray-600 dark:text-white/60 cursor-pointer hover:text-gray-900 dark:hover:text-white whitespace-nowrap transition-colors"
              >
                <i className="ri-global-line w-4 h-4 flex items-center justify-center"></i>
                <span>{currentLangLabel}</span>
                <i className="ri-arrow-down-s-line w-4 h-4 flex items-center justify-center"></i>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-8 w-36 bg-white dark:bg-[#242424] border border-gray-200 dark:border-white/10 rounded-lg z-50 overflow-hidden">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.code)}
                      className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                        currentLang === lang.code ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-white/70'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isDark ? <i className="ri-sun-line text-base"></i> : <i className="ri-moon-line text-base"></i>}
            </button>

            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-sm font-bold cursor-pointer"
                >
                  {userInitial}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-10 bg-white dark:bg-[#242424] border border-gray-200 dark:border-white/10 rounded-lg w-48 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                      <p className="text-sm text-gray-900 dark:text-white font-semibold">{userName}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
                    >
                      <i className="ri-dashboard-line w-4 h-4 flex items-center justify-center"></i>
                      {t('dash_my_dashboard')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
                    >
                      <i className="ri-logout-box-line w-4 h-4 flex items-center justify-center"></i>
                      {t('dash_sign_out')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm px-3 py-1 border border-gray-300 dark:border-white/20 rounded text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer whitespace-nowrap">
                  {t('nav_sign_in')}
                </Link>
                <Link to="/signup" className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer whitespace-nowrap">
                  {t('nav_sign_up')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <nav className={`fixed left-0 top-12 bottom-0 w-48 bg-white dark:bg-[#181818] border-r border-gray-200 dark:border-white/10 flex-col overflow-y-auto z-40 transition-all lg:translate-x-0 ${mobileNavOpen ? 'flex translate-x-0' : 'hidden lg:flex -translate-x-full'}`}>
        <ul className="py-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
              >
                <i className={`${item.icon} w-5 h-5 flex items-center justify-center`}></i>
                <span>{t(item.label)}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto px-4 py-4 border-t border-gray-200 dark:border-white/10">
          <p className="text-xs text-gray-400 dark:text-white/20">© 2026 DIFF., Inc.</p>
        </div>
      </nav>

      {/* Main */}
      <div className="lg:ml-48 pt-12 flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : !chData ? (
          <div className="flex flex-col items-center justify-center h-96 text-center px-4">
            <i className="ri-error-warning-line text-4xl text-gray-300 dark:text-white/20 mb-3"></i>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-white/70">Channel not found</h2>
            <p className="text-sm text-gray-400 dark:text-white/30 mt-1">No data available for this channel in the database.</p>
            <Link to="/" className="mt-4 text-sm text-red-500 hover:underline">← Back to Home</Link>
          </div>
        ) : (
          <>
            {/* Banner */}
            <div className="relative h-40 md:h-52 bg-gradient-to-br from-gray-100 dark:from-[#1a1a1a] to-gray-200 dark:to-[#2a1a1a] overflow-hidden">
              {chData.avatar && (
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `url(${chData.avatar})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(24px) saturate(1.5)',
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0f0f0f] via-transparent to-transparent" />
            </div>

            {/* Channel info bar */}
            <div className="px-4 lg:px-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-6">
                {/* Avatar */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white dark:border-[#0f0f0f] bg-gray-100 dark:bg-[#242424] flex-shrink-0 z-10">
                  {chData.avatar ? (
                    <img
                      src={chData.avatar}
                      alt={chData.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-red-600/20">
                      <i className="ri-user-line text-red-400 text-2xl"></i>
                    </div>
                  )}
                </div>

                {/* Name + handle */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{chData.name}</h1>
                    <span className="bg-red-100 dark:bg-red-600/20 text-red-600 dark:text-red-400 text-xs px-2 py-0.5 rounded-full font-medium">{chData.category}</span>
                    {countryRank && (
                      <span className="bg-yellow-100 dark:bg-yellow-600/20 text-yellow-700 dark:text-yellow-400 text-xs px-2 py-0.5 rounded-full font-medium">
                        #{countryRank} in {chData.country}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-white/40">{chData.country} · {chData.category}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pb-1">
                  <button
                    onClick={handleSaveToggle}
                    className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border cursor-pointer whitespace-nowrap transition-all duration-200 ${
                      saveAnim ? 'scale-95' : 'scale-100'
                    } ${
                      saved
                        ? 'bg-red-50 dark:bg-red-600/20 border-red-300 dark:border-red-600/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-600/30'
                        : 'bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20'
                    }`}
                  >
                    <i className={`${saved ? 'ri-heart-fill' : 'ri-heart-line'} w-4 h-4 flex items-center justify-center transition-transform ${saveAnim ? 'scale-125' : ''}`}></i>
                    {saved ? t('dash_saved_btn') : t('dash_save_channel')}
                  </button>

                  <a
                    href={`https://youtube.com/channel/${channelId}`}
                    target="_blank"
                    rel="nofollow noreferrer"
                    className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer whitespace-nowrap transition-colors"
                  >
                    <i className="ri-youtube-line w-4 h-4 flex items-center justify-center"></i>
                    YouTube
                  </a>
                </div>
              </div>

              {/* Save feedback toast */}
              {saveAnim && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-[#242424] border border-white/10 rounded-full px-5 py-2.5 flex items-center gap-2 animate-bounce">
                  <i className={`${saved ? 'ri-heart-fill text-red-400' : 'ri-heart-line text-white/50'} w-4 h-4 flex items-center justify-center`}></i>
                  <span className="text-sm text-white font-medium">
                    {saved ? 'Channel saved to dashboard!' : 'Channel removed from dashboard'}
                  </span>
                </div>
              )}

              {/* Stats cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {stats.map((s) => (
                  <div key={s.label} className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-4 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500 dark:text-white/40">{s.label}</p>
                      <i className={`${s.icon} ${s.color} w-4 h-4 flex items-center justify-center`}></i>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white font-mono leading-tight">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Est. Daily Views */}
              <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-4 mb-3 transition-colors">
                <div className="flex items-center gap-1.5 mb-2">
                  <i className="ri-speed-up-line text-blue-500 dark:text-blue-400 w-4 h-4 flex items-center justify-center"></i>
                  <p className="text-xs text-gray-500 dark:text-white/40">Est. Daily Views</p>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white font-mono leading-tight">{formatNum(chData.dailyViews)}</p>
                <p className="text-xs text-gray-400 dark:text-white/25 mt-1">Based on recent video performance</p>
              </div>

              {/* Super Chat Revenue — 4 metrics (no DB data → all "—") */}
              <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden mb-6 transition-colors">
                <div className="px-5 py-3.5 border-b border-gray-200 dark:border-white/10 flex items-center gap-2">
                  <i className="ri-chat-smile-3-line text-yellow-500 dark:text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Super Chat Revenue</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100 dark:divide-white/[0.05]">
                  {[
                    { label: '오늘 수입',  icon: 'ri-sun-line',      color: 'text-yellow-500 dark:text-yellow-400' },
                    { label: '어제 수입',  icon: 'ri-moon-line',     color: 'text-blue-500 dark:text-blue-400' },
                    { label: '최근 7일',   icon: 'ri-calendar-line', color: 'text-green-500 dark:text-green-400' },
                    { label: '전체 누적',  icon: 'ri-stack-line',    color: 'text-red-500 dark:text-red-400' },
                  ].map((m) => (
                    <div key={m.label} className="px-5 py-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <i className={`${m.icon} ${m.color} w-3.5 h-3.5 flex items-center justify-center`}></i>
                        <p className="text-xs text-gray-500 dark:text-white/40">{m.label}</p>
                      </div>
                      <p className="text-lg font-bold text-gray-400 dark:text-white/30 font-mono">—</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights Panel */}
              <AIInsightsPanel />

              {/* Competitor Comparison */}
              <CompetitorComparison />

              {/* Charts row */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
                <SubscriberChart />
                <ViewsBarChart data={chartData} />
              </div>

              {/* Revenue Chart */}
              <div className="mb-6">
                <RevenueChart />
              </div>

              {/* Similar Channels */}
              {similarChannels.length > 0 && (
                <div className="mb-6">
                  <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 dark:border-white/10 flex items-center gap-2">
                      <i className="ri-links-line text-red-400 text-base w-5 h-5 flex items-center justify-center"></i>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Similar Channels</h3>
                      <span className="text-xs bg-red-100 dark:bg-red-600/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">{chData.category}</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-gray-100 dark:divide-white/5">
                      {similarChannels.map((sim) => (
                        <Link
                          key={sim.channelId}
                          to={`/channel/${sim.channelId}`}
                          className="flex flex-col items-center gap-2 px-3 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-white/10 flex-shrink-0">
                            {sim.avatar ? (
                              <img
                                src={sim.avatar}
                                alt={sim.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <i className="ri-user-line text-gray-400 dark:text-white/30 text-sm"></i>
                              </div>
                            )}
                          </div>
                          <div className="text-center min-w-0 w-full">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{sim.name}</p>
                            <p className="text-xs text-gray-400 dark:text-white/30 font-mono">{formatNum(sim.subscribers)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Videos */}
              <div className="mb-6">
                <RecentVideos videos={videos} channelId={channelId ?? ''} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChannelDetailPage;
