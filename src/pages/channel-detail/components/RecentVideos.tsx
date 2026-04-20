import { recentVideos } from '@/mocks/channelDetail';

const formatViews = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M views';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K views';
  return n + ' views';
};

const timeAgo = (d: string) => {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  return `${Math.floor(diff / 30)} months ago`;
};

const RecentVideos = () => {
  return (
    <div className="bg-[#181818] border border-white/10 rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Recent Videos</h3>
        <span className="text-xs text-white/30">{recentVideos.length} videos</span>
      </div>
      <div className="divide-y divide-white/5">
        {recentVideos.map((video) => (
          <div key={video.videoId} className="flex gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors cursor-pointer group">
            {/* Thumbnail */}
            <div className="relative flex-shrink-0 w-32 h-[72px] rounded-lg overflow-hidden bg-white/10">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {/* Duration badge */}
              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded font-mono">
                {video.duration}
              </span>
              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                <i className="ri-play-fill text-white text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium leading-snug line-clamp-2 group-hover:text-red-400 transition-colors mb-2">
                {video.title}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-white/50 font-mono">{formatViews(video.views)}</span>
                <span className="text-white/20 text-xs">·</span>
                <span className="text-xs text-white/30">{timeAgo(video.uploadDate)}</span>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 flex items-center">
              <i className="ri-arrow-right-s-line text-white/20 group-hover:text-white/50 transition-colors w-5 h-5 flex items-center justify-center"></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentVideos;
