import type { Comment, Platform } from '@/mocks/commentManager';
import { statsByChannel } from '@/mocks/commentManager';

interface ManagedChannel {
  id: string;
  name: string;
  avatar: string;
  platform: Platform;
  subs: string;
  pending: number;
  group: string;
}

interface AllChannelsOverviewProps {
  channels: ManagedChannel[];
  channelCommentMap: Record<string, Comment[]>;
  onSelectChannel: (id: string) => void;
}

const PLATFORM_ICON: Record<Platform, string> = {
  youtube: 'ri-youtube-line',
  tiktok: 'ri-tiktok-line',
  instagram: 'ri-instagram-line',
  facebook: 'ri-facebook-circle-line',
};

const PLATFORM_COLOR: Record<Platform, string> = {
  youtube: 'text-red-500',
  tiktok: 'text-pink-500',
  instagram: 'text-orange-500',
  facebook: 'text-blue-500',
};

const PLATFORM_BG: Record<Platform, string> = {
  youtube: 'bg-red-50 dark:bg-red-500/10',
  tiktok: 'bg-pink-50 dark:bg-pink-500/10',
  instagram: 'bg-orange-50 dark:bg-orange-500/10',
  facebook: 'bg-blue-50 dark:bg-blue-500/10',
};

const PLATFORM_BORDER: Record<Platform, string> = {
  youtube: 'border-red-200 dark:border-red-500/25',
  tiktok: 'border-pink-200 dark:border-pink-500/25',
  instagram: 'border-orange-200 dark:border-orange-500/25',
  facebook: 'border-blue-200 dark:border-blue-500/25',
};

const PLATFORM_BAR: Record<Platform, string> = {
  youtube: 'bg-red-500',
  tiktok: 'bg-pink-500',
  instagram: 'bg-orange-500',
  facebook: 'bg-blue-500',
};

/* ── Mini sparkline (7-day trend) ── */
const SPARKLINE_DATA: Record<string, number[]> = {
  'ch-main':   [620, 710, 680, 790, 820, 760, 847],
  'ch-gaming': [310, 350, 290, 380, 400, 390, 412],
  'ch-yt2':    [480, 510, 530, 490, 560, 540, 562],
  'ch-yt3':    [210, 240, 260, 230, 270, 280, 289],
  'ch-tiktok': [980, 1050, 1120, 1080, 1150, 1190, 1203],
  'ch-ig':     [280, 300, 310, 290, 320, 330, 334],
  'ch-fb':     [600, 640, 680, 650, 700, 710, 723],
};

const GROWTH_RATE: Record<string, number> = {
  'ch-main':   12.4,
  'ch-gaming': 8.7,
  'ch-yt2':    15.2,
  'ch-yt3':    6.3,
  'ch-tiktok': 22.8,
  'ch-ig':     4.1,
  'ch-fb':     9.5,
};

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

const Sparkline = ({ data, color, width = 80, height = 28 }: SparklineProps) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const polyline = points.join(' ');
  const lastPt = points[points.length - 1].split(',');

  // Area fill path
  const areaPath = `M0,${height} L${polyline.split(' ').map((p) => p).join(' L')} L${width},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Area */}
      <path d={areaPath} fill={`url(#grad-${color})`} />
      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={parseFloat(lastPt[0])}
        cy={parseFloat(lastPt[1])}
        r="2.5"
        fill={color}
      />
    </svg>
  );
};

const SPARKLINE_COLOR: Record<Platform, string> = {
  youtube: '#ef4444',
  tiktok: '#ec4899',
  instagram: '#f97316',
  facebook: '#3b82f6',
};

/* ── Donut mini ── */
const MiniDonut = ({ approved, pending, skipped }: { approved: number; pending: number; skipped: number }) => {
  const total = approved + pending + skipped || 1;
  const r = 14;
  const circ = 2 * Math.PI * r;
  const segments = [
    { value: approved, color: '#22c55e' },
    { value: pending, color: '#f97316' },
    { value: skipped, color: '#d1d5db' },
  ];
  let offset = 0;
  return (
    <svg width={36} height={36} viewBox="0 0 36 36" className="-rotate-90">
      <circle cx={18} cy={18} r={r} fill="none" stroke="currentColor" strokeWidth={5} className="text-gray-100 dark:text-white/5" />
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circ;
        const gap = circ - dash;
        const el = (
          <circle
            key={i}
            cx={18} cy={18} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={5}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
};

/* ── Summary top stats ── */
const SummaryBar = ({ channels, channelCommentMap }: { channels: ManagedChannel[]; channelCommentMap: Record<string, Comment[]> }) => {
  const totalComments = channels.reduce((s, ch) => s + (statsByChannel[ch.id]?.commentsToday ?? 0), 0);
  const totalPending = channels.reduce((s, ch) => s + (channelCommentMap[ch.id] ?? []).filter(c => c.status === 'pending').length, 0);
  const totalAutoReplied = channels.reduce((s, ch) => s + (statsByChannel[ch.id]?.autoReplied ?? 0), 0);
  const avgSentiment = Math.round(
    channels.reduce((s, ch) => s + (statsByChannel[ch.id]?.avgSentimentScore ?? 0), 0) / channels.length
  );
  const overallGrowth = (
    channels.reduce((s, ch) => s + (GROWTH_RATE[ch.id] ?? 0), 0) / channels.length
  ).toFixed(1);

  const summaryCards = [
    {
      label: 'Total Comments Today',
      value: totalComments.toLocaleString(),
      icon: 'ri-chat-3-line',
      iconBg: 'bg-sky-50 dark:bg-sky-500/15',
      iconColor: 'text-sky-500',
      sub: `+${overallGrowth}% avg growth`,
      subColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Total Auto-Replied',
      value: totalAutoReplied.toLocaleString(),
      icon: 'ri-robot-line',
      iconBg: 'bg-violet-50 dark:bg-violet-500/15',
      iconColor: 'text-violet-500',
      sub: `${Math.round((totalAutoReplied / totalComments) * 100)}% reply rate`,
      subColor: 'text-violet-600 dark:text-violet-400',
    },
    {
      label: 'Pending (All Channels)',
      value: totalPending.toLocaleString(),
      icon: 'ri-time-line',
      iconBg: 'bg-orange-50 dark:bg-orange-500/15',
      iconColor: 'text-orange-500',
      sub: 'Across all channels',
      subColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      label: 'Avg. Sentiment',
      value: `${avgSentiment}`,
      icon: 'ri-emotion-happy-line',
      iconBg: 'bg-green-50 dark:bg-green-500/15',
      iconColor: 'text-green-500',
      sub: avgSentiment >= 70 ? 'Mostly positive' : 'Mixed sentiment',
      subColor: avgSentiment >= 70 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400',
      suffix: '/100',
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {summaryCards.map((card) => (
        <div key={card.label} className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card px-5 py-4 flex flex-col gap-2.5 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-white/40 font-medium leading-tight">{card.label}</p>
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${card.iconBg}`}>
              <i className={`${card.icon} ${card.iconColor} text-sm`}></i>
            </div>
          </div>
          <div className="flex items-end gap-1.5">
            <p className="text-3xl font-bold text-gray-900 dark:text-off-white">{card.value}</p>
            {card.suffix && <span className="text-sm text-gray-400 dark:text-white/30 mb-1">{card.suffix}</span>}
          </div>
          <p className={`text-xs ${card.subColor}`}>{card.sub}</p>
        </div>
      ))}
    </div>
  );
};

/* ── Channel row card ── */
const ChannelCard = ({
  channel,
  comments,
  onSelect,
}: {
  channel: ManagedChannel;
  comments: Comment[];
  onSelect: () => void;
}) => {
  const stats = statsByChannel[channel.id];
  const sparkData = SPARKLINE_DATA[channel.id] ?? [0, 0, 0, 0, 0, 0, 0];
  const growth = GROWTH_RATE[channel.id] ?? 0;
  const sparkColor = SPARKLINE_COLOR[channel.platform];

  const approved = comments.filter(c => c.status === 'approved').length;
  const pending = comments.filter(c => c.status === 'pending').length;
  const skipped = comments.filter(c => c.status === 'skipped').length;
  const total = comments.length || 1;

  const replyRate = stats ? Math.round((stats.autoReplied / stats.commentsToday) * 100) : 0;
  const sentimentScore = stats?.avgSentimentScore ?? 0;

  const sentimentColor = sentimentScore >= 70
    ? 'text-green-600 dark:text-green-400'
    : sentimentScore >= 45
    ? 'text-yellow-600 dark:text-yellow-400'
    : 'text-red-500 dark:text-red-400';

  return (
    <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card transition-all hover:border-gray-300 dark:hover:border-dark-border/80 group">
      {/* Top section */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-dark-border/60">
        {/* Avatar + platform badge */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-base">
            <img
              src={channel.avatar}
              alt={channel.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${PLATFORM_BG[channel.platform]} border-2 border-white dark:border-dark-card`}>
            <i className={`${PLATFORM_ICON[channel.platform]} ${PLATFORM_COLOR[channel.platform]} text-[10px]`}></i>
          </div>
        </div>

        {/* Channel info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-gray-900 dark:text-off-white truncate">{channel.name}</h3>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${PLATFORM_BG[channel.platform]} ${PLATFORM_COLOR[channel.platform]} ${PLATFORM_BORDER[channel.platform]} capitalize`}>
              {channel.platform}
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{channel.subs} followers</p>
        </div>

        {/* Sparkline + growth */}
        <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
          <Sparkline data={sparkData} color={sparkColor} width={80} height={28} />
          <div className="flex items-center gap-1">
            <i className={`${growth >= 0 ? 'ri-arrow-up-line text-green-500' : 'ri-arrow-down-line text-red-500'} text-xs w-3 h-3 flex items-center justify-center`}></i>
            <span className={`text-xs font-bold ${growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
              {growth >= 0 ? '+' : ''}{growth}%
            </span>
            <span className="text-[10px] text-gray-400 dark:text-white/25">7d</span>
          </div>
        </div>

        {/* Go to channel button */}
        <button
          onClick={onSelect}
          className="flex-shrink-0 flex items-center gap-1.5 bg-gray-50 dark:bg-dark-surface hover:bg-red-50 dark:hover:bg-red-500/10 border border-gray-200 dark:border-dark-border hover:border-red-300 dark:hover:border-red-500/30 text-gray-500 dark:text-white/40 hover:text-red-600 dark:hover:text-red-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
        >
          <i className="ri-arrow-right-line w-3 h-3 flex items-center justify-center"></i>
          <span className="hidden md:inline">Manage</span>
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y md:divide-y-0 divide-gray-100 dark:divide-dark-border/60">
        {/* Comments Today */}
        <div className="px-4 py-3 flex flex-col gap-1">
          <p className="text-[10px] text-gray-400 dark:text-white/30 font-medium uppercase tracking-wider">Comments Today</p>
          <p className="text-xl font-bold text-gray-900 dark:text-off-white">{stats?.commentsToday.toLocaleString() ?? '—'}</p>
          <div className="flex items-center gap-1">
            <i className="ri-arrow-up-line text-green-500 text-xs w-3 h-3 flex items-center justify-center"></i>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">+{growth}%</span>
          </div>
        </div>

        {/* Reply Rate */}
        <div className="px-4 py-3 flex flex-col gap-1">
          <p className="text-[10px] text-gray-400 dark:text-white/30 font-medium uppercase tracking-wider">Reply Rate</p>
          <p className="text-xl font-bold text-gray-900 dark:text-off-white">{replyRate}%</p>
          <div className="h-1.5 bg-gray-100 dark:bg-white/8 rounded-full overflow-hidden mt-0.5">
            <div
              className={`h-full rounded-full ${PLATFORM_BAR[channel.platform]} transition-all`}
              style={{ width: `${replyRate}%` }}
            ></div>
          </div>
        </div>

        {/* Sentiment */}
        <div className="px-4 py-3 flex flex-col gap-1">
          <p className="text-[10px] text-gray-400 dark:text-white/30 font-medium uppercase tracking-wider">Sentiment</p>
          <div className="flex items-end gap-1">
            <p className={`text-xl font-bold ${sentimentColor}`}>{sentimentScore}</p>
            <span className="text-xs text-gray-400 dark:text-white/25 mb-0.5">/100</span>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-white/30">
            {sentimentScore >= 70 ? '😄 Positive' : sentimentScore >= 45 ? '🙂 Mixed' : '😕 Needs work'}
          </p>
        </div>

        {/* Reply Status donut */}
        <div className="px-4 py-3 flex items-center gap-3">
          <MiniDonut approved={approved} pending={pending} skipped={skipped} />
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
              <span className="text-[10px] text-gray-500 dark:text-white/40">{approved} approved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0"></span>
              <span className="text-[10px] text-gray-500 dark:text-white/40">{pending} pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-white/20 flex-shrink-0"></span>
              <span className="text-[10px] text-gray-500 dark:text-white/40">{skipped} skipped</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending alert */}
      {pending > 0 && (
        <div className="px-5 py-2.5 border-t border-orange-100 dark:border-orange-500/15 bg-orange-50/50 dark:bg-orange-500/5 flex items-center justify-between rounded-b-xl">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></div>
            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              {pending} comment{pending > 1 ? 's' : ''} waiting for review
            </span>
          </div>
          <button
            onClick={onSelect}
            className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold cursor-pointer transition-colors whitespace-nowrap"
          >
            Review now →
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Platform summary bar ── */
const PlatformSummary = ({ channels, channelCommentMap }: { channels: ManagedChannel[]; channelCommentMap: Record<string, Comment[]> }) => {
  const platforms: Platform[] = ['youtube', 'tiktok', 'instagram', 'facebook'];
  const platformLabels: Record<Platform, string> = {
    youtube: 'YouTube',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    facebook: 'Facebook',
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card px-5 py-4 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-off-white flex items-center gap-2">
          <i className="ri-bar-chart-grouped-line text-red-500 w-4 h-4 flex items-center justify-center"></i>
          Platform Distribution
        </h3>
        <span className="text-xs text-gray-400 dark:text-white/30">Today's comments</span>
      </div>
      <div className="flex flex-col gap-3">
        {platforms.map((p) => {
          const pChannels = channels.filter(ch => ch.platform === p);
          if (pChannels.length === 0) return null;
          const total = pChannels.reduce((s, ch) => s + (statsByChannel[ch.id]?.commentsToday ?? 0), 0);
          const allTotal = channels.reduce((s, ch) => s + (statsByChannel[ch.id]?.commentsToday ?? 0), 0);
          const pct = allTotal > 0 ? Math.round((total / allTotal) * 100) : 0;
          return (
            <div key={p} className="flex items-center gap-3">
              <div className={`w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 ${PLATFORM_BG[p]}`}>
                <i className={`${PLATFORM_ICON[p]} ${PLATFORM_COLOR[p]} text-xs`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-white/60">{platformLabels[p]}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800 dark:text-off-white">{total.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 dark:text-white/25">({pct}%)</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-white/8 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${PLATFORM_BAR[p]} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 dark:text-white/25 flex-shrink-0 w-8 text-right">{pChannels.length}ch</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Top performers ── */
const TopPerformers = ({ channels }: { channels: ManagedChannel[] }) => {
  const sorted = [...channels].sort((a, b) => (GROWTH_RATE[b.id] ?? 0) - (GROWTH_RATE[a.id] ?? 0));

  return (
    <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card px-5 py-4 transition-colors">
      <h3 className="text-sm font-bold text-gray-900 dark:text-off-white flex items-center gap-2 mb-4">
        <i className="ri-trophy-line text-yellow-500 w-4 h-4 flex items-center justify-center"></i>
        Growth Ranking
        <span className="text-xs font-normal text-gray-400 dark:text-white/30">7-day</span>
      </h3>
      <div className="flex flex-col gap-2.5">
        {sorted.map((ch, idx) => {
          const growth = GROWTH_RATE[ch.id] ?? 0;
          const sparkData = SPARKLINE_DATA[ch.id] ?? [];
          const sparkColor = SPARKLINE_COLOR[ch.platform];
          const rankColors = ['text-yellow-500', 'text-gray-400 dark:text-white/40', 'text-orange-400'];
          return (
            <div key={ch.id} className="flex items-center gap-3">
              <span className={`text-sm font-black w-5 text-center flex-shrink-0 ${rankColors[idx] ?? 'text-gray-300 dark:text-white/20'}`}>
                {idx + 1}
              </span>
              <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-base flex-shrink-0">
                <img
                  src={ch.avatar}
                  alt={ch.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-off-white truncate">{ch.name}</p>
                <p className="text-[10px] text-gray-400 dark:text-white/30 capitalize">{ch.platform}</p>
              </div>
              <Sparkline data={sparkData} color={sparkColor} width={48} height={20} />
              <div className="flex items-center gap-0.5 flex-shrink-0 w-14 justify-end">
                <i className={`${growth >= 0 ? 'ri-arrow-up-line text-green-500' : 'ri-arrow-down-line text-red-500'} text-xs w-3 h-3 flex items-center justify-center`}></i>
                <span className={`text-xs font-bold ${growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {growth >= 0 ? '+' : ''}{growth}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Main component ── */
const AllChannelsOverview = ({ channels, channelCommentMap, onSelectChannel }: AllChannelsOverviewProps) => {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-off-white flex items-center gap-2">
            <i className="ri-layout-grid-line text-red-500 w-4 h-4 flex items-center justify-center"></i>
            All Channels Overview
          </h2>
          <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">
            {channels.length} channels · Real-time sync
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/25">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span>Live</span>
          </div>
          <span className="text-xs text-gray-400 dark:text-white/25 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-full">
            Today, Apr 19
          </span>
        </div>
      </div>

      {/* Summary top stats */}
      <SummaryBar channels={channels} channelCommentMap={channelCommentMap} />

      {/* Platform + Growth ranking row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PlatformSummary channels={channels} channelCommentMap={channelCommentMap} />
        <TopPerformers channels={channels} />
      </div>

      {/* Channel cards */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2">
          <i className="ri-list-check-2 w-3 h-3 flex items-center justify-center"></i>
          Channel Details
        </h3>
        <div className="flex flex-col gap-3">
          {channels.map((ch) => (
            <ChannelCard
              key={ch.id}
              channel={ch}
              comments={channelCommentMap[ch.id] ?? []}
              onSelect={() => onSelectChannel(ch.id)}
            />
          ))}
        </div>
      </div>

      <div className="h-4"></div>
    </div>
  );
};

export default AllChannelsOverview;
