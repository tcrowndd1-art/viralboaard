import { useState } from 'react';

interface BottomActionBarProps {
  onGenerateAll: () => void;
  isGeneratingAll: boolean;
  scriptContent?: string;
  projectName?: string;
}

const BottomActionBar = ({ onGenerateAll, isGeneratingAll, scriptContent = '', projectName = 'Untitled Project' }: BottomActionBarProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [sendDone, setSendDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportDone(false);

    // Build the full export text
    const header = [
      '═══════════════════════════════════════════',
      `  PROJECT: ${projectName}`,
      `  EXPORTED: ${new Date().toLocaleString()}`,
      `  FORMAT: YouTube Short · 60s · 9:16`,
      '═══════════════════════════════════════════',
      '',
    ].join('\n');

    const content = scriptContent
      ? header + scriptContent
      : header + '[No script content yet — write your script in the Script Editor]';

    // Trigger download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_script.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setIsExporting(false);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 2500);
    }, 600);
  };

  const handleCopyScript = async () => {
    if (!scriptContent) return;
    try {
      await navigator.clipboard.writeText(scriptContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSend = () => {
    if (isSending) return;
    setIsSending(true);
    setSendDone(false);
    setTimeout(() => {
      setIsSending(false);
      setSendDone(true);
      setTimeout(() => setSendDone(false), 2500);
    }, 2800);
  };

  return (
    <div className="flex-shrink-0 border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card px-6 py-4 transition-colors">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: status info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-600 dark:text-white/60">5 scenes ready</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/50">
            <i className="ri-time-line w-3 h-3 flex items-center justify-center"></i>
            <span>~60s total runtime</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/50">
            <i className="ri-image-line w-3 h-3 flex items-center justify-center"></i>
            <span>10 variants (A/B)</span>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Generate All Images */}
          <button
            onClick={onGenerateAll}
            disabled={isGeneratingAll}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:cursor-not-allowed"
          >
            {isGeneratingAll ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <i className="ri-magic-line w-4 h-4 flex items-center justify-center"></i>
                <span>Generate All Images</span>
              </>
            )}
          </button>

          {/* Copy Script */}
          <button
            onClick={handleCopyScript}
            disabled={!scriptContent}
            className={`flex items-center gap-2 border text-sm font-medium px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed ${
              copied
                ? 'border-green-400 dark:border-green-500/60 bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400'
                : 'border-gray-200 dark:border-white/25 hover:border-gray-300 dark:hover:border-white/50 text-gray-700 dark:text-white/85 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-white/8 hover:bg-gray-100 dark:hover:bg-white/12'
            }`}
          >
            <i className={`${copied ? 'ri-check-line' : 'ri-file-copy-line'} w-4 h-4 flex items-center justify-center`}></i>
            <span>{copied ? 'Copied!' : 'Copy Script'}</span>
          </button>

          {/* Export Script .txt */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 border border-gray-200 dark:border-white/25 hover:border-gray-300 dark:hover:border-white/50 text-gray-700 dark:text-white/85 hover:text-gray-900 dark:hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 dark:bg-white/8 hover:bg-gray-100 dark:hover:bg-white/12"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 dark:border-white/20 border-t-gray-600 dark:border-t-white/60 rounded-full animate-spin flex-shrink-0"></div>
                <span>Preparing...</span>
              </>
            ) : exportDone ? (
              <>
                <i className="ri-check-line text-green-500 w-4 h-4 flex items-center justify-center"></i>
                <span className="text-green-500">Downloaded!</span>
              </>
            ) : (
              <>
                <i className="ri-download-2-line w-4 h-4 flex items-center justify-center"></i>
                <span>Export Script (.txt)</span>
              </>
            )}
          </button>

          {/* Send to Video Render */}
          <button
            onClick={handleSend}
            disabled={isSending}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0"></div>
                <span>Sending to Render...</span>
              </>
            ) : sendDone ? (
              <>
                <i className="ri-check-double-line w-4 h-4 flex items-center justify-center"></i>
                <span>Sent to Render!</span>
              </>
            ) : (
              <>
                <i className="ri-video-upload-line w-4 h-4 flex items-center justify-center"></i>
                <span>Send to Video Render</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomActionBar;
