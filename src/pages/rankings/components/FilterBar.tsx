import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { countries, categories } from '@/mocks/channelRankings';

interface FilterBarProps {
  country: string;
  category: string;
  period: string;
  onCountryChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onPeriodChange: (v: string) => void;
}

interface DropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  icon: string;
}

const Dropdown = ({ label, value, options, onChange, icon }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-off-white/20 text-gray-700 dark:text-off-white/70 text-sm px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap transition-colors min-w-[140px]"
      >
        <i className={`${icon} text-gray-400 dark:text-off-white/30 w-4 h-4 flex items-center justify-center`}></i>
        <span className="flex-1 text-left">{selected?.label ?? label}</span>
        <i className={`ri-arrow-down-s-line text-gray-400 dark:text-off-white/30 w-4 h-4 flex items-center justify-center transition-transform ${open ? 'rotate-180' : ''}`}></i>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg py-1 z-50 min-w-full max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm cursor-pointer whitespace-nowrap transition-colors ${
                value === opt.value
                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 font-medium'
                  : 'text-gray-700 dark:text-off-white/60 hover:bg-gray-50 dark:hover:bg-dark-surface'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterBar = ({ country, category, period, onCountryChange, onCategoryChange, onPeriodChange }: FilterBarProps) => {
  const { t } = useTranslation();

  const countryOptions = countries.map((c) => ({ value: c.code, label: c.label }));
  const categoryOptions = categories.map((c) => ({ value: c === 'All Categories' ? 'ALL' : c, label: c }));
  const periodOptions = [
    { value: 'Daily', label: t('rankings_period_daily') },
    { value: 'Weekly', label: t('rankings_period_weekly') },
    { value: 'Monthly', label: t('rankings_period_monthly') },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dropdown
        label={t('rankings_country')}
        value={country}
        options={countryOptions}
        onChange={onCountryChange}
        icon="ri-map-pin-line"
      />
      <Dropdown
        label={t('rankings_category')}
        value={category}
        options={categoryOptions}
        onChange={onCategoryChange}
        icon="ri-apps-line"
      />

      {/* Period toggle */}
      <div className="flex items-center bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-1">
        {periodOptions.map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriodChange(p.value)}
            className={`text-sm px-3 py-1 rounded-md cursor-pointer whitespace-nowrap transition-colors ${
              period === p.value
                ? 'bg-gray-900 dark:bg-off-white text-white dark:text-dark-base font-medium'
                : 'text-gray-500 dark:text-off-white/40 hover:text-gray-700 dark:hover:text-off-white/70'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
