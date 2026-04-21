import { TrendingVideoItem } from '@/services/youtube';

interface LiveCardProps {
  stream: TrendingVideoIteideoItem;
  rank?: number;
}

const formatViewers = (n: number): string => {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만명`;
  if (n >= 1000) return `${n.toLocaleString()}명`;
  return `${n}명`;
};

const formatSuperChat = (n: number): string => {
  if (n >= 100000) return `₩${(n / 10000).toFixed(0)}만`;
  return `₩${n.toLocaleString()}`;
};

const LiveCard = ({ stream, rank }: LiveCardProps) => {
  return (
    <article className="group cursor-pointer">
      {/* Thumbnail */}
      <div className="relative w-full rounded-lg overflow-hidden bg-gray-200" style={{ aspectRatio: '16/9' }}>
        <img
          src={stream.thumbnail}
          alt={stream.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
        />

        {/* LIVE badge + viewer count */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block"></span>
            방송중
          </span>
          <span className="bg-black/70 text-white text-xs font-semibold px-2 py-0.5 rounded-sm">
            {formatViewers(stream.viewerCount)} 시청중
          </span>
        </div>

        {/* Rank badge */}
        {rank === 1 && (
          <div className="absolute top-2 right-2">
            <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-sm">
              시청자 1위
            </span>
          </div>
        )}

        {/* Super chat badge */}
        {stream.superChatAmount && (
          <div className="absolute bottom-2 right-2">
            <span className="bg-black/70 text-green-400 text-xs font-semibold px-2 py-0.5 rounded-sm">
              $ {stream.superChatAmount.toLocaleString()}
            </span>
          </div>
        )}

        {/* Hover play overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-full backdrop-blur-sm">
            <i className="ri-play-fill text-white text-2xl w-6 h-6 flex items-center justify-center"></i>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex gap-2.5 mt-2.5">
        <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden bg-gray-200">
          <img
            src={stream.channelAvatar}
            alt={stream.channelName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-gray-600 transition-colors">
            {stream.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{stream.channelName}</p>
        </div>
      </div>
    </article>
  );
};

export default LiveCard;
