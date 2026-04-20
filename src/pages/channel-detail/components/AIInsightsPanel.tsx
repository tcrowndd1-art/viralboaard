import { useState } from 'react';

interface InsightMetric {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  icon: string;
}

const monthlyRevenueData = [
  { month: 'Nov', revenue: 1.2 },
  { month: 'Dec', revenue: 1.8 },
  { month: 'Jan', revenue: 1.5 },
  { month: 'Feb', revenue: 2.1 },
  { month: 'Mar', revenue: 2.4 },
  { month: 'Apr', revenue: 2.9 },
];

const maxRevenue = Math.max(...monthlyRevenueData.map((d) => d.revenue));

const hookTypes = [
  { label: 'Shock Statement', count: 38, color: 'bg-red-500' },
  { label: 'Curiosity Gap', count: 29, color: 'bg-orange-500' },
  { label: 'Challenge', count: 21, color: 'bg-yellow-500' },
  { label: 'Authority', count: 12, color: 'bg-green-500' },
];

const growthTrendData = [
  { month: 'Nov', growth: 2.1 },
  { month: 'Dec', growth: 3.4 },
  { month: 'Jan', growth: 2.8 },
  { month: 'Feb', growth: 4.2 },
  { month: 'Mar', growth: 5.1 },
  { month: 'Apr', growth: 6.3 },
];

const maxGrowth = Math.max(...growthTrendData.map((d) => d.growth));

const AIInsightsPanel = () => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'growth' | 'hooks'>('revenue');

  const metrics: InsightMetric[] = [
    {
      label: 'Est. Monthly Revenue',
      value: '$1.8M – $4.2M',
      sub: 'Based on CPM × views',
      color: 'text-green-400',
      icon: 'ri-money-dollar-circle-line',
    },
    {
      label: 'Avg. CPM (Niche)',
      value: '$4.20',
      sub: 'Entertainment category',
      color: 'text-yellow-400',
      icon: 'ri-price-tag-3-line',
    },
    {
      label: 'Viral Score',
      value: '94 / 100',
      sub: 'Top 1% globally',
      color: 'text-red-400',
      icon: 'ri-fire-line',
    },
    {
      label: 'Engagement Rate',
      value: '8.7%',
      sub: '3× industry avg.',
      color: 'text-orange-400',
      icon: 'ri-heart-pulse-line',
    },
  ];

  return (
    <div className="bg-[#181818] border border-white/10 rounded-lg overflow-hidden mb-6">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center">
            <i className="ri-robot-2-line text-red-400 text-base"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">AI Insights</h3>
          <span className="text-xs bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full font-medium">Beta</span>
        </div>
        <span className="text-xs text-white/30">Updated just now</span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
        {metrics.map((m) => (
          <div key={m.label} className="bg-[#181818] px-4 py-4">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${m.icon} ${m.color} text-sm`}></i>
              </div>
              <p className="text-xs text-white/40 leading-tight">{m.label}</p>
            </div>
            <p className={`text-base font-bold font-mono ${m.color} leading-tight`}>{m.value}</p>
            {m.sub && <p className="text-xs text-white/25 mt-1">{m.sub}</p>}
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="px-5 pt-4 pb-0 flex items-center gap-1 border-t border-white/5">
        {[
          { key: 'revenue', label: 'Revenue Trend', icon: 'ri-line-chart-line' },
          { key: 'growth', label: 'Growth Trend', icon: 'ri-arrow-up-line' },
          { key: 'hooks', label: 'Hook Analysis', icon: 'ri-flashlight-line' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-red-600/20 text-red-400'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            <i className={`${tab.icon} w-3 h-3 flex items-center justify-center`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div className="px-5 py-4">
        {activeTab === 'revenue' && (
          <div>
            <div className="flex items-end justify-between gap-2 h-28">
              {monthlyRevenueData.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-xs text-green-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ${d.revenue}M
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm transition-all duration-300 group-hover:from-green-500 group-hover:to-green-300 cursor-pointer"
                    style={{ height: `${(d.revenue / maxRevenue) * 80}px` }}
                  />
                  <span className="text-xs text-white/30">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 bg-green-600/10 border border-green-600/20 rounded-lg px-3 py-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-arrow-up-line text-green-400 text-xs"></i>
              </div>
              <p className="text-xs text-green-400 font-medium">+141% revenue growth over 6 months</p>
            </div>
          </div>
        )}

        {activeTab === 'growth' && (
          <div>
            <div className="relative h-28">
              <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`M ${growthTrendData.map((d, i) => `${(i / (growthTrendData.length - 1)) * 300},${80 - (d.growth / maxGrowth) * 70}`).join(' L ')}`}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={`M 0,80 L ${growthTrendData.map((d, i) => `${(i / (growthTrendData.length - 1)) * 300},${80 - (d.growth / maxGrowth) * 70}`).join(' L ')} L 300,80 Z`}
                  fill="url(#growthGrad)"
                />
                {growthTrendData.map((d, i) => (
                  <circle
                    key={d.month}
                    cx={(i / (growthTrendData.length - 1)) * 300}
                    cy={80 - (d.growth / maxGrowth) * 70}
                    r="3"
                    fill="#f97316"
                  />
                ))}
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-0">
                {growthTrendData.map((d) => (
                  <span key={d.month} className="text-xs text-white/30">{d.month}</span>
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 bg-orange-600/10 border border-orange-600/20 rounded-lg px-3 py-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-rocket-line text-orange-400 text-xs"></i>
              </div>
              <p className="text-xs text-orange-400 font-medium">Subscriber growth accelerating — +6.3% this month</p>
            </div>
          </div>
        )}

        {activeTab === 'hooks' && (
          <div className="space-y-3">
            {hookTypes.map((h) => (
              <div key={h.label} className="flex items-center gap-3">
                <span className="text-xs text-white/50 w-28 flex-shrink-0">{h.label}</span>
                <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${h.color} rounded-full transition-all duration-700`}
                    style={{ width: `${h.count}%` }}
                  />
                </div>
                <span className="text-xs text-white/40 font-mono w-8 text-right">{h.count}%</span>
              </div>
            ))}
            <div className="mt-2 flex items-center gap-2 bg-red-600/10 border border-red-600/20 rounded-lg px-3 py-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-lightbulb-flash-line text-red-400 text-xs"></i>
              </div>
              <p className="text-xs text-red-400 font-medium">Shock Statement hooks drive 2.4× more clicks</p>
            </div>
          </div>
        )}
      </div>

      {/* Best Upload Time */}
      <div className="px-5 pb-4 border-t border-white/5 pt-4">
        <p className="text-xs text-white/30 uppercase tracking-wider mb-3 font-semibold">Best Upload Times</p>
        <div className="flex flex-wrap gap-2">
          {[
            { day: 'Fri', time: '3–5 PM EST', score: 98 },
            { day: 'Sat', time: '12–2 PM EST', score: 94 },
            { day: 'Sun', time: '2–4 PM EST', score: 91 },
          ].map((t) => (
            <div key={t.day} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-time-line text-white/40 text-xs"></i>
              </div>
              <span className="text-xs text-white/70 font-medium">{t.day}</span>
              <span className="text-xs text-white/40">{t.time}</span>
              <span className="text-xs text-green-400 font-mono font-bold">{t.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPanel;
