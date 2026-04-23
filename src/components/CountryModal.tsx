import { useRef, useEffect, useState } from 'react';

export const COUNTRY_FLAG: Record<string, string> = {
  KR: '🇰🇷', US: '🇺🇸', JP: '🇯🇵', BR: '🇧🇷',
};

export const SUPPORTED_COUNTRIES = ['KR', 'US', 'JP', 'BR'] as const;

const COUNTRY_LABEL_KO: Record<string, string> = {
  KR: '대한민국', US: '미국', JP: '일본', BR: '브라질',
};
const COUNTRY_LABEL_EN: Record<string, string> = {
  KR: 'South Korea', US: 'United States', JP: 'Japan', BR: 'Brazil',
};

export const COUNTRY_STORAGE_KEY = 'viralboard_country';

export const loadCountry = (): string => {
  try {
    const v = localStorage.getItem(COUNTRY_STORAGE_KEY);
    if (v && (SUPPORTED_COUNTRIES as readonly string[]).includes(v)) return v;
  } catch { /* ignore */ }
  return 'KR';
};

export const saveCountry = (code: string) => {
  try { localStorage.setItem(COUNTRY_STORAGE_KEY, code); } catch { /* ignore */ }
};

/* ── Legacy CountryModal (fullscreen overlay) — kept for backward compat ── */
interface CountryModalProps {
  open: boolean;
  current: string;
  onSelect: (code: string) => void;
  onClose: () => void;
  isKo?: boolean;
}

export const CountryModal = ({ open, current, onSelect, onClose, isKo = true }: CountryModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  if (!open) return null;

  const handlePick = (code: string) => {
    saveCountry(code);
    onSelect(code);
    onClose();
  };

  const LABEL = isKo ? COUNTRY_LABEL_KO : COUNTRY_LABEL_EN;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-[#161616] rounded-2xl shadow-2xl w-[320px] max-w-[90vw] overflow-hidden border border-gray-100 dark:border-white/[0.08]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <i className="ri-global-line text-sm text-gray-500 dark:text-white/50"></i>
            <span className="text-[13px] font-black text-gray-900 dark:text-white">
              {isKo ? '지역 선택' : 'Select Region'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        <div className="px-3 pt-3 pb-3 space-y-1.5">
          {(SUPPORTED_COUNTRIES as readonly string[]).map((c) => (
            <button
              key={c}
              onClick={() => handlePick(c)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                current === c
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-50 dark:bg-white/[0.04] text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/[0.08]'
              }`}
            >
              <span className="text-base leading-none">{COUNTRY_FLAG[c] ?? '🌐'}</span>
              <span>{LABEL[c] ?? c}</span>
              {current === c && <i className="ri-check-line ml-auto text-sm"></i>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── CountryPicker: trigger button + dropdown popover (anchored below button) ── */
type PickerVariant = 'pill' | 'bordered';

interface CountryPickerProps {
  current: string;
  onSelect: (code: string) => void;
  variant?: PickerVariant;
  isKo?: boolean;
}

export const CountryPicker = ({ current, onSelect, variant = 'bordered', isKo = true }: CountryPickerProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const LABEL = isKo ? COUNTRY_LABEL_KO : COUNTRY_LABEL_EN;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const handlePick = (code: string) => {
    saveCountry(code);
    onSelect(code);
    setOpen(false);
  };

  const triggerClass = variant === 'pill'
    ? 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer border bg-red-600 text-white border-red-600 shadow-sm'
    : 'flex items-center gap-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-white/70 text-sm px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap transition-colors min-w-[140px]';

  return (
    <div ref={rootRef} className="relative inline-block">
      <button onClick={() => setOpen(v => !v)} className={triggerClass}>
        {variant === 'pill' ? (
          <>
            <span>{COUNTRY_FLAG[current] ?? '🌐'}</span>
            <span>{current}</span>
            <i className={`ri-arrow-down-s-line text-[10px] opacity-60 transition-transform ${open ? 'rotate-180' : ''}`}></i>
          </>
        ) : (
          <>
            <i className="ri-map-pin-line text-gray-400 dark:text-white/30 w-4 h-4 flex items-center justify-center"></i>
            <span className="flex-1 text-left">{COUNTRY_FLAG[current] ?? '🌐'} {current}</span>
            <i className={`ri-arrow-down-s-line text-gray-400 dark:text-white/30 w-4 h-4 flex items-center justify-center transition-transform ${open ? 'rotate-180' : ''}`}></i>
          </>
        )}
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 w-[200px] bg-white dark:bg-[#161616] rounded-xl shadow-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden"
        >
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100 dark:border-white/[0.06]">
            <i className="ri-global-line text-xs text-gray-500 dark:text-white/50"></i>
            <span className="text-[11px] font-black text-gray-700 dark:text-white/80 uppercase tracking-wide">
              {isKo ? '지역' : 'Region'}
            </span>
          </div>
          <div className="p-1.5 space-y-0.5">
            {(SUPPORTED_COUNTRIES as readonly string[]).map((c) => (
              <button
                key={c}
                onClick={() => handlePick(c)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
                  current === c
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/[0.08]'
                }`}
              >
                <span className="text-sm leading-none">{COUNTRY_FLAG[c] ?? '🌐'}</span>
                <span className="flex-1 text-left">{LABEL[c] ?? c}</span>
                {current === c && <i className="ri-check-line text-xs"></i>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
