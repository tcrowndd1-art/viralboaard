import { useState } from 'react';

interface Competitor {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  subscribers: number;
  monthlyRevMin: number;
  monthlyRevMax: number;
  cpm: number;
  growthRate: number;
  engagementRate: number;
  avgViews: number;
  hookType: string;
  hookColor: string;
  viralScore: number;
}

const competitors: Competitor[] = [
  {
    id: 'comp1',
    name: 'Mark Rober',
    handle: '@MarkRober',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20creator%20portrait%20smiling%20clean%20white%20background%20studio%20lighting%20headshot&width=80&height=80&seq=comp-avatar-1&orientation=squarish',
    subscribers: 48200000,
    monthlyRevMin: 280000,
    monthlyRevMax: 620000,
    cpm: 4.8,
    growthRate: 3.2,
    engagementRate: 6.4,
    avgViews: 28000000,
    hookType: 'Curiosity Gap',
    hookColor: 'bg-orange-500/20 text-orange-400',
    viralScore: 88,
  },
  {
    id: 'comp2',
    name: 'Dude Perfect',
    handle: '@DudePerfect',
    avatar: 'https://readdy.ai/api/search-image?query=group%20of%20young%20men%20sports%20creators%20portrait%20smiling%20clean%20white%20background%20studio%20lighting%20headshot&width=80&height=80&seq=comp-avatar-2&orientation=squarish',
    subscribers: 60100000,
    monthlyRevMin: 340000,
    monthlyRevMax: 780000,
    cpm: 4.2,
    growthRate: 1.8,
    engagementRate: 5.1,
    avgViews: 32000000,
    hookType: 'Challenge',
    hookColor: 'bg-yellow-500/20 text-yellow-400',
    viralScore: 82,
  },
  {
    id: 'comp3',
    name: 'Ryan Trahan',
    handle: '@RyanTrahan',
    avatar: 'https://readdy.ai/api/search-image?query=young%20male%20vlogger%20creator%20portrait%20smiling%20clean%20white%20background%20studio%20lighting%20headshot&width=80&height=80&seq=comp-avatar-3&orientation=squarish',
    subscribers: 15800000,
    monthlyRevMin: 95000,
    monthlyRevMax: 210000,
    cpm: 3.9,
    growthRate: 5.7,
    engagementRate: 9.2,
    avgViews: 8500000,
    hookType: 'Shock Statement',
    hookColor: 'bg-red-500/20 text-red-400',
    viralScore: 91,
  },
];

const myChannel = {
  name: 'MrBeast',
  subscribers: 312000000,
  monthlyRevMin: 1800000,
  monthlyRevMax: 4200000,
  cpm: 4.2,
  growthRate: 6.3,
  engagementRate: 8.7,
  avgViews: 95000000,
  viralScore: 94,
};

const formatNum = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
};

const formatRev = (min: number, max: number) => {
  const fmt = (n: number) => {
    if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'K';
    return '$' + n;
  };
  return `${fmt(min)} – ${fmt(max)}`;
};

type MetricKey = 'revenue' | 'growth' | 'engagement' | 'viral';

const CompetitorComparison = () => {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('revenue');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const metrics: { key: MetricKey; label: string; icon: string }[] = [
    { key: 'revenue', label: 'Revenue', icon: 'ri-money-dollar-circle-line' },
    { key: 'growth', label: 'Growth', icon: 'ri-arrow-up-line' },
    { key: 'engagement', label: 'Engagement', icon: 'ri-heart-pulse-line' },
    { key: 'viral', label: 'Viral Score', icon: 'ri-fire-line' },
  ];

  const getMetricValue = (c: Competitor): number => {
    if (activeMetric === 'revenue') return c.monthlyRevMax;
    if (activeMetric === 'growth') return c.growthRate;
    if (activeMetric === 'engagement') return c.engagementRate;
    return c.viralScore;
  };

  const getMyValue = (): number => {
    if (activeMetric === 'revenue') return myChannel.monthlyRevMax;
    if (activeMetric === 'growth') return myChannel.growthRate;
    if (activeMetric === 'engagement') return myChannel.engagementRate;
    return myChannel.viralScore;
  };

  const getDisplayValue = (c: Competitor): string => {
    if (activeMetric === 'revenue') return formatRev(c.monthlyRevMin, c.monthlyRevMax);
    if (activeMetric === 'growth') return `+${c.growthRate}%`;
    if (activeMetric === 'engagement') return `${c.engagementRate}%`;
    return `${c.viralScore}/100`;
  };

  const getMyDisplayValue = (): string => {
    if (activeMetric === 'revenue') return formatRev(myChannel.monthlyRevMin, myChannel.monthlyRevMax);
    if (activeMetric === 'growth') return `+${myChannel.growthRate}%`;
    if (activeMetric === 'engagement') return `${myChannel.engagementRate}%`;
    return `${myChannel.viralScore}/100`;
  };

  const allValues = [getMyValue(), ...competitors.map(getMetricValue)];
  const maxVal = Math.max(...allValues);

  return (
    <div className="bg-[#181818] border border-white/10 rounded-lg overflow-hidden mb-6">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center">
            <i className="ri-bar-chart-grouped-line text-orange-400 text-base"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">Competitor Comparison</h3>
          <span className="text-xs bg-orange-600/20 text-orange-400 px-2 py-0.5 rounded-full font-medium">3 Similar Channels</span>
        </div>
        {/* Metric tabs */}
        <div className="flex items-center gap-1">
          {metrics.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                activeMetric === m.key
                  ? 'bg-orange-600/20 text-orange-400'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <i className={`${m.icon} w-3 h-3 flex items-center justify-center`}></i>
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bar chart comparison */}
      <div className="px-5 py-5">
        <div className="flex items-end gap-4 h-36 mb-4">
          {/* My channel bar */}
          <div className="flex-1 flex flex-col items-center gap-1 group">
            <span className="text-xs text-green-400 font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {getMyDisplayValue()}
            </span>
            <div
              className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-md transition-all duration-700 relative cursor-pointer"
              style={{ height: `${(getMyValue() / maxVal) * 100}px` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-green-300"></div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs text-green-400 font-bold">You</span>
              <span className="text-xs text-white/30 text-center leading-tight">MrBeast</span>
            </div>
          </div>

          {/* Competitor bars */}
          {competitors.map((c) => (
            <div
              key={c.id}
              className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
              onMouseEnter={() => setHoveredId(c.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <span className="text-xs text-white/60 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {getDisplayValue(c)}
              </span>
              <div
                className={`w-full rounded-t-md transition-all duration-700 relative ${
                  hoveredId === c.id
                    ? 'bg-gradient-to-t from-orange-600 to-orange-400'
                    : 'bg-gradient-to-t from-white/20 to-white/10'
                }`}
                style={{ height: `${(getMetricValue(c) / maxVal) * 100}px` }}
              >
                <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full transition-colors ${hoveredId === c.id ? 'bg-orange-300' : 'bg-white/30'}`}></div>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className={`text-xs font-medium transition-colors ${hoveredId === c.id ? 'text-orange-400' : 'text-white/50'}`}>{c.name}</span>
                <span className="text-xs text-white/25 text-center leading-tight">{c.handle}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-500"></div>
            <span className="text-xs text-white/40">Your Channel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-white/20"></div>
            <span className="text-xs text-white/40">Competitors</span>
          </div>
        </div>

        {/* Competitor detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {competitors.map((c) => (
            <div
              key={c.id}
              className={`border rounded-lg p-3 transition-all cursor-pointer ${
                hoveredId === c.id
                  ? 'border-orange-600/40 bg-orange-600/5'
                  : 'border-white/8 bg-white/[0.02] hover:border-white/15'
              }`}
              onMouseEnter={() => setHoveredId(c.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Channel header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                  <p className="text-xs text-white/30 truncate">{formatNum(c.subscribers)} subs</p>
                </div>
                <div className="ml-auto w-6 h-6 flex items-center justify-center">
                  <i className="ri-youtube-line text-red-400 text-sm"></i>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 rounded-md px-2 py-1.5">
                  <p className="text-xs text-white/30 mb-0.5">Revenue</p>
                  <p className="text-xs font-bold text-green-400 font-mono leading-tight">{formatRev(c.monthlyRevMin, c.monthlyRevMax)}</p>
                </div>
                <div className="bg-white/5 rounded-md px-2 py-1.5">
                  <p className="text-xs text-white/30 mb-0.5">Growth</p>
                  <p className="text-xs font-bold text-orange-400 font-mono">+{c.growthRate}%</p>
                </div>
                <div className="bg-white/5 rounded-md px-2 py-1.5">
                  <p className="text-xs text-white/30 mb-0.5">Engagement</p>
                  <p className="text-xs font-bold text-white/70 font-mono">{c.engagementRate}%</p>
                </div>
                <div className="bg-white/5 rounded-md px-2 py-1.5">
                  <p className="text-xs text-white/30 mb-0.5">CPM</p>
                  <p className="text-xs font-bold text-yellow-400 font-mono">${c.cpm}</p>
                </div>
              </div>

              {/* Hook type */}
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.hookColor}`}>{c.hookType}</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 flex items-center justify-center">
                    <i className="ri-fire-line text-red-400 text-xs"></i>
                  </div>
                  <span className="text-xs text-white/40 font-mono">{c.viralScore}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Insight callout */}
        <div className="mt-4 flex items-start gap-2 bg-green-600/10 border border-green-600/20 rounded-lg px-3 py-2.5">
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="ri-trophy-line text-green-400 text-xs"></i>
          </div>
          <p className="text-xs text-green-400 font-medium leading-relaxed">
            MrBeast leads all competitors in revenue (+167% vs avg) and viral score. Growth rate is 2.1× higher than the niche average.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompetitorComparison;
