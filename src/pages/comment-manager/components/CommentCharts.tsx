import type { Comment } from '@/mocks/commentManager';

interface CommentChartsProps {
  comments: Comment[];
}

/* ── Donut segment helper ── */
interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

const DonutChart = ({ segments, size = 72, strokeWidth = 10 }: {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
}) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-gray-100 dark:text-white/5"
      />
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circ;
        const gap = circ - dash;
        const el = (
          <circle
            key={i}
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
};

/* ── Horizontal bar ── */
const HBar = ({ label, value, total, color, icon }: {
  label: string; value: number; total: number; color: string; icon: string;
}) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${color}`}>
        <i className={`${icon} text-xs`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600 dark:text-white/60 font-medium">{label}</span>
          <span className="text-xs font-bold text-gray-800 dark:text-off-white">{value} <span className="text-gray-400 dark:text-white/30 font-normal">({pct}%)</span></span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color.replace('text-', '').includes('#') ? color : undefined }}
          >
            <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommentCharts = ({ comments }: CommentChartsProps) => {
  const total = comments.length || 1;

  /* Platform breakdown */
  const byPlatform = {
    youtube: comments.filter(c => c.platform === 'youtube').length,
    tiktok: comments.filter(c => c.platform === 'tiktok').length,
    instagram: comments.filter(c => c.platform === 'instagram').length,
    facebook: comments.filter(c => c.platform === 'facebook').length,
  };

  /* Sentiment breakdown */
  const bySentiment = {
    positive: comments.filter(c => c.sentiment === 'positive').length,
    neutral: comments.filter(c => c.sentiment === 'neutral').length,
    negative: comments.filter(c => c.sentiment === 'negative').length,
  };

  /* Status breakdown */
  const byStatus = {
    pending: comments.filter(c => c.status === 'pending').length,
    approved: comments.filter(c => c.status === 'approved').length,
    skipped: comments.filter(c => c.status === 'skipped').length,
  };

  const platformSegments: DonutSegment[] = [
    { value: byPlatform.youtube, color: '#ef4444', label: 'YouTube' },
    { value: byPlatform.tiktok, color: '#ec4899', label: 'TikTok' },
    { value: byPlatform.instagram, color: '#f97316', label: 'Instagram' },
    { value: byPlatform.facebook, color: '#3b82f6', label: 'Facebook' },
  ];

  const sentimentSegments: DonutSegment[] = [
    { value: bySentiment.positive, color: '#22c55e', label: 'Positive' },
    { value: bySentiment.neutral, color: '#eab308', label: 'Neutral' },
    { value: bySentiment.negative, color: '#ef4444', label: 'Negative' },
  ];

  const avgScore = comments.length > 0
    ? Math.round(comments.reduce((s, c) => s + c.sentimentScore, 0) / comments.length)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

      {/* ── Platform Distribution ── */}
      <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card px-5 py-4 transition-colors">
        <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider mb-4">Platform Breakdown</p>
        <div className="flex items-center gap-4">
          {/* Donut */}
          <div className="relative flex-shrink-0">
            <DonutChart segments={platformSegments} size={72} strokeWidth={9} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700 dark:text-off-white">{total}</span>
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {[
              { label: 'YouTube', value: byPlatform.youtube, color: 'bg-red-500', dot: '#ef4444' },
              { label: 'TikTok', value: byPlatform.tiktok, color: 'bg-pink-500', dot: '#ec4899' },
              { label: 'Instagram', value: byPlatform.instagram, color: 'bg-orange-500', dot: '#f97316' },
              { label: 'Facebook', value: byPlatform.facebook, color: 'bg-blue-500', dot: '#3b82f6' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.dot }}></span>
                <span className="text-xs text-gray-500 dark:text-white/50 flex-1 truncate">{item.label}</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-off-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sentiment Distribution ── */}
      <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card px-5 py-4 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider">Sentiment Split</p>
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${avgScore >= 70 ? 'text-green-600 dark:text-green-400' : avgScore >= 45 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
              {avgScore}
            </span>
            <span className="text-xs text-gray-400 dark:text-white/30">avg</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Donut */}
          <div className="relative flex-shrink-0">
            <DonutChart segments={sentimentSegments} size={72} strokeWidth={9} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm">
                {avgScore >= 70 ? '😄' : avgScore >= 45 ? '🙂' : '😐'}
              </span>
            </div>
          </div>
          {/* Bars */}
          <div className="flex flex-col gap-2.5 flex-1 min-w-0">
            <HBar label="Positive" value={bySentiment.positive} total={total} color="text-green-500" icon="ri-emotion-happy-line" />
            <HBar label="Neutral" value={bySentiment.neutral} total={total} color="text-yellow-500" icon="ri-emotion-normal-line" />
            <HBar label="Negative" value={bySentiment.negative} total={total} color="text-red-500" icon="ri-emotion-unhappy-line" />
          </div>
        </div>
      </div>

      {/* ── Reply Status ── */}
      <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card px-5 py-4 transition-colors">
        <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider mb-4">Reply Status</p>

        {/* Stacked bar */}
        <div className="h-3 rounded-full overflow-hidden flex mb-4 gap-0.5">
          {byStatus.approved > 0 && (
            <div
              className="bg-green-500 rounded-l-full transition-all duration-500"
              style={{ width: `${(byStatus.approved / total) * 100}%` }}
            ></div>
          )}
          {byStatus.pending > 0 && (
            <div
              className="bg-orange-400 transition-all duration-500"
              style={{ width: `${(byStatus.pending / total) * 100}%` }}
            ></div>
          )}
          {byStatus.skipped > 0 && (
            <div
              className="bg-gray-300 dark:bg-white/20 rounded-r-full transition-all duration-500"
              style={{ width: `${(byStatus.skipped / total) * 100}%` }}
            ></div>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          {[
            { label: 'Approved', value: byStatus.approved, color: 'text-green-500', bg: 'bg-green-500', icon: 'ri-check-double-line' },
            { label: 'Pending', value: byStatus.pending, color: 'text-orange-500', bg: 'bg-orange-400', icon: 'ri-time-line' },
            { label: 'Skipped', value: byStatus.skipped, color: 'text-gray-400 dark:text-white/30', bg: 'bg-gray-300 dark:bg-white/20', icon: 'ri-skip-forward-line' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <i className={`${item.icon} text-xs`}></i>
              </div>
              <span className="text-xs text-gray-500 dark:text-white/50 flex-1">{item.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-800 dark:text-off-white">{item.value}</span>
                <span className="text-[10px] text-gray-400 dark:text-white/25">
                  ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Completion rate */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-white/30">Completion rate</span>
          <span className={`text-xs font-bold ${byStatus.approved / total >= 0.7 ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}`}>
            {total > 0 ? Math.round((byStatus.approved / total) * 100) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommentCharts;
