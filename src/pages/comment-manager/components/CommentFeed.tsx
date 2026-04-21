import { useState } from 'react';
import type { Comment, Platform, Sentiment } from '@/mocks/commentManager';

const PLATFORM_META: Record<Platform, { icon: string; color: string; label: string }> = {
  youtube: { icon: 'ri-youtube-line', color: 'text-red-500 dark:text-red-400', label: 'YouTube' },
  tiktok: { icon: 'ri-tiktok-line', color: 'text-pink-500 dark:text-pink-400', label: 'TikTok' },
  instagram: { icon: 'ri-instagram-line', color: 'text-orange-500 dark:text-orange-400', label: 'Instagram' },
  facebook: { icon: 'ri-facebook-line', color: 'text-blue-500 dark:text-blue-400', label: 'Facebook' },
};

const SENTIMENT_META: Record<Sentiment, { emoji: string; color: string; bg: string; label: string }> = {
  positive: {
    emoji: '😄',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/25',
    label: 'Positive',
  },
  neutral: {
    emoji: '😐',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/25',
    label: 'Neutral',
  },
  negative: {
    emoji: '😠',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/25',
    label: 'Negative',
  },
};

const timeAgo = (ts: string): string => {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'Just now';
};

interface CommentCardProps {
  comment: Comment;
  onApprove: (id: string) => void;
  onSkip: (id: string) => void;
  onEdit: (id: string, newReply: string) => void;
}

const CommentCard = ({ comment, onApprove, onSkip, onEdit }: CommentCardProps) => {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.aiReply);
  const [imgError, setImgError] = useState(false);

  const platform = PLATFORM_META[comment.platform];
  const sentiment = SENTIMENT_META[comment.sentiment];

  const handleApprove = () => {
    if (editing) {
      onEdit(comment.id, editText);
      setEditing(false);
    }
    onApprove(comment.id);
  };

  const handleEdit = () => {
    if (editing) {
      onEdit(comment.id, editText);
      setEditing(false);
    } else {
      setEditing(true);
    }
  };

  if (comment.status === 'approved') {
    return (
      <div className="rounded-xl border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/5 px-5 py-4 flex items-center gap-3 opacity-70">
        <i className="ri-check-double-line text-green-500 dark:text-green-400 text-lg w-5 h-5 flex items-center justify-center flex-shrink-0"></i>
        <div className="flex-1 min-w-0">
          <span className="text-sm text-gray-600 dark:text-white/50 font-medium">@{comment.username}</span>
          <span className="text-xs text-gray-400 dark:text-white/25 ml-2">Reply approved &amp; sent</span>
        </div>
        <span className="text-xs text-green-600 dark:text-green-400 font-medium whitespace-nowrap">Approved</span>
      </div>
    );
  }

  if (comment.status === 'skipped') {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card px-5 py-4 flex items-center gap-3 opacity-50">
        <i className="ri-skip-forward-line text-gray-400 dark:text-white/30 text-lg w-5 h-5 flex items-center justify-center flex-shrink-0"></i>
        <div className="flex-1 min-w-0">
          <span className="text-sm text-gray-500 dark:text-white/40 font-medium">@{comment.username}</span>
          <span className="text-xs text-gray-400 dark:text-white/20 ml-2">Skipped</span>
        </div>
        <span className="text-xs text-gray-400 dark:text-white/25 whitespace-nowrap">Skipped</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-border bg-white dark:bg-dark-card transition-all overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-white/5">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 flex-shrink-0 bg-gray-100 dark:bg-white/5">
          {imgError ? (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-white/30 text-sm font-bold">
              {comment.username.charAt(0).toUpperCase()}
            </div>
          ) : (
            <img
              src={comment.avatar}
              alt={comment.username}
              className="w-full h-full object-cover object-top"
              onError={() => setImgError(true)}
            />
          )}
        </div>

        {/* User info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">@{comment.username}</span>
            <span className={`flex items-center gap-1 text-xs ${platform.color}`}>
              <i className={`${platform.icon} w-3 h-3 flex items-center justify-center`}></i>
              {platform.label}
            </span>
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${sentiment.bg} ${sentiment.color}`}>
              {sentiment.emoji} {sentiment.label} · {comment.sentimentScore}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400 dark:text-white/25">{timeAgo(comment.timestamp)}</span>
            <span className="text-gray-200 dark:text-white/15 text-xs">·</span>
            <span className="text-xs text-gray-400 dark:text-white/25 truncate">{comment.videoTitle}</span>
            <span className="text-gray-200 dark:text-white/15 text-xs">·</span>
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-white/25">
              <i className="ri-thumb-up-line w-3 h-3 flex items-center justify-center"></i>
              {comment.likes}
            </span>
          </div>
        </div>
      </div>

      {/* Comment body */}
      <div className="px-5 py-3">
        <div className="mb-3">
          <p className="text-xs text-gray-400 dark:text-white/30 font-medium uppercase tracking-wider mb-1.5">Original Comment</p>
          <p className="text-sm text-gray-700 dark:text-white/75 leading-relaxed">{comment.text}</p>
        </div>

        {/* AI Reply */}
        <div className="rounded-lg border border-sky-200 dark:border-blue-500/30 bg-sky-50 dark:bg-blue-500/5 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-robot-line text-sky-500 dark:text-blue-400 text-xs w-3 h-3 flex items-center justify-center"></i>
            <span className="text-xs text-sky-600 dark:text-blue-400 font-semibold">AI Suggested Reply</span>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 dark:bg-blue-500 animate-pulse"></div>
              <span className="text-xs text-sky-400 dark:text-blue-400/60">Generated</span>
            </div>
          </div>
          {editing ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={4}
              className="w-full bg-transparent text-sm text-gray-700 dark:text-white/80 outline-none resize-none leading-relaxed placeholder-gray-300 dark:placeholder-white/20"
              autoFocus
            />
          ) : (
            <p className="text-sm text-gray-700 dark:text-white/80 leading-relaxed">{editText}</p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 px-5 pb-4">
        <button
          onClick={handleApprove}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-check-line w-3 h-3 flex items-center justify-center"></i>
          {editing ? 'Save & Approve' : 'Approve'}
        </button>

        <button
          onClick={handleEdit}
          className={`flex items-center gap-1.5 border text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            editing
              ? 'border-sky-300 dark:border-blue-500/50 text-sky-600 dark:text-blue-400 bg-sky-50 dark:bg-blue-500/10 hover:bg-sky-100 dark:hover:bg-blue-500/20'
              : 'border-gray-200 dark:border-white/20 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/40 bg-transparent'
          }`}
        >
          <i className={`${editing ? 'ri-save-line' : 'ri-edit-line'} w-3 h-3 flex items-center justify-center`}></i>
          {editing ? 'Save Draft' : 'Edit Reply'}
        </button>

        <button
          onClick={() => onSkip(comment.id)}
          className="flex items-center gap-1.5 text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60 text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap hover:bg-gray-100 dark:hover:bg-white/5"
        >
          <i className="ri-skip-forward-line w-3 h-3 flex items-center justify-center"></i>
          Skip
        </button>

        {editing && (
          <span className="ml-auto text-xs text-gray-400 dark:text-white/25 font-mono">{editText.length} chars</span>
        )}
      </div>
    </div>
  );
};

interface CommentFeedProps {
  comments: Comment[];
  onApprove: (id: string) => void;
  onSkip: (id: string) => void;
  onEdit: (id: string, newReply: string) => void;
}

const CommentFeed = ({ comments, onApprove, onSkip, onEdit }: CommentFeedProps) => {
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-card mb-4">
          <i className="ri-chat-check-line text-gray-300 dark:text-white/20 text-2xl"></i>
        </div>
        <p className="text-sm text-gray-500 dark:text-white/40 font-medium">No comments match your filters</p>
        <p className="text-xs text-gray-400 dark:text-white/20 mt-1">Try adjusting the platform or sentiment filter</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          onApprove={onApprove}
          onSkip={onSkip}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

export default CommentFeed;
