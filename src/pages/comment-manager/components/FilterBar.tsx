import { useState } from 'react';
import type { Platform, Sentiment } from '@/mocks/commentManager';

type PlatformFilter = 'all' | Platform;
type SentimentFilter = 'all' | Sentiment;

interface FilterBarProps {
  platform: PlatformFilter;
  sentiment: SentimentFilter;
  dateRange: string;
  onPlatformChange: (p: PlatformFilter) => void;
  onSentimentChange: (s: SentimentFilter) => void;
  onDateRangeChange: (d: string) => void;
}

const PLATFORM_TABS: { key: PlatformFilter; label: string; icon: string; activeColor: string }[] = [
  { key: 'all', label: 'All', icon: 'ri-apps-line', activeColor: 'bg-gray-800 dark:bg-blue-600 text-white' },
  { key: 'youtube', label: 'YouTube', icon: 'ri-youtube-line', activeColor: 'bg-red-500 text-white' },
  { key: 'tiktok', label: 'TikTok', icon: 'ri-tiktok-line', activeColor: 'bg-pink-500 text-white' },
  { key: 'instagram', label: 'Instagram', icon: 'ri-instagram-line', activeColor: 'bg-orange-500 text-white' },
];

const SENTIMENT_OPTIONS: { key: SentimentFilter; label: string; emoji: string; color: string; activeBg: string }[] = [
  { key: 'all', label: 'All Sentiments', emoji: '💬', color: 'text-gray-600 dark:text-white/60', activeBg: 'bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20' },
  { key: 'positive', label: 'Positive', emoji: '😄', color: 'text-green-600 dark:text-green-400', activeBg: 'bg-green-50 dark:bg-green-500/15 border-green-300 dark:border-green-500/30' },
  { key: 'neutral', label: 'Neutral', emoji: '😐', color: 'text-yellow-600 dark:text-yellow-400', activeBg: 'bg-yellow-50 dark:bg-yellow-500/15 border-yellow-300 dark:border-yellow-500/30' },
  { key: 'negative', label: 'Negative', emoji: '😠', color: 'text-red-600 dark:text-red-400', activeBg: 'bg-red-50 dark:bg-red-500/15 border-red-300 dark:border-red-500/30' },
];

const DATE_RANGES = ['Today', 'Last 7 days', 'Last 30 days', 'Custom'];

const FilterBar = ({
  platform,
  sentiment,
  dateRange,
  onPlatformChange,
  onSentimentChange,
  onDateRangeChange,
}: FilterBarProps) => {
  const [dateOpen, setDateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card px-4 py-3 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Platform tabs */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1 flex-shrink-0">
          {PLATFORM_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onPlatformChange(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                platform === tab.key
                  ? tab.activeColor
                  : 'text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white/70'
              }`}
            >
              <i className={`${tab.icon} w-3 h-3 flex items-center justify-center`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-gray-200 dark:bg-white/10 hidden lg:block flex-shrink-0"></div>

        {/* Sentiment filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-400 dark:text-white/30 mr-1 whitespace-nowrap">Sentiment:</span>
          {SENTIMENT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onSentimentChange(opt.key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                sentiment === opt.key
                  ? `${opt.activeBg} ${opt.color}`
                  : 'border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60 hover:border-gray-300 dark:hover:border-white/20'
              }`}
            >
              <span>{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Date range */}
        <div className="lg:ml-auto relative flex-shrink-0">
          <button
            onClick={() => setDateOpen(!dateOpen)}
            className="flex items-center gap-2 border border-gray-200 dark:border-white/15 hover:border-gray-300 dark:hover:border-white/30 text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap bg-white dark:bg-transparent"
          >
            <i className="ri-calendar-line w-3 h-3 flex items-center justify-center"></i>
            {dateRange}
            <i className="ri-arrow-down-s-line w-3 h-3 flex items-center justify-center"></i>
          </button>
          {dateOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden z-20">
              {DATE_RANGES.map((d) => (
                <button
                  key={d}
                  onClick={() => { onDateRangeChange(d); setDateOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                    dateRange === d
                      ? 'text-red-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-600 dark:text-white/60'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
