import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Search, Clock, X } from 'lucide-react';
import { mosaicAvatars } from '@/mocks/playboardData';
import { getSearchHistory } from '@/services/cache';

interface Props {
  onSearch: (query: string) => void;
  loading: boolean;
}

const SearchBanner = ({ onSearch, loading }: Props) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, [showHistory]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (q) { setShowHistory(false); onSearch(q); }
  };

  const handleHistoryClick = (q: string) => {
    setInput(q);
    setShowHistory(false);
    onSearch(q);
  };

  return (
    <div className="bg-white dark:bg-[#181818] border-b border-gray-200 dark:border-white/10 py-6 px-6 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Message */}
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white leading-snug mb-4">
            Data reveals numbers.<br />
            <span className="font-black text-red-600 dark:text-red-400">ViralBoard</span> unlocks Money-Making Actions.
          </p>

          {/* Channel search */}
          <div ref={wrapperRef} className="relative max-w-md mb-3">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40 pointer-events-none" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setShowHistory(true)}
                  placeholder="채널명으로 검색..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors whitespace-nowrap"
              >
                {loading ? '검색 중...' : '검색'}
              </button>
            </form>

            {/* History dropdown */}
            {showHistory && history.length > 0 && (
              <div className="absolute top-full left-0 right-12 mt-1 bg-white dark:bg-[#242424] border border-gray-200 dark:border-white/10 rounded shadow-lg z-20">
                <div className="px-3 py-1.5 border-b border-gray-100 dark:border-white/10">
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wide">최근 검색</span>
                </div>
                {history.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleHistoryClick(q)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                  >
                    <Clock className="w-3 h-3 text-gray-300 dark:text-white/20 flex-shrink-0" />
                    <span className="flex-1 truncate">{q}</span>
                    <X
                      className="w-3 h-3 text-gray-300 dark:text-white/20 flex-shrink-0 hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = history.filter((h) => h !== q);
                        localStorage.setItem('vb_search_history', JSON.stringify(next));
                        setHistory(next);
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="#"
              className="inline-block bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-5 py-2 rounded cursor-pointer whitespace-nowrap transition-colors"
            >
              {t('banner_cta')}
            </a>
            <Link
              to="/revenue-calculator"
              className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-5 py-2 rounded cursor-pointer whitespace-nowrap transition-colors"
            >
              <i className="ri-calculator-line text-sm w-4 h-4 flex items-center justify-center"></i>
              Revenue Calculator
            </Link>
          </div>
        </div>

        {/* Right: Mosaic avatars */}
        <div className="hidden md:grid grid-cols-4 gap-1 flex-shrink-0">
          {mosaicAvatars.slice(0, 16).map((src, i) => (
            <div key={i} className="w-12 h-12 rounded overflow-hidden bg-gray-100 dark:bg-white/10">
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover object-top"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchBanner;
