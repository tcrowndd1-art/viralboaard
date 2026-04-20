import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { recommendedChannels } from '@/mocks/userDashboard';
import type { RecommendedChannel } from '@/mocks/userDashboard';

const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

const categoryColors: Record<string, string> = {
  Entertainment: 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400',
  Gaming: 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400',
  Tech: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
  Education: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  Music: 'bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400',
};

const RecommendationCard = ({
  channel,
  onSave,
  saved,
}: {
  channel: RecommendedChannel;
  onSave: (id: string) => void;
  saved: boolean;
}) => {
  const { t } = useTranslation();
  const colorClass = categoryColors[channel.category] ?? 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400';

  return (
    <div className="bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-white/12 rounded-lg p-4 flex flex-col gap-3 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
      {/* Reason tag */}
      <div className="flex items-center gap-1.5">
        <i className="ri-magic-line text-violet-500 text-xs w-3 h-3 flex items-center justify-center"></i>
        <span className="text-xs text-gray-400 dark:text-white/40 truncate">{channel.reason}</span>
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 flex-shrink-0">
          <img src={channel.avatar} alt={channel.name} className="w-full h-full object-cover object-top" />
        </div>
        <div className="min-w-0 flex-1">
          <Link
            to={`/channel/${channel.id}`}
            className="text-sm font-semibold text-gray-900 dark:text-white hover:text-red-500 dark:hover:text-red-400 transition-colors truncate block cursor-pointer"
          >
            {channel.name}
          </Link>
          <p className="text-xs text-gray-400 dark:text-white/40 truncate">{channel.handle}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${colorClass}`}>
          {channel.category}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatNumber(channel.subscribers)}</p>
          <p className="text-xs text-gray-400 dark:text-white/55">{t('dash_subscribers')}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-green-600 dark:text-green-400">+{channel.monthlyGrowth}%</p>
          <p className="text-xs text-gray-400 dark:text-white/55">{t('dash_monthly_growth')}</p>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={() => onSave(channel.id)}
        className={`w-full py-2 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
          saved
            ? 'bg-red-50 dark:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-600/30'
            : 'bg-white dark:bg-white/8 text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/12 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10'
        }`}
      >
        {saved ? (
          <span className="flex items-center justify-center gap-1.5">
            <i className="ri-heart-fill w-3 h-3 flex items-center justify-center"></i>
            {t('dash_saved_btn')}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            <i className="ri-heart-line w-3 h-3 flex items-center justify-center"></i>
            {t('dash_save_channel')}
          </span>
        )}
      </button>
    </div>
  );
};

const Recommendations = () => {
  const { t } = useTranslation();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const handleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/15 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2">
          <i className="ri-magic-line text-violet-500 w-4 h-4 flex items-center justify-center"></i>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('dash_recommended')}</h2>
        </div>
        <span className="text-xs text-gray-400 dark:text-white/30">{t('dash_based_on')}</span>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {recommendedChannels.map((ch) => (
          <RecommendationCard
            key={ch.id}
            channel={ch}
            onSave={handleSave}
            saved={savedIds.has(ch.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
