import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Eye, Video, X, Sparkles } from 'lucide-react';
import type { ChannelResult, VideoResult } from '@/services/youtube';
import { analyzeChannelGrowth, type ChannelAnalysis } from '@/services/openrouter';

interface Props {
  channel: ChannelResult;
  videos: VideoResult[];
  onClose: () => void;
}

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const ANALYSIS_LABELS: { key: keyof Omit<ChannelAnalysis, 'copyStrategy'>; label: string }[] = [
  { key: 'hookPattern', label: '훅 패턴' },
  { key: 'thumbnailStrategy', label: '썸네일 전략' },
  { key: 'uploadPattern', label: '업로드 패턴' },
  { key: 'growthFormula', label: '성장 공식' },
];

const ChannelSearchResult = ({ channel, videos, onClose }: Props) => {
  const navigate = useNavigate();
  const [aiResult, setAiResult] = useState<ChannelAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  useEffect(() => {
    setAiResult(null);
    setAiError(false);
    setAiLoading(true);
    analyzeChannelGrowth({
      name: channel.name,
      subscribers: channel.subscribers,
      totalViews: channel.totalViews,
      videoCount: channel.videoCount,
      description: channel.description,
      recentVideoTitles: videos.map((v) => v.title),
      recentUploadDates: videos.map((v) => v.uploadDate),
    })
      .then((result) => {
        setAiResult(result);
      })
      .catch((err) => {
        console.error('[AI Analysis] 에러:', err);
        setAiError(true);
      })
      .finally(() => {
        setAiLoading(false);
      });
  }, [channel.id]);

  return (
    <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-sm mx-4 mt-4 transition-colors">
      {/* Channel header */}
      <div className="flex items-start gap-4 p-4 border-b border-gray-100 dark:border-white/10">
        <img
          src={channel.avatar || undefined}
          alt={channel.name}
          className="w-16 h-16 rounded-full object-cover flex-shrink-0 bg-gray-100 dark:bg-white/10"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">{channel.name}</h2>
            <span className="text-xs text-gray-400 dark:text-white/40">{channel.handle}</span>
            {channel.country && (
              <span className="text-xs text-gray-400 dark:text-white/40">{channel.country}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-white/40 mt-1 line-clamp-2">{channel.description}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white/60 transition-colors"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-white/10 border-b border-gray-100 dark:border-white/10">
        <div className="flex flex-col items-center py-3 gap-1">
          <div className="flex items-center gap-1 text-gray-400 dark:text-white/40">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs">구독자</span>
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{fmt(channel.subscribers)}</span>
        </div>
        <div className="flex flex-col items-center py-3 gap-1">
          <div className="flex items-center gap-1 text-gray-400 dark:text-white/40">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-xs">총 조회수</span>
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{fmt(channel.totalViews)}</span>
        </div>
        <div className="flex flex-col items-center py-3 gap-1">
          <div className="flex items-center gap-1 text-gray-400 dark:text-white/40">
            <Video className="w-3.5 h-3.5" />
            <span className="text-xs">영상 수</span>
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{fmt(channel.videoCount)}</span>
        </div>
      </div>

      {/* AI Analysis card */}
      <div className="mx-4 my-4 p-3 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-sm">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          <span className="text-xs font-semibold text-gray-700 dark:text-white/70">AI 채널 분석</span>
        </div>

        {aiLoading && (
          <div className="space-y-2.5">
            <div className="text-xs text-gray-500 dark:text-white/50 mb-2 animate-pulse">AI 분석 중...</div>
            {[90, 75, 85, 70, 80].map((w, i) => (
              <div key={i} className="space-y-1">
                <div className="h-2.5 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded animate-pulse" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        )}

        {aiError && (
          <p className="text-xs text-red-500 font-medium">OpenRouter API 키를 확인해주세요.</p>
        )}

        {!aiLoading && !aiError && aiResult && (
          <div className="space-y-3">
            {ANALYSIS_LABELS.map(({ key, label }) => (
              <div key={key}>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">{label}</span>
                <p className="text-xs text-gray-700 dark:text-white/70 mt-0.5">{aiResult[key]}</p>
              </div>
            ))}
            <div>
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">복제 전략</span>
              <ul className="mt-0.5 space-y-0.5">
                {aiResult.copyStrategy.map((line, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700 dark:text-white/70">
                    <span className="text-red-400 font-bold flex-shrink-0">{i + 1}.</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                const params = new URLSearchParams({
                  topic: `${channel.name} 스타일 분석`,
                  channel: channel.name,
                  hook: aiResult.hookPattern,
                  growth: aiResult.growthFormula,
                });
                navigate(`/ai-studio?${params.toString()}`);
              }}
              className="w-full mt-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-2 rounded transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              대본 재창작
            </button>
          </div>
        )}
      </div>

      {/* Recent videos */}
      {videos.length > 0 && (
        <div className="px-4 pb-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wide mb-3">
            최근 영상
          </h3>
          <div className="space-y-3">
            {videos.map((v) => (
              <a
                key={v.videoId}
                href={`https://www.youtube.com/watch?v=${v.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <div className="relative flex-shrink-0 w-24 h-[54px] rounded overflow-hidden bg-gray-100 dark:bg-white/10">
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                  <span className="absolute bottom-1 right-1 text-[10px] font-medium bg-black/80 text-white px-1 rounded">
                    {v.duration}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-red-500 transition-colors">
                    {v.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 dark:text-white/40">
                    <span>{fmt(v.views)} views</span>
                    <span>·</span>
                    <span>{v.uploadDate}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelSearchResult;
