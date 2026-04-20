import { useState } from 'react';
import TransitionPicker from './TransitionPicker';

interface BottomToolbarProps {
  totalDuration: number;
  globalTransition?: string;
  onGlobalTransitionChange?: (key: string) => void;
}

const BottomToolbar = ({ totalDuration, globalTransition = 'crossfade', onGlobalTransitionChange }: BottomToolbarProps) => {
  const [bgmName, setBgmName] = useState<string | null>(null);
  const [bgmVolume, setBgmVolume] = useState(40);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderDone, setRenderDone] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const handleBgmDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setBgmName(file.name);
    }
  };

  const handleBgmInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setBgmName(file.name);
  };

  const handleRender = () => {
    if (isRendering) return;
    setIsRendering(true);
    setRenderDone(false);
    setTimeout(() => {
      setIsRendering(false);
      setRenderDone(true);
      setTimeout(() => setRenderDone(false), 3000);
    }, 3200);
  };

  const handleExport = () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportDone(false);
    setTimeout(() => {
      setIsExporting(false);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    }, 2000);
  };

  const mins = Math.floor(totalDuration / 60);
  const secs = totalDuration % 60;
  const durationStr = `${mins}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="flex-shrink-0 border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-base px-5 py-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

        {/* Left group */}
        <div className="flex flex-wrap items-center gap-4 flex-1">

          {/* Global Transition picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-white/30 whitespace-nowrap font-medium">Global Transition:</span>
            <TransitionPicker
              value={globalTransition}
              onChange={(key) => onGlobalTransitionChange?.(key)}
              compact
            />
          </div>

          {/* BGM upload */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-white/30 whitespace-nowrap font-medium">BGM:</span>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleBgmDrop}
              className={`relative flex items-center gap-2 border rounded-lg px-3 py-1.5 transition-colors ${
                isDragOver
                  ? 'border-red-400 bg-red-50 dark:bg-red-500/10'
                  : bgmName
                  ? 'border-green-300 dark:border-green-500/30 bg-green-50 dark:bg-green-500/5'
                  : 'border-dashed border-gray-300 dark:border-white/15 hover:border-gray-400 dark:hover:border-white/25'
              }`}
            >
              <input
                type="file"
                accept="audio/*"
                onChange={handleBgmInput}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {bgmName ? (
                <>
                  <i className="ri-music-2-line text-green-500 dark:text-green-400 text-xs w-3 h-3 flex items-center justify-center flex-shrink-0"></i>
                  <span className="text-xs text-gray-600 dark:text-white/60 max-w-[100px] truncate">{bgmName}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setBgmName(null); }}
                    className="text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 cursor-pointer w-3 h-3 flex items-center justify-center flex-shrink-0 z-10"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </button>
                </>
              ) : (
                <>
                  <i className="ri-upload-2-line text-gray-400 dark:text-white/30 text-xs w-3 h-3 flex items-center justify-center"></i>
                  <span className="text-xs text-gray-400 dark:text-white/30 whitespace-nowrap">Drop audio or click</span>
                </>
              )}
            </div>

            {bgmName && (
              <div className="flex items-center gap-1.5">
                <i className="ri-volume-down-line text-gray-400 dark:text-white/30 text-xs w-3 h-3 flex items-center justify-center"></i>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={bgmVolume}
                  onChange={(e) => setBgmVolume(Number(e.target.value))}
                  className="w-20 accent-red-500 cursor-pointer"
                />
                <span className="text-xs text-gray-400 dark:text-white/30 font-mono w-7">{bgmVolume}%</span>
              </div>
            )}
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-lg px-3 py-1.5">
            <i className="ri-time-line text-gray-400 dark:text-white/30 text-xs w-3 h-3 flex items-center justify-center"></i>
            <span className="text-xs text-gray-500 dark:text-white/40">Duration</span>
            <span className="text-xs font-bold text-gray-800 dark:text-white font-mono">{durationStr}</span>
          </div>
        </div>

        {/* Right group: action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Render MP4 */}
          <button
            onClick={handleRender}
            disabled={isRendering}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-400 disabled:bg-red-500/50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:cursor-not-allowed"
          >
            {isRendering ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0"></div>
                Rendering...
              </>
            ) : renderDone ? (
              <>
                <i className="ri-check-line w-4 h-4 flex items-center justify-center"></i>
                MP4 Ready!
              </>
            ) : (
              <>
                <i className="ri-video-download-line w-4 h-4 flex items-center justify-center"></i>
                Render MP4
              </>
            )}
          </button>

          {/* Export to CapCut */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 border border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/35 text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap bg-white dark:bg-transparent disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 dark:border-white/20 border-t-gray-600 dark:border-t-white/60 rounded-full animate-spin flex-shrink-0"></div>
                Exporting...
              </>
            ) : exportDone ? (
              <>
                <i className="ri-check-line text-green-500 w-4 h-4 flex items-center justify-center"></i>
                <span className="text-green-500">Exported!</span>
              </>
            ) : (
              <>
                <i className="ri-export-line w-4 h-4 flex items-center justify-center"></i>
                Export to CapCut
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomToolbar;
