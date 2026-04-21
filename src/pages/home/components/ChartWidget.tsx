import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ChannelItem {
  rank: number;
  name: string;
  score: string;
  avatar: string;
  channelId: string;
  scoreUp?: boolean | null;
}

interface ChartWidgetProps {
  titleKey: string;
  items: ChannelItem[];
  scoreType?: 'math' | 'arrow' | 'plain';
  loading?: boolean;
}

const ChartWidget = ({ titleKey, items, scoreType = 'math', loading = false }: ChartWidgetProps) => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<'Daily' | 'Weekly'>('Daily');

  const getScoreColor = (item: ChannelItem) => {
    if (scoreType === 'arrow') {
      if (item.scoreUp === true) return 'text-green-600 dark:text-green-400';
      if (item.scoreUp === false) return 'text-red-500 dark:text-red-400';
      return 'text-gray-400 dark:text-white/30';
    }
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-sm overflow-hidden transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t(titleKey)}</h3>
        <div className="flex items-center gap-1">
          {(['Daily', 'Weekly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-xs px-2 py-0.5 rounded cursor-pointer whitespace-nowrap transition-colors ${
                period === p
                  ? 'bg-gray-200 dark:bg-white/15 text-gray-800 dark:text-white font-medium'
                  : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
              }`}
            >
              {p === 'Daily' ? t('chart_period_daily') : t('chart_period_weekly')}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="divide-y divide-gray-50 dark:divide-white/5">
        {loading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">
            <div className="w-4 h-3 bg-gray-100 dark:bg-white/10 rounded animate-pulse flex-shrink-0" />
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 animate-pulse flex-shrink-0" />
            <div className="flex-1 h-3 bg-gray-100 dark:bg-white/10 rounded animate-pulse" />
            <div className="w-10 h-3 bg-gray-100 dark:bg-white/10 rounded animate-pulse" />
          </div>
        ))}
        {!loading && items.map((item) => (
          <div key={item.rank} onClick={() => item.channelId && window.open(`https://www.youtube.com/channel/${item.channelId}`, '_blank')} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer transition-colors">
            <span className="text-sm text-gray-400 dark:text-white/30 w-4 text-center flex-shrink-0">{item.rank}</span>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-white/10 flex-shrink-0">
              <img
                src={item.avatar || undefined}
                alt={item.name}
                className="w-full h-full object-cover object-top"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <span className="text-sm text-gray-800 dark:text-white/80 flex-1 truncate">{item.name}</span>
            <span className={`text-xs font-mono font-medium flex-shrink-0 ${getScoreColor(item)}`}>
              {item.score}
            </span>
          </div>
        ))}
      </div>

      {/* More button */}
      <div className="border-t border-gray-100 dark:border-white/10 px-4 py-2 text-center">
        <button className="text-xs text-gray-400 dark:text-white/25 hover:text-gray-600 dark:hover:text-white/50 cursor-pointer transition-colors">• • •</button>
      </div>
    </section>
  );
};

export default ChartWidget;
