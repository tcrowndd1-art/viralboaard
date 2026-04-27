import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';

interface VideoModalProps {
  videoId: string;
  isShorts: boolean;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (videoId: string) => void;
}

interface VideoMeta {
  title: string;
  channel: string;
  channelAvatar: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
  subscriberCount: number;
}

const fmt = (n: number): string => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

const timeAgo = (iso: string): string => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return '오늘';
  if (days === 1) return '1일 전';
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  if (days < 365) return `${Math.floor(days / 30)}개월 전`;
  return `${Math.floor(days / 365)}년 전`;
};

export function VideoModal({ videoId, isShorts, onClose, isSaved = false, onToggleSave }: VideoModalProps) {
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('viralboard_data')
        .select('title,channel,channel_thumbnail_url,views,likes,comments,published_at,subscriber_count')
        .eq('video_id', videoId)
        .limit(1);
      if (cancelled || !data || data.length === 0) return;
      const v = data[0] as any;
      setMeta({
        title: v.title ?? '',
        channel: v.channel ?? '',
        channelAvatar: v.channel_thumbnail_url ?? '',
        views: v.views ?? 0,
        likes: v.likes ?? 0,
        comments: v.comments ?? 0,
        publishedAt: v.published_at ?? '',
        subscriberCount: v.subscriber_count ?? 0,
      });
    })();
    return () => { cancelled = true; };
  }, [videoId]);

  const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  const containerClass = isShorts ? 'max-w-sm' : 'max-w-4xl';
  const aspectClass = isShorts ? 'aspect-[9/16]' : 'aspect-video';

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(ytUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard denied — open in new tab as fallback
      window.open(ytUrl, '_blank', 'noopener');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${containerClass} my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white text-2xl cursor-pointer"
          aria-label="Close"
        >✕</button>

        <div className={`${aspectClass} w-full`}>
          <iframe
            src={embedUrl}
            className="w-full h-full rounded-lg"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>

        {meta && (
          <div className="mt-3 bg-white dark:bg-[#181818] rounded-lg p-4 text-gray-900 dark:text-white">
            <h3 className="text-[15px] font-bold line-clamp-2 mb-2">{meta.title}</h3>

            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                {meta.channelAvatar ? (
                  <img src={meta.channelAvatar} alt={meta.channel} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-white/10 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold truncate">{meta.channel}</p>
                  {meta.subscriberCount > 0 && (
                    <p className="text-[11px] text-gray-500 dark:text-white/50">구독자 {fmt(meta.subscriberCount)}</p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {onToggleSave && (
                  <button
                    onClick={() => onToggleSave(videoId)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/15'
                    }`}
                  >
                    <i className={isSaved ? 'ri-bookmark-fill' : 'ri-bookmark-line'}></i>
                    {isSaved ? '저장됨' : '저장'}
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors cursor-pointer"
                >
                  <i className={copied ? 'ri-check-line text-green-500' : 'ri-share-line'}></i>
                  {copied ? '복사됨' : '공유'}
                </button>
                <a
                  href={ytUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <i className="ri-youtube-line"></i>
                  YouTube
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 rounded-full px-3 py-1.5 text-[12px] font-semibold">
                <i className="ri-eye-line"></i>
                {fmt(meta.views)}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 rounded-full px-3 py-1.5 text-[12px] font-semibold">
                <i className="ri-thumb-up-line"></i>
                {fmt(meta.likes)}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 rounded-full px-3 py-1.5 text-[12px] font-semibold">
                <i className="ri-chat-3-line"></i>
                {fmt(meta.comments)}
              </span>
              {meta.publishedAt && (
                <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 rounded-full px-3 py-1.5 text-[12px] text-gray-500 dark:text-white/50">
                  <i className="ri-time-line"></i>
                  {timeAgo(meta.publishedAt)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
