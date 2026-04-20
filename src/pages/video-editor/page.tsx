import { useState } from 'react';
import { Link } from 'react-router-dom';
import SceneTimeline from './components/SceneTimeline';
import SceneEditor from './components/SceneEditor';
import BottomToolbar from './components/BottomToolbar';
import { useTheme } from '@/hooks/useTheme';
import type { SceneData } from './components/SceneTimeline';

const INITIAL_SCENES: SceneData[] = [
  {
    id: 'hook',
    label: 'Hook',
    duration: 3,
    thumbnail: 'https://readdy.ai/api/search-image?query=extreme%20close-up%20of%20a%20human%20eye%20with%20dramatic%20cinematic%20lighting%2C%20dark%20moody%20background%2C%20high%20contrast%2C%20professional%20photography%2C%20intense%20gaze%2C%20shallow%20depth%20of%20field&width=560&height=315&seq=ve-hook&orientation=landscape',
    textOverlay: 'You\'ve been doing this WRONG',
    narration: 'You\'ve been doing this wrong your entire life. In the next 60 seconds, I\'ll show you the one trick that top creators use to go viral overnight.',
    transition: 'crossfade',
    color: 'bg-red-500',
  },
  {
    id: 'shock',
    label: 'Shock',
    duration: 12,
    thumbnail: 'https://readdy.ai/api/search-image?query=wide%20shot%20of%20person%20standing%20in%20front%20of%20massive%20data%20visualization%20screens%20showing%20YouTube%20analytics%20charts%2C%20dark%20room%20with%20blue%20ambient%20lighting%2C%20cinematic%20composition%2C%20professional%20studio&width=560&height=315&seq=ve-shock&orientation=landscape',
    textOverlay: '95% of channels FAIL',
    narration: '95% of YouTube channels never reach 1,000 subscribers. Not because they lack talent — but because they\'re missing this single psychological trigger that makes viewers stop scrolling instantly.',
    transition: 'slide',
    color: 'bg-orange-500',
  },
  {
    id: 'evidence',
    label: 'Evidence',
    duration: 15,
    thumbnail: 'https://readdy.ai/api/search-image?query=over%20the%20shoulder%20shot%20of%20person%20looking%20at%20multiple%20computer%20monitors%20showing%20YouTube%20growth%20charts%20and%20statistics%2C%20dark%20room%2C%20blue%20screen%20glow%2C%20cinematic%2C%20professional%20photography&width=560&height=315&seq=ve-evidence&orientation=landscape',
    textOverlay: '340% Watch Time Increase',
    narration: 'I tested this on 47 channels across 6 niches. Every single one saw a 340% increase in watch time within 30 days. MrBeast uses it. PewDiePie uses it. And now I\'m going to show you exactly how.',
    transition: 'dissolve',
    color: 'bg-yellow-500',
  },
  {
    id: 'solution',
    label: 'Solution',
    duration: 20,
    thumbnail: 'https://readdy.ai/api/search-image?query=medium%20shot%20of%20confident%20creator%20explaining%20to%20camera%20in%20modern%20studio%2C%20professional%20lighting%20setup%2C%20dark%20background%20with%20subtle%20blue%20accent%20lights%2C%20cinematic%20composition%2C%20high%20quality%20photography&width=560&height=315&seq=ve-solution&orientation=landscape',
    textOverlay: 'The Pattern Interrupt Method',
    narration: 'The Pattern Interrupt Method. In the first 3 seconds, you need a visual or audio break that forces the brain to pay attention. Cut to black for 0.5s, then hit them with your strongest visual.',
    transition: 'crossfade',
    color: 'bg-blue-500',
  },
  {
    id: 'cta',
    label: 'CTA',
    duration: 10,
    thumbnail: 'https://readdy.ai/api/search-image?query=dutch%20angle%20shot%20of%20creator%20pointing%20directly%20at%20camera%20with%20subscribe%20button%20graphic%20overlay%2C%20dramatic%20studio%20lighting%2C%20dark%20background%2C%20cinematic%20composition%2C%20high%20energy%2C%20professional%20photography&width=560&height=315&seq=ve-cta&orientation=landscape',
    textOverlay: 'Subscribe NOW',
    narration: 'Subscribe right now and I\'ll send you the full 47-channel case study for free. Hit the bell so you never miss a growth hack. Drop a comment below!',
    transition: 'zoom',
    color: 'bg-green-500',
  },
];

const VideoEditorPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const [scenes, setScenes] = useState<SceneData[]>(INITIAL_SCENES);
  const [activeId, setActiveId] = useState<string>(INITIAL_SCENES[0].id);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [projectName, setProjectName] = useState('My Video Project');
  const [editingName, setEditingName] = useState(false);
  const [globalTransition, setGlobalTransition] = useState('crossfade');

  const handleGlobalTransitionChange = (key: string) => {
    setGlobalTransition(key);
    setScenes((prev) => prev.map((s) => ({ ...s, transition: key })));
  };

  const activeScene = scenes.find((s) => s.id === activeId) ?? scenes[0];
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  const handleUpdate = (id: string, updates: Partial<SceneData>) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handlePreview = () => {
    setIsPreviewing(true);
    setTimeout(() => setIsPreviewing(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-base text-gray-900 dark:text-off-white transition-colors">
      {/* Top Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card sticky top-0 z-30 transition-colors">
        {/* Left: brand + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/"
            className="font-black text-sm tracking-widest text-gray-900 dark:text-white uppercase hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap hidden sm:block"
          >
            ViralBoard
          </Link>
          <span className="text-gray-300 dark:text-white/20 text-sm hidden sm:block">/</span>
          <div className="flex items-center gap-1.5">
            <i className="ri-scissors-cut-line text-blue-500 text-sm w-4 h-4 flex items-center justify-center"></i>
            <span className="text-sm text-gray-500 dark:text-white/60 whitespace-nowrap hidden sm:block">Quick Video Editor</span>
          </div>
          <span className="text-gray-300 dark:text-white/20 text-sm hidden sm:block">/</span>
          {editingName ? (
            <input
              autoFocus
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
              className="text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 border border-blue-400 rounded px-2 py-0.5 outline-none w-44"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-sm font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1.5 group whitespace-nowrap"
            >
              {projectName}
              <i className="ri-pencil-line text-xs text-gray-300 dark:text-white/20 group-hover:text-blue-500 w-3 h-3 flex items-center justify-center transition-colors"></i>
            </button>
          )}
        </div>

        {/* Center: scene indicator */}
        <div className="hidden md:flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 rounded-xl px-3 py-1.5">
          {scenes.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                activeId === s.id ? 'bg-blue-500 w-4' : 'bg-gray-300 dark:bg-white/20 hover:bg-gray-400 dark:hover:bg-white/40'
              }`}
              title={s.label}
            ></button>
          ))}
          <span className="text-xs text-gray-400 dark:text-white/30 ml-1 font-mono">
            {scenes.findIndex((s) => s.id === activeId) + 1}/{scenes.length}
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Auto-save */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/25">
            <i className="ri-cloud-line w-3 h-3 flex items-center justify-center"></i>
            <span>Saved</span>
          </div>

          {/* Undo/Redo */}
          <div className="hidden md:flex items-center gap-0.5">
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <i className="ri-arrow-go-back-line text-sm"></i>
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <i className="ri-arrow-go-forward-line text-sm"></i>
            </button>
          </div>

          {/* Theme toggle */}
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

          {/* Preview button */}
          <button
            onClick={handlePreview}
            className={`flex items-center gap-2 border text-sm font-medium px-4 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              isPreviewing
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/70 hover:border-gray-400 dark:hover:border-white/35 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-transparent'
            }`}
          >
            {isPreviewing ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-500 rounded-full animate-spin flex-shrink-0"></div>
                Previewing...
              </>
            ) : (
              <>
                <i className="ri-play-circle-line w-4 h-4 flex items-center justify-center"></i>
                Preview
              </>
            )}
          </button>

          {/* Dashboard */}
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-600 dark:text-white hover:text-gray-900 text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap border border-transparent dark:border-white/15"
          >
            <i className="ri-dashboard-line w-3 h-3 flex items-center justify-center"></i>
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Timeline section */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-dark-border px-5 py-4 bg-gray-50 dark:bg-dark-surface transition-colors">
          <SceneTimeline
            scenes={scenes}
            activeId={activeId}
            onSelect={setActiveId}
            onReorder={setScenes}
          />
        </div>

        {/* Scene editor */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Scene nav arrows */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                const idx = scenes.findIndex((s) => s.id === activeId);
                if (idx > 0) setActiveId(scenes[idx - 1].id);
              }}
              disabled={scenes.findIndex((s) => s.id === activeId) === 0}
              className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <i className="ri-arrow-left-s-line w-4 h-4 flex items-center justify-center"></i>
              Prev Scene
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-white/30">Editing:</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-white">{activeScene.label}</span>
              <span className="text-xs text-gray-400 dark:text-white/30 font-mono bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{activeScene.duration}s</span>
            </div>

            <button
              onClick={() => {
                const idx = scenes.findIndex((s) => s.id === activeId);
                if (idx < scenes.length - 1) setActiveId(scenes[idx + 1].id);
              }}
              disabled={scenes.findIndex((s) => s.id === activeId) === scenes.length - 1}
              className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Next Scene
              <i className="ri-arrow-right-s-line w-4 h-4 flex items-center justify-center"></i>
            </button>
          </div>

          <SceneEditor
            key={activeScene.id}
            scene={activeScene}
            onUpdate={handleUpdate}
          />
        </div>

        {/* Bottom toolbar */}
        <BottomToolbar
          totalDuration={totalDuration}
          globalTransition={globalTransition}
          onGlobalTransitionChange={handleGlobalTransitionChange}
        />
      </div>
    </div>
  );
};

export default VideoEditorPage;
