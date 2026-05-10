import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/services/supabase';
import GlobalSidebar from '@/components/feature/GlobalSidebar';
import TopHeader from '@/pages/home/components/TopHeader';
import { VideoModal } from '@/components/VideoModal';

interface RisingVideo {
  video_id: string;
  title: string;
  channel: string;
  category: string;
  country: string;
  is_shorts: boolean;
  current_views: number;
  previous_views: number;
  view_delta: number;
  hours_diff: number;
  views_per_hour: number;
  thumbnail_url: string;
  fetched_at: string;
  published_at?: string;
}

const COUNTRIES = [
  { code: 'ALL', label: '🌍 전체' },
  { code: 'KR',  label: '🇰🇷 한국' },
  { code: 'US',  label: '🇺🇸 미국' },
  { code: 'BR',  label: '🇧🇷 브라질' },
  { code: 'JP',  label: '🇯🇵 일본' },
  { code: 'IN',  label: '🇮🇳 인도' },
  { code: 'GB',  label: '🇬🇧 영국' },
  { code: 'DE',  label: '🇩🇪 독일' },
  { code: 'FR',  label: '🇫🇷 프랑스' },
  { code: 'ID',  label: '🇮🇩 인도네시아' },
  { code: 'MX',  label: '🇲🇽 멕시코' },
];

const TYPES = [
  { value: 'ALL',     label: '전체' },
  { value: 'LONG',    label: '🎬 Video' },
  { value: 'SHORTS',  label: '⚡ Shorts' },
];

function fmtViews(n: number | null | undefined) {
  if (n == null) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function fmtVph(n: number | null | undefined) {
  if (n == null) return '0/h';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M/h`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K/h`;
  return `${Math.round(n)}/h`;
}

function timeAgo(iso: string | null | undefined) {
  if (!iso) return '-';
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `${h}시간 전`;
  return `${m}분 전`;
}

function pubTimeAgo(iso: string | null | undefined) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return '오늘';
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  if (days < 365) return `${Math.floor(days / 30)}개월 전`;
  return `${Math.floor(days / 365)}년 전`;
}

export default function RisingPage() {
  useTranslation();
  const [videos, setVideos]       = useState<RisingVideo[]>([]);
  const [loading, setLoading]     = useState(true);
  const [country, setCountry]     = useState('ALL');
  const [type, setType]           = useState('ALL');
  const [modalVideo, setModalVideo] = useState<{ videoId: string; isShorts: boolean } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchRising();
  }, [country, type]);

  async function fetchRising() {
    setLoading(true);
    try {
      let query = supabase
        .from('viralboard_rising')
        .select('*')
        .order('views_per_hour', { ascending: false })
        .limit(100);

      if (country !== 'ALL') query = query.eq('country', country);
      if (type === 'SHORTS')  query = query.eq('is_shorts', true);
      if (type === 'LONG')    query = query.eq('is_shorts', false);

      const { data, error } = await query;
      if (error) throw error;
      setVideos(data || []);
      setLastUpdated(new Date().toLocaleTimeString('ko-KR'));
    } catch (e) {
      console.error('[Rising] fetch error', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-base">
      <TopHeader />
      <GlobalSidebar />
      <main className="lg:ml-52 pt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">

          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚀</span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">급상승</h1>
              <span className="text-xs text-gray-400 ml-1">views/hour 기준</span>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-gray-400">{lastUpdated} 기준</span>
              )}
              <button
                onClick={fetchRising}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                🔄 새로고침
              </button>
            </div>
          </div>

          {/* 국가 탭 */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {COUNTRIES.map(c => (
              <button
                key={c.code}
                onClick={() => setCountry(c.code)}
                className={`whitespace-nowrap text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                  country === c.code
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Video/Shorts 탭 */}
          <div className="flex gap-2 mb-6">
            {TYPES.map(tp => (
              <button
                key={tp.value}
                onClick={() => setType(tp.value)}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                  type === tp.value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tp.label}
              </button>
            ))}
          </div>

          {/* 카드 그리드 */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse h-80 md:h-48" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500 text-sm">급상승 영상이 없어요. 잠시 후 다시 확인해주세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {videos.map((v, idx) => (
                <div
                  key={`${v.video_id}-${v.country}`}
                  onClick={() => setModalVideo({ videoId: v.video_id, isShorts: v.is_shorts })}
                  className="group cursor-pointer rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:shadow-lg"
                >
                  {/* 썸네일 */}
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                    {v.thumbnail_url ? (
                      <img
                        src={(v.thumbnail_url ?? '').replace(/\/(hq|mq|sd)default\.jpg/, '/maxresdefault.jpg')}
                        alt={v.title}
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.src.includes('maxresdefault')) img.src = img.src.replace('maxresdefault', 'hqdefault');
                          else if (img.src.includes('hqdefault')) img.src = img.src.replace('hqdefault', 'mqdefault');
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">▶</div>
                    )}
                    {/* 순위 뱃지 */}
                    {idx < 3 && (
                      <div className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-amber-600'
                      }`}>
                        {idx + 1}
                      </div>
                    )}
                    {/* Shorts 뱃지 */}
                    {v.is_shorts && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs md:text-[10px] font-bold px-1.5 py-0.5 rounded">
                        Shorts
                      </div>
                    )}
                    {/* views/hour 뱃지 */}
                    <div className="absolute bottom-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      🚀 {fmtVph(v.views_per_hour)}
                    </div>
                  </div>

                  {/* 정보 */}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 leading-snug">{v.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">{v.channel}</p>

                    {/* G4.1 메타: 모바일 inline + md+ 2x2 grid */}
                    <div className="flex md:hidden items-center gap-2 text-xs mb-1.5">
                      <span className="font-bold text-gray-700 dark:text-gray-200">👁 {fmtViews((v as any).views ?? v.current_views ?? 0)}</span>
                      {v.view_delta > 0 && <span className="text-emerald-500 font-semibold">+{fmtViews(v.view_delta)}</span>}
                    </div>
                    <div className="hidden md:grid grid-cols-2 gap-x-2 gap-y-0.5 mb-1.5 border-l-2 border-gray-100 dark:border-gray-800 pl-2">
                      <span className="text-[11px] text-gray-600 dark:text-gray-300 font-mono inline-flex items-center gap-1"><i className="ri-eye-line text-[12px] text-sky-500"></i>{fmtViews((v as any).views ?? v.current_views ?? 0)}</span>
                      <span className="text-[11px] text-gray-600 dark:text-gray-300 font-mono inline-flex items-center gap-1"><i className="ri-chat-3-line text-[12px] text-emerald-500"></i>{fmtViews((v as any).comments ?? 0)}</span>
                      <span className="text-[11px] text-gray-600 dark:text-gray-300 font-mono inline-flex items-center gap-1"><i className="ri-user-line text-[12px] text-amber-500"></i>{fmtViews((v as any).subscriber_count ?? 0)}</span>
                      {v.view_delta > 0 && (
                        <span className="text-[11px] text-emerald-500 font-mono inline-flex items-center gap-1"><i className="ri-arrow-up-line text-[12px]"></i>{fmtViews(v.view_delta)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {v.published_at ? (
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">📅 {pubTimeAgo(v.published_at)}</span>
                      ) : (
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">{timeAgo(v.fetched_at)}</span>
                      )}
                      <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">{v.category}</span>
                      <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">{v.country}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {modalVideo && (
        <VideoModal
          videoId={modalVideo.videoId}
          isShorts={modalVideo.isShorts}
          onClose={() => setModalVideo(null)}
          isSaved={false}
          onToggleSave={() => {}}
        />
      )}
    </div>
  );
}