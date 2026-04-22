import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RankingChannelItem } from '@/services/youtube';
import HoverPopup from '@/components/feature/HoverPopup';
import type { ChannelPopupData } from '@/components/feature/HoverPopup';
import { useSavedChannels } from '@/hooks/useSavedChannels';

type SortKey = 'rank' | 'subscribers' | 'views' | 'growthPercent';
type SortDir = 'asc' | 'desc';

interface RankingsTableProps {
  channels: RankingChannelItem[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

const formatNumber = (n: number): string => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
};

const countryFlag: Record<string, string> = {
  US: '🇺🇸', IN: '🇮🇳', KR: '🇰🇷', MX: '🇲🇽', AR: '🇦🇷', RU: '🇷🇺', ID: '🇮🇩',
};

const categoryColors: Record<string, string> = {
  Entertainment: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
  Music: 'bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400',
  Education: 'bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400',
  Gaming: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
  Sports: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400',
  News: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
  Comedy: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  Kids: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
};

const HOOK_TYPES = [
  'Question Hook', 'Shock Statement', 'Story Hook', 'How-To Hook',
  'Controversy Hook', 'List Hook', 'Challenge Hook', 'Curiosity Gap',
];

const CPM_BY_CATEGORY: Record<string, number> = {
  Entertainment: 3.2, Music: 2.8, Education: 6.5, Gaming: 4.1,
  Sports: 5.2, News: 4.8, Comedy: 3.6, Kids: 2.1,
};

const fmtRevenue = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};

// Country CPM multiplier relative to US baseline
// Source: industry estimates — US=1.0, KR≈0.25, IN≈0.08, MX≈0.12, AR≈0.10, RU≈0.15, ID≈0.09
const CPM_COUNTRY_MULT: Record<string, number> = {
  US: 1.0, GB: 0.9, CA: 0.85, AU: 0.8,
  KR: 0.25, JP: 0.35, DE: 0.7, FR: 0.6,
  MX: 0.12, AR: 0.10, BR: 0.14,
  IN: 0.08, ID: 0.09, PH: 0.08,
  RU: 0.15, TR: 0.12,
};

// Shorts + ad-skipped + non-monetized views: ~35-40% of total views are not monetized
const MONETIZABLE_RATE = 0.62;

const calcRevenue = (ch: RankingChannelItem) => {
  const cpm = CPM_BY_CATEGORY[ch.category] ?? 3.5;
  const countryMult = CPM_COUNTRY_MULT[ch.country] ?? 0.3;
  const effectiveViews = ch.views * MONETIZABLE_RATE;
  const base = (effectiveViews / 12 / 1000) * cpm * countryMult;
  return { min: Math.round(base * 0.6), max: Math.round(base * 1.4) };
};

const seededRand = (seed: number, offset = 0) => {
  const x = Math.sin(seed * 9301 + offset * 49297 + 233) * 10000;
  return x - Math.floor(x);
};

/* Generate a 12-point sparkline based on channel growth trend */
const buildSparkline = (ch: RankingChannelItem): number[] => {
  const base = 100;
  const trend = ch.growthPercent / 100;
  return Array.from({ length: 12 }, (_, i) => {
    const noise = (seededRand(ch.rank, i + 10) - 0.5) * 15;
    return Math.max(10, base + trend * i * 8 + noise);
  });
};

const buildChannelPopup = (ch: RankingChannelItem): ChannelPopupData => {
  const cpm = CPM_BY_CATEGORY[ch.category] ?? 3.5;
  const countryMult = CPM_COUNTRY_MULT[ch.country] ?? 0.3;
  const monthlyViews = (ch.views * MONETIZABLE_RATE) / 12;
  const revenueBase = (monthlyViews / 1000) * cpm * countryMult;
  const r = seededRand(ch.rank);
  return {
    type: 'channel',
    monthlyRevenueMin: Math.round(revenueBase * 0.6),
    monthlyRevenueMax: Math.round(revenueBase * 1.4),
    avgCpm: parseFloat((cpm * (0.85 + r * 0.3)).toFixed(2)),
    monthlyViewTrend: parseFloat((ch.growthPercent * (0.8 + seededRand(ch.rank, 1) * 0.4)).toFixed(1)),
    topHookType: HOOK_TYPES[Math.floor(seededRand(ch.rank, 2) * HOOK_TYPES.length)],
    sparkline: buildSparkline(ch),
  };
};

interface ThProps {
  label: string;
  sortable?: boolean;
  colKey?: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
  align?: string;
}

const Th = ({ label, sortable, colKey, currentKey, currentDir, onSort, align = 'text-left' }: ThProps) => {
  const active = sortable && colKey === currentKey;
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold text-gray-500 dark:text-off-white/40 uppercase tracking-wider ${align} ${sortable ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-off-white/70 transition-colors' : ''}`}
      onClick={() => sortable && colKey && onSort(colKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortable && (
          <span className="flex flex-col w-3 h-3 items-center justify-center">
            <i className={`ri-arrow-up-s-line text-xs leading-none ${active && currentDir === 'asc' ? 'text-gray-900 dark:text-off-white' : 'text-gray-300 dark:text-off-white/20'}`}></i>
            <i className={`ri-arrow-down-s-line text-xs leading-none ${active && currentDir === 'desc' ? 'text-gray-900 dark:text-off-white' : 'text-gray-300 dark:text-off-white/20'}`}></i>
          </span>
        )}
      </span>
    </th>
  );
};

/* ── Bookmark button ── */
interface BookmarkBtnProps {
  channel: RankingChannelItem;
}

const BookmarkBtn = ({ channel }: BookmarkBtnProps) => {
  const { isSaved, toggleChannel } = useSavedChannels();
  const saved = isSaved(String(channel.rank));
  const [flash, setFlash] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleChannel({
      id: channel.channelId,
      name: channel.name,
      handle: '',
      avatar: channel.avatar,
      category: channel.category,
      subscribers: channel.subscribers,
      weeklyGrowth: channel.growthPercent,
      isLive: false,
      lastVideo: '',
      lastVideoViews: 0,
    });
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  };

  return (
    <button
      onClick={handleClick}
      title={saved ? 'Remove from saved' : 'Save channel'}
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

const RankingsTable = ({ channels, sortKey, sortDir, onSort }: RankingsTableProps) => {
  const { t } = useTranslation();
  const thProps = { currentKey: sortKey, currentDir: sortDir, onSort };

  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback((rank: number, e: React.MouseEvent<HTMLTableRowElement>) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setAnchorRect(e.currentTarget.getBoundingClientRect());
    setHoveredId(rank);
  }, []);

  const handleMouseLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => {
      setHoveredId(null);
      setAnchorRect(null);
    }, 80);
  }, []);

  const hoveredChannel = channels.find((c) => c.rank === hoveredId) ?? null;

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
        <table className="w-full min-w-[740px]">
          <thead className="bg-gray-50 dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
            <tr>
              <Th label={t('rankings_col_rank')} sortable colKey="rank" {...thProps} align="text-center" />
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-off-white/40 uppercase tracking-wider text-left">{t('rankings_col_channel')}</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-off-white/40 uppercase tracking-wider text-left hidden md:table-cell">{t('rankings_col_category')}</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-off-white/40 uppercase tracking-wider text-left hidden lg:table-cell">{t('rankings_col_country')}</th>
              <Th label={t('rankings_col_subscribers')} sortable colKey="subscribers" {...thProps} align="text-right" />
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-off-white/40 uppercase tracking-wider text-right">평균 조회수</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-off-white/40 uppercase tracking-wider text-right">영상당 속도</th>
              {/* Bookmark col */}
              <th className="px-3 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-border bg-white dark:bg-dark-base">
            {channels.map((ch, idx) => (
              <tr
                key={ch.rank}
                onClick={() => window.open(`https://www.youtube.com/channel/${ch.channelId}`, '_blank')}
                onMouseEnter={(e) => handleMouseEnter(ch.rank, e)}
                onMouseLeave={handleMouseLeave}
                className={`transition-colors cursor-pointer group ${
                  hoveredId === ch.rank
                    ? 'bg-red-50/60 dark:bg-red-500/5'
                    : 'hover:bg-gray-50 dark:hover:bg-dark-surface'
                }`}
              >
                {/* Rank */}
                <td className="px-4 py-3 text-center">
                  {idx < 3 ? (
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400' :
                      idx === 1 ? 'bg-gray-100 text-gray-500 dark:bg-off-white/10 dark:text-off-white/60' :
                      'bg-orange-100 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400'
                    }`}>
                      {ch.rank}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-off-white/30 font-mono">{ch.rank}</span>
                  )}
                </td>

                {/* Channel */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-card flex-shrink-0">
                      <img
                        src={ch.avatar || undefined}
                        alt={ch.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-800 dark:text-off-white font-medium group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors truncate max-w-[160px]">
                          {ch.name}
                        </span>
                        <i className="ri-bar-chart-box-line text-red-400 text-xs w-3 h-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"></i>
                      </div>
                      {(() => {
                        const { min, max } = calcRevenue(ch);
                        return (
                          <span className="text-[10px] font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded w-fit mt-0.5">
                            {fmtRevenue(min)}–{fmtRevenue(max)}/mo
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[ch.category] ?? 'bg-gray-100 text-gray-500 dark:bg-dark-card dark:text-off-white/40'}`}>
                    {ch.category}
                  </span>
                </td>

                {/* Country */}
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-gray-500 dark:text-off-white/40">
                    {countryFlag[ch.country] ?? ch.country}
                  </span>
                </td>

                {/* Subscribers */}
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-gray-800 dark:text-off-white font-mono">{formatNumber(ch.subscribers)}</span>
                </td>

                {/* Avg views per video */}
                <td className="px-4 py-3 text-right">
                  {ch.videoCount > 0 ? (
                    <>
                      <span className="text-sm text-gray-800 dark:text-off-white font-mono">
                        {formatNumber(Math.round(ch.views / ch.videoCount))}
                      </span>
                      <p className="text-[9px] text-gray-300 dark:text-white/20 mt-0.5">{ch.videoCount}개 영상</p>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-off-white/50 font-mono">{formatNumber(ch.views)}</span>
                  )}
                </td>

                {/* Velocity: views-per-subscriber (engagement momentum) */}
                <td className="px-4 py-3 text-right">
                  {ch.subscribers > 0 ? (() => {
                    const vps = ch.views / ch.subscribers;
                    const avg = channels.reduce((s, c) => s + (c.subscribers > 0 ? c.views / c.subscribers : 0), 0) / Math.max(channels.length, 1);
                    const ratio = Math.round(ch.views / ch.subscribers);
                    const cls = ratio >= 1000 ? 'bg-amber-400 text-black' : ratio >= 300 ? 'bg-green-400/90 text-black' : ratio >= 100 ? 'bg-sky-400/90 text-black' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/40';
                    const diff = vps - avg;
                    return (
                      <>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded leading-none ${cls}`}>
                          ×{ratio >= 10000 ? `${(ratio/1000).toFixed(0)}K` : ratio.toLocaleString()}
                        </span>
                        <p className={`text-[9px] font-semibold mt-0.5 ${diff > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-300 dark:text-white/20'}`}>
                          {diff > 0 ? `↑ avg +${Math.round(diff)}` : `avg ${Math.round(diff)}`}
                        </p>
                      </>
                    );
                  })() : <span className="text-[10px] text-gray-300 dark:text-white/20">—</span>}
                </td>

                {/* Bookmark */}
                <td className="px-3 py-3 text-center">
                  <BookmarkBtn channel={ch} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {channels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-dark-base">
            <i className="ri-search-line text-4xl text-gray-300 dark:text-off-white/15 w-12 h-12 flex items-center justify-center mx-auto mb-3"></i>
            <p className="text-sm text-gray-400 dark:text-off-white/30">{t('rankings_no_results')}</p>
          </div>
        )}
      </div>

      {hoveredChannel && (
        <HoverPopup
          data={buildChannelPopup(hoveredChannel)}
          anchorRect={anchorRect}
          visible={!!hoveredId}
        />
      )}
    </>
  );
};

export default RankingsTable;
export type { SortKey, SortDir };
