import { commentStats } from '@/mocks/commentManager';

interface StatsData {
  commentsToday: number;
  autoReplied: number;
  pendingReview: number;
  avgSentimentScore: number;
}

interface StatCardsProps {
  stats?: StatsData;
}

const getSentimentEmoji = (score: number): string => {
  if (score >= 80) return '😄';
  if (score >= 60) return '🙂';
  if (score >= 40) return '😐';
  if (score >= 20) return '😕';
  return '😠';
};

const getSentimentColor = (score: number): string => {
  if (score >= 70) return 'text-green-600 dark:text-green-400';
  if (score >= 45) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const StatCards = ({ stats = commentStats }: StatCardsProps) => {
  const replyRate = Math.round((stats.autoReplied / stats.commentsToday) * 100);

  const cards = [
    {
      label: 'Comments Today',
      value: stats.commentsToday.toLocaleString(),
      icon: 'ri-chat-3-line',
      iconColor: 'text-sky-600 dark:text-sky-400',
      iconBg: 'bg-sky-50 dark:bg-sky-500/15',
      sub: '+12% vs yesterday',
      subColor: 'text-green-600 dark:text-green-400',
      trend: 'up' as const,
    },
    {
      label: 'Auto-Replied',
      value: stats.autoReplied.toLocaleString(),
      icon: 'ri-robot-line',
      iconColor: 'text-violet-600 dark:text-violet-400',
      iconBg: 'bg-violet-50 dark:bg-violet-500/15',
      sub: `${replyRate}% reply rate`,
      subColor: 'text-violet-600 dark:text-violet-400',
      trend: null,
    },
    {
      label: 'Pending Review',
      value: stats.pendingReview.toLocaleString(),
      icon: 'ri-time-line',
      iconColor: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-50 dark:bg-orange-500/15',
      sub: 'Needs your attention',
      subColor: 'text-orange-600 dark:text-orange-400',
      trend: null,
    },
    {
      label: 'Avg. Sentiment Score',
      value: `${stats.avgSentimentScore}`,
      icon: null,
      emoji: getSentimentEmoji(stats.avgSentimentScore),
      iconBg: 'bg-green-50 dark:bg-green-500/15',
      sub: stats.avgSentimentScore >= 70 ? 'Mostly positive audience' : stats.avgSentimentScore >= 45 ? 'Mixed audience sentiment' : 'Needs attention',
      subColor: getSentimentColor(stats.avgSentimentScore),
      trend: null,
      isScore: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card px-5 py-4 flex flex-col gap-3 transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-white/40 font-medium">{card.label}</p>
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${card.iconBg}`}>
              {card.isScore ? (
                <span className="text-lg leading-none">{card.emoji}</span>
              ) : (
                <i className={`${card.icon} ${card.iconColor} text-sm`}></i>
              )}
            </div>
          </div>
          <div className="flex items-end gap-2">
            <p className={`text-3xl font-bold ${card.isScore ? getSentimentColor(stats.avgSentimentScore) : 'text-gray-900 dark:text-off-white'}`}>
              {card.value}
            </p>
            {card.isScore && <span className="text-gray-400 dark:text-white/30 text-sm mb-1">/100</span>}
          </div>
          <div className="flex items-center gap-1.5">
            {card.trend === 'up' && (
              <i className="ri-arrow-up-line text-green-500 text-xs w-3 h-3 flex items-center justify-center"></i>
            )}
            <p className={`text-xs ${card.subColor}`}>{card.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
