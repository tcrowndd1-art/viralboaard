import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { VideoModal } from '@/components/VideoModal';
import { CountryPicker, loadCountry } from '@/components/CountryModal';
import TopHeader from './components/TopHeader';
import GlobalSidebar from '@/components/feature/GlobalSidebar';
import SearchBanner from './components/SearchBanner';
import HomeFooter from './components/HomeFooter';
import ChannelSearchResult from './components/ChannelSearchResult';
import {
  searchChannel, fetchRecentVideos,
} from '@/services/youtube';
import type { ChannelResult, VideoResult, PopularChannelItem, TrendingVideoItem, ViralVideoItem } from '@/services/youtube';
import { cacheGet, cacheSet, addSearchHistory } from '@/services/cache';
import { viralMockData } from '@/mocks/viralData';
import { supabase } from '@/services/supabase';
import { AdStrip } from './components/AdBillboard';

type PlayHandler = (videoId: string, isShorts: boolean) => void;
const VideoPlayContext = createContext<PlayHandler | null>(null);
const usePlayVideo = (): PlayHandler => useContext(VideoPlayContext) ?? (() => {});

const CACHE_KEY = (q: string) => `vb_channel_${q.toLowerCase().trim()}`;
const SAVED_VIDEOS_KEY = 'viralboard_saved_videos';

const loadSavedVideos = (): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(SAVED_VIDEOS_KEY) ?? '[]') as string[]); }
  catch { return new Set(); }
};
const persistSavedVideos = (s: Set<string>) => localStorage.setItem(SAVED_VIDEOS_KEY, JSON.stringify([...s]));

/* ── Revenue ── */
const CPM: Record<string, number> = {
  Entertainment: 3.2, Music: 2.8, Education: 6.5, Gaming: 4.1,
  Sports: 5.2, News: 4.8, Comedy: 3.6, Kids: 2.1, Technology: 7.4,
};
function calcRevenue(views: number, category: string) {
  return (views / 1000) * (CPM[category] ?? 3.5) * 0.55;
}
function fmtRevenue(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n)}`;
}
function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}
function channelTier(subs: number) {
  if (subs >= 1_000_000) return { label: 'Macro', cls: 'bg-yellow-400/90 text-black' };
  if (subs >= 100_000)   return { label: 'Mid',   cls: 'bg-sky-400/90 text-black' };
  if (subs >= 10_000)    return { label: 'Micro', cls: 'bg-emerald-400/90 text-black' };
  return                        { label: 'Nano',  cls: 'bg-gray-300/90 text-black' };
}
function multiBadge(score: number | null) {
  if (score === null) return null;
  const t = `×${Math.round(score)}`;
  if (score >= 100) return { text: t, cls: 'bg-amber-400 text-black' };
  if (score >= 30)  return { text: t, cls: 'bg-green-400/90 text-black' };
  if (score >= 10)  return { text: t, cls: 'bg-sky-400/90 text-black' };
  return                  { text: t, cls: 'bg-gray-200 text-gray-600 dark:bg-white/15 dark:text-white/50' };
}

/* ── Channel avatar with initials fallback ── */
const ChannelAvatar = ({ src, name }: { src: string; name: string }) => {
  const [failed, setFailed] = useState(!src);
  const initials = (name || '?').replace(/\s+/g, '').slice(0, 2).toUpperCase();
  if (failed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-white/15 text-gray-600 dark:text-white/70 font-bold text-[11px] uppercase">
        {initials}
      </div>
    );
  }
  return (
    <img src={src} alt={name} className="w-full h-full object-cover"
      onError={() => setFailed(true)} />
  );
};

/* ── Category tabs — English keys internally ── */
const CATS = ['All', 'Entertainment', 'Gaming', 'Music', 'Education', 'Health', 'Sports', 'Science', 'Psychology', 'Self-Dev', 'Stories', 'Other'] as const;
type Cat = typeof CATS[number];

const CAT_MAP: Record<Cat, string[]> = {
  'All':           [],
  'Entertainment': ['Entertainment', 'Comedy', 'Kids'],
  'Gaming':        ['Gaming'],
  'Music':         ['Music'],
  'Education':     ['Education', 'Technology'],
  'Health':        ['Health', 'Fitness'],
  'Sports':        ['Sports'],
  'Science':       ['Science'],
  'Psychology':    ['Psychology'],
  'Self-Dev':      ['Self-Dev', 'Self-help', 'Motivation'],
  'Stories':       ['Stories', 'News'],
  'Other':         ['Other', 'Comedy', 'News'],
};

const DB_CAT_MAP: Record<string, string> = {
  entertainment: 'Entertainment',
  news_politics: 'News',
  science_tech:  'Science',
  howto_style:   'Self-Dev',
  people_blogs:  'Stories',
  reference:     'Other',
};
const normalizeCategory = (c: string): string => DB_CAT_MAP[c] ?? c;

/* ── Channel rank history (daily snapshot) ── */
const CH_RANK_HIST_KEY = 'vb_ch_rank_hist';
// Structure: { [country]: { date: "YYYY-MM-DD", prev: {chId:rank}, curr: {chId:rank} } }
const loadPrevChRanks = (country: string): Map<string, number> => {
  try {
    const raw = JSON.parse(localStorage.getItem(CH_RANK_HIST_KEY) ?? '{}');
    const entry = raw[country];
    if (!entry) return new Map();
    const today = new Date().toISOString().slice(0, 10);
    // Same day → compare against day-before snapshot (entry.prev)
    // Different day → entry.curr was saved yesterday, use it as "prev"
    const src: Record<string, number> = entry.date === today ? (entry.prev ?? {}) : (entry.curr ?? {});
    return new Map(Object.entries(src) as [string, number][]);
  } catch { return new Map(); }
};
const saveCurrChRanks = (country: string, channels: PopularChannelItem[]) => {
  try {
    const raw = JSON.parse(localStorage.getItem(CH_RANK_HIST_KEY) ?? '{}');
    const today = new Date().toISOString().slice(0, 10);
    const existing = raw[country] ?? { date: '', prev: {}, curr: {} };
    const newRanks: Record<string, number> = {};
    channels.forEach((ch, i) => { newRanks[ch.channelId] = i + 1; });
    // New day → rotate curr → prev, reset curr
    raw[country] = existing.date !== today
      ? { date: today, prev: existing.curr ?? {}, curr: newRanks }
      : { ...existing, curr: newRanks };
    localStorage.setItem(CH_RANK_HIST_KEY, JSON.stringify(raw));
  } catch { /* ignore */ }
};


/* ── Per-category accent colors for dynamic shorts rows ── */
const CAT_ACCENT: Partial<Record<Cat, { accent: string; accentBg: string; accentBorder: string }>> = {
  Entertainment: { accent: '#ef4444', accentBg: 'rgba(239,68,68,0.10)',    accentBorder: 'rgba(239,68,68,0.22)' },
  Gaming:        { accent: '#22c55e', accentBg: 'rgba(34,197,94,0.10)',    accentBorder: 'rgba(34,197,94,0.22)' },
  Music:         { accent: '#a855f7', accentBg: 'rgba(168,85,247,0.10)',   accentBorder: 'rgba(168,85,247,0.22)' },
  Education:     { accent: '#818cf8', accentBg: 'rgba(99,102,241,0.10)',   accentBorder: 'rgba(99,102,241,0.22)' },
  Health:        { accent: '#10b981', accentBg: 'rgba(16,185,129,0.10)',   accentBorder: 'rgba(16,185,129,0.22)' },
  Sports:        { accent: '#f59e0b', accentBg: 'rgba(245,158,11,0.10)',   accentBorder: 'rgba(245,158,11,0.22)' },
  Science:       { accent: '#38bdf8', accentBg: 'rgba(56,189,248,0.10)',   accentBorder: 'rgba(56,189,248,0.22)' },
  Psychology:    { accent: '#e879f9', accentBg: 'rgba(232,121,249,0.10)',  accentBorder: 'rgba(232,121,249,0.22)' },
  'Self-Dev':    { accent: '#fb923c', accentBg: 'rgba(251,146,60,0.10)',   accentBorder: 'rgba(251,146,60,0.22)' },
  Stories:       { accent: '#84cc16', accentBg: 'rgba(132,204,22,0.10)',   accentBorder: 'rgba(132,204,22,0.22)' },
  Other:         { accent: '#6b7280', accentBg: 'rgba(107,114,128,0.10)',  accentBorder: 'rgba(107,114,128,0.22)' },
};

/* ── Pagination component ── */
const Pagination = ({
  page, total, perPage, onChange,
}: { page: number; total: number; perPage: number; onChange: (p: number) => void }) => {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (totalPages <= 1) return null;
  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
        className="w-6 h-6 flex items-center justify-center rounded text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60 disabled:opacity-30 cursor-pointer transition-colors text-xs">
        ‹
      </button>
      {pages.map((p, i) =>
        p === '…' ? <span key={`e${i}`} className="w-6 h-6 flex items-center justify-center text-gray-300 dark:text-white/20 text-xs">…</span> : (
          <button key={p} onClick={() => onChange(p as number)}
            className={`w-6 h-6 flex items-center justify-center rounded text-xs font-semibold cursor-pointer transition-colors ${
              page === p ? 'bg-red-600 text-white' : 'text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/8'
            }`}>{p}</button>
        )
      )}
      <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        className="w-6 h-6 flex items-center justify-center rounded text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60 disabled:opacity-30 cursor-pointer transition-colors text-xs">
        ›
      </button>
    </div>
  );
};

/* ── Video card (16:9) ── */
const VideoCard = ({
  v, savedIds, onToggleSave,
}: {
  v: ViralVideoItem;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
}) => {
  const rev = calcRevenue(v.views, v.category);
  const revMin = fmtRevenue(rev * 0.5);
  const revMax = fmtRevenue(rev * 2.2);
  const multi = multiBadge(v.viralScore);
  const tier = channelTier(v.subscribers);
  const saved = savedIds.has(v.videoId);
  const playVideo = usePlayVideo();
  const { t } = useTranslation();
  const _vcDaysAgo = Math.max(0, Math.floor((Date.now() - new Date(v.uploadDate).getTime()) / 86400000));
  const ageText = _vcDaysAgo === 0 ? t('time_today') : _vcDaysAgo < 7 ? `${_vcDaysAgo}${t('time_days_ago')}` : _vcDaysAgo < 30 ? `${Math.floor(_vcDaysAgo / 7)}${t('time_weeks_ago')}` : _vcDaysAgo < 365 ? `${Math.floor(_vcDaysAgo / 30)}개월 전` : `${Math.floor(_vcDaysAgo / 365)}년 전`;

  return (
    <div className="group cursor-pointer relative w-full">
      <div
        className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-white/10 mb-2"
        style={{ aspectRatio: '16/9' }}
        onClick={() => playVideo(v.videoId, false)}
      >
        <img src={v.thumbnail} alt={v.title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
          onError={(e) => { const img = e.target as HTMLImageElement; if (img.src.includes('maxresdefault')) { img.src = img.src.replace('maxresdefault', 'hqdefault'); } else if (img.src.includes('hqdefault')) { img.src = img.src.replace('hqdefault', 'mqdefault'); } else { img.style.opacity = '0'; } }} />
        <div className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-sm rounded px-1.5 leading-none" style={{ paddingTop: '3px', paddingBottom: '3px' }}>
          <span className="text-emerald-400 text-[9px] font-black leading-none">{revMin}–{revMax}</span>
        </div>
        <span className={`absolute top-1.5 left-1.5 text-[7px] font-black px-1 leading-none rounded uppercase ${tier.cls}`} style={{ paddingTop: '2px', paddingBottom: '2px' }}>{tier.label}</span>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <i className="ri-play-fill text-white text-2xl"></i>
        </div>
      </div>
      <div className="flex items-start gap-1.5">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => playVideo(v.videoId, false)}>
          <p className="text-[12px] text-gray-900 dark:text-white/85 font-semibold line-clamp-2 leading-snug mb-1 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">{v.title}</p>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-gray-400 dark:text-white/30 truncate max-w-[120px]">{v.channelName}</span>
            <span className="text-[10px] text-gray-300 dark:text-white/15">·</span>
            <span className="text-[10px] text-gray-400 dark:text-white/30 font-mono inline-flex items-center gap-0.5"><i className="ri-eye-line text-[10px]"></i>{fmtViews(v.views)}</span>
            <span className="text-[10px] text-gray-300 dark:text-white/15">·</span>
            <span className="text-[10px] text-gray-400 dark:text-white/30 font-mono inline-flex items-center gap-0.5"><i className="ri-thumb-up-line text-[10px]"></i>{fmtViews(v.likes ?? 0)}</span>
            <span className="text-[10px] text-gray-300 dark:text-white/15">·</span>
            <span className="text-[10px] text-gray-400 dark:text-white/30 font-mono inline-flex items-center gap-0.5"><i className="ri-chat-3-line text-[10px]"></i>{fmtViews(v.comments ?? 0)}</span>
            {multi && <span className={`text-[8px] font-black px-1 py-px rounded leading-none ${multi.cls}`}>{multi.text}</span>}
            <span className="text-[10px] text-gray-300 dark:text-white/15">·</span>
            <span className={`text-[10px] ${_vcDaysAgo <= 30 ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-white/30'}`}>{ageText}</span>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onToggleSave(v.videoId); }}
          className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md transition-all cursor-pointer mt-0.5 ${
            saved ? 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/15' : 'text-gray-300 dark:text-white/25 hover:text-red-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
          }`}>
          <i className={`${saved ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-sm`}></i>
        </button>
      </div>
    </div>
  );
};

/* ── Shorts card (9:16) ── */
const ShortsCard = ({ v, rank }: { v: ViralVideoItem; rank?: number }) => {
  const { t } = useTranslation();
  const multi = multiBadge(v.viralScore);
  const playVideo = usePlayVideo();
  const daysAgo = Math.max(0, Math.floor((Date.now() - new Date(v.uploadDate).getTime()) / 86400000));
  const ago = daysAgo === 0
    ? t('time_today')
    : daysAgo <= 7
      ? `${daysAgo}${t('time_days_ago')}`
      : `${Math.floor(daysAgo / 7)}${t('time_weeks_ago')}`;
  return (
    <div onClick={() => playVideo(v.videoId, (v.duration ?? 0) <= 60)}
      className="group cursor-pointer block w-full">
      <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-white/10" style={{ aspectRatio: '9/16' }}>
        <img src={v.thumbnail} alt={v.title}
          className="w-full h-full object-cover object-center group-hover:scale-[1.07] transition-transform duration-300"
          onError={(e) => { const img = e.target as HTMLImageElement; if (img.src.includes('maxresdefault')) { img.src = img.src.replace('maxresdefault', 'hqdefault'); } else if (img.src.includes('hqdefault')) { img.src = img.src.replace('hqdefault', 'mqdefault'); } else { img.style.opacity = '0'; } }} />
        {rank !== undefined && (
          <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shadow-md"
            style={{
              background: rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : rank === 3 ? '#f97316' : '#ef4444',
              color: rank <= 3 ? '#000' : '#fff',
            }}>
            {rank}
          </div>
        )}
        {multi && (
          <div className="absolute top-1.5 right-1.5">
            <span className={`text-[7px] font-black px-1 rounded leading-none ${multi.cls}`} style={{ paddingTop: '2px', paddingBottom: '2px' }}>
              {multi.text}
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/92 via-black/45 to-transparent px-2 pb-2 pt-10">
          <p className="text-white text-[10px] font-semibold line-clamp-2 leading-tight mb-1.5">{v.title}</p>
          <div className="flex items-center justify-between gap-1">
            <span className="text-white/50 text-[8px] truncate">{v.channelName}</span>
            <span className="text-white/75 text-[8px] font-mono font-bold flex-shrink-0">{fmtViews(v.views)}</span>
          </div>
          <span className="text-white/30 text-[7px] mt-0.5 block">{ago}</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <i className="ri-play-fill text-white text-lg" style={{ marginLeft: '2px' }}></i>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Trending card (API, 16:9) ── */
const TrendCard = ({ v }: { v: TrendingVideoItem }) => {
  const playVideo = usePlayVideo();
  return (
  <div onClick={() => playVideo(v.videoId, false)}
    className="group cursor-pointer block w-full">
    <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-white/10 mb-2" style={{ aspectRatio: '16/9' }}>
      <img src={v.thumbnail} alt={v.title}
        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
        onError={(e) => { const img = e.target as HTMLImageElement; if (img.src.includes('maxresdefault')) { img.src = img.src.replace('maxresdefault', 'hqdefault'); } else if (img.src.includes('hqdefault')) { img.src = img.src.replace('hqdefault', 'mqdefault'); } else { img.style.opacity = '0'; } }} />
    </div>
    <p className="text-[12px] text-gray-900 dark:text-white/85 font-semibold line-clamp-2 leading-snug mb-1 group-hover:text-red-500 transition-colors">{v.title}</p>
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-gray-400 dark:text-white/30 truncate">{v.channelName}</span>
      <span className="text-[10px] text-gray-300 dark:text-white/15">·</span>
      <span className="text-[10px] text-gray-400 dark:text-white/30 font-mono">{v.score}</span>
    </div>
  </div>
  );
};

/* ── Section header (no pagination — moved to bottom of grids) ── */
const SectionHeader = ({
  icon, iconColor, title, glowColor, badge,
}: {
  icon: string; iconColor: string; title: string;
  glowColor?: string; badge?: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 mb-3 px-4 sm:px-6">
    <i className={`${icon} ${iconColor} text-sm`}></i>
    <h2
      className={`text-[13px] font-black tracking-tight ${!glowColor ? 'text-gray-900 dark:text-white' : ''}`}
      style={glowColor ? { color: glowColor, textShadow: `0 0 12px ${glowColor}88` } : undefined}
    >{title}</h2>
    {badge}
  </div>
);

/* ── Shorts section — category-aware, 2 preset rows or 1 dynamic row ── */
const ShortsSection = ({ data, activeCat, loaded }: { data: ViralVideoItem[]; activeCat: Cat; loaded: boolean }) => {
  const { t } = useTranslation();
  const [dynPage, setDynPage] = useState(1);
  const PER_PAGE = 8;

  /* Shuffle once when data first arrives — different order each page load */
  const shuffledData = useMemo(() => {
    if (data.length === 0) return data;
    const arr = [...data];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length > 0]);

  const SkeletonCard = ({ k }: { k: number }) => (
    <div key={`sk-${k}`} className="w-full animate-pulse">
      <div className="w-full bg-gray-100 dark:bg-white/8 rounded-xl" style={{ aspectRatio: '9/16' }} />
    </div>
  );

  const ShortsRow = ({
    label, items, page, onPage, accent, accentBg, accentBorder,
  }: {
    label: string; items: ViralVideoItem[]; page: number; onPage: (p: number) => void;
    accent: string; accentBg: string; accentBorder: string;
  }) => {
    const paged = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const isEmpty = paged.length === 0;
    const noData = loaded && items.length === 0;
    const half1 = isEmpty ? Array.from({ length: 4 }) as (ViralVideoItem | undefined)[] : paged.slice(0, 4);
    const half2 = isEmpty ? Array.from({ length: 4 }) as (ViralVideoItem | undefined)[] : paged.slice(4, 8);

    return (
      <div className="mb-6">
        {/* Row label */}
        <div className="px-4 sm:px-6 flex items-center gap-2.5 mb-3">
          <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: accent }} />
          <span
            className="text-[11px] font-black px-2.5 py-1 rounded-lg flex-shrink-0"
            style={{ background: accentBg, color: accent, border: `1px solid ${accentBorder}` }}
          >
            {label}
          </span>
          <span className="text-[9px] text-gray-400 dark:text-white/40 font-mono">{items.length}</span>
        </div>
        {noData ? (
          <div className="px-4 sm:px-6 py-8 text-center text-[12px] text-gray-400 dark:text-white/40">
            이 카테고리는 아직 수집된 데이터가 없습니다
          </div>
        ) : (
        <>
        {/* Cards — mobile: 2-col, desktop: split 4+4 */}
        <div className="sm:hidden grid grid-cols-2 gap-2 px-4">
          {paged.map((v, i) => {
            const rank = (page - 1) * PER_PAGE + i + 1;
            return v ? <ShortsCard key={v.videoId} v={v} rank={rank} />
              : <SkeletonCard key={i} k={i} />;
          })}
        </div>
        <div className="hidden sm:flex gap-3 px-6 items-stretch">
          <div className="grid gap-3 flex-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {half1.map((v, i) => {
              const rank = (page - 1) * PER_PAGE + i + 1;
              return v ? <ShortsCard key={v.videoId} v={v} rank={rank} />
                : <SkeletonCard key={i} k={i} />;
            })}
          </div>
          <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0 w-5">
            <div className="flex-1 w-px bg-gray-100 dark:bg-white/[0.06]" />
            <span className="text-[7px] text-gray-200 dark:text-white/[0.12] font-mono tracking-widest rotate-90">···</span>
            <div className="flex-1 w-px bg-gray-100 dark:bg-white/[0.06]" />
          </div>
          <div className="grid gap-3 flex-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {half2.map((v, i) => {
              const rank = (page - 1) * PER_PAGE + i + 5;
              return v ? <ShortsCard key={v.videoId} v={v} rank={rank} />
                : <SkeletonCard key={i + 4} k={i + 4} />;
            })}
          </div>
        </div>
        </>
        )}
        {/* Pagination at bottom */}
        {!noData && items.length > PER_PAGE && (
          <div className="flex justify-end px-6 mt-3">
            <Pagination page={page} total={items.length} perPage={PER_PAGE} onChange={onPage} />
          </div>
        )}
      </div>
    );
  };

  if (activeCat !== 'All') {
    const cats = CAT_MAP[activeCat];
    const filtered = cats.length > 0
      ? shuffledData.filter(v => cats.some(c => c.toLowerCase() === v.category.toLowerCase()))
      : shuffledData;
    const accent = CAT_ACCENT[activeCat] ?? { accent: '#6b7280', accentBg: 'rgba(107,114,128,0.10)', accentBorder: 'rgba(107,114,128,0.22)' };
    const catKey = `cat_${activeCat.toLowerCase().replace('-', '')}` as never;
    const label = t(catKey, activeCat);
    return (
      <section>
        <div className="flex items-center gap-2 mb-4 px-4 sm:px-6">
          <i className="ri-scissors-cut-line text-red-500 text-sm"></i>
          <h2 className="text-[13px] font-black text-gray-900 dark:text-white tracking-tight">Shorts</h2>
          <span className="text-[9px] text-gray-500 dark:text-white/50 font-mono ml-1 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">{t('home_viral_score_order')}</span>
        </div>
        <ShortsRow
          label={label}
          items={filtered}
          page={dynPage}
          onPage={setDynPage}
          accent={accent.accent}
          accentBg={accent.accentBg}
          accentBorder={accent.accentBorder}
        />
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4 px-4 sm:px-6">
        <i className="ri-scissors-cut-line text-red-500 text-sm"></i>
        <h2 className="text-[13px] font-black text-gray-900 dark:text-white tracking-tight">Shorts</h2>
        <span className="text-[9px] text-gray-500 dark:text-white/50 font-mono ml-1 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">{t('home_viral_score_order')}</span>
      </div>
      <ShortsRow
        label={t('cat_all', 'All')}
        items={shuffledData}
        page={dynPage}
        onPage={setDynPage}
        accent="#ef4444"
        accentBg="rgba(239,68,68,0.10)"
        accentBorder="rgba(239,68,68,0.22)"
      />
    </section>
  );
};

/* ── Video grid section (4 per row, pagination at bottom) ── */
const VideoSection = ({
  icon, iconColor, title, glowColor, badge, items, savedIds, onToggleSave, loaded, emptyMessage,
}: {
  icon: string; iconColor: string; title: string; glowColor?: string; badge?: React.ReactNode;
  items: ViralVideoItem[]; savedIds: Set<string>; onToggleSave: (id: string) => void; loaded: boolean;
  emptyMessage?: string;
}) => {
  const [page, setPage] = useState(1);
  const PER_PAGE = 4;
  const paged = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const noData = loaded && items.length === 0;

  return (
    <section>
      <SectionHeader icon={icon} iconColor={iconColor} title={title} glowColor={glowColor} badge={badge} />
      {noData ? (
        <div className="px-4 sm:px-6 py-8 text-center text-[12px] text-gray-400 dark:text-white/40">
          {emptyMessage ?? '이 카테고리는 아직 수집된 데이터가 없습니다'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6">
          {paged.length === 0
            ? Array.from({ length: PER_PAGE }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-full bg-gray-100 dark:bg-white/8 rounded-xl mb-2" style={{ aspectRatio: '16/9' }} />
                  <div className="h-3 bg-gray-100 dark:bg-white/8 rounded w-full mb-1.5" />
                  <div className="h-3 bg-gray-100 dark:bg-white/8 rounded w-2/3" />
                </div>
              ))
            : paged.map((v) => (
                <VideoCard key={v.videoId} v={v} savedIds={savedIds} onToggleSave={onToggleSave} />
              ))
          }
        </div>
      )}
      {items.length > PER_PAGE && (
        <div className="flex justify-end px-6 mt-3">
          <Pagination page={page} total={items.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      )}
    </section>
  );
};

/* ── Trending section (API, pagination at bottom) ── */
const TrendingSection = ({ items, loaded, country = 'KR' }: { items: TrendingVideoItem[]; loaded: boolean; country?: string }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const PER_PAGE = 4;
  const paged = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <section>
      <SectionHeader icon="ri-fire-line" iconColor="text-orange-500" title={t('home_trending_live')}
        badge={<span className="flex items-center gap-1 text-[9px] text-red-500"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block"></span>LIVE · {country}</span>}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6">
        {!loaded && items.length === 0
          ? Array.from({ length: PER_PAGE }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full bg-gray-100 dark:bg-white/8 rounded-xl mb-2" style={{ aspectRatio: '16/9' }} />
                <div className="h-3 bg-gray-100 dark:bg-white/8 rounded w-full mb-1.5" />
                <div className="h-3 bg-gray-100 dark:bg-white/8 rounded w-2/3" />
              </div>
            ))
          : paged.map(v => <TrendCard key={v.videoId} v={v} />)
        }
      </div>
      {items.length > PER_PAGE && (
        <div className="flex justify-end px-6 mt-3">
          <Pagination page={page} total={items.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      )}
    </section>
  );
};

/* ═══════════════ MAIN PAGE ═══════════════ */
const HomePage = () => {
  const { t, i18n } = useTranslation();
  const isKo = i18n.language.startsWith('ko');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<Cat>('All');
  const [activeCountry, setActiveCountry] = useState(() => loadCountry());
  useEffect(() => {
    const onChange = () => setActiveCountry(loadCountry());
    window.addEventListener('country-changed', onChange);
    return () => window.removeEventListener('country-changed', onChange);
  }, []);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => loadSavedVideos());
  const [modalVideo, setModalVideo] = useState<{ videoId: string; isShorts: boolean } | null>(null);
  const playVideo = useCallback<PlayHandler>((videoId, isShorts) => setModalVideo({ videoId, isShorts }), []);

  const [chTab, setChTab] = useState<'subs' | 'views'>('subs');
  const [searching, setSearching] = useState(false);
  const [channel, setChannel] = useState<ChannelResult | null>(null);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [popularChannels, setPopularChannels] = useState<PopularChannelItem[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<TrendingVideoItem[]>([]);
  const [liveVideos, setLiveVideos] = useState<ViralVideoItem[]>([]);
  const [homeDataLoaded, setHomeDataLoaded] = useState(false);
  const [prevChRankings, setPrevChRankings] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    let cancelled = false;
    setLiveVideos([]);
    setTrendingVideos([]);
    setPopularChannels([]);
    setHomeDataLoaded(false);
    setPrevChRankings(loadPrevChRanks(activeCountry));

    async function loadHomeData() {
      try {
        const { data, error } = await supabase
          .from('viralboard_data')
          .select('*')
          .eq('country', activeCountry)
          .order('views', { ascending: false })
          .limit(100);

        if (error) throw error;
        if (cancelled) return;
        if (!data || data.length === 0) return;

        // 바이럴 영상 (liveVideos)
        const viral: ViralVideoItem[] = data.map((v, i) => ({
          rank: i + 1,
          videoId: v.video_id,
          title: v.title,
          channelName: v.channel,
          channelAvatar: '',
          channelId: v.channel_id,
          subscribers: v.subscriber_count ?? 0,
          views: v.views,
          viralScore: v.subscriber_count > 0 ? v.views / v.subscriber_count : null,
          uploadDate: v.published_at ?? v.fetched_at,
          thumbnail: (v.thumbnail_url ?? '').replace(/\/(hq|mq|sd)default\.jpg/, '/maxresdefault.jpg'),
          category: normalizeCategory(v.category),
          country: v.country,
          isShorts: v.is_shorts ?? false,
          duration: v.duration_seconds ?? 0,
          likes: v.likes ?? 0,
          comments: v.comments ?? 0,
        }));
        if (!cancelled) setLiveVideos(viral);

        // 트렌딩 영상 — 최근 7일 업로드 + VPH(시간당 조회수) 순
        const _sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
        const { data: trendRaw } = await supabase
          .from('viralboard_data')
          .select('video_id, title, channel, channel_id, thumbnail_url, views, published_at')
          .eq('country', activeCountry)
          .gte('published_at', _sevenDaysAgo)
          .order('views', { ascending: false })
          .limit(50);
        if (cancelled) return;

        const _nowMs = Date.now();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const _trendSrc: any[] = (trendRaw && trendRaw.length >= 4) ? trendRaw : data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const _withVph = _trendSrc.map((v: any) => ({
          ...v,
          _vph: v.published_at
            ? v.views / Math.max(1, (_nowMs - new Date(v.published_at).getTime()) / 3_600_000)
            : 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        })).filter((v: any) => v._vph > 0)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .sort((a: any, b: any) => b._vph - a._vph)
          .slice(0, 16);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const trending: TrendingVideoItem[] = _withVph.map((v: any, i: number) => ({
          rank: i + 1,
          title: v.title,
          score: v._vph >= 10_000
            ? `${(v._vph / 1_000).toFixed(0)}K/h`
            : v._vph >= 1_000
              ? `${(v._vph / 1_000).toFixed(1)}K/h`
              : `${Math.round(v._vph)}/h`,
          thumbnail: v.thumbnail_url ?? '',
          channelName: v.channel,
          channelAvatar: '',
          videoId: v.video_id,
          channelId: v.channel_id,
        }));
        if (!cancelled) setTrendingVideos(trending);

        // 인기 채널 (popularChannels) — channel_id별 조회수 집계
        const channelMap = new Map<string, { name: string; channelId: string; totalViews: number; subscribers: number; avatar: string }>();
        for (const v of data) {
          const subs = v.subscriber_count ?? 0;
          const thumb = v.channel_thumbnail_url ?? '';
          const existing = channelMap.get(v.channel_id);
          if (!existing) {
            channelMap.set(v.channel_id, { name: v.channel, channelId: v.channel_id, totalViews: v.views, subscribers: subs, avatar: thumb });
          } else {
            existing.totalViews += v.views;
            if (subs > existing.subscribers) existing.subscribers = subs;
            if (!existing.avatar && thumb) existing.avatar = thumb;
          }
        }
        const popular: PopularChannelItem[] = [...channelMap.values()]
          .sort((a, b) => b.totalViews - a.totalViews)
          .slice(0, 20)
          .map((ch, i) => ({
            rank: i + 1,
            name: ch.name,
            score: ch.totalViews >= 1_000_000
              ? `${(ch.totalViews / 1_000_000).toFixed(1)}M`
              : `${(ch.totalViews / 1_000).toFixed(0)}K`,
            avatar: ch.avatar,
            channelId: ch.channelId,
            subscribers: ch.subscribers,
            totalViews: ch.totalViews,
          }));
        if (!cancelled) {
          setPopularChannels(popular);
          saveCurrChRanks(activeCountry, popular);
        }

      } catch (e) {
        console.error('[home] loadHomeData FAIL:', e);
      } finally {
        if (!cancelled) setHomeDataLoaded(true);
      }
    }

    loadHomeData();
    return () => { cancelled = true; };
  }, [activeCountry]);

  const handleToggleSave = useCallback((videoId: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId); else next.add(videoId);
      persistSavedVideos(next);
      return next;
    });
  }, []);

  const handleSearch = async (query: string) => {
    setSearching(true);
    setSearchError(null);
    setChannel(null);
    setVideos([]);
    const cacheKey = CACHE_KEY(query);
    const cached = cacheGet<{ channel: ChannelResult; videos: VideoResult[] }>(cacheKey);
    if (cached) {
      setChannel(cached.channel);
      setVideos(cached.videos);
      setSearching(false);
      addSearchHistory(query);
      return;
    }
    try {
      const results = await searchChannel(query);
      if (!results.length) {
        setSearchError(isKo
          ? '검색 결과가 없습니다. 다른 키워드를 시도해보세요.'
          : 'No results. Try another keyword.');
        return;
      }
      const top = results[0];
      const recentVideos = await fetchRecentVideos(top.id);
      setChannel(top);
      setVideos(recentVideos);
      cacheSet(cacheKey, { channel: top, videos: recentVideos });
      addSearchHistory(query);
    } catch {
      setSearchError(isKo ? '검색 중 오류가 발생했습니다. API 키를 확인해주세요.' : 'Search error. Please check your API key.');
    } finally {
      setSearching(false);
    }
  };

  const filterByCat = (items: ViralVideoItem[]) => {
    let result = items;
    if (activeCat !== 'All') {
      const cats = CAT_MAP[activeCat];
      result = result.filter(v => cats.some(c => c.toLowerCase() === v.category.toLowerCase()));
    }
    result = result.filter(v => (v.country ?? '').toUpperCase() === activeCountry.toUpperCase());
    return result;
  };

  /* fetch 완료 후 실데이터 없으면 빈 배열, 로딩 중만 mock skeleton */
  const videoPool = liveVideos.length > 0
    ? liveVideos
    : homeDataLoaded
      ? []
      : viralMockData;
  const longformPool = videoPool.filter(v => !v.isShorts);
  const _thirtyDaysAgo  = Date.now() - 30 * 24 * 3600 * 1000;
  const _ninetyDaysAgo  = Date.now() - 90 * 24 * 3600 * 1000;
  const _uploadMs = (v: ViralVideoItem) => v.uploadDate ? new Date(v.uploadDate).getTime() : 0;
  // Tier 1: spec 기준 — ×100 이상, 30일 이내
  const _rising100 = [...longformPool]
    .filter(v => v.viralScore !== null && v.viralScore >= 100 && _uploadMs(v) >= _thirtyDaysAgo)
    .sort((a, b) => (b.viralScore ?? 0) - (a.viralScore ?? 0))
    .slice(0, 12);
  // Tier 2: relaxed — ×10 이상, 90일 이내
  const _rising10 = [...longformPool]
    .filter(v => v.viralScore !== null && v.viralScore >= 10 && _uploadMs(v) >= _ninetyDaysAgo)
    .sort((a, b) => (b.viralScore ?? 0) - (a.viralScore ?? 0))
    .slice(0, 12);
  // Tier 3: Video Rankings 떡상 탐지 fallback — viralScore > 0 전체
  const _risingAll = [...longformPool]
    .filter(v => v.viralScore !== null && v.viralScore > 0)
    .sort((a, b) => (b.viralScore ?? 0) - (a.viralScore ?? 0))
    .slice(0, 12);
  const risingVideos = filterByCat(
    _rising100.length > 0 ? _rising100 : _rising10.length > 0 ? _rising10 : _risingAll
  );
  const topViewVideos = filterByCat([...longformPool].sort((a, b) => b.views - a.views));
  const topViewsAll = topViewVideos;
  const chBySubs  = [...popularChannels].sort((a, b) => b.subscribers - a.subscribers);
  const chByViews = [...popularChannels].sort((a, b) => b.totalViews - a.totalViews);

  /* Category display labels */
  const CAT_LABELS: Record<Cat, string> = {
    'All':           t('cat_all'),
    'Entertainment': t('cat_entertainment'),
    'Gaming':        t('cat_gaming'),
    'Music':         t('cat_music'),
    'Education':     t('cat_education'),
    'Health':        t('cat_health'),
    'Sports':        t('cat_sports'),
    'Science':       t('cat_science'),
    'Psychology':    t('cat_psychology'),
    'Self-Dev':      t('cat_selfdev'),
    'Stories':       t('cat_stories'),
    'Other':         t('cat_other'),
  };

  return (
    <VideoPlayContext.Provider value={playVideo}>
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors">
      <TopHeader onMobileMenuToggle={() => setSidebarOpen(v => !v)} />
      <GlobalSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-52 pt-12 pb-16 lg:pb-0">
        <SearchBanner onSearch={handleSearch} loading={searching} />

        {searchError && (
          <div className="mx-6 mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded text-sm text-red-600 dark:text-red-400">{searchError}</div>
        )}
        {channel && (
          <ChannelSearchResult channel={channel} videos={videos}
            onClose={() => { setChannel(null); setVideos([]); setSearchError(null); }} />
        )}

        <div className="pt-5 pb-12 space-y-8">

          {/* ── Popular Channels TOP10 — horizontal scroll with tabs ── */}
          {(() => {
            const chList = (chTab === 'subs' ? chBySubs : chByViews).slice(0, 10);
            const isLoading = !homeDataLoaded && popularChannels.length === 0;
            return (
              <div>
                <div className="flex items-center justify-between mb-3 px-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-400 dark:text-white/45 uppercase tracking-[0.15em]">{t('home_popular_channels')}</span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-black" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>TOP10</span>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => setChTab('subs')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold transition-all cursor-pointer ${
                          chTab === 'subs' ? 'bg-amber-400/90 text-black' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/45 hover:bg-gray-200 dark:hover:bg-white/15'
                        }`}>
                        <i className="ri-user-star-line text-[9px]"></i> {t('home_by_subs')}
                      </button>
                      <button onClick={() => setChTab('views')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold transition-all cursor-pointer ${
                          chTab === 'views' ? 'bg-sky-400/90 text-black' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/45 hover:bg-gray-200 dark:hover:bg-white/15'
                        }`}>
                        <i className="ri-eye-line text-[9px]"></i> {t('home_by_views')}
                      </button>
                    </div>
                  </div>
                  <a href="/rankings" className="text-[10px] text-gray-400 dark:text-white/45 hover:text-red-500 transition-colors mr-6">{t('home_view_all')}</a>
                </div>
                <div className="overflow-x-auto scrollbar-hide px-4 sm:px-6 pb-1">
                  <div className="flex gap-2.5" style={{ width: 'max-content' }}>
                    {(isLoading ? Array.from({ length: 10 }) : chList).map((ch, i) =>
                      ch ? (
                        <Link
                          key={(ch as PopularChannelItem).channelId + chTab}
                          to={`/channel/${(ch as PopularChannelItem).channelId}`}
                          className="group flex flex-col items-center gap-1.5 w-[76px] flex-shrink-0 px-1.5 py-2.5 rounded-xl border border-gray-100 dark:border-white/[0.07] hover:border-red-200 dark:hover:border-red-500/30 hover:bg-red-50/40 dark:hover:bg-red-500/[0.05] transition-all"
                        >
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-white/10 ring-2 ring-transparent group-hover:ring-red-400/50 transition-all">
                              <ChannelAvatar src={(ch as PopularChannelItem).avatar || ''} name={(ch as PopularChannelItem).name} />
                            </div>
                            {/* Gold/Silver/Bronze rank badge — silver uses outline for white-bg visibility */}
                            <span className={`absolute -top-1 -left-1 w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-black leading-none ${
                              i === 0 ? 'bg-amber-400 text-black' :
                              i === 1 ? 'bg-slate-400 text-white ring-1 ring-slate-500/30' :
                              i === 2 ? 'bg-orange-400 text-black' :
                              'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50'
                            }`}>{i + 1}</span>
                          </div>
                          <p className="text-[9px] font-semibold text-gray-700 dark:text-white/70 group-hover:text-red-600 dark:group-hover:text-red-400 truncate w-full text-center transition-colors leading-tight">
                            {(ch as PopularChannelItem).name}
                          </p>
                          <p className="text-[8px] text-gray-400 dark:text-white/45 font-mono leading-none">
                            {chTab === 'subs' && (ch as PopularChannelItem).subscribers != null
                              ? (((ch as PopularChannelItem).subscribers / 1_000_000) >= 1
                                  ? `${((ch as PopularChannelItem).subscribers / 1_000_000).toFixed(1)}M`
                                  : `${Math.round((ch as PopularChannelItem).subscribers / 1_000)}K`)
                              : (ch as PopularChannelItem).totalViews != null
                                ? (((ch as PopularChannelItem).totalViews / 1_000_000_000) >= 1
                                    ? `${((ch as PopularChannelItem).totalViews / 1_000_000_000).toFixed(1)}B`
                                    : `${((ch as PopularChannelItem).totalViews / 1_000_000).toFixed(0)}M`)
                                : ''}
                          </p>
                          {/* Rank change badge */}
                          {(() => {
                            if (prevChRankings.size === 0) return null;
                            const prevRank = prevChRankings.get((ch as PopularChannelItem).channelId);
                            const currRank = i + 1;
                            if (prevRank === undefined) return <span className="text-[7px] font-black px-1 py-px rounded bg-blue-500/15 text-blue-500 leading-none">NEW</span>;
                            const diff = prevRank - currRank;
                            if (diff > 0) return <span className="text-[8px] font-black text-red-500 leading-none">▲{diff}</span>;
                            if (diff < 0) return <span className="text-[8px] font-black text-gray-400 dark:text-white/30 leading-none">▼{Math.abs(diff)}</span>;
                            return <span className="text-[8px] text-gray-300 dark:text-white/20 leading-none">—</span>;
                          })()}
                        </Link>
                      ) : (
                        <div key={i} className="w-[76px] flex-shrink-0 flex flex-col items-center gap-1.5 px-1.5 py-2.5 rounded-xl border border-gray-100 dark:border-white/[0.07]">
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/8 animate-pulse" />
                          <div className="h-2 bg-gray-100 dark:bg-white/8 rounded animate-pulse w-4/5" />
                          <div className="h-2 bg-gray-100 dark:bg-white/8 rounded animate-pulse w-1/2" />
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="border-t border-gray-100 dark:border-white/[0.05]" />

          {/* ── Filter bar ── */}
          <div className="px-4 sm:px-6 -mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <CountryPicker current={activeCountry} onSelect={setActiveCountry} variant="pill" isKo={isKo} />
              <div className="w-px h-5 bg-gray-200 dark:bg-white/10 flex-shrink-0" />
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 flex-nowrap sm:flex-wrap flex-1 min-w-0">
              {/* Category pills */}
              {CATS.map(cat => (
                <button key={cat} onClick={() => setActiveCat(cat)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeCat === cat
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20'
                  }`}>{CAT_LABELS[cat]}</button>
              ))}
              </div>
            </div>
            {/* Viral legend */}
            <div className="flex items-center gap-2.5 text-[9px] text-gray-400 dark:text-white/45">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>{t('home_viral_100')}</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>{t('home_viral_30')}</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block"></span>{t('home_viral_10')}</span>
            </div>

          </div>

          {/* ── Shorts (category-aware) ── */}
          <ShortsSection
            data={videoPool.filter(v => v.isShorts && (v.country ?? '').toUpperCase() === activeCountry.toUpperCase())}
            activeCat={activeCat}
            loaded={homeDataLoaded}
          />


          {/* ── Rising Channels ── */}
          <VideoSection icon="ri-rocket-line" iconColor="text-emerald-500"
            title={t('home_rising_channels')}
            glowColor="#10b981"
            badge={<span className="text-[10px] text-gray-400 dark:text-white/45">{t('home_views_vs_subs')}</span>}
            emptyMessage="이번 주는 검증된 떡상 영상이 없습니다. 곧 업데이트됩니다."
            items={risingVideos} savedIds={savedIds} onToggleSave={handleToggleSave} loaded={homeDataLoaded} />

          {/* ── Top Views ── */}
          <VideoSection icon="ri-eye-line" iconColor="text-sky-500"
            title={t('home_top_views')}
            glowColor="#38bdf8"
            badge={<span className="text-[10px] text-gray-400 dark:text-white/45">{t('home_est_revenue')}</span>}
            items={topViewVideos} savedIds={savedIds} onToggleSave={handleToggleSave} loaded={homeDataLoaded} />

          {/* ── Ad strip — between Top Views and Trending sections ── */}
          <AdStrip offset={2} />

          {/* ── Trending Live ── */}
          <TrendingSection items={trendingVideos} loaded={homeDataLoaded} country={activeCountry} />

          {/* ── Total Views TOP ── */}
          <VideoSection
            icon="ri-bar-chart-box-line" iconColor="text-rose-500" title={t('home_total_views_top')}
            glowColor="#f43f5e"
            badge={
              <div className="flex items-center gap-1.5 ml-1">
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-500/15 text-rose-500 dark:text-rose-400">{t('home_shorts_1m')}</span>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-500/15 text-sky-500 dark:text-sky-400">{t('home_longform_3m')}</span>
              </div>
            }
            items={topViewsAll}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            loaded={homeDataLoaded}
          />

        </div>

        <HomeFooter />
      </div>
      {modalVideo && (
        <VideoModal videoId={modalVideo.videoId} isShorts={modalVideo.isShorts} onClose={() => setModalVideo(null)} />
      )}
    </div>
    </VideoPlayContext.Provider>
  );
};

export default HomePage;
