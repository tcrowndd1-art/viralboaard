import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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

const COUNTRY_FLAG: Record<string, string> = {
  KR: '🇰🇷', US: '🇺🇸', JP: '🇯🇵', GB: '🇬🇧', IN: '🇮🇳',
  MX: '🇲🇽', BR: '🇧🇷', ID: '🇮🇩', DE: '🇩🇪', CA: '🇨🇦',
  AU: '🇦🇺', FR: '🇫🇷', PH: '🇵🇭', TW: '🇹🇼', TH: '🇹🇭', RU: '🇷🇺',
};

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
function multiBadge(score: number) {
  const t = `×${Math.round(score)}`;
  if (score >= 100) return { text: t, cls: 'bg-amber-400 text-black' };
  if (score >= 30)  return { text: t, cls: 'bg-green-400/90 text-black' };
  if (score >= 10)  return { text: t, cls: 'bg-sky-400/90 text-black' };
  return                  { text: t, cls: 'bg-gray-200 text-gray-600 dark:bg-white/15 dark:text-white/50' };
}

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
  'Self-Dev':      ['Self-help', 'Motivation'],
  'Stories':       ['Stories', 'News'],
  'Other':         ['Other', 'Comedy', 'News'],
};

/* ── Shorts rows config ── */
const SHORTS_ROWS = [
  { key: 'entermusic', tKey: 'home_shorts_entermusic', cats: ['Entertainment', 'Music', 'Comedy', 'Kids'], accent: '#ef4444', accentBg: 'rgba(239,68,68,0.10)', accentBorder: 'rgba(239,68,68,0.22)' },
  { key: 'edtech',     tKey: 'home_shorts_edtech',     cats: ['Education', 'Technology', 'News'],          accent: '#818cf8', accentBg: 'rgba(99,102,241,0.10)', accentBorder: 'rgba(99,102,241,0.22)' },
] as const;

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

  return (
    <div className="group cursor-pointer relative w-full">
      <div
        className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-white/10 mb-2"
        style={{ aspectRatio: '16/9' }}
        onClick={() => window.open(`https://www.youtube.com/watch?v=${v.videoId}`, '_blank')}
      >
        <img src={v.thumbnail} alt={v.title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
          onError={(e) => { const img = e.target as HTMLImageElement; if (img.src.includes('hqdefault')) { img.src = img.src.replace('hqdefault', 'mqdefault'); } else { img.style.opacity = '0'; } }} />
        <div className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-sm rounded px-1.5 leading-none" style={{ paddingTop: '3px', paddingBottom: '3px' }}>
          <span className="text-emerald-400 text-[9px] font-black leading-none">{revMin}–{revMax}</span>
        </div>
        <span className={`absolute top-1.5 left-1.5 text-[7px] font-black px-1 leading-none rounded uppercase ${tier.cls}`} style={{ paddingTop: '2px', paddingBottom: '2px' }}>{tier.label}</span>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <i className="ri-play-fill text-white text-2xl"></i>
        </div>
      </div>
      <div className="flex items-start gap-1.5">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => window.open(`https://www.youtube.com/watch?v=${v.videoId}`, '_blank')}>
          <p className="text-[12px] text-gray-900 dark:text-white/85 font-semibold line-clamp-2 leading-snug mb-1 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">{v.title}</p>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-gray-400 dark:text-white/30 truncate max-w-[120px]">{v.channelName}</span>
            <span className="text-[10px] text-gray-300 dark:text-white/15">·</span>
            <span className="text-[10px] text-gray-400 dark:text-white/30 font-mono">{fmtViews(v.views)}</span>
            <span className={`text-[8px] font-black px-1 py-px rounded leading-none ${multi.cls}`}>{multi.text}</span>
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
const ShortsCard = ({ v }: { v: ViralVideoItem }) => {
  const { t } = useTranslation();
  const multi = multiBadge(v.viralScore);
  const daysAgo = Math.max(0, Math.floor((Date.now() - new Date(v.uploadDate).getTime()) / 86400000));
  const ago = daysAgo === 0
    ? t('time_today')
    : daysAgo <= 7
      ? `${daysAgo}${t('time_days_ago')}`
      : `${Math.floor(daysAgo / 7)}${t('time_weeks_ago')}`;
  return (
    <a href={`https://www.youtube.com/shorts/${v.videoId}`} target="_blank" rel="noopener noreferrer"
      className="group cursor-pointer block w-full">
      <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-white/10" style={{ aspectRatio: '9/16' }}>
        <img src={v.thumbnail} alt={v.title}
          className="w-full h-full object-cover object-center group-hover:scale-[1.07] transition-transform duration-300"
          onError={(e) => { const img = e.target as HTMLImageElement; if (img.src.includes('hqdefault')) { img.src = img.src.replace('hqdefault', 'mqdefault'); } else { img.style.opacity = '0'; } }} />
        <div className="absolute top-1.5 right-1.5">
          <span className={`text-[7px] font-black px-1 rounded leading-none ${multi.cls}`} style={{ paddingTop: '2px', paddingBottom: '2px' }}>
            {multi.text}
          </span>
        </div>
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
    </a>
  );
};

/* ── Trending card (API, 16:9) ── */
const TrendCard = ({ v }: { v: TrendingVideoItem }) => (
  <a href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noopener noreferrer"
    className="group cursor-pointer block w-full">
    <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-white/10 mb-2" style={{ aspectRatio: '16/9' }}>
      <img src={v.thumbnail} alt={v.title}
        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
        onError={(e) => { const img = e.target as HTMLImageElement; if (img.src.includes('hqdefault')) { img.src = img.src.replace('hqdefault', 'mqdefault'); } else { img.style.opacity = '0'; } }} />
    </div>
    <p className="text-[12px] text-gray-900 dark:text-white/85 font-semibold line-clamp-2 leading-snug mb-1 group-hover:text-red-500 transition-colors">{v.title}</p>
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-gray-400 dark:text-white/30 truncate">{v.channelName}</span>
      <span className="text-[10px] text-gray-300 dark:text-white/15">·</span>
      <span className="text-[10px] text-gray-400 dark:text-white/30 font-mono">{v.score}</span>
    </div>
  </a>
);

/* ── Section header (no pagination — moved to bottom of grids) ── */
const SectionHeader = ({
  icon, iconColor, title, glowColor, badge,
}: {
  icon: string; iconColor: string; title: string;
  glowColor?: string; badge?: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 mb-3 px-6">
    <i className={`${icon} ${iconColor} text-sm`}></i>
    <h2
      className={`text-[13px] font-black tracking-tight ${!glowColor ? 'text-gray-900 dark:text-white' : ''}`}
      style={glowColor ? { color: glowColor, textShadow: `0 0 12px ${glowColor}88` } : undefined}
    >{title}</h2>
    {badge}
  </div>
);

/* ── Shorts section — category-aware, 2 preset rows or 1 dynamic row ── */
const ShortsSection = ({ data, activeCat }: { data: ViralVideoItem[]; activeCat: Cat }) => {
  const { t } = useTranslation();
  const [page1, setPage1] = useState(1);
  const [page2, setPage2] = useState(1);
  const [dynPage, setDynPage] = useState(1);
  const PER_PAGE = 8;

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
    const half1 = isEmpty ? Array.from({ length: 4 }) as (ViralVideoItem | undefined)[] : paged.slice(0, 4);
    const half2 = isEmpty ? Array.from({ length: 4 }) as (ViralVideoItem | undefined)[] : paged.slice(4, 8);

    return (
      <div className="mb-6">
        {/* Row label */}
        <div className="px-6 flex items-center gap-2.5 mb-3">
          <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: accent }} />
          <span
            className="text-[11px] font-black px-2.5 py-1 rounded-lg flex-shrink-0"
            style={{ background: accentBg, color: accent, border: `1px solid ${accentBorder}` }}
          >
            {label}
          </span>
          <span className="text-[9px] text-gray-400 dark:text-white/40 font-mono">{items.length}</span>
        </div>
        {/* Cards */}
        <div className="flex gap-3 px-6 items-stretch">
          <div className="grid gap-3 flex-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {half1.map((v, i) =>
              v ? <ShortsCard key={v.videoId} v={v} />
                : <SkeletonCard key={i} k={i} />
            )}
          </div>
          <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0 w-5">
            <div className="flex-1 w-px bg-gray-100 dark:bg-white/[0.06]" />
            <span className="text-[7px] text-gray-200 dark:text-white/[0.12] font-mono tracking-widest rotate-90">···</span>
            <div className="flex-1 w-px bg-gray-100 dark:bg-white/[0.06]" />
          </div>
          <div className="grid gap-3 flex-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {half2.map((v, i) =>
              v ? <ShortsCard key={v.videoId} v={v} />
                : <SkeletonCard key={i + 4} k={i + 4} />
            )}
          </div>
        </div>
        {/* Pagination at bottom */}
        {items.length > PER_PAGE && (
          <div className="flex justify-end px-6 mt-3">
            <Pagination page={page} total={items.length} perPage={PER_PAGE} onChange={onPage} />
          </div>
        )}
      </div>
    );
  };

  if (activeCat !== 'All') {
    const cats = CAT_MAP[activeCat];
    const filtered = cats.length > 0 ? data.filter(v => cats.includes(v.category)) : data;
    const accent = CAT_ACCENT[activeCat] ?? { accent: '#6b7280', accentBg: 'rgba(107,114,128,0.10)', accentBorder: 'rgba(107,114,128,0.22)' };
    const catKey = `cat_${activeCat.toLowerCase().replace('-', '')}` as never;
    const label = t(catKey, activeCat);
    return (
      <section>
        <div className="flex items-center gap-2 mb-4 px-6">
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
      <div className="flex items-center gap-2 mb-4 px-6">
        <i className="ri-scissors-cut-line text-red-500 text-sm"></i>
        <h2 className="text-[13px] font-black text-gray-900 dark:text-white tracking-tight">Shorts</h2>
        <span className="text-[9px] text-gray-500 dark:text-white/50 font-mono ml-1 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">{t('home_viral_score_order')}</span>
      </div>
      <ShortsRow
        label={t('home_shorts_entermusic')}
        items={data.filter(v => SHORTS_ROWS[0].cats.includes(v.category))}
        page={page1} onPage={setPage1}
        accent={SHORTS_ROWS[0].accent} accentBg={SHORTS_ROWS[0].accentBg} accentBorder={SHORTS_ROWS[0].accentBorder}
      />
      <ShortsRow
        label={t('home_shorts_edtech')}
        items={data.filter(v => SHORTS_ROWS[1].cats.includes(v.category))}
        page={page2} onPage={setPage2}
        accent={SHORTS_ROWS[1].accent} accentBg={SHORTS_ROWS[1].accentBg} accentBorder={SHORTS_ROWS[1].accentBorder}
      />
    </section>
  );
};

/* ── Video grid section (4 per row, pagination at bottom) ── */
const VideoSection = ({
  icon, iconColor, title, glowColor, badge, items, savedIds, onToggleSave,
}: {
  icon: string; iconColor: string; title: string; glowColor?: string; badge?: React.ReactNode;
  items: ViralVideoItem[]; savedIds: Set<string>; onToggleSave: (id: string) => void;
}) => {
  const [page, setPage] = useState(1);
  const PER_PAGE = 4;
  const paged = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <section>
      <SectionHeader icon={icon} iconColor={iconColor} title={title} glowColor={glowColor} badge={badge} />
      <div className="grid grid-cols-4 gap-4 px-6">
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
      {items.length > PER_PAGE && (
        <div className="flex justify-end px-6 mt-3">
          <Pagination page={page} total={items.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      )}
    </section>
  );
};

/* ── Trending section (API, pagination at bottom) ── */
const TrendingSection = ({ items, loaded }: { items: TrendingVideoItem[]; loaded: boolean }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const PER_PAGE = 4;
  const paged = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <section>
      <SectionHeader icon="ri-fire-line" iconColor="text-orange-500" title={t('home_trending_live')}
        badge={<span className="flex items-center gap-1 text-[9px] text-red-500"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block"></span>LIVE · KR</span>}
      />
      <div className="grid grid-cols-4 gap-4 px-6">
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
  const [activeCountry, setActiveCountry] = useState('All');
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => loadSavedVideos());
  const modalRef = useRef<HTMLDivElement>(null);

  const [chTab, setChTab] = useState<'subs' | 'views'>('subs');
  const [searching, setSearching] = useState(false);
  const [channel, setChannel] = useState<ChannelResult | null>(null);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [popularChannels, setPopularChannels] = useState<PopularChannelItem[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<TrendingVideoItem[]>([]);
  const [liveVideos, setLiveVideos] = useState<ViralVideoItem[]>([]);
  const [homeDataLoaded, setHomeDataLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadHomeData() {
      try {
        const { data, error } = await supabase
          .from('viralboard_data')
          .select('*')
          .order('views', { ascending: false })
          .limit(100);

        if (error) throw error;
        if (!data || data.length === 0 || cancelled) return;

        // 바이럴 영상 (liveVideos)
        const viral: ViralVideoItem[] = data.map((v, i) => ({
          rank: i + 1,
          videoId: v.video_id,
          title: v.title,
          channelName: v.channel,
          channelAvatar: '',
          channelId: v.channel_id,
          subscribers: 0,
          views: v.views,
          viralScore: v.views / 1000,
          uploadDate: v.fetched_at,
          thumbnail: v.thumbnail_url,
          category: v.category,
          country: v.country,
        }));
        if (!cancelled) setLiveVideos(viral);

        // 트렌딩 영상 (trendingVideos) — 최신 수집 16개
        const recent16 = [...data]
          .sort((a, b) => new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime())
          .slice(0, 16);
        const trending: TrendingVideoItem[] = recent16.map((v, i) => ({
          rank: i + 1,
          title: v.title,
          score: v.views >= 1_000_000
            ? `${(v.views / 1_000_000).toFixed(1)}M`
            : `${(v.views / 1_000).toFixed(0)}K`,
          thumbnail: v.thumbnail_url,
          channelName: v.channel,
          channelAvatar: '',
          videoId: v.video_id,
          channelId: v.channel_id,
        }));
        if (!cancelled) setTrendingVideos(trending);

        // 인기 채널 (popularChannels) — channel_id별 조회수 집계
        const channelMap = new Map<string, { name: string; channelId: string; totalViews: number }>();
        for (const v of data) {
          const existing = channelMap.get(v.channel_id);
          if (!existing) {
            channelMap.set(v.channel_id, { name: v.channel, channelId: v.channel_id, totalViews: v.views });
          } else {
            existing.totalViews += v.views;
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
            avatar: '',
            channelId: ch.channelId,
            subscribers: 0,
            totalViews: ch.totalViews,
          }));
        if (!cancelled) setPopularChannels(popular);

      } catch (e) {
        console.error('[home] loadHomeData FAIL:', e);
      } finally {
        if (!cancelled) setHomeDataLoaded(true);
      }
    }

    loadHomeData();
    return () => { cancelled = true; };
  }, []);

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
      const result = await searchChannel(query);
      if (!result) { setSearchError(isKo ? '채널을 찾을 수 없습니다.' : 'Channel not found.'); return; }
      const recentVideos = await fetchRecentVideos(result.id);
      setChannel(result);
      setVideos(recentVideos);
      cacheSet(cacheKey, { channel: result, videos: recentVideos });
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
    if (activeCountry !== 'All') {
      result = result.filter(v => v.country === activeCountry);
    }
    return result;
  };

  /* API 데이터 우선, quota 소진 시 mock fallback */
  const videoPool = liveVideos.length > 0 ? liveVideos : viralMockData;
  const risingVideos = filterByCat([...videoPool].sort((a, b) => b.viralScore - a.viralScore));
  const topViewVideos = filterByCat([...videoPool].sort((a, b) => b.views - a.views));
  const topViewsAll = topViewVideos;
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
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors">
      <TopHeader onMobileMenuToggle={() => setSidebarOpen(v => !v)} />
      <GlobalSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-52 pt-12">
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
            const chList = chTab === 'subs' ? popularChannels.slice(0, 10) : chByViews.slice(0, 10);
            const isLoading = !homeDataLoaded && popularChannels.length === 0;
            return (
              <div>
                <div className="flex items-center justify-between mb-3 px-6">
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
                <div className="overflow-x-auto scrollbar-hide px-6 pb-1">
                  <div className="flex gap-2.5" style={{ width: 'max-content' }}>
                    {(isLoading ? Array.from({ length: 10 }) : chList).map((ch, i) =>
                      ch ? (
                        <a
                          key={(ch as PopularChannelItem).channelId + chTab}
                          href={`https://www.youtube.com/channel/${(ch as PopularChannelItem).channelId}`}
                          target="_blank" rel="noopener noreferrer"
                          className="group flex flex-col items-center gap-1.5 w-[76px] flex-shrink-0 px-1.5 py-2.5 rounded-xl border border-gray-100 dark:border-white/[0.07] hover:border-red-200 dark:hover:border-red-500/30 hover:bg-red-50/40 dark:hover:bg-red-500/[0.05] transition-all"
                        >
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-white/10 ring-2 ring-transparent group-hover:ring-red-400/50 transition-all">
                              <img src={(ch as PopularChannelItem).avatar || undefined} alt={(ch as PopularChannelItem).name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
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
                        </a>
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
          {(() => {
            const allCountries = Array.from(new Set(videoPool.map(v => v.country).filter(Boolean))).sort();
            return (
              <div className="px-6 -mt-4 space-y-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Country modal trigger */}
                  <button
                    onClick={() => setCountryModalOpen(true)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer border ${
                      activeCountry !== 'All'
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 border-transparent hover:bg-gray-200 dark:hover:bg-white/20'
                    }`}
                  >
                    <span>{activeCountry === 'All' ? '🌏' : (COUNTRY_FLAG[activeCountry] ?? '🌐')}</span>
                    <span>{activeCountry === 'All' ? t('cat_all') : activeCountry}</span>
                    <i className="ri-arrow-down-s-line text-[10px] opacity-60"></i>
                  </button>
                  <div className="w-px h-5 bg-gray-200 dark:bg-white/10 flex-shrink-0" />
                  {/* Category pills */}
                  {CATS.map(cat => (
                    <button key={cat} onClick={() => setActiveCat(cat)}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        activeCat === cat
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-sm'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20'
                      }`}>{CAT_LABELS[cat]}</button>
                  ))}
                </div>
                {/* Viral legend */}
                <div className="flex items-center gap-2.5 text-[9px] text-gray-400 dark:text-white/45">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>{t('home_viral_100')}</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>{t('home_viral_30')}</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block"></span>{t('home_viral_10')}</span>
                  {activeCountry !== 'All' && (
                    <button onClick={() => setActiveCountry('All')} className="ml-2 text-red-400 hover:text-red-500 flex items-center gap-0.5 cursor-pointer">
                      <i className="ri-close-circle-line text-xs"></i> {activeCountry}
                    </button>
                  )}
                </div>

                {/* ── Country Modal ── */}
                {countryModalOpen && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    onClick={() => setCountryModalOpen(false)}
                  >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
                    <div
                      ref={modalRef}
                      className="relative bg-white dark:bg-[#161616] rounded-2xl shadow-2xl w-[320px] max-w-[90vw] overflow-hidden border border-gray-100 dark:border-white/[0.08]"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-white/[0.06]">
                        <div className="flex items-center gap-2">
                          <i className="ri-global-line text-sm text-gray-500 dark:text-white/50"></i>
                          <span className="text-[13px] font-black text-gray-900 dark:text-white">{isKo ? '지역 선택' : 'Select Region'}</span>
                        </div>
                        <button onClick={() => setCountryModalOpen(false)}
                          className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                          <i className="ri-close-line text-base"></i>
                        </button>
                      </div>
                      <div className="px-3 pt-3 pb-1">
                        <button
                          onClick={() => { setActiveCountry('All'); setCountryModalOpen(false); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                            activeCountry === 'All'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-50 dark:bg-white/[0.04] text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/[0.08]'
                          }`}
                        >
                          <span className="text-base leading-none">🌏</span>
                          <span>{isKo ? '전체 지역' : 'All Regions'}</span>
                          {activeCountry === 'All' && <i className="ri-check-line ml-auto text-white text-sm"></i>}
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 px-3 pb-3 pt-2">
                        {allCountries.map(c => (
                          <button
                            key={c}
                            onClick={() => { setActiveCountry(c); setCountryModalOpen(false); }}
                            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                              activeCountry === c
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-gray-50 dark:bg-white/[0.04] text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/[0.08]'
                            }`}
                          >
                            <span className="text-sm leading-none flex-shrink-0">{COUNTRY_FLAG[c] ?? '🌐'}</span>
                            <span className="truncate">{c}</span>
                            {activeCountry === c && <i className="ri-check-line ml-auto text-[10px] flex-shrink-0"></i>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Shorts (category-aware) ── */}
          <ShortsSection data={videoPool} activeCat={activeCat} />

          {/* ── Saved Videos ── */}
          {savedIds.size > 0 && (() => {
            const saved = videoPool.filter(v => savedIds.has(v.videoId));
            if (!saved.length) return null;
            return (
              <VideoSection icon="ri-bookmark-fill" iconColor="text-red-500" title="Saved Videos"
                badge={<span className="text-[10px] bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-400 px-1.5 py-0.5 rounded-full font-bold">{savedIds.size}</span>}
                items={saved} savedIds={savedIds} onToggleSave={handleToggleSave} />
            );
          })()}

          {/* ── Rising Channels ── */}
          <VideoSection icon="ri-rocket-line" iconColor="text-emerald-500"
            title={t('home_rising_channels')}
            glowColor="#10b981"
            badge={<span className="text-[10px] text-gray-400 dark:text-white/45">{t('home_views_vs_subs')}</span>}
            items={risingVideos} savedIds={savedIds} onToggleSave={handleToggleSave} />

          {/* ── Top Views ── */}
          <VideoSection icon="ri-eye-line" iconColor="text-sky-500"
            title={t('home_top_views')}
            glowColor="#38bdf8"
            badge={<span className="text-[10px] text-gray-400 dark:text-white/45">{t('home_est_revenue')}</span>}
            items={topViewVideos} savedIds={savedIds} onToggleSave={handleToggleSave} />

          {/* ── Trending Live ── */}
          <TrendingSection items={trendingVideos} loaded={homeDataLoaded} />

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
          />

        </div>

        <HomeFooter />
      </div>
    </div>
  );
};

export default HomePage;
