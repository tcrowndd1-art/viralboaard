import { useState } from 'react';

export const TRANSITIONS = [
  { key: 'crossfade', label: 'Crossfade', duration: '0.3s', icon: 'ri-contrast-2-line', description: 'Smooth blend between scenes' },
  { key: 'slide', label: 'Slide', duration: '0.4s', icon: 'ri-arrow-right-line', description: 'Slide from right to left' },
  { key: 'dissolve', label: 'Dissolve', duration: '0.5s', icon: 'ri-drop-line', description: 'Gradual pixel dissolve' },
  { key: 'zoom', label: 'Zoom In', duration: '0.3s', icon: 'ri-zoom-in-line', description: 'Zoom into next scene' },
  { key: 'wipe', label: 'Wipe', duration: '0.4s', icon: 'ri-layout-right-2-line', description: 'Horizontal wipe transition' },
  { key: 'flash', label: 'Flash', duration: '0.2s', icon: 'ri-flashlight-line', description: 'White flash cut' },
  { key: 'none', label: 'Cut', duration: '0s', icon: 'ri-scissors-cut-line', description: 'Hard cut, no transition' },
];

interface TransitionPickerProps {
  value: string;
  onChange: (key: string) => void;
  compact?: boolean;
}

const TransitionPicker = ({ value, onChange, compact = false }: TransitionPickerProps) => {
  const [open, setOpen] = useState(false);
  const selected = TRANSITIONS.find((t) => t.key === value) ?? TRANSITIONS[0];

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/8 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 dark:text-white/70 cursor-pointer transition-colors whitespace-nowrap"
        >
          <i className={`${selected.icon} w-3 h-3 flex items-center justify-center`}></i>
          <span>{selected.label}</span>
          <span className="text-gray-400 dark:text-white/30 font-mono">{selected.duration}</span>
          <i className="ri-arrow-down-s-line w-3 h-3 flex items-center justify-center text-gray-400 dark:text-white/30"></i>
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <div className="absolute bottom-full left-0 mb-1.5 w-52 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden z-30">
              {TRANSITIONS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { onChange(t.key); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                    value === t.key ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 font-semibold' : 'text-gray-700 dark:text-white/70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <i className={`${t.icon} w-3 h-3 flex items-center justify-center`}></i>
                    {t.label}
                  </div>
                  <span className="text-gray-400 dark:text-white/30 font-mono">{t.duration}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider">Transition Effect</p>
      <div className="grid grid-cols-2 gap-1.5">
        {TRANSITIONS.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all text-left ${
              value === t.key
                ? 'border-red-400 dark:border-red-500/60 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold'
                : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/3 text-gray-600 dark:text-white/60 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <i className={`${t.icon} w-3.5 h-3.5 flex items-center justify-center flex-shrink-0`}></i>
            <div className="min-w-0">
              <div className="font-medium truncate">{t.label}</div>
              <div className="text-gray-400 dark:text-white/25 font-mono text-[10px]">{t.duration}</div>
            </div>
          </button>
        ))}
      </div>
      {/* Preview animation hint */}
      <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-gray-50 dark:bg-white/3 rounded-lg border border-gray-100 dark:border-white/5">
        <i className="ri-information-line text-gray-400 dark:text-white/25 w-3 h-3 flex items-center justify-center flex-shrink-0"></i>
        <p className="text-xs text-gray-400 dark:text-white/30">{selected.description} · {selected.duration}</p>
      </div>
    </div>
  );
};

export default TransitionPicker;
