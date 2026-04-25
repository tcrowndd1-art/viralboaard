import { useState } from 'react';
import { Link } from 'react-router-dom';

interface ChannelCardProps {
  channel: {
    id: string;
    type?: string;
    name: string;
    handle: string;
    avatar: string;
    banner?: string;
    category?: string;
    country?: string;
    subscribers: number;
    totalViews: number;
    videoCount: number;
    growthPercent?: number;
    description?: string;
  };
}

const formatNumber = (n: number): string => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

const categoryColors: Record<string, string> = {
  Entertainment: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
  Music: 'bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400',
  Gaming: 'bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400',
  Education: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400',
  Kids: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
  Sports: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400',
  News: 'bg-gray-100 text-gray-600 dark:bg-off-white/8 dark:text-off-white/50',
};

const ChannelCard = ({ channel }: ChannelCardProps) => {
  const colorClass = categoryColors[channel.category ?? ''] ?? 'bg-gray-100 text-gray-500 dark:bg-off-white/8 dark:text-off-white/40';
  const growth = channel.growthPercent ?? 0;
  const [imgErr, setImgErr] = useState(false);

  return (
    <Link
      to={`/channel/${channel.id}`}
      className="group flex flex-col bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-5 hover:border-gray-300 dark:hover:border-off-white/15 transition-all cursor-pointer"
    >
      {/* Type badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-400 dark:text-off-white/30 flex items-center gap-1">
          <i className="ri-user-line w-3 h-3 flex items-center justify-center"></i>
          Channel
        </span>
        {channel.category && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
            {channel.category}
          </span>
        )}
      </div>

      {/* Avatar + Name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-dark-border group-hover:border-red-400 dark:group-hover:border-red-500 transition-colors bg-red-500 flex items-center justify-center">
          {imgErr || !channel.avatar ? (
            <span className="text-white font-bold text-lg">{channel.name.charAt(0).toUpperCase()}</span>
          ) : (
            <img src={channel.avatar} alt={channel.name} className="w-full h-full object-cover object-top" onError={() => setImgErr(true)} />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-gray-900 dark:text-off-white font-semibold text-base truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            {channel.name}
          </h3>
          <p className="text-gray-400 dark:text-off-white/40 text-sm truncate">{channel.handle}</p>
          {channel.country && <p className="text-gray-400 dark:text-off-white/30 text-xs mt-0.5">{channel.country}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-auto">
        <div className="bg-gray-50 dark:bg-dark-surface rounded-md p-2 text-center">
          <p className="text-gray-900 dark:text-off-white text-sm font-semibold">{formatNumber(channel.subscribers)}</p>
          <p className="text-gray-400 dark:text-off-white/30 text-xs mt-0.5">Subscribers</p>
        </div>
        <div className="bg-gray-50 dark:bg-dark-surface rounded-md p-2 text-center">
          <p className="text-gray-900 dark:text-off-white text-sm font-semibold">{formatNumber(channel.totalViews)}</p>
          <p className="text-gray-400 dark:text-off-white/30 text-xs mt-0.5">Total Views</p>
        </div>
        <div className="bg-gray-50 dark:bg-dark-surface rounded-md p-2 text-center">
          <p className={`text-sm font-semibold ${growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {growth >= 0 ? '+' : ''}{growth}%
          </p>
          <p className="text-gray-400 dark:text-off-white/30 text-xs mt-0.5">Growth</p>
        </div>
      </div>
    </Link>
  );
};

export default ChannelCard;
