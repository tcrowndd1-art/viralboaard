import { useMemo } from 'react';
import type { Niche, Frequency } from './CalculatorInputs';
import { NICHES, FREQUENCIES } from './CalculatorInputs';

interface Props {
  subscribers: number;
  avgViews: number;
  frequency: Frequency;
  niche: Niche;
  onSavePDF: () => void;
  onShare: () => void;
}

const CPM_MAP: Record<Niche, number> = {
  Finance: 12.5,
  Health: 8.4,
  Psychology: 9.2,
  Education: 7.8,
  Tech: 10.1,
  Entertainment: 4.2,
};

const NICHE_AVG_REVENUE: Record<Niche, number> = {
  Finance: 3200,
  Health: 1800,
  Psychology: 2100,
  Education: 1500,
  Tech: 2600,
  Entertainment: 900,
};

const fmt = (n: number): string => {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(1) + 'K';
  return '$' + n.toFixed(0);
};

const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];

const RevenueOutput = ({ subscribers, avgViews, frequency, niche, onSavePDF, onShare }: Props) => {
  const cpm = CPM_MAP[niche];
  const freqData = FREQUENCIES.find((f) => f.key === frequency)!;
  const videosPerMonth = freqData.videosPerMonth;

  const monthlyViews = avgViews * videosPerMonth;
  const monetizedRatio = 0.45; // ~45% of views are monetized
  const revenueBase = (monthlyViews / 1000) * cpm * monetizedRatio;
  const revenueMin = revenueBase * 0.7;
  const revenueMax = revenueBase * 1.4;
  const revenueAnnual = revenueBase * 12;

  const nicheAvg = NICHE_AVG_REVENUE[niche];
  const vsNicheAvg = revenueBase > 0 ? ((revenueBase - nicheAvg) / nicheAvg) * 100 : 0;

  // 6-month growth projection (compound 8% monthly growth)
  const projectionData = useMemo(() => {
    return MONTHS.map((month, i) => ({
      month,
      revenue: revenueBase * Math.pow(1.08, i),
    }));
  }, [revenueBase]);

  const maxProjection = Math.max(...projectionData.map((d) => d.revenue), 1);

  // Bar chart: Your channel vs niche average
  const barData = [
    { label: 'Your Channel', value: revenueBase, color: 'bg-green-500' },
    { label: 'Niche Avg.', value: nicheAvg, color: 'bg-gray-300 dark:bg-white/20' },
  ];
  const maxBar = Math.max(...barData.map((b) => b.value), 1);

  const nicheInfo = NICHES.find((n) => n.key === niche)!;

  return (
    <div className="space-y-5">
      {/* Main Revenue Card */}
      <div className="bg-white dark:bg-[#181818] border-2 border-green-200 dark:border-green-600/30 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 dark:bg-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-green-500 text-base"></i>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-white/50">Estimated Monthly AdSense Revenue</p>
          </div>
          <div className="flex items-end gap-3 mb-3">
            <p className="text-4xl font-black text-green-500 font-mono tabular-nums leading-none">
              {fmt(revenueMin)}
            </p>
            <span className="text-2xl font-black text-green-400/60 mb-0.5">–</span>
            <p className="text-4xl font-black text-green-500 font-mono tabular-nums leading-none">
              {fmt(revenueMax)}
            </p>
          </div>
          <p className="text-xs text-gray-400 dark:text-white/30 mb-4">
            Based on {(monthlyViews / 1000).toFixed(0)}K monthly views × ${cpm} CPM × 45% monetization rate
          </p>

          {/* Sub-metrics row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2.5">
              <p className="text-xs text-gray-400 dark:text-white/30 mb-1">CPM (Niche)</p>
              <p className="text-base font-bold text-green-500 font-mono">${cpm}</p>
              <p className="text-xs text-gray-400 dark:text-white/25">{niche}</p>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2.5">
              <p className="text-xs text-gray-400 dark:text-white/30 mb-1">Annual Est.</p>
              <p className="text-base font-bold text-green-500 font-mono">{fmt(revenueAnnual)}</p>
              <p className="text-xs text-gray-400 dark:text-white/25">per year</p>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2.5">
              <p className="text-xs text-gray-400 dark:text-white/30 mb-1">vs Niche Avg</p>
              <p className={`text-base font-bold font-mono ${vsNicheAvg >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {vsNicheAvg >= 0 ? '+' : ''}{vsNicheAvg.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-400 dark:text-white/25">comparison</p>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Month Growth Projection Line Chart */}
      <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-line-chart-line text-green-500 text-sm"></i>
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">6-Month Growth Projection</p>
          </div>
          <span className="text-xs text-gray-400 dark:text-white/30 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-full">+8% monthly growth</span>
        </div>

        {revenueBase > 0 ? (
          <div className="relative h-36">
            <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="currentColor" strokeWidth="0.5" className="text-gray-100 dark:text-white/5" />
              ))}
              {/* Area fill */}
              <path
                d={`M 0,${100 - (projectionData[0].revenue / maxProjection) * 90} ${projectionData.map((d, i) => `L ${(i / (projectionData.length - 1)) * 400},${100 - (d.revenue / maxProjection) * 90}`).join(' ')} L 400,100 L 0,100 Z`}
                fill="url(#projGrad)"
              />
              {/* Line */}
              <path
                d={`M ${projectionData.map((d, i) => `${(i / (projectionData.length - 1)) * 400},${100 - (d.revenue / maxProjection) * 90}`).join(' L ')}`}
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Dots */}
              {projectionData.map((d, i) => (
                <circle
                  key={d.month}
                  cx={(i / (projectionData.length - 1)) * 400}
                  cy={100 - (d.revenue / maxProjection) * 90}
                  r="4"
                  fill="#22c55e"
                  stroke="white"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
            {/* Month labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between">
              {projectionData.map((d) => (
                <span key={d.month} className="text-xs text-gray-400 dark:text-white/30">{d.month}</span>
              ))}
            </div>
            {/* Value labels */}
            <div className="absolute top-0 left-0 right-0 flex justify-between">
              {projectionData.map((d) => (
                <span key={d.month} className="text-xs text-green-500 font-mono font-bold">{fmt(d.revenue)}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-36 flex items-center justify-center">
            <p className="text-sm text-gray-400 dark:text-white/30">Adjust sliders to see projection</p>
          </div>
        )}
      </div>

      {/* Bar Chart: Your Channel vs Niche Average */}
      <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-bar-chart-2-line text-green-500 text-sm"></i>
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-white">Your Channel vs Niche Average</p>
        </div>

        <div className="flex items-end gap-8 h-28 mb-3">
          {barData.map((b) => (
            <div key={b.label} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-xs font-bold text-green-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                {fmt(b.value)}
              </span>
              <div
                className={`w-full ${b.color} rounded-t-lg transition-all duration-700`}
                style={{ height: `${Math.max((b.value / maxBar) * 80, 4)}px` }}
              />
              <span className="text-xs text-gray-500 dark:text-white/50 text-center font-medium">{b.label}</span>
              <span className="text-xs text-green-500 font-mono font-bold">{fmt(b.value)}</span>
            </div>
          ))}

          {/* Niche CPM info */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-white/5 rounded-xl p-3 h-full">
            <div className="w-8 h-8 flex items-center justify-center">
              <i className={`${nicheInfo.icon} text-green-500 text-xl`}></i>
            </div>
            <p className="text-xs text-gray-500 dark:text-white/50 text-center">{niche} CPM</p>
            <p className="text-lg font-black text-green-500 font-mono">${cpm}</p>
          </div>
        </div>

        {/* Insight */}
        {revenueBase > 0 && (
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${vsNicheAvg >= 0 ? 'bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20' : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20'}`}>
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={`${vsNicheAvg >= 0 ? 'ri-arrow-up-line text-green-500' : 'ri-arrow-down-line text-red-500'} text-xs`}></i>
            </div>
            <p className={`text-xs font-medium ${vsNicheAvg >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              Your estimated revenue is {Math.abs(vsNicheAvg).toFixed(0)}% {vsNicheAvg >= 0 ? 'above' : 'below'} the {niche} niche average
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onSavePDF}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap text-sm"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-file-pdf-line text-sm"></i>
          </div>
          Save Report as PDF
        </button>
        <button
          onClick={onShare}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border-2 border-green-500 text-green-600 dark:text-green-400 font-semibold rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors cursor-pointer whitespace-nowrap text-sm"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-share-line text-sm"></i>
          </div>
          Share Results
        </button>
      </div>
    </div>
  );
};

export default RevenueOutput;
