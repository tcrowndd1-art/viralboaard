import { recentVideos, subscriberGrowthData, channelDetailData } from '@/mocks/channelDetail';

const CPM_MAP: Record<string, number> = {
  Technology: 10.5, Education: 8.2, Gaming: 4.5,
  Entertainment: 3.5, Music: 3.0, Sports: 6.0,
  News: 7.0, Kids: 2.0, Comedy: 3.8,
};

const cpm = CPM_MAP[channelDetailData.category] ?? 4.0;

const videoRevenue = recentVideos.map(v => ({
  title: v.title.length > 16 ? v.title.slice(0, 16) + '…' : v.title,
  min: Math.round((v.views / 1000) * cpm * 0.55 * 0.6),
  max: Math.round((v.views / 1000) * cpm * 0.55 * 1.4),
}));

// Monthly revenue estimate from subscriber trend × avg views per sub × CPM
const monthlyRevenue = subscriberGrowthData.map(d => {
  const estimatedMonthlyViews = d.subscribers * 1_000_000 * 0.008; // ~0.8% monthly view rate
  const rev = (estimatedMonthlyViews / 1000) * cpm * 0.55;
  return { month: d.month, rev: Math.round(rev / 1000) }; // in $K
});

const fmtMoney = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
};

const RevenueChart = () => {
  const W = 600;
  const H = 180;
  const PAD = { top: 20, right: 20, bottom: 52, left: 56 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Per-video revenue bars
  const maxRev = Math.max(...videoRevenue.map(v => v.max));
  const barCount = videoRevenue.length;
  const barGap = 6;
  const barW = (chartW - barGap * (barCount - 1)) / barCount;

  // Monthly trend line
  const mW = 560;
  const mH = 160;
  const mPad = { top: 20, right: 20, bottom: 40, left: 52 };
  const mChartW = mW - mPad.left - mPad.right;
  const mChartH = mH - mPad.top - mPad.bottom;
  const maxMonthRev = Math.max(...monthlyRevenue.map(d => d.rev));
  const pts = monthlyRevenue.map((d, i) => {
    const x = mPad.left + (i / (monthlyRevenue.length - 1)) * mChartW;
    const y = mPad.top + mChartH - (d.rev / maxMonthRev) * mChartH;
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const areaPath = `M ${pts[0]} L ${pts.slice(1).join(' L ')} L ${mPad.left + mChartW},${mPad.top + mChartH} L ${mPad.left},${mPad.top + mChartH} Z`;

  return (
    <div className="bg-[#181818] border border-white/10 rounded-lg p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">💰 수익 분석</h3>
        <span className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded">CPM ${cpm.toFixed(1)} · {channelDetailData.category}</span>
      </div>

      {/* Monthly revenue trend */}
      <div>
        <p className="text-xs text-white/40 mb-2">월별 추정 수익 (최근 6개월)</p>
        <svg viewBox={`0 0 ${mW} ${mH}`} className="w-full" style={{ minWidth: 280 }}>
          <defs>
            <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((ratio, i) => {
            const y = mPad.top + mChartH - ratio * mChartH;
            const label = `$${Math.round(maxMonthRev * ratio)}K`;
            return (
              <g key={i}>
                <line x1={mPad.left} y1={y} x2={mW - mPad.right} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <text x={mPad.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.25)">{label}</text>
              </g>
            );
          })}
          <path d={areaPath} fill="url(#revAreaGrad)" />
          <polyline points={polyline} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
          {monthlyRevenue.map((d, i) => {
            const x = mPad.left + (i / (monthlyRevenue.length - 1)) * mChartW;
            const y = mPad.top + mChartH - (d.rev / maxMonthRev) * mChartH;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="3" fill="#22c55e" />
                <text x={x} y={mH - 6} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.3)">{d.month}</text>
                <text x={x} y={y - 8} textAnchor="middle" fontSize="9" fill="#4ade80">${d.rev}K</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Per-video revenue bars */}
      <div>
        <p className="text-xs text-white/40 mb-2">영상별 추정 수익</p>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 300 }}>
          <defs>
            <linearGradient id="revBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="revBarGradMax" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((ratio, i) => {
            const y = PAD.top + chartH - ratio * chartH;
            const label = fmtMoney(maxRev * ratio);
            return (
              <g key={i}>
                <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.25)">{label}</text>
              </g>
            );
          })}
          {videoRevenue.map((v, i) => {
            const minH = (v.min / maxRev) * chartH;
            const maxH = (v.max / maxRev) * chartH;
            const x = PAD.left + i * (barW + barGap);
            return (
              <g key={i}>
                {/* max range (lighter) */}
                <rect x={x} y={PAD.top + chartH - maxH} width={barW} height={maxH - minH} fill="url(#revBarGradMax)" rx="2" />
                {/* min (solid) */}
                <rect x={x} y={PAD.top + chartH - minH} width={barW} height={minH} fill="url(#revBarGrad)" rx="2" />
                <text x={x + barW / 2} y={PAD.top + chartH - maxH - 4} textAnchor="middle" fontSize="8" fill="rgba(74,222,128,0.7)">{fmtMoney(v.max)}</text>
                <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.25)">{v.title}</text>
              </g>
            );
          })}
        </svg>
        <p className="text-[10px] text-white/20 mt-1 text-right">밝은 영역 = 최대 추정치, 진한 영역 = 최소 추정치</p>
      </div>
    </div>
  );
};

export default RevenueChart;
