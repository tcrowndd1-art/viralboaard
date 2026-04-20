import { topLives } from '@/mocks/playboardData';
import type { TrendingVideoItem } from '@/services/youtube';

interface Props {
  items?: TrendingVideoItem[];
}

const TopLivesWidget = ({ items }: Props) => {
  const data = items && items.length > 0 ? items : topLives;

  return (
    <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-sm overflow-hidden transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top Lives</h3>
          <div className="flex items-center gap-1.5">
            <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-sm">ONAIR</span>
            <span className="text-sm font-mono font-semibold text-gray-800 dark:text-white/80">83,219</span>
          </div>
        </div>
        <button className="text-xs text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 cursor-pointer whitespace-nowrap transition-colors">View more</button>
      </div>

      {/* Scrollable list */}
      <div className="overflow-x-auto">
        <div className="flex gap-3 px-4 py-3" style={{ minWidth: 'max-content' }}>
          {data.map((item) => (
            <div key={item.rank} className="w-44 flex-shrink-0 cursor-pointer group">
              <div className="relative w-44 h-24 bg-gray-100 dark:bg-white/10 rounded overflow-hidden mb-2">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover object-top group-hover:opacity-90 transition-opacity"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                  {item.rank}
                </span>
              </div>
              <p className="text-xs text-gray-800 dark:text-white/80 font-medium leading-snug line-clamp-2 mb-1">{item.title}</p>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">{item.score}</p>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-100 dark:bg-white/10 flex-shrink-0">
                  <img
                    src={item.channelAvatar}
                    alt={item.channelName}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-white/40 truncate">{item.channelName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* More button */}
      <div className="border-t border-gray-100 dark:border-white/10 px-4 py-2 text-center">
        <button className="text-xs text-gray-400 dark:text-white/25 hover:text-gray-600 dark:hover:text-white/50 cursor-pointer transition-colors">• • •</button>
      </div>
    </div>
  );
};

export default TopLivesWidget;
