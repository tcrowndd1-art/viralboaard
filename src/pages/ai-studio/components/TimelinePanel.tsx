import { useState, useRef } from 'react';

interface TimelineClip {
  id: string;
  label: string;
  section: string;
  start: number;
  duration: number;
  color: string;
  colorDark: string;
  bg: string;
  bgDark: string;
  icon: string;
  type: 'video' | 'audio' | 'text';
}

const VIDEO_CLIPS: TimelineClip[] = [
  { id: 'hook', label: 'Hook', section: '0–3s', start: 0, duration: 5, color: 'text-red-600', colorDark: 'dark:text-red-400', bg: 'bg-red-500', bgDark: 'dark:bg-red-500', icon: 'ri-flashlight-line', type: 'video' },
  { id: 'shock', label: 'Shock', section: '3–15s', start: 5, duration: 20, color: 'text-orange-600', colorDark: 'dark:text-orange-400', bg: 'bg-orange-500', bgDark: 'dark:bg-orange-500', icon: 'ri-alarm-warning-line', type: 'video' },
  { id: 'evidence', label: 'Evidence', section: '15–30s', start: 25, duration: 25, color: 'text-yellow-600', colorDark: 'dark:text-yellow-400', bg: 'bg-yellow-500', bgDark: 'dark:bg-yellow-500', icon: 'ri-bar-chart-2-line', type: 'video' },
  { id: 'solution', label: 'Solution', section: '30–50s', start: 50, duration: 33, color: 'text-sky-600', colorDark: 'dark:text-sky-400', bg: 'bg-sky-500', bgDark: 'dark:bg-sky-500', icon: 'ri-lightbulb-line', type: 'video' },
  { id: 'cta', label: 'CTA', section: '50–60s', start: 83, duration: 17, color: 'text-green-600', colorDark: 'dark:text-green-400', bg: 'bg-green-500', bgDark: 'dark:bg-green-500', icon: 'ri-cursor-line', type: 'video' },
];

const AUDIO_CLIPS: TimelineClip[] = [
  { id: 'bgm', label: 'Background Music', section: 'Full', start: 0, duration: 100, color: 'text-violet-600', colorDark: 'dark:text-violet-400', bg: 'bg-violet-500', bgDark: 'dark:bg-violet-500', icon: 'ri-music-2-line', type: 'audio' },
  { id: 'sfx1', label: 'SFX — Whoosh', section: '0–3s', start: 0, duration: 5, color: 'text-pink-600', colorDark: 'dark:text-pink-400', bg: 'bg-pink-500', bgDark: 'dark:bg-pink-500', icon: 'ri-sound-module-line', type: 'audio' },
  { id: 'sfx2', label: 'SFX — Impact', section: '3–5s', start: 5, duration: 3, color: 'text-pink-600', colorDark: 'dark:text-pink-400', bg: 'bg-pink-400', bgDark: 'dark:bg-pink-400', icon: 'ri-sound-module-line', type: 'audio' },
];

const TEXT_CLIPS: TimelineClip[] = [
  { id: 'title', label: 'Title Overlay', section: '0–5s', start: 0, duration: 8, color: 'text-cyan-600', colorDark: 'dark:text-cyan-400', bg: 'bg-cyan-500', bgDark: 'dark:bg-cyan-500', icon: 'ri-text', type: 'text' },
  { id: 'sub1', label: 'Subtitle — Hook', section: '0–3s', start: 0, duration: 5, color: 'text-teal-600', colorDark: 'dark:text-teal-400', bg: 'bg-teal-500', bgDark: 'dark:bg-teal-500', icon: 'ri-closed-captioning-line', type: 'text' },
  { id: 'sub2', label: 'Subtitle — CTA', section: '50–60s', start: 83, duration: 17, color: 'text-teal-600', colorDark: 'dark:text-teal-400', bg: 'bg-teal-400', bgDark: 'dark:bg-teal-400', icon: 'ri-closed-captioning-line', type: 'text' },
];

const TICK_MARKS = [0, 10, 20, 30, 40, 50, 60];

const TimelinePanel = () => {
  const [playhead, setPlayhead] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    setPlayhead(Math.round(pct * 60));
  };

  const togglePlay = () => setIsPlaying((p) => !p);

  const renderTrack = (clips: TimelineClip[]) =>
    clips.map((clip) => (
      <div
        key={clip.id}
        onClick={() => setSelectedClip(selectedClip === clip.id ? null : clip.id)}
        className={`absolute top-1 bottom-1 rounded-md cursor-pointer transition-all flex items-center px-2 gap-1 overflow-hidden group ${
          selectedClip === clip.id ? 'ring-2 ring-white/60 brightness-110' : 'hover:brightness-110'
        } ${clip.bg} ${clip.bgDark}`}
        style={{ left: `${clip.start}%`, width: `${clip.duration}%` }}
        title={clip.label}
      >
        <i className={`${clip.icon} text-white text-xs w-3 h-3 flex items-center justify-center flex-shrink-0`}></i>
        <span className="text-white text-xs font-medium truncate whitespace-nowrap">{clip.label}</span>
      </div>
    ));

  const tracks = [
    { label: 'Video', icon: 'ri-film-line', clips: VIDEO_CLIPS, color: 'text-red-500' },
    { label: 'Audio', icon: 'ri-music-2-line', clips: AUDIO_CLIPS, color: 'text-violet-500' },
    { label: 'Text', icon: 'ri-text', clips: TEXT_CLIPS, color: 'text-cyan-500' },
  ];

  const selectedClipData = [...VIDEO_CLIPS, ...AUDIO_CLIPS, ...TEXT_CLIPS].find((c) => c.id === selectedClip);

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <i className="ri-timeline-view text-red-500 w-4 h-4 flex items-center justify-center"></i>
            Timeline Editor
          </h2>
          <p className="text-xs text-gray-500 dark:text-white/55 mt-0.5">60s · 3 tracks · 11 clips</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-white/60">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.5}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-20 accent-red-500 cursor-pointer"
          />
          <span className="text-xs text-gray-600 dark:text-white/65 font-mono w-6">{zoom}x</span>
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3">
        <button
          onClick={() => setPlayhead(0)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 transition-colors cursor-pointer"
        >
          <i className="ri-skip-back-line text-sm"></i>
        </button>
        <button
          onClick={togglePlay}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-400 text-white transition-colors cursor-pointer"
        >
          <i className={`${isPlaying ? 'ri-pause-fill' : 'ri-play-fill'} text-base`}></i>
        </button>
        <button
          onClick={() => setPlayhead(60)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 transition-colors cursor-pointer"
        >
          <i className="ri-skip-forward-line text-sm"></i>
        </button>

        {/* Timecode */}
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-sm font-mono text-gray-900 dark:text-white font-semibold">
            {String(Math.floor(playhead / 60)).padStart(2, '0')}:{String(playhead % 60).padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-500 dark:text-white/55 font-mono">/ 01:00</span>
        </div>

        <div className="flex-1"></div>

        {/* Volume */}
        <div className="hidden sm:flex items-center gap-2">
          <i className="ri-volume-up-line text-gray-500 dark:text-white/60 text-sm w-4 h-4 flex items-center justify-center"></i>
          <input type="range" min={0} max={100} defaultValue={80} className="w-20 accent-red-500 cursor-pointer" />
        </div>

        {/* Snap toggle */}
        <button className="hidden md:flex items-center gap-1.5 text-xs text-gray-600 dark:text-white/65 hover:text-gray-800 dark:hover:text-white px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-focus-3-line w-3 h-3 flex items-center justify-center"></i>
          Snap
        </button>
      </div>

      {/* Timeline tracks */}
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden flex-1">
        {/* Time ruler */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="relative h-8 border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-surface cursor-crosshair select-none"
        >
          {TICK_MARKS.map((t) => (
            <div
              key={t}
              className="absolute top-0 bottom-0 flex flex-col items-center"
              style={{ left: `${(t / 60) * 100}%` }}
            >
              <div className="w-px h-3 bg-gray-300 dark:bg-white/20 mt-1"></div>
              <span className="text-xs text-gray-500 dark:text-white/55 font-mono mt-0.5">{t}s</span>
            </div>
          ))}
          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
            style={{ left: `${(playhead / 60) * 100}%` }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full -translate-x-1/2 -translate-y-0.5"></div>
          </div>
        </div>

        {/* Track rows */}
        {tracks.map((track) => (
          <div key={track.label} className="flex border-b border-gray-100 dark:border-white/5 last:border-b-0">
            {/* Track label */}
            <div className="w-28 flex-shrink-0 flex items-center gap-2 px-3 py-2 border-r border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
              <i className={`${track.icon} ${track.color} text-sm w-4 h-4 flex items-center justify-center`}></i>
              <span className="text-xs font-semibold text-gray-700 dark:text-white/75">{track.label}</span>
            </div>
            {/* Clips area */}
            <div className="flex-1 relative h-12">
              {renderTrack(track.clips)}
              {/* Playhead line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500/40 pointer-events-none z-10"
                style={{ left: `${(playhead / 60) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected clip inspector */}
      {selectedClipData && (
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <i className={`${selectedClipData.icon} ${selectedClipData.color} ${selectedClipData.colorDark} text-sm w-4 h-4 flex items-center justify-center`}></i>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{selectedClipData.label}</h3>
              <span className="text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 px-2 py-0.5 rounded-full capitalize">{selectedClipData.type}</span>
            </div>
            <button
              onClick={() => setSelectedClip(null)}
              className="text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 cursor-pointer w-6 h-6 flex items-center justify-center"
            >
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-white/55 mb-1">Start</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedClipData.section.split('–')[0]}s</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/55 mb-1">Duration</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white">{Math.round(selectedClipData.duration * 0.6)}s</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/55 mb-1">Track</p>
              <p className="text-sm text-gray-900 dark:text-white capitalize">{selectedClipData.type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/55 mb-1">Opacity</p>
              <input type="range" min={0} max={100} defaultValue={100} className="w-full accent-red-500 cursor-pointer mt-1" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelinePanel;
