import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { recentSearches } from '@/mocks/userDashboard';
import type { RecentSearch } from '@/mocks/userDashboard';

const timeAgo = (timestamp: string): string => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
};

const RecentSearches = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searches, setSearches] = useState<RecentSearch[]>(recentSearches);

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleRemove = (id: string) => {
    setSearches((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/15 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2">
          <i className="ri-history-line text-gray-400 dark:text-white/50 w-4 h-4 flex items-center justify-center"></i>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('dashboard_recent')}</h2>
        </div>
        {searches.length > 0 && (
          <button
            onClick={() => setSearches([])}
            className="text-xs text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 cursor-pointer transition-colors whitespace-nowrap"
          >
            {t('dash_clear_all')}
          </button>
        )}
      </div>

      {searches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <i className="ri-search-line text-gray-300 dark:text-white/20 text-2xl mb-2 w-8 h-8 flex items-center justify-center mx-auto"></i>
          <p className="text-xs text-gray-400 dark:text-white/30">{t('dash_no_searches')}</p>
        </div>
      ) : (
        <ul>
          {searches.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/3 transition-colors group cursor-pointer"
              onClick={() => handleSearch(s.query)}
            >
              <i className="ri-search-line text-gray-300 dark:text-white/30 text-sm w-4 h-4 flex items-center justify-center flex-shrink-0"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-white truncate">{s.query}</p>
                <p className="text-xs text-gray-400 dark:text-white/50">{s.resultCount} {t('dash_results')} · {timeAgo(s.timestamp)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleRemove(s.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 dark:text-white/30 hover:text-gray-500 dark:hover:text-white/60 cursor-pointer w-5 h-5 flex items-center justify-center flex-shrink-0"
              >
                <i className="ri-close-line text-xs"></i>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentSearches;
