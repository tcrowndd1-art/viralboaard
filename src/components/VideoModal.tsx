import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { fetchYouTubeComments } from '@/utils/ytComments';
import type { Comment } from '@/utils/ytComments';

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
  const [activeTab, setActiveTab] = useState<'info' | 'comments'>('info');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentsDisabled, setCommentsDisabled] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    setMeta(null);
    setActiveTab('info');
    setComments([]);
    setCommentsError(null);
    setCommentsDisabled(false);
    (async () => {
      const { data } = await supabase
        .from('viralboard_data')
        .select('title,channel,channel_thumbnail_url,views,likes,comments,published_at,subscriber_count')
        .eq('video_id', videoId)
        .limit(1);
      if (cancelled || !data || data.length === 0) return;
      const v = data[0] as any;
      setMeta({
        title: v?.title ?? '',
        channel: v?.channel ?? '',
        channelAvatar: v?.channel_thumbnail_url ?? '',
        views: v?.views ?? 0,
        likes: v?.likes ?? 0,
        comments: v?.comments ?? 0,
        publishedAt: v?.published_at ?? '',
        subscriberCount: v?.subscriber_count ?? 0,
      });
    })();
    return () => { cancelled = true; };
  }, [videoId]);

  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const result = await fetchYouTubeComments(videoId);
      if (!result.ok) {
        if (result.disabled) setCommentsDisabled(true);
        else setCommentsError(result.error);
        return;
      }
      setComments(result.comments);
    } catch {
      setCommentsError('댓글을 불러올 수 없습니다');
    } finally {
      setCommentsLoading(false);
    }
  }, [videoId]);

  const handleTabChange = (tab: 'info' | 'comments') => {
    setActiveTab(tab);
    if (tab === 'comments' && comments.length === 0 && !commentsLoading && !commentsDisabled) {
      fetchComments();
    }
  };

  const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

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

  const tabsBar = (
    <div className="flex border-b border-gray-200 dark:border-dark-border flex-shrink-0">
      {(['info', 'comments'] as const).map(tab => (
        <button
          key={tab}
          onClick={() => handleTabChange(tab)}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === tab
              ? 'text-gray-900 dark:text-off-white border-b-2 border-gray-900 dark:border-white -mb-px'
              : 'text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60'
          }`}
        >
          {tab === 'info' ? '📊 영상 정보' : '💬 댓글'}
        </button>
      ))}
    </div>
  );

  const infoContent = (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 flex-wrap">
        {meta?.channelAvatar && (
          <img src={meta.channelAvatar} alt={meta.channel} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
        )}
        <span>{meta?.channel ?? ''}</span>
        {meta?.publishedAt && (
          <>
            <span>·</span>
            <span>{timeAgo(meta.publishedAt)} 업로드</span>
          </>
        )}
      </div>
      {meta && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 dark:bg-dark-card rounded-lg p-3">
              <p className="text-xs text-gray-400 dark:text-white/30 mb-1">조회수</p>
              <p className="text-lg font-bold text-gray-900 dark:text-off-white">{fmt(meta.views)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-dark-card rounded-lg p-3">
              <p className="text-xs text-gray-400 dark:text-white/30 mb-1">구독자</p>
              <p className="text-lg font-bold text-gray-900 dark:text-off-white">{fmt(meta.subscriberCount)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 rounded-full px-3 py-1.5 text-xs">
              👍 {fmt(meta.likes)}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 rounded-full px-3 py-1.5 text-xs">
              💬 {fmt(meta.comments)}
            </span>
          </div>
        </>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {onToggleSave && (
          <button
            onClick={() => onToggleSave(videoId)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors cursor-pointer"
        >
          <i className={copied ? 'ri-check-line text-green-500' : 'ri-share-line'}></i>
          {copied ? '복사됨' : '공유'}
        </button>
        <a
          href={ytUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          <i className="ri-youtube-line"></i>
          YouTube
        </a>
      </div>
    </div>
  );

  const commentsContent = (
    <div className="p-4">
      {commentsLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-gray-200 dark:border-white/20 border-t-red-500 rounded-full animate-spin" />
        </div>
      )}
      {commentsDisabled && (
        <div className="text-center py-12 text-gray-400 dark:text-white/30 text-sm">
          댓글이 비활성화된 영상입니다
        </div>
      )}
      {commentsError && !commentsDisabled && (
        <div className="text-center py-12 text-red-400 dark:text-red-500/60 text-sm">{commentsError}</div>
      )}
      {!commentsLoading && !commentsDisabled && !commentsError && (
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-white/30 text-sm">댓글이 없습니다</div>
          ) : (
            comments.map((c, i) => (
              <div key={i} className="flex gap-2.5">
                <img
                  src={c.authorProfileImageUrl}
                  alt={c.author}
                  className="w-7 h-7 rounded-full flex-shrink-0 object-cover bg-gray-100 dark:bg-dark-card"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-gray-700 dark:text-white/70 truncate">{c.author}</span>
                    {c.likeCount > 0 && (
                      <span className="text-[10px] text-gray-400 dark:text-white/30 flex items-center gap-0.5 flex-shrink-0">
                        <i className="ri-thumb-up-line text-[9px]"></i>
                        {c.likeCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-white/60 leading-relaxed whitespace-pre-line">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  if (isShorts) {
    return (
      <div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div className="relative w-full max-w-sm my-auto" onClick={e => e.stopPropagation()}>
          <button onClick={onClose} className="absolute -top-10 right-0 text-white text-2xl cursor-pointer" aria-label="Close">
            ✕
          </button>
          <div className="aspect-[9/16] w-full">
            <iframe src={embedUrl} className="w-full h-full rounded-t-lg" allow="autoplay; encrypted-media" allowFullScreen />
          </div>
          <div className="bg-white dark:bg-dark-base rounded-b-lg border border-t-0 border-gray-200 dark:border-dark-border overflow-hidden">
            {tabsBar}
            <div className="max-h-64 overflow-y-auto">
              {activeTab === 'info' ? infoContent : commentsContent}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dark-base rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-dark-border flex-shrink-0">
          <h2 className="text-sm font-bold text-gray-900 dark:text-off-white truncate flex-1 mr-4 leading-snug">
            {meta?.title ?? '...'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
          >
            <i className="ri-close-line text-lg text-gray-500 dark:text-white/50"></i>
          </button>
        </div>

        {/* Body: left video + right panel */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Left: video */}
          <div className="md:w-[55%] bg-black flex-shrink-0 flex items-center justify-center">
            <div className="w-full aspect-video">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Right: tabs panel */}
          <div className="md:w-[45%] flex flex-col min-h-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-dark-border">
            {tabsBar}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'info' ? infoContent : commentsContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
