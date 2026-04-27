import { viewsPerVideoData } from '@/mocks/channelDetail';

interface ViewData {
  title: string;
  views: number;
}

interface Props {
  data?: ViewData[];
}

const fmtV = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toString();
};

const ViewsBarChart = ({ data }: Props) => {
  const chartData: ViewData[] = (data && data.length > 0)
    ? data
    : viewsPerVideoData.map((d) => ({ title: d.title, views: d.views * 1_000_000 }));

  const maxViews = Math.max(...chartData.map((d) => d.views), 1);
  const W = 600;
  const H = 160;
  const PAD = { top: 16, right: 16, bottom: 48, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const barCount = chartData.length;
  const barGap = 8;
  const barW = (chartW - barGap * (barCount - 1)) / barCount;

  return (
    <div className="bg-[#181818] border border-white/10 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Views per Video</h3>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 320 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Y grid */}
          {[0, 0.5, 1].map((ratio, i) => {
            const y = PAD.top + chartH - ratio * chartH;
            const label = fmtV(maxViews * ratio);
            return (
              <g key={i}>
                <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.3)">{label}</text>
              </g>
            );
          })}

          {/* Bars */}
          {chartData.map((d, i) => {
            const barH = Math.max(2, (d.views / maxViews) * chartH);
            const x = PAD.left + i * (barW + barGap);
            const y = PAD.top + chartH - barH;
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={barH} fill="url(#barGrad)" rx="3" />
                <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)">{fmtV(d.views)}</text>
                <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)">{d.title}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default ViewsBarChart;
