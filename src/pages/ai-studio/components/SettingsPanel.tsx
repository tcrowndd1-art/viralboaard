import { useState } from 'react';

const SettingsPanel = () => {
  const [format, setFormat] = useState('short');
  const [style, setStyle] = useState('cinematic');
  const [aiModel, setAiModel] = useState('v2');
  const [resolution, setResolution] = useState('1080');
  const [fps, setFps] = useState('30');
  const [autoSave, setAutoSave] = useState(true);
  const [watermark, setWatermark] = useState(false);
  const [bgMusic, setBgMusic] = useState(true);
  const [musicVolume, setMusicVolume] = useState(40);
  const [voiceVolume, setVoiceVolume] = useState(85);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${value ? 'bg-red-500' : 'bg-gray-200 dark:bg-white/15'}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`}
      ></span>
    </button>
  );

  const SectionTitle = ({ icon, title }: { icon: string; title: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <i className={`${icon} text-red-500 text-sm w-4 h-4 flex items-center justify-center`}></i>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <i className="ri-settings-3-line text-red-500 w-4 h-4 flex items-center justify-center"></i>
            Project Settings
          </h2>
          <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">Configure your video project</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-red-500 hover:bg-red-400 text-white'
          }`}
        >
          {saved ? (
            <><i className="ri-check-line w-4 h-4 flex items-center justify-center"></i>Saved!</>
          ) : (
            <><i className="ri-save-line w-4 h-4 flex items-center justify-center"></i>Save Settings</>
          )}
        </button>
      </div>

      {/* Video Format */}
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-5">
        <SectionTitle icon="ri-film-line" title="Video Format" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 dark:text-white/40 mb-2 block font-medium">Content Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'short', label: 'Short · 60s', icon: 'ri-smartphone-line' },
                { key: 'long', label: 'Long · 10m+', icon: 'ri-tv-2-line' },
                { key: 'reel', label: 'Reel · 30s', icon: 'ri-instagram-line' },
                { key: 'ad', label: 'Ad · 15s', icon: 'ri-advertisement-line' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFormat(f.key)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                    format === f.key
                      ? 'border-red-400 bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400'
                      : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 hover:border-gray-300 dark:hover:border-white/20'
                  }`}
                >
                  <i className={`${f.icon} w-3 h-3 flex items-center justify-center`}></i>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-white/40 mb-2 block font-medium">Resolution</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-white/80 outline-none cursor-pointer"
              >
                <option value="4k">4K (3840×2160)</option>
                <option value="1080">1080p (1920×1080)</option>
                <option value="720">720p (1280×720)</option>
                <option value="vertical">Vertical 9:16 (1080×1920)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-white/40 mb-2 block font-medium">Frame Rate</label>
              <div className="flex gap-2">
                {['24', '30', '60'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFps(f)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-mono font-semibold cursor-pointer transition-all whitespace-nowrap ${
                      fps === f
                        ? 'border-red-400 bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400'
                        : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 hover:border-gray-300 dark:hover:border-white/20'
                    }`}
                  >
                    {f} fps
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Style */}
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-5">
        <SectionTitle icon="ri-palette-line" title="Visual Style" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { key: 'cinematic', label: 'Cinematic Dark', color: 'from-gray-900 to-gray-700' },
            { key: 'vibrant', label: 'Vibrant Pop', color: 'from-orange-500 to-red-500' },
            { key: 'minimal', label: 'Clean Minimal', color: 'from-gray-100 to-white' },
            { key: 'neon', label: 'Neon Glow', color: 'from-violet-900 to-cyan-900' },
            { key: 'warm', label: 'Warm Tone', color: 'from-amber-700 to-orange-600' },
            { key: 'cold', label: 'Cold Steel', color: 'from-slate-700 to-slate-500' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setStyle(s.key)}
              className={`flex flex-col items-start gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                style === s.key
                  ? 'border-red-400 ring-1 ring-red-400/30'
                  : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
              }`}
            >
              <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${s.color}`}></div>
              <span className={`text-xs font-medium ${style === s.key ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-white/60'}`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Model */}
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-5">
        <SectionTitle icon="ri-robot-line" title="AI Model" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: 'v1', label: 'ViralBoard v1', desc: 'Fast · Basic quality', badge: '' },
            { key: 'v2', label: 'ViralBoard v2.1', desc: 'Balanced · Recommended', badge: 'Default' },
            { key: 'v3', label: 'ViralBoard v3 Pro', desc: 'Slow · Highest quality', badge: 'New' },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setAiModel(m.key)}
              className={`flex flex-col items-start gap-1.5 p-4 rounded-xl border cursor-pointer transition-all text-left ${
                aiModel === m.key
                  ? 'border-red-400 bg-red-50 dark:bg-red-500/10'
                  : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <span className={`text-sm font-semibold ${aiModel === m.key ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white/80'}`}>
                  {m.label}
                </span>
                {m.badge && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    m.badge === 'New' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/40'
                  }`}>{m.badge}</span>
                )}
              </div>
              <p className="text-xs text-gray-400 dark:text-white/30">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Audio Settings */}
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-5">
        <SectionTitle icon="ri-volume-up-line" title="Audio Settings" />
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-white/80 font-medium">Background Music</p>
              <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">Auto-generate ambient music</p>
            </div>
            <Toggle value={bgMusic} onChange={setBgMusic} />
          </div>
          {bgMusic && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-500 dark:text-white/40 font-medium">Music Volume</label>
                <span className="text-xs font-mono text-gray-600 dark:text-white/60">{musicVolume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={musicVolume}
                onChange={(e) => setMusicVolume(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500 dark:text-white/40 font-medium">Voice Volume</label>
              <span className="text-xs font-mono text-gray-600 dark:text-white/60">{voiceVolume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={voiceVolume}
              onChange={(e) => setVoiceVolume(Number(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Export & Misc */}
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-5">
        <SectionTitle icon="ri-download-2-line" title="Export & Misc" />
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-white/80 font-medium">Auto-save</p>
              <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">Save project every 2 minutes</p>
            </div>
            <Toggle value={autoSave} onChange={setAutoSave} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-white/80 font-medium">ViralBoard Watermark</p>
              <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">Add watermark to exported video</p>
            </div>
            <Toggle value={watermark} onChange={setWatermark} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
