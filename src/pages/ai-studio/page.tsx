import { useState } from 'react';
import { Link } from 'react-router-dom';
import ScriptEditor from './components/ScriptEditor';
import ScenePreviewGrid from './components/ScenePreviewGrid';
import BottomActionBar from './components/BottomActionBar';
import TimelinePanel from './components/TimelinePanel';
import SettingsPanel from './components/SettingsPanel';
import { useTheme } from '@/hooks/useTheme';

type ActiveMode = 'storyboard' | 'timeline' | 'settings';

const AiStudioPage = () => {
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [editingName, setEditingName] = useState(false);
  const [activePanel, setActivePanel] = useState<'script' | 'preview'>('script');
  const [activeMode, setActiveMode] = useState<ActiveMode>('storyboard');
  const [scriptContent, setScriptContent] = useState('');
  const [topic, setTopic] = useState('');
  const { isDark, toggleTheme } = useTheme();

  const handleGenerateAll = () => {
    if (isGeneratingAll) return;
    setIsGeneratingAll(true);
    setTimeout(() => setIsGeneratingAll(false), 3500);
  };

  const modeTabs: { key: ActiveMode; label: string; icon: string }[] = [
    { key: 'storyboard', label: 'Storyboard', icon: 'ri-layout-column-line' },
    { key: 'timeline', label: 'Timeline', icon: 'ri-timeline-view' },
    { key: 'settings', label: 'Settings', icon: 'ri-settings-3-line' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-base text-gray-900 dark:text-white transition-colors">

      {/* ── Top bar — matches Video Editor header exactly ── */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card sticky top-0 z-30 transition-colors gap-2">

        {/* Left: brand + breadcrumb */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
          <Link
            to="/"
            className="font-black text-sm tracking-widest text-gray-900 dark:text-white uppercase hover:text-red-500 transition-colors whitespace-nowrap hidden sm:block"
          >
            ViralBoard
          </Link>
          <span className="text-gray-300 dark:text-white/20 text-sm hidden sm:block">/</span>
          <div className="flex items-center gap-1.5">
            <i className="ri-film-ai-line text-red-500 text-sm w-4 h-4 flex items-center justify-center"></i>
            <span className="text-sm text-gray-500 dark:text-white/60 hidden sm:block">AI Studio</span>
          </div>
          <span className="text-gray-300 dark:text-white/20 text-sm hidden sm:block">/</span>
          {editingName ? (
            <input
              autoFocus
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
              className="text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 border border-red-400 rounded px-2 py-0.5 outline-none w-32 md:w-40"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-sm font-semibold text-gray-800 dark:text-white hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1 group whitespace-nowrap min-h-[44px]"
            >
              <span className="truncate max-w-[100px] md:max-w-none">{projectName}</span>
              <i className="ri-pencil-line text-xs text-gray-300 dark:text-white/20 group-hover:text-red-400 w-3 h-3 flex items-center justify-center transition-colors"></i>
            </button>
          )}
        </div>

        {/* Center: mode tabs */}
        <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1 flex-shrink-0">
          {modeTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveMode(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all min-h-[36px] ${
                activeMode === tab.key
                  ? 'bg-red-500 text-white'
                  : 'text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 font-medium'
              }`}
            >
              <i className={`${tab.icon} w-3 h-3 flex items-center justify-center`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: actions — identical to Video Editor */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/25">
            <i className="ri-cloud-line w-3 h-3 flex items-center justify-center"></i>
            <span>Auto-saved</span>
          </div>

          <div className="hidden md:flex items-center gap-0.5">
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <i className="ri-arrow-go-back-line text-sm"></i>
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <i className="ri-arrow-go-forward-line text-sm"></i>
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <i className="ri-sun-line text-base"></i>
            ) : (
              <i className="ri-moon-line text-base"></i>
            )}
          </button>

          <button className="hidden sm:flex items-center gap-1.5 border border-gray-300 dark:border-white/20 text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white text-xs px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap bg-white dark:bg-transparent hover:border-gray-400 dark:hover:border-white/35">
            <i className="ri-share-line w-4 h-4 flex items-center justify-center"></i>
            Share
          </button>

          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-600 dark:text-white hover:text-gray-900 text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap border border-transparent dark:border-white/15"
          >
            <i className="ri-dashboard-line w-3 h-3 flex items-center justify-center"></i>
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Sub-header: project meta — matches Video Editor's timeline section style */}
      <div className="flex-shrink-0 flex items-center gap-3 md:gap-4 px-5 py-2 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface transition-colors overflow-x-auto">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-400 dark:text-white/25">Format:</span>
          <span className="text-xs text-gray-600 dark:text-white/60 font-medium whitespace-nowrap">YouTube Short · 60s · 9:16</span>
        </div>
        <div className="w-px h-3 bg-gray-200 dark:bg-white/10 flex-shrink-0"></div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-400 dark:text-white/25">Style:</span>
          <span className="text-xs text-gray-600 dark:text-white/60 font-medium whitespace-nowrap">Cinematic Dark</span>
        </div>
        <div className="w-px h-3 bg-gray-200 dark:bg-white/10 flex-shrink-0 hidden sm:block"></div>
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-400 dark:text-white/25">AI Model:</span>
          <span className="text-xs text-red-500 font-medium whitespace-nowrap">ViralBoard v2.1</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-gray-400 dark:text-white/30 whitespace-nowrap">AI Ready</span>
        </div>
      </div>

      {/* ── Mobile panel switcher (Storyboard only) ── */}
      {activeMode === 'storyboard' && (
        <div className="md:hidden flex border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card flex-shrink-0">
          <button
            onClick={() => setActivePanel('script')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors min-h-[44px] cursor-pointer ${
              activePanel === 'script'
                ? 'text-red-600 dark:text-white border-b-2 border-red-500'
                : 'text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60'
            }`}
          >
            <i className="ri-file-text-line w-4 h-4 flex items-center justify-center"></i>
            Script
          </button>
          <button
            onClick={() => setActivePanel('preview')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors min-h-[44px] cursor-pointer ${
              activePanel === 'preview'
                ? 'text-red-600 dark:text-white border-b-2 border-red-500'
                : 'text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60'
            }`}
          >
            <i className="ri-layout-grid-line w-4 h-4 flex items-center justify-center"></i>
            Scenes
          </button>
        </div>
      )}

      {/* ── Main workspace ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* ── STORYBOARD MODE ── */}
        {activeMode === 'storyboard' && (
          <>
            {/* Left panel: Script Editor */}
            <div
              className={`
                flex flex-col border-b md:border-b-0 md:border-r border-gray-200 dark:border-dark-border
                bg-white dark:bg-dark-card transition-colors overflow-hidden
                md:w-[420px] md:flex-shrink-0
                ${activePanel === 'script' ? 'flex' : 'hidden md:flex'}
              `}
              style={{ minHeight: 0 }}
            >
              <div className="flex-1 overflow-y-auto px-4 md:px-5 py-4 md:py-5">
                <ScriptEditor
                topic={topic}
                onTopicChange={setTopic}
                onScriptChange={setScriptContent}
              />
              </div>
            </div>

            {/* Right panel: Scene Preview */}
            <div
              className={`
                flex-1 flex flex-col bg-gray-50 dark:bg-dark-surface transition-colors overflow-hidden
                ${activePanel === 'preview' ? 'flex' : 'hidden md:flex'}
              `}
              style={{ minHeight: 0 }}
            >
              <div className="flex-1 overflow-y-auto px-4 md:px-5 py-4 md:py-5">
                <ScenePreviewGrid generatingAll={isGeneratingAll} topic={topic} />
              </div>
            </div>
          </>
        )}

        {/* ── TIMELINE MODE ── */}
        {activeMode === 'timeline' && (
          <div className="flex-1 flex flex-col bg-gray-50 dark:bg-dark-surface overflow-hidden" style={{ minHeight: 0 }}>
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
              <TimelinePanel />
            </div>
          </div>
        )}

        {/* ── SETTINGS MODE ── */}
        {activeMode === 'settings' && (
          <div className="flex-1 flex flex-col bg-gray-50 dark:bg-dark-surface overflow-hidden" style={{ minHeight: 0 }}>
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
              <SettingsPanel />
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <BottomActionBar
        onGenerateAll={handleGenerateAll}
        isGeneratingAll={isGeneratingAll}
        scriptContent={scriptContent}
        projectName={projectName}
      />
    </div>
  );
};

export default AiStudioPage;
