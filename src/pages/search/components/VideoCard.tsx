interface VideoCardProps {
  video: {
    videoId?: string;
    id?: string;
    type?: string;
    title: string;
    channelName?: string;
    channelAvatar?: string;
    thumbnail: string;
    views: number;
    likes?: number;
    duration: string;
    uploadDate: string;
    category?: string;
  };
}

const formatNumber = (n: number): string => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const categoryColors: Record<string, string> = {
  Entertainment: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
  Music: 'bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400',
  Gaming: 'bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400',
  Education: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400',
  Kids: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
};

const VideoCard = ({ video }: VideoCardProps) => {
  const colorClass = categoryColors[video.category ?? ''] ?? 'bg-gray-100 text-gray-500 dark:bg-off-white/8 dark:text-off-white/40';

  return (
    <div className="group flex flex-col bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden hover:border-gray-300 dark:hover:border-off-white/15 transition-all cursor-pointer">
      {/* Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-dark-surface">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
        />
        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
          {video.duration}
        </span>
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="w-10 h-10 flex items-center justify-center bg-red-600/0 group-hover:bg-red-600 rounded-full transition-all opacity-0 group-hover:opacity-100">
            <i className="ri-play-fill text-white text-lg w-5 h-5 flex items-center justify-center"></i>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Type badge + category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 dark:text-off-white/30 flex items-center gap-1">
            <i className="ri-video-line w-3 h-3 flex items-center justify-center"></i>
            Video
          </span>
          {video.category && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
              {video.category}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-gray-900 dark:text-off-white font-semibold text-sm leading-snug mb-3 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
          {video.title}
        </h3>

        {/* Channel info */}
        {video.channelName && (
          <div className="flex items-center gap-2 mb-3">
            {video.channelAvatar && (
              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-dark-surface">
                <img src={video.channelAvatar} alt={video.channelName} className="w-full h-full object-cover object-top" />
              </div>
            )}
            <span className="text-gray-500 dark:text-off-white/40 text-xs truncate">{video.channelName}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mt-auto text-xs text-gray-400 dark:text-off-white/30">
          <span className="flex items-center gap-1">
            <i className="ri-eye-line w-3 h-3 flex items-center justify-center"></i>
            {formatNumber(video.views)}
          </span>
          {(video.likes ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <i className="ri-thumb-up-line w-3 h-3 flex items-center justify-center"></i>
              {formatNumber(video.likes!)}
            </span>
          )}
          <span className="ml-auto">{formatDate(video.uploadDate)}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
