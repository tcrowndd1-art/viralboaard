import { useId } from 'react';

export type Niche = 'Finance' | 'Health' | 'Psychology' | 'Education' | 'Tech' | 'Entertainment';
export type Frequency = 'daily' | '3x_week' | 'weekly' | 'monthly';

interface Props {
  subscribers: number;
  avgViews: number;
  frequency: Frequency;
  niche: Niche;
  onSubscribersChange: (v: number) => void;
  onAvgViewsChange: (v: number) => void;
  onFrequencyChange: (v: Frequency) => void;
  onNicheChange: (v: Niche) => void;
}

const NICHES: { key: Niche; icon: string; cpm: number }[] = [
  { key: 'Finance', icon: 'ri-funds-line', cpm: 12.5 },
  { key: 'Health', icon: 'ri-heart-pulse-line', cpm: 8.4 },
  { key: 'Psychology', icon: 'ri-brain-line', cpm: 9.2 },
  { key: 'Education', icon: 'ri-graduation-cap-line', cpm: 7.8 },
  { key: 'Tech', icon: 'ri-cpu-line', cpm: 10.1 },
  { key: 'Entertainment', icon: 'ri-movie-line', cpm: 4.2 },
];

const FREQUENCIES: { key: Frequency; label: string; videosPerMonth: number }[] = [
  { key: 'daily', label: 'Daily', videosPerMonth: 30 },
  { key: '3x_week', label: '3× / Week', videosPerMonth: 12 },
  { key: 'weekly', label: 'Weekly', videosPerMonth: 4 },
  { key: 'monthly', label: 'Monthly', videosPerMonth: 1 },
];

const formatSliderLabel = (n: number, max: number): string => {
  if (max >= 1_000_000) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return n.toString();
  }
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toString();
};

const CalculatorInputs = ({
  subscribers,
  avgViews,
  frequency,
  niche,
  onSubscribersChange,
  onAvgViewsChange,
  onFrequencyChange,
  onNicheChange,
}: Props) => {
  const subId = useId();
  const viewId = useId();

  return (
    <div className="space-y-7">
      {/* Subscriber Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label htmlFor={subId} className="text-sm font-semibold text-gray-800 dark:text-white">
            Subscriber Count
          </label>
          <span className="text-lg font-black text-gray-900 dark:text-white font-mono tabular-nums">
            {formatSliderLabel(subscribers, 1_000_000)}
          </span>
        </div>
        <div className="relative">
          <input
            id={subId}
            type="range"
            min={0}
            max={1_000_000}
            step={1000}
            value={subscribers}
            onChange={(e) => onSubscribersChange(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-green-500 bg-gray-200 dark:bg-white/10"
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-gray-400 dark:text-white/30">0</span>
            <span className="text-xs text-gray-400 dark:text-white/30">500K</span>
            <span className="text-xs text-gray-400 dark:text-white/30">1M</span>
          </div>
        </div>
      </div>

      {/* Avg Views Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label htmlFor={viewId} className="text-sm font-semibold text-gray-800 dark:text-white">
            Avg. Views per Video
          </label>
          <span className="text-lg font-black text-gray-900 dark:text-white font-mono tabular-nums">
            {formatSliderLabel(avgViews, 10_000_000)}
          </span>
        </div>
        <div className="relative">
          <input
            id={viewId}
            type="range"
            min={0}
            max={10_000_000}
            step={10000}
            value={avgViews}
            onChange={(e) => onAvgViewsChange(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-green-500 bg-gray-200 dark:bg-white/10"
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-gray-400 dark:text-white/30">0</span>
            <span className="text-xs text-gray-400 dark:text-white/30">5M</span>
            <span className="text-xs text-gray-400 dark:text-white/30">10M</span>
          </div>
        </div>
      </div>

      {/* Upload Frequency */}
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Upload Frequency</p>
        <div className="grid grid-cols-2 gap-2">
          {FREQUENCIES.map((f) => (
            <button
              key={f.key}
              onClick={() => onFrequencyChange(f.key)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all whitespace-nowrap border ${
                frequency === f.key
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:border-green-400 dark:hover:border-green-500/50 hover:text-green-600 dark:hover:text-green-400'
              }`}
            >
              {f.label}
              <span className={`block text-xs mt-0.5 font-normal ${frequency === f.key ? 'text-green-100' : 'text-gray-400 dark:text-white/30'}`}>
                {f.videosPerMonth} videos/mo
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Niche Selector */}
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Content Niche</p>
        <div className="grid grid-cols-2 gap-2">
          {NICHES.map((n) => (
            <button
              key={n.key}
              onClick={() => onNicheChange(n.key)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border ${
                niche === n.key
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:border-green-400 dark:hover:border-green-500/50 hover:text-green-600 dark:hover:text-green-400'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                <i className={`${n.icon} text-sm`}></i>
              </div>
              <span className="flex-1 text-left">{n.key}</span>
              <span className={`text-xs font-mono ${niche === n.key ? 'text-green-100' : 'text-gray-400 dark:text-white/30'}`}>
                ${n.cpm}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-white/30 mt-2">CPM shown per niche</p>
      </div>
    </div>
  );
};

export { NICHES, FREQUENCIES };
export default CalculatorInputs;
