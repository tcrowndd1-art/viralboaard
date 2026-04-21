import { useState, useRef, useCallback, useEffect } from 'react';
import type { SceneData } from './SceneTimeline';
import TransitionPicker from './TransitionPicker';

const FONTS = ['Inter', 'Montserrat', 'Playfair Display', 'Oswald', 'Bebas Neue', 'Roboto Mono'];
const COLORS = ['#ffffff', '#000000', '#ef4444', '#f59e0b', '#22c55e', '#ec4899', '#a855f7', '#06b6d4'];

interface TextOverlay {
  text: string;
  font: string;
  size: number;
  color: string;
  x: number;
  y: number;
}

interface AudioWaveformProps {
  isPlaying: boolean;
}

const AudioWaveform = ({ isPlaying }: AudioWaveformProps) => {
  const bars = [3, 6, 9, 5, 8, 4, 7, 10, 6, 4, 8, 5, 9, 3, 7, 6, 4, 8, 5, 7, 9, 4, 6, 8, 3, 7, 5, 9, 6, 4];
  return (
    <div className="flex items-center gap-px h-8">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all ${isPlaying ? 'bg-red-500' : 'bg-gray-300 dark:bg-white/20'}`}
          style={{
            height: `${h * 2.5}px`,
            animation: isPlaying ? `pulse 0.8s ease-in-out ${i * 40}ms infinite alternate` : 'none',
          }}
        ></div>
      ))}
    </div>
  );
};

interface SceneEditorProps {
  scene: SceneData;
  onUpdate: (id: string, updates: Partial<SceneData>) => void;
}

type RightTab = 'narration' | 'transition' | 'settings';

const SceneEditor = ({ scene, onUpdate }: SceneEditorProps) => {
  const [overlay, setOverlay] = useState<TextOverlay>({
    text: scene.textOverlay || 'Click to edit text',
    font: 'Montserrat',
    size: 24,
    color: '#ffffff',
    x: 50,
    y: 75,
  });
  const [narration, setNarration] = useState(scene.narration);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [fontOpen, setFontOpen] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>('narration');
  const [savedOverlay, setSavedOverlay] = useState(false);
  const [duration, setDuration] = useState(scene.duration);
  const imageRef = useRef<HTMLDivElement>(null);

  // Cancel TTS and sync when scene changes
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setIsVoicePlaying(false);
    setOverlay((prev) => ({ ...prev, text: scene.textOverlay || prev.text }));
    setNarration(scene.narration);
    setDuration(scene.duration);
  }, [scene.id]);

  // Cancel TTS on unmount
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (editingText) return;
    e.preventDefault();
    setIsDraggingText(true);
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const moveHandler = (me: MouseEvent) => {
      const x = Math.max(5, Math.min(95, ((me.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(5, Math.min(95, ((me.clientY - rect.top) / rect.height) * 100));
      setOverlay((prev) => ({ ...prev, x, y }));
    };
    const upHandler = () => {
      setIsDraggingText(false);
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
    };
    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
  }, [editingText]);

  const handleSaveOverlay = () => {
    onUpdate(scene.id, { textOverlay: overlay.text });
    setSavedOverlay(true);
    setTimeout(() => setSavedOverlay(false), 2000);
  };

  const handleSaveNarration = () => {
    onUpdate(scene.id, { narration });
  };

  const handleSaveDuration = (val: number) => {
    setDuration(val);
    onUpdate(scene.id, { duration: val });
  };

  const handleSaveTransition = (key: string) => {
    onUpdate(scene.id, { transition: key });
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      const variants = [
        `${scene.label}: This is where your story begins. The hook that stops the scroll and makes them stay for every second.`,
        `In this scene, we reveal the core insight that changes everything. Your audience will lean in, captivated by what comes next.`,
        `The moment of truth arrives. Everything you've built to this point converges into a single, powerful message that resonates deeply.`,
      ];
      const newText = variants[Math.floor(Math.random() * variants.length)];
      setNarration(newText);
      onUpdate(scene.id, { narration: newText });
      setIsRegenerating(false);
    }, 1800);
  };

  const rightTabs: { key: RightTab; label: string; icon: string }[] = [
    { key: 'narration', label: 'Narration', icon: 'ri-mic-line' },
    { key: 'transition', label: 'Transition', icon: 'ri-contrast-2-line' },
    { key: 'settings', label: 'Settings', icon: 'ri-settings-3-line' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
      {/* ── Left: Image canvas with text overlay ── */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <i className="ri-image-edit-line text-red-500 w-4 h-4 flex items-center justify-center"></i>
            Scene Canvas
            <span className="text-xs font-normal text-gray-400 dark:text-white/30">— drag text to reposition</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-white/30 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full font-mono">{scene.label}</span>
            {/* Transition badge */}
            <span className="text-xs text-gray-500 dark:text-white/40 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full flex items-center gap-1">
              <i className="ri-contrast-2-line w-3 h-3 flex items-center justify-center"></i>
              {scene.transition}
            </span>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={imageRef}
          className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-surface flex-1"
          style={{ minHeight: '240px', maxHeight: '320px' }}
        >
          <img
            src={scene.thumbnail}
            alt={scene.label}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/10"></div>

          {/* Transition preview overlay */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
            <i className="ri-contrast-2-line text-white/60 text-xs w-3 h-3 flex items-center justify-center"></i>
            <span className="text-xs text-white/70 font-medium capitalize">{scene.transition}</span>
          </div>

          {/* Draggable text overlay */}
          <div
            className={`absolute select-none ${isDraggingText ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
              left: `${overlay.x}%`,
              top: `${overlay.y}%`,
              transform: 'translate(-50%, -50%)',
              fontFamily: overlay.font,
              fontSize: `${overlay.size}px`,
              color: overlay.color,
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              fontWeight: 700,
              lineHeight: 1.2,
              maxWidth: '80%',
              textAlign: 'center',
              zIndex: 10,
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={() => setEditingText(true)}
          >
            {editingText ? (
              <input
                autoFocus
                value={overlay.text}
                onChange={(e) => setOverlay((p) => ({ ...p, text: e.target.value }))}
                onBlur={() => { setEditingText(false); onUpdate(scene.id, { textOverlay: overlay.text }); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { setEditingText(false); onUpdate(scene.id, { textOverlay: overlay.text }); } }}
                className="bg-black/40 text-white outline-none border-b-2 border-red-400 text-center w-full"
                style={{ fontFamily: overlay.font, fontSize: `${overlay.size}px`, color: overlay.color, fontWeight: 700 }}
              />
            ) : (
              overlay.text
            )}
          </div>

          {/* Canvas hint */}
          <div className="absolute bottom-2 right-2 text-xs text-white/40 bg-black/30 px-2 py-1 rounded-lg">
            Double-click text to edit
          </div>
        </div>

        {/* Text overlay tools */}
        <div className="bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 dark:text-off-white/40 uppercase tracking-wider">Text Overlay</p>
            <button
              onClick={handleSaveOverlay}
              className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                savedOverlay
                  ? 'bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30'
                  : 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/20'
              }`}
            >
              <i className={`${savedOverlay ? 'ri-check-line' : 'ri-save-line'} w-3 h-3 flex items-center justify-center`}></i>
              {savedOverlay ? 'Saved!' : 'Save to Scene'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Font selector */}
            <div className="relative">
              <button
                onClick={() => setFontOpen(!fontOpen)}
                className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-700 dark:text-white/70 cursor-pointer hover:border-gray-300 dark:hover:border-white/20 transition-colors whitespace-nowrap"
              >
                <i className="ri-font-size w-3 h-3 flex items-center justify-center"></i>
                <span style={{ fontFamily: overlay.font }}>{overlay.font}</span>
                <i className="ri-arrow-down-s-line w-3 h-3 flex items-center justify-center"></i>
              </button>
              {fontOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setFontOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden z-20">
                    {FONTS.map((f) => (
                      <button
                        key={f}
                        onClick={() => { setOverlay((p) => ({ ...p, font: f })); setFontOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                          overlay.font === f ? 'text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-500/10' : 'text-gray-700 dark:text-white/70'
                        }`}
                        style={{ fontFamily: f }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Size slider */}
            <div className="flex items-center gap-2 flex-1 min-w-[120px]">
              <i className="ri-text-spacing w-3 h-3 flex items-center justify-center text-gray-400 dark:text-white/30 flex-shrink-0"></i>
              <input
                type="range"
                min={12}
                max={64}
                value={overlay.size}
                onChange={(e) => setOverlay((p) => ({ ...p, size: Number(e.target.value) }))}
                className="flex-1 accent-red-500 cursor-pointer"
              />
              <span className="text-xs text-gray-400 dark:text-white/30 font-mono w-8 text-right">{overlay.size}px</span>
            </div>

            {/* Color picker */}
            <div className="flex items-center gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setOverlay((p) => ({ ...p, color: c }))}
                  className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 flex-shrink-0 ${
                    overlay.color === c ? 'border-red-500 scale-110' : 'border-transparent'
                  }`}
                  style={{ background: c, boxShadow: c === '#ffffff' ? 'inset 0 0 0 1px #e5e7eb' : undefined }}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Tabbed panel ── */}
      <div className="w-full lg:w-80 flex flex-col gap-3 flex-shrink-0">
        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
          {rightTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRightTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                rightTab === tab.key
                  ? 'bg-red-500 text-white'
                  : 'text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
              }`}
            >
              <i className={`${tab.icon} w-3 h-3 flex items-center justify-center`}></i>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── NARRATION TAB ── */}
        {rightTab === 'narration' && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <i className="ri-mic-line text-red-500 w-4 h-4 flex items-center justify-center"></i>
                Narration
              </h3>
              <span className="text-xs text-gray-400 dark:text-white/30 font-mono">{narration.split(' ').length}w</span>
            </div>

            <textarea
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              onBlur={handleSaveNarration}
              rows={7}
              className="w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-off-white/80 outline-none resize-none leading-relaxed placeholder-gray-300 dark:placeholder-off-white/20 focus:border-red-400 dark:focus:border-red-500/50 transition-colors"
              placeholder="Write narration for this scene..."
            />

            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 disabled:bg-red-500/50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:cursor-not-allowed"
            >
              {isRegenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0"></div>
                  Regenerating...
                </>
              ) : (
                <>
                  <i className="ri-sparkling-line w-4 h-4 flex items-center justify-center"></i>
                  Regenerate Voice
                </>
              )}
            </button>

            {/* Audio waveform player */}
            <div className="bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider">Voice Preview</span>
                <span className="text-xs text-gray-400 dark:text-white/25 font-mono">{scene.duration}s</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (isVoicePlaying) {
                      window.speechSynthesis?.cancel();
                      setIsVoicePlaying(false);
                    } else {
                      if (!window.speechSynthesis) return;
                      const utt = new SpeechSynthesisUtterance(narration);
                      utt.lang = 'ko-KR';
                      utt.onend = () => setIsVoicePlaying(false);
                      utt.onerror = () => setIsVoicePlaying(false);
                      window.speechSynthesis.speak(utt);
                      setIsVoicePlaying(true);
                    }
                  }}
                  className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 cursor-pointer transition-colors ${
                    isVoicePlaying
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-300 dark:hover:bg-white/15'
                  }`}
                >
                  <i className={`${isVoicePlaying ? 'ri-pause-fill' : 'ri-play-fill'} text-sm`}></i>
                </button>
                <div className="flex-1 overflow-hidden">
                  <AudioWaveform isPlaying={isVoicePlaying} />
                </div>
              </div>
            </div>

            {/* Voice settings */}
            <div className="bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider">Voice Settings</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-white/50">Voice</span>
                <select className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 text-xs rounded-lg px-2 py-1 outline-none cursor-pointer">
                  <option>Nova (Female)</option>
                  <option>Onyx (Male)</option>
                  <option>Shimmer (Female)</option>
                  <option>Echo (Male)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-white/50">Speed</span>
                <div className="flex items-center gap-2">
                  <input type="range" min={0.5} max={2} step={0.1} defaultValue={1} className="w-20 accent-red-500 cursor-pointer" />
                  <span className="text-xs text-gray-400 dark:text-white/30 font-mono w-6">1x</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── TRANSITION TAB ── */}
        {rightTab === 'transition' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <i className="ri-contrast-2-line text-red-500 w-4 h-4 flex items-center justify-center"></i>
                Transition Effect
              </h3>
              <span className="text-xs text-gray-400 dark:text-white/30 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full capitalize">{scene.transition}</span>
            </div>

            <TransitionPicker
              value={scene.transition}
              onChange={handleSaveTransition}
            />

            {/* Apply to all scenes */}
            <div className="mt-1 p-3 bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/8 rounded-xl flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider">Apply Globally</p>
              <p className="text-xs text-gray-400 dark:text-white/30">Set this transition for all scenes at once</p>
              <button
                onClick={() => handleSaveTransition(scene.transition)}
                className="flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-global-line w-3 h-3 flex items-center justify-center"></i>
                Apply to All Scenes
              </button>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {rightTab === 'settings' && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <i className="ri-settings-3-line text-red-500 w-4 h-4 flex items-center justify-center"></i>
              Scene Settings
            </h3>

            {/* Duration */}
            <div className="bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider">Duration</p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={60}
                  value={duration}
                  onChange={(e) => handleSaveDuration(Number(e.target.value))}
                  className="flex-1 accent-red-500 cursor-pointer"
                />
                <span className="text-sm font-bold text-gray-800 dark:text-white font-mono w-10 text-right">{duration}s</span>
              </div>
              <div className="flex gap-2">
                {[3, 5, 10, 15, 20, 30].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSaveDuration(s)}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      duration === s
                        ? 'bg-red-500 text-white'
                        : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 hover:border-gray-300 dark:hover:border-white/20'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>

            {/* Scene label */}
            <div className="bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider">Scene Label</p>
              <input
                type="text"
                defaultValue={scene.label}
                onBlur={(e) => onUpdate(scene.id, { label: e.target.value })}
                className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-white/70 outline-none focus:border-red-400 dark:focus:border-red-500/50 transition-colors"
              />
            </div>

            {/* Color tag */}
            <div className="bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider">Timeline Color</p>
              <div className="flex gap-2 flex-wrap">
                {['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-sky-500', 'bg-purple-500', 'bg-pink-500', 'bg-gray-500'].map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdate(scene.id, { color: c })}
                    className={`w-7 h-7 rounded-full ${c} cursor-pointer transition-transform hover:scale-110 border-2 ${
                      scene.color === c ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'
                    }`}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SceneEditor;
