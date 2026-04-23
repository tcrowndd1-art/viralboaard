import { useRef } from 'react';

export const COUNTRY_FLAG: Record<string, string> = {
  KR: '🇰🇷', US: '🇺🇸', JP: '🇯🇵', BR: '🇧🇷',
};

export const SUPPORTED_COUNTRIES = ['KR'] as const;
export const FUTURE_COUNTRIES: Array<{ code: string; label: string }> = [
  { code: 'US', label: 'United States' },
  { code: 'JP', label: 'Japan' },
  { code: 'BR', label: 'Brazil' },
];

const COUNTRY_LABEL: Record<string, string> = {
  KR: 'South Korea',
  US: 'United States',
  JP: 'Japan',
  BR: 'Brazil',
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

        <div className="px-3 pt-3 pb-2 space-y-1.5">
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
              <span>{isKo && c === 'KR' ? '대한민국' : COUNTRY_LABEL[c] ?? c}</span>
              {current === c && <i className="ri-check-line ml-auto text-sm"></i>}
            </button>
          ))}
        </div>

        <div className="px-3 pb-3 pt-1">
          <div className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 mb-1.5">
              {isKo ? '🚧 추후 확장 예정' : '🚧 Coming Soon'}
            </p>
            <div className="grid grid-cols-3 gap-1">
              {FUTURE_COUNTRIES.map((c) => (
                <div
                  key={c.code}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-white/5 text-[10px] text-gray-400 dark:text-white/40"
                >
                  <span className="text-sm">{COUNTRY_FLAG[c.code]}</span>
                  <span>{c.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
