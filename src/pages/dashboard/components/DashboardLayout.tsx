import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { useTheme } from '@/hooks/useTheme';
import GlobalSidebar from '@/components/feature/GlobalSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const AUTH_KEY = 'viralboard_auth';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'ko', label: '한국어' },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userInitial, setUserInitial] = useState('U');

  const langRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        const email: string = data.email ?? '';
        setUserEmail(email);
        const prefix = email.split('@')[0] ?? '';
        const displayName = prefix
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .trim() || 'User';
        setUserName(displayName);
        setUserInitial(displayName.charAt(0).toUpperCase());
      }
    } catch {
      setUserName('User');
      setUserInitial('U');
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLangChange = (code: string) => {
    i18n.changeLanguage(code);
    setCurrentLang(code);
    setLangOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    navigate('/');
  };

  const currentLangLabel = LANGUAGES.find((l) => l.code === currentLang)?.label ?? 'English';

  return (
    <div className="min-h-screen bg-white dark:bg-dark-base text-gray-900 dark:text-off-white flex flex-col transition-colors">

      {/* ── Top Header — flex justify-between, locked layout ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border h-12 transition-colors">
        <div className="flex items-center justify-between h-full px-4 gap-3">

          {/* LEFT: Logo + hamburger + search */}
          <div className="flex items-center gap-3 flex-1 min-w-0 max-w-sm">
            <Link
              to="/"
              className="font-black text-base tracking-widest text-gray-900 dark:text-white uppercase whitespace-nowrap hidden lg:block hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
            >
              ViralBoard
            </Link>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-gray-600 dark:text-white/60 w-8 h-8 flex items-center justify-center cursor-pointer flex-shrink-0"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              <i className="ri-menu-line text-lg"></i>
            </button>

            {/* Search bar */}
            <div
              className="flex-1 flex items-center bg-gray-100 dark:bg-white/10 rounded-full px-3 h-8 cursor-pointer hover:bg-gray-200 dark:hover:bg-white/15 transition-colors min-w-0"
              onClick={() => navigate('/search')}
            >
              <i className="ri-search-line text-gray-400 dark:text-white/50 text-sm mr-2 w-4 h-4 flex items-center justify-center flex-shrink-0"></i>
              <span className="text-sm text-gray-400 dark:text-white/50 select-none truncate">{t('dash_search_placeholder')}</span>
            </div>
          </div>

          {/* CENTER: spacer */}
          <div className="flex-1 hidden md:block" />

          {/* RIGHT: fixed anchor — notification + lang + theme + user */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Notification bell */}
            <button className="relative text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white cursor-pointer w-8 h-8 flex items-center justify-center transition-colors">
              <i className="ri-notification-3-line text-lg"></i>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>

            {/* Language selector */}
            <div ref={langRef} className="hidden md:block relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 text-sm text-gray-600 dark:text-white/60 cursor-pointer hover:text-gray-900 dark:hover:text-white whitespace-nowrap transition-colors h-8 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <i className="ri-global-line w-4 h-4 flex items-center justify-center"></i>
                <span className="text-xs">{currentLangLabel}</span>
                <i className="ri-arrow-down-s-line w-4 h-4 flex items-center justify-center"></i>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-[#242424] border border-gray-200 dark:border-white/10 rounded-lg z-50 overflow-hidden">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.code)}
                      className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                        currentLang === lang.code
                          ? 'text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-600/10'
                          : 'text-gray-700 dark:text-white/70'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark/Light toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <i className="ri-sun-line text-base"></i> : <i className="ri-moon-line text-base"></i>}
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 dark:bg-white/10"></div>

            {/* User avatar + menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-sm font-bold cursor-pointer flex-shrink-0"
              >
                {userInitial}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#242424] border border-gray-200 dark:border-white/10 rounded-lg w-52 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                    <p className="text-sm text-gray-900 dark:text-white font-semibold">{userName}</p>
                    <p className="text-xs text-gray-400 dark:text-white/60 mt-0.5 truncate">{userEmail}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <i className="ri-dashboard-line w-4 h-4 flex items-center justify-center"></i>
                    {t('dash_my_dashboard')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <i className="ri-logout-box-line w-4 h-4 flex items-center justify-center"></i>
                    {t('dash_sign_out')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Sidebar */}
      <GlobalSidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
        showUserInfo
        userName={userName}
        userInitial={userInitial}
      />

      {/* Main content — lg:ml-52 unified */}
      <div className="lg:ml-52 pt-12 flex-1">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
