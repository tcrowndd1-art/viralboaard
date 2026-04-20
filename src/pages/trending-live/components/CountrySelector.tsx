import { useState, useRef, useEffect } from 'react';
import { countries } from '@/mocks/trendingLive';

interface CountrySelectorProps {
  selected: string;
  onChange: (code: string) => void;
}

const CountrySelector = ({ selected, onChange }: CountrySelectorProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = countries.find((c) => c.code === selected) || countries[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
      >
        <span>{current.flag}</span>
        <span>{current.name}</span>
        <i className={`ri-arrow-down-s-line w-4 h-4 flex items-center justify-center text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}></i>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-sm z-50 py-1 max-h-64 overflow-y-auto">
          {countries.map((c) => (
            <button
              key={c.code}
              onClick={() => { onChange(c.code); setOpen(false); }}
              className={`whitespace-nowrap w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
                selected === c.code ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountrySelector;
