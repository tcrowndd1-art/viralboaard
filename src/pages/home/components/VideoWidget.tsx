import { useState } from 'react';

interface VideoItem {
  rank: number;
  title: string;
  score: string;
  thumbnail: string;
  channelName: string;
  channelAvatar: string;
  videoId: string;
}

interface VideoWidgetProps {
  title: string;
  items: VideoItem[];
}

const VideoWidget = ({ title, items }: VideoWidgetProps) => {
  const [period, setPeriod] = useState<'Daily' | 'Weekly'>('Daily');

  return (
    <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-sm overflow-hidden transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
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
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="divide-y divide-gray-50 dark:divide-white/5">
        {items.map((item) => (
          <div key={item.rank} className="flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer transition-colors" onClick={() => window.open(`https://www.youtube.com/watch?v=${item.videoId}`, '_blank')}>
            {/* Thumbnail */}
            <div className="relative flex-shrink-0 w-24 h-14 bg-gray-100 dark:bg-white/10 rounded overflow-hidden">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover object-top"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                {item.rank}
              </span>
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-800 dark:text-white/80 font-medium leading-snug line-clamp-2 mb-1">{item.title}</p>
              <p className="text-xs text-green-600 dark:text-green-400 font-mono font-medium mb-1">{item.score}</p>
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

export default VideoWidget;
