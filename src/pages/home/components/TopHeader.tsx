import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { useTheme } from '@/hooks/useTheme';
import { ViralBoardIcon } from '@/components/ViralBoardIcon';

const RECENT_SEARCHES_KEY = 'viralboard_recent_searches';
const AUTH_KEY = 'viralboard_auth';

const getRecentSearches = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const saveRecentSearch = (query: string) => {
  const prev = getRecentSearches().filter((q) => q !== query);
  const next = [query, ...prev].slice(0, 5);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
};

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'ko', label: 'KO' },
];

const LANGUAGES_FULL = [
  { code: 'en', flag: '🇺🇸', label: 'English',    sub: 'Switch to English' },
  { code: 'ko', flag: '🇰🇷', label: '한국어',       sub: '한국어로 변경' },
  { code: 'pt', flag: '🇧🇷', label: 'Português',   sub: 'Mudar para Português' },
];

const TopHeader = ({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void } = {}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [searchValue, setSearchValue] = useState(initialQuery);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => (i18n.language || 'en').split('-')[0]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const auth = localStorage.getItem(AUTH_KEY);
    setIsLoggedIn(!!auth);
  }, []);

  useEffect(() => {
    const handler = (lng: string) => setCurrentLang(lng.split('-')[0]);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, []);

  useEffect(() => {
    if (isFocused) setRecentSearches(getRecentSearches());
  }, [isFocused]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    saveRecentSearch(trimmed);
    setIsFocused(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch(searchValue);
  };

  const handleRecentClick = (q: string) => {
    setSearchValue(q);
    handleSearch(q);
  };

  const removeRecent = (q: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = getRecentSearches().filter((item) => item !== q);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    setRecentSearches(next);
  };

  const handleLangChange = (code: string) => {
    i18n.changeLanguage(code);
    setCurrentLang(code);
    setLangOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsLoggedIn(false);
    navigate('/');
  };

  const currentLangShort = LANGUAGES.find((l) => l.code === currentLang)?.label ?? 'EN';
  const showDropdown = isFocused && recentSearches.length > 0;

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          GLOBAL HEADER — fixed h-12, TRUE 3-zone layout
          LEFT: logo (w-52 matches sidebar) | CENTER: search (max-w-[600px]) | RIGHT: controls (flex-1)
          ══════════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border transition-colors">
        <div className="h-full flex items-center">

          {/* ── ZONE LEFT: Logo — exactly w-52 to align with sidebar ── */}
          <div className="w-52 flex-shrink-0 flex items-center px-4 border-r border-gray-200 dark:border-dark-border h-full">
            {/* Mobile hamburger */}
            <button
              className="md:hidden w-7 h-7 flex items-center justify-center text-gray-600 dark:text-white/60 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 transition-colors mr-2"
              onClick={() => {
                if (onMobileMenuToggle) {
                  onMobileMenuToggle();
                } else {
                  setMobileMenuOpen(!mobileMenuOpen);
                }
              }}
            >
              <i className="ri-menu-line text-lg"></i>
            </button>

            {/* Logo — always visible on desktop */}
            <Link
              to="/"
              className="hidden md:flex items-center gap-2 group transition-opacity hover:opacity-85 whitespace-nowrap"
            >
              <ViralBoardIcon size={24} />
              <span className="font-black text-[12px] tracking-[0.1em] text-gray-900 dark:text-white uppercase">
                ViralBoard
              </span>
            </Link>
            {/* Logo on mobile */}
            <Link to="/" className="md:hidden">
              <ViralBoardIcon size={26} />
            </Link>
          </div>

          {/* ── ZONE CENTER: Search bar — flex-1, perfectly centered ── */}
          <div className="flex-1 flex items-center justify-center px-4 h-full">
            <div className="relative w-full max-w-[600px]">
              <div className={`flex items-center h-8 rounded-full px-3 transition-colors ${
                isFocused
                  ? 'bg-gray-100 dark:bg-white/15 ring-1 ring-gray-300 dark:ring-white/20'
                  : 'bg-gray-100 dark:bg-white/10'
              }`}>
                <i className="ri-search-line text-gray-400 dark:text-white/40 text-sm w-4 h-4 flex items-center justify-center flex-shrink-0"></i>
                <input
                  ref={inputRef}
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  placeholder={t('search_placeholder')}
                  className="bg-transparent text-sm outline-none w-full text-gray-800 dark:text-off-white placeholder-gray-400 dark:placeholder-white/30 mx-2 min-w-0"
                />
                {searchValue ? (
                  <button
                    onClick={() => setSearchValue('')}
                    className="text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white/70 cursor-pointer w-4 h-4 flex items-center justify-center flex-shrink-0 transition-colors"
                  >
                    <i className="ri-close-line text-sm"></i>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSearch(searchValue)}
                    className="text-gray-400 dark:text-white/30 hover:text-red-600 dark:hover:text-red-400 cursor-pointer w-4 h-4 flex items-center justify-center flex-shrink-0 transition-colors"
                  >
                    <i className="ri-arrow-right-line text-sm"></i>
                  </button>
                )}
              </div>

              {/* Recent searches dropdown */}
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl z-50 overflow-hidden"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                >
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-dark-border">
                    <span className="text-xs text-gray-400 dark:text-white/30 font-medium">{t('search_recent')}</span>
                  </div>
                  {recentSearches.map((q) => (
                    <div
                      key={q}
                      onClick={() => handleRecentClick(q)}
                      className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <i className="ri-history-line text-gray-400 dark:text-white/30 text-sm w-4 h-4 flex items-center justify-center flex-shrink-0"></i>
                        <span className="text-sm text-gray-700 dark:text-off-white truncate">{q}</span>
                      </div>
                      <button
                        onClick={(e) => removeRecent(q, e)}
                        className="text-gray-300 dark:text-white/20 hover:text-gray-500 dark:hover:text-white/50 cursor-pointer w-4 h-4 flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i className="ri-close-line text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── ZONE RIGHT: Controls — locked far-right ── */}
          <div className="flex items-center gap-1 pr-4 flex-shrink-0">

            {/* Language selector */}
            <div ref={langRef} className="hidden md:block relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-off-white hover:bg-gray-100 dark:hover:bg-white/8 cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-global-line text-sm w-4 h-4 flex items-center justify-center"></i>
                <span>{currentLangShort}</span>
                <i className="ri-arrow-down-s-line text-xs w-3 h-3 flex items-center justify-center opacity-60"></i>
              </button>
              {langOpen && (
                <div
                  className="absolute top-full right-0 mt-1.5 w-36 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl z-50 overflow-hidden py-1"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                >
                  {LANGUAGES_FULL.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.code)}
                      className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                        currentLang === lang.code
                          ? 'text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-600/10'
                          : 'text-gray-700 dark:text-off-white hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-5 bg-gray-200 dark:bg-white/10 mx-1 flex-shrink-0"></div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-off-white hover:bg-gray-100 dark:hover:bg-white/8 transition-colors cursor-pointer flex-shrink-0"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark
                ? <i className="ri-sun-line text-base"></i>
                : <i className="ri-moon-line text-base"></i>
              }
            </button>

            {/* Divider */}
            <div className="hidden md:block w-px h-5 bg-gray-200 dark:bg-white/10 mx-1 flex-shrink-0"></div>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="h-8 px-3 flex items-center text-xs font-medium border border-gray-300 dark:border-white/20 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/8 cursor-pointer whitespace-nowrap transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="h-8 px-3 flex items-center text-xs font-medium bg-gray-900 dark:bg-white/15 text-white dark:text-white hover:bg-gray-700 dark:hover:bg-white/25 cursor-pointer whitespace-nowrap rounded-lg transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="h-8 px-3 flex items-center text-xs font-medium border border-gray-300 dark:border-dark-border rounded-lg text-gray-700 dark:text-off-white hover:bg-gray-50 dark:hover:bg-white/8 cursor-pointer whitespace-nowrap transition-colors"
                  >
                    {t('nav_sign_in')}
                  </Link>
                  <Link
                    to="/signup"
                    className="h-8 px-3 flex items-center text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap transition-colors"
                  >
                    {t('nav_sign_up')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="fixed top-12 left-0 right-0 z-40 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border p-4 flex flex-col gap-3 md:hidden">
          <div className="flex gap-2 flex-wrap">
            {LANGUAGES_FULL.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLangChange(lang.code)}
                className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                  currentLang === lang.code
                    ? 'border-red-600 text-red-600 bg-red-50 dark:bg-red-600/10 dark:text-red-400 dark:border-red-500'
                    : 'border-gray-300 dark:border-dark-border text-gray-600 dark:text-off-white hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm px-3 py-2.5 border border-gray-300 dark:border-white/20 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer whitespace-nowrap w-full text-center transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-2.5 bg-gray-900 dark:bg-white/15 text-white dark:text-white hover:bg-gray-700 dark:hover:bg-white/25 cursor-pointer whitespace-nowrap w-full rounded-lg transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm px-3 py-2.5 border border-gray-300 dark:border-dark-border rounded-lg text-gray-700 dark:text-off-white hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer whitespace-nowrap w-full text-center transition-colors"
              >
                {t('nav_sign_in')}
              </Link>
              <Link
                to="/signup"
                className="text-sm px-3 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap w-full text-center transition-colors"
              >
                {t('nav_sign_up')}
              </Link>
            </>
          )}
        </div>
      )}

    </>
  );
};

export default TopHeader;
