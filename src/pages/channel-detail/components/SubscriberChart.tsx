import { subscriberGrowthData } from '@/mocks/channelDetail';

const SubscriberChart = () => {
  const values = subscriberGrowthData.map(d => d.subscribers);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 600;
  const H = 140;
  const PAD = { top: 16, right: 16, bottom: 32, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const points = subscriberGrowthData.map((d, i) => ({
    x: PAD.left + (i / (subscriberGrowthData.length - 1)) * chartW,
    y: PAD.top + chartH - ((d.subscribers - min) / range) * chartH,
    ...d,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${PAD.top + chartH} L ${points[0].x} ${PAD.top + chartH} Z`;

  const yTicks = [min, min + range * 0.5, max].map(v => ({
    value: v,
    y: PAD.top + chartH - ((v - min) / range) * chartH,
    label: (v / 1000).toFixed(0) + 'M',
  }));

  return (
    <div className="bg-[#181818] border border-white/10 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Subscriber Growth</h3>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 320 }}>
          <defs>
            <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((t, i) => (
            <g key={i}>
              <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={PAD.left - 6} y={t.y + 4} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.3)">{t.label}</text>
            </g>
          ))}

          {/* X axis labels */}
          {points.map((p, i) => (
            <text key={i} x={p.x} y={H - 6} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.3)">{p.month}</text>
          ))}

          {/* Area fill */}
          <path d={areaD} fill="url(#subGrad)" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots + tooltips */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#ef4444" stroke="#0f0f0f" strokeWidth="2" />
              <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)">{p.subscribers}M</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default SubscriberChart;
