import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSavedChannels } from '@/hooks/useSavedChannels';
import type { SavedChannel } from '@/mocks/userDashboard';

const formatNumber = (n: number): string => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
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

const ChannelRow = ({
  channel,
  onRemove,
}: {
  channel: SavedChannel;
  onRemove: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const colorClass = categoryColors[channel.category] ?? 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400';

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/3 transition-colors group">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-white/10">
          <img
            src={channel.avatar}
            alt={channel.name}
            className="w-full h-full object-cover object-top"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        {channel.isLive && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#181818] animate-pulse"></span>
        )}
      </div>

      {/* Name + handle */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            to={`/channel/${channel.id}`}
            className="text-sm font-medium text-gray-900 dark:text-white hover:text-red-500 dark:hover:text-red-400 transition-colors truncate cursor-pointer"
          >
            {channel.name}
          </Link>
          {channel.isLive && (
            <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded font-medium flex-shrink-0">LIVE</span>
          )}
        </div>
        <p className="text-xs text-gray-400 dark:text-white/40 truncate">{channel.handle}</p>
      </div>

      {/* Category */}
      <span className={`hidden md:inline-flex text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${colorClass}`}>
        {channel.category}
      </span>

      {/* Subscribers */}
      <div className="hidden sm:block text-right flex-shrink-0 w-20">
        <p className="text-sm text-gray-900 dark:text-white font-medium">{formatNumber(channel.subscribers)}</p>
        <p className="text-xs text-gray-400 dark:text-white/50">{t('dash_col_subs')}</p>
      </div>

      {/* Growth */}
      <div className="text-right flex-shrink-0 w-16">
        <p className={`text-sm font-semibold ${channel.weeklyGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
          {channel.weeklyGrowth >= 0 ? '+' : ''}{channel.weeklyGrowth}%
        </p>
        <p className="text-xs text-gray-400 dark:text-white/50">{t('dash_col_7d')}</p>
      </div>

      {/* Last video */}
      <div className="hidden lg:block flex-shrink-0 max-w-[180px]">
        <p className="text-xs text-gray-500 dark:text-white/70 truncate">{channel.lastVideo}</p>
        <p className="text-xs text-gray-400 dark:text-white/50">{formatNumber(channel.lastVideoViews)} {t('dash_col_views')}</p>
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(channel.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 cursor-pointer w-7 h-7 flex items-center justify-center flex-shrink-0"
        title="Remove"
      >
        <i className="ri-close-line text-sm"></i>
      </button>
    </div>
  );
};

const SavedChannels = () => {
  const { t } = useTranslation();
  const { channels, removeChannel } = useSavedChannels();

  return (
    <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/15 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2">
          <i className="ri-heart-line text-red-500 dark:text-red-400 w-4 h-4 flex items-center justify-center"></i>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('dashboard_saved')}</h2>
          <span className="text-xs bg-gray-100 dark:bg-white/15 text-gray-500 dark:text-white/70 px-2 py-0.5 rounded-full">{channels.length}</span>
        </div>
        <Link to="/rankings" className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 cursor-pointer whitespace-nowrap transition-colors">
          {t('dash_browse_more')}
        </Link>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-4 px-5 py-2 border-b border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/5">
        <div className="w-10 flex-shrink-0"></div>
        <div className="flex-1 text-xs text-gray-500 dark:text-white/60 font-semibold">{t('dash_col_channel')}</div>
        <div className="hidden md:block text-xs text-gray-500 dark:text-white/60 font-semibold flex-shrink-0 w-20">{t('dash_col_category')}</div>
        <div className="hidden sm:block text-xs text-gray-500 dark:text-white/60 font-semibold text-right flex-shrink-0 w-20">{t('dash_col_subscribers')}</div>
        <div className="text-xs text-gray-500 dark:text-white/60 font-semibold text-right flex-shrink-0 w-16">{t('dash_col_growth')}</div>
        <div className="hidden lg:block text-xs text-gray-500 dark:text-white/60 font-semibold flex-shrink-0 max-w-[180px]">{t('dash_col_latest')}</div>
        <div className="w-7 flex-shrink-0"></div>
      </div>

      {channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-white/8 rounded-full mb-3">
            <i className="ri-heart-line text-gray-300 dark:text-white/40 text-xl"></i>
          </div>
          <p className="text-sm text-gray-400 dark:text-white/60">{t('dash_no_saved')}</p>
          <Link to="/rankings" className="mt-3 text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 cursor-pointer">
            {t('dash_browse_rankings_link')}
          </Link>
        </div>
      ) : (
        channels.map((ch) => (
          <ChannelRow key={ch.id} channel={ch} onRemove={removeChannel} />
        ))
      )}
    </div>
  );
};

export default SavedChannels;
