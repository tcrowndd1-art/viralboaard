import { useEffect, useRef, useState } from 'react';

/* ─── Channel popup data ─── */
export interface ChannelPopupData {
  type: 'channel';
  monthlyRevenueMin: number;
  monthlyRevenueMax: number;
  avgCpm: number;
  monthlyViewTrend: number;
  topHookType: string;
  sparkline?: number[];
}

/* ─── Video popup data ─── */
export interface VideoPopupData {
  type: 'video';
  revenueMin: number;
  revenueMax: number;
  cpm: number;
  viewToSubRatio: number;
  engagementRate: number;
  hookType: string;
  sparkline?: number[];
}

export type PopupData = ChannelPopupData | VideoPopupData;

interface HoverPopupProps {
  data: PopupData;
  anchorRect: DOMRect | null;
  visible: boolean;
}

const fmt = (n: number): string => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};

const HOOK_COLORS: Record<string, string> = {
  'Question Hook': 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'Shock Statement': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'Story Hook': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'How-To Hook': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Controversy Hook': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'List Hook': 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  'Challenge Hook': 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'Curiosity Gap': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
};

/* ─── Mini Sparkline SVG ─── */
interface SparklineProps {
  data: number[];
  color: string;
  fillColor: string;
  width?: number;
  height?: number;
}

const Sparkline = ({ data, color, fillColor, width = 220, height = 40 }: SparklineProps) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });

  const polyline = pts.join(' ');
  const lastPt = pts[pts.length - 1].split(',');
  const lastX = parseFloat(lastPt[0]);
  const lastY = parseFloat(lastPt[1]);

  // Area fill path
  const areaPath = `M0,${height} L${pts.join(' L')} L${width},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {/* Area fill */}
      <path d={areaPath} fill={fillColor} opacity="0.15" />
      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Last point dot */}
      <circle cx={lastX} cy={lastY} r="3" fill={color} />
    </svg>
  );
};

const ChannelCard = ({ data }: { data: ChannelPopupData }) => {
  const isPositive = data.monthlyViewTrend >= 0;
  const sparkColor = isPositive ? '#22c55e' : '#ef4444';
  const sparkFill = isPositive ? '#22c55e' : '#ef4444';

  return (
    <div className="flex flex-col gap-3">
      {/* Sparkline chart */}
      {data.sparkline && data.sparkline.length > 1 && (
        <div className="rounded-lg bg-gray-50 dark:bg-white/4 px-2 pt-2 pb-1 overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-gray-400 dark:text-white/30 font-medium uppercase tracking-wider">12-Month View Trend</span>
            <span className={`text-[10px] font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{data.monthlyViewTrend.toFixed(1)}%
            </span>
          </div>
          <Sparkline data={data.sparkline} color={sparkColor} fillColor={sparkFill} width={220} height={36} />
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-gray-300 dark:text-white/20">Apr '25</span>
            <span className="text-[9px] text-gray-300 dark:text-white/20">Apr '26</span>
          </div>
        </div>
      )}

      {/* Monthly Revenue */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <i className="ri-money-dollar-circle-line text-green-500 text-sm w-4 h-4 flex items-center justify-center"></i>
          <span className="text-xs text-gray-500 dark:text-white/40 font-medium">Est. Monthly Revenue</span>
        </div>
        <span className="text-sm font-bold text-green-600 dark:text-green-400">
          {fmt(data.monthlyRevenueMin)} – {fmt(data.monthlyRevenueMax)}
        </span>
      </div>

      {/* Avg CPM */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <i className="ri-price-tag-3-line text-amber-500 text-sm w-4 h-4 flex items-center justify-center"></i>
          <span className="text-xs text-gray-500 dark:text-white/40 font-medium">Average CPM</span>
        </div>
        <span className="text-sm font-semibold text-gray-800 dark:text-white/80">${data.avgCpm.toFixed(2)}</span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-white/10"></div>

      {/* Top Hook Type */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <i className="ri-flashlight-line text-amber-500 text-sm w-4 h-4 flex items-center justify-center"></i>
          <span className="text-xs text-gray-500 dark:text-white/40 font-medium">Top Hook Type</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${HOOK_COLORS[data.topHookType] ?? 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/60'}`}>
          {data.topHookType}
        </span>
      </div>
    </div>
  );
};

const VideoCard = ({ data }: { data: VideoPopupData }) => {
  const isPositive = data.engagementRate >= 0.03;
  const sparkColor = isPositive ? '#22c55e' : '#f59e0b';
  const sparkFill = isPositive ? '#22c55e' : '#f59e0b';

  return (
    <div className="flex flex-col gap-3">
      {/* Sparkline */}
      {data.sparkline && data.sparkline.length > 1 && (
        <div className="rounded-lg bg-gray-50 dark:bg-white/4 px-2 pt-2 pb-1 overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-gray-400 dark:text-white/30 font-medium uppercase tracking-wider">Daily Views (30d)</span>
            <span className={`text-[10px] font-bold ${sparkColor === '#22c55e' ? 'text-green-500' : 'text-amber-500'}`}>
              {(data.engagementRate * 100).toFixed(1)}% eng.
            </span>
          </div>
          <Sparkline data={data.sparkline} color={sparkColor} fillColor={sparkFill} width={220} height={36} />
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-gray-300 dark:text-white/20">Day 1</span>
            <span className="text-[9px] text-gray-300 dark:text-white/20">Day 30</span>
          </div>
        </div>
      )}

      {/* Estimated Revenue */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <i className="ri-money-dollar-circle-line text-green-500 text-sm w-4 h-4 flex items-center justify-center"></i>
          <span className="text-xs text-gray-500 dark:text-white/40 font-medium">Est. Revenue</span>
        </div>
        <span className="text-sm font-bold text-green-600 dark:text-green-400">
          ${data.revenueMin.toLocaleString()} – ${data.revenueMax.toLocaleString()}
        </span>
      </div>

      {/* CPM */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <i className="ri-price-tag-3-line text-amber-500 text-sm w-4 h-4 flex items-center justify-center"></i>
          <span className="text-xs text-gray-500 dark:text-white/40 font-medium">Est. CPM (Niche)</span>
        </div>
        <span className="text-sm font-semibold text-gray-800 dark:text-white/80">${data.cpm.toFixed(2)}</span>
      </div>

      {/* View-to-Sub Ratio */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <i className="ri-user-line text-gray-400 dark:text-white/30 text-sm w-4 h-4 flex items-center justify-center"></i>
          <span className="text-xs text-gray-500 dark:text-white/40 font-medium">View / Sub Ratio</span>
        </div>
        <span className="text-sm font-semibold text-gray-800 dark:text-white/80">{(data.viewToSubRatio * 100).toFixed(1)}%</span>
      </div>

      {/* Engagement Rate */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <i className="ri-heart-line text-rose-400 text-sm w-4 h-4 flex items-center justify-center"></i>
          <span className="text-xs text-gray-500 dark:text-white/40 font-medium">Engagement Rate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-400 rounded-full"
              style={{ width: `${Math.min(100, data.engagementRate * 1000)}%` }}
            ></div>
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-white/80">{(data.engagementRate * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-white/10"></div>

      {/* Hook Type */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <i className="ri-flashlight-line text-amber-500 text-sm w-4 h-4 flex items-center justify-center"></i>
          <span className="text-xs text-gray-500 dark:text-white/40 font-medium">Hook Type</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${HOOK_COLORS[data.hookType] ?? 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/60'}`}>
          {data.hookType}
        </span>
      </div>
    </div>
  );
};

/* ─── Main HoverPopup ─── */
const SIDEBAR_WIDTH = 208;

const HoverPopup = ({ data, anchorRect, visible }: HoverPopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchorRect || !popupRef.current) return;
    const popup = popupRef.current;
    const popW = popup.offsetWidth || 280;
    const popH = popup.offsetHeight || 280;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const GAP = 10;

    let left = anchorRect.right + GAP;
    if (left + popW > vw - 12) {
      left = anchorRect.left - popW - GAP;
    }
    if (left < SIDEBAR_WIDTH + 8) {
      left = anchorRect.right + GAP;
    }

    let top = anchorRect.top + anchorRect.height / 2 - popH / 2;
    top = Math.max(8, Math.min(top, vh - popH - 8));

    setPos({ top, left });
  }, [anchorRect, visible]);

  if (!visible || !anchorRect) return null;

  return (
    <div
      ref={popupRef}
      className="fixed z-[9999] w-72 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 pointer-events-none"
      style={{
        top: pos.top,
        left: pos.left,
        boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        animation: 'fadeInScale 0.15s ease-out',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-3 pb-2.5 border-b border-gray-100 dark:border-white/10">
        <i className="ri-bar-chart-box-line text-red-500 dark:text-red-400 text-sm w-4 h-4 flex items-center justify-center"></i>
        <span className="text-xs font-bold text-gray-700 dark:text-white/70 uppercase tracking-wider">
          {data.type === 'channel' ? 'Channel Insights' : 'Video Insights'}
        </span>
        <span className="ml-auto text-xs text-gray-300 dark:text-white/20 font-medium">AI Est.</span>
      </div>

      {data.type === 'channel' ? (
        <ChannelCard data={data} />
      ) : (
        <VideoCard data={data} />
      )}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default HoverPopup;
