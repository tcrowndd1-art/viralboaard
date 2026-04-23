import type { TrendingVideo } from '../types/trending';

interface Props { video: TrendingVideo; }

export function TrendingCard({ video }: Props) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.video_id}`}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={`trending-card-${video.video_id}`}
      className="block bg-white rounded-lg border hover:shadow-md transition p-3"
    >
      <div className="relative">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full h-40 object-cover rounded mb-2"
          loading="lazy"
        />
      </div>
      <h3 className="font-semibold text-sm line-clamp-2 mb-1">{video.title}</h3>
      <p className="text-xs text-gray-500 mb-1">{video.channel}</p>
      {video.style_tag && (
        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded mb-2">
          {video.style_tag}
        </span>
      )}
      <div className="flex gap-2 text-xs text-gray-600">
        <span>👁 {video.views.toLocaleString()}</span>
        <span>👍 {video.likes.toLocaleString()}</span>
      </div>
    </a>
  );
}
