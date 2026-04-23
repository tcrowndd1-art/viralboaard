import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSavedChannels } from '@/hooks/useSavedChannels';
import { useSavedVideos } from '@/hooks/useSavedVideos';
import { VideoModal } from '@/components/VideoModal';

interface GlobalSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  showUserInfo?: boolean;
  userName?: string;
  userInitial?: string;
}

/* ── Primary 7-item nav (spec) ── */
const NAV_ITEMS = [
  { href: '/',                   icon: 'ri-home-4-line',        label: 'Home',            exact: true  },
  { href: '/video-rankings',     icon: 'ri-video-line',         label: 'Video Rankings',  exact: false },
  { href: '/rankings',           icon: 'ri-bar-chart-line',     label: 'Channel Rankings', exact: false },
  { href: '/search',             icon: 'ri-search-line',        label: 'Search',          exact: false },
  { href: '/ai-studio',          icon: 'ri-film-ai-line',       label: 'AI Studio',       exact: false },
  { href: '/video-editor',       icon: 'ri-scissors-cut-line',  label: 'Video Editor',    exact: false },
  // { href: '/revenue-calculator', icon: 'ri-calculator-line', label: 'Revenue Calc', exact: false },
];

/* ── Extra items below divider ── */
const EXTRA_ITEMS = [
  { href: '/dashboard',        icon: 'ri-dashboard-line',     label: 'My Dashboard',    exact: true  },
  { href: '/comment-manager',  icon: 'ri-chat-settings-line', label: 'Comment Manager', exact: false },
  { href: '/chrome-extension', icon: 'ri-chrome-line',        label: 'Chrome Extension',exact: false },
];

const GlobalSidebar = ({
  mobileOpen = false,
  onMobileClose,
  showUserInfo = false,
  userName = 'User',
  userInitial = 'U',
}: GlobalSidebarProps) => {
  const location = useLocation();
  const path = location.pathname;
  const { t } = useTranslation();
  const [modalVideo, setModalVideo] = useState<{ videoId: string; isShorts: boolean } | null>(null);
  const { channels: savedChannelsList } = useSavedChannels();
  const { videos: savedVideosList } = useSavedVideos();

  const isActive = (href: string, exact: boolean) =>
    exact ? path === href : path.startsWith(href);

  const NavLink = ({ href, icon, label, exact }: typeof NAV_ITEMS[0]) => {
    const active = isActive(href, exact);
    return (
      <li>
        <Link
          to={href}
          onClick={onMobileClose}
          className={`
            relative flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg
            text-sm cursor-pointer transition-all duration-150 min-h-[40px]
            ${active
              ? 'font-semibold text-red-600 dark:text-off-white bg-red-50 dark:bg-red-600/15'
              : 'text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-off-white'
            }
          `}
        >
          {/* Active left bar */}
          {active && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-red-500 dark:bg-red-400 rounded-full -ml-2"></span>
          )}

          {/* Icon — fixed 20px, never shifts */}
          <span className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${
            active ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-white/40'
          }`}>
            <i className={`${icon} text-[15px]`}></i>
          </span>

          <span className="truncate flex-1">{label}</span>

          {/* Active dot */}
          {active && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 flex-shrink-0"></span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      {/* ── Sidebar nav — starts at top-12 (below global header) ── */}
      <nav
        className={`
          sidebar-nav
          fixed left-0 top-12 bottom-0 w-52 z-40
          bg-white dark:bg-dark-base
          border-r border-gray-200 dark:border-dark-border
          flex flex-col
          transition-transform duration-200 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* ── User info (dashboard context) ── */}
        {showUserInfo && (
          <div className="px-4 py-3.5 border-b border-gray-200 dark:border-dark-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-off-white truncate">{userName}</p>
                <p className="text-xs text-gray-400 dark:text-white/40 truncate">{t('dash_pro_member')}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Scrollable nav area (no logo here — logo is in TopHeader) ── */}
        <div className="flex-1 overflow-y-auto sidebar-scroll">

          {/* Primary nav */}
          <ul className="py-2">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </ul>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-dark-border mx-4 my-1"></div>

          {/* Extra nav */}
          <ul className="py-1">
            {EXTRA_ITEMS.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </ul>

          {/* Saved channels */}
          <div className="px-4 pt-3 pb-2 border-t border-gray-200 dark:border-dark-border mt-2">
            <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest mb-2 px-1">
              {t('dash_saved_channels_nav')}
            </p>
            {savedChannelsList.length === 0 ? (
              <div className="text-center py-3">
                <i className="ri-list-check-2 text-xl text-gray-300 dark:text-white/20 w-6 h-6 flex items-center justify-center mx-auto mb-1"></i>
                <p className="text-xs text-gray-400 dark:text-white/30">{t('sidebar_no_favorite_channels')}</p>
                <Link
                  to="/login"
                  className="text-xs text-gray-500 dark:text-white/40 underline hover:text-gray-700 dark:hover:text-white/60 cursor-pointer"
                >
                  {t('sidebar_sign_in')}
                </Link>
              </div>
            ) : (
              savedChannelsList.slice(0, 5).map((ch) => (
                <Link
                  key={ch.id}
                  to={`/channel/${ch.id}`}
                  onClick={onMobileClose}
                  className="flex items-center gap-2 py-1.5 px-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors group min-h-[36px]"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 dark:border-dark-border flex-shrink-0 bg-gray-100 dark:bg-dark-card">
                    <img
                      src={ch.avatar}
                      alt={ch.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-white/50 group-hover:text-gray-900 dark:group-hover:text-off-white truncate transition-colors">
                    {ch.name}
                  </span>
                  {ch.isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse ml-auto"></span>
                  )}
                </Link>
              ))
            )}
            {savedChannelsList.length > 5 && (
              <Link
                to="/dashboard"
                className="text-xs text-gray-400 dark:text-white/25 hover:text-gray-600 dark:hover:text-white/50 px-1 mt-1 block transition-colors cursor-pointer"
              >
                +{savedChannelsList.length - 5} more
              </Link>
            )}
          </div>

          {/* Saved videos */}
          <div className="px-4 pt-3 pb-2 border-t border-gray-200 dark:border-dark-border mt-1">
            <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest mb-2 px-1">
              즐겨찾기 영상
            </p>
            {savedVideosList.length === 0 ? (
              <div className="text-center py-3">
                <i className="ri-bookmark-line text-xl text-gray-300 dark:text-white/20 w-6 h-6 flex items-center justify-center mx-auto mb-1"></i>
                <p className="text-xs text-gray-400 dark:text-white/30">저장한 영상이 없습니다</p>
              </div>
            ) : (
              savedVideosList.slice(0, 4).map((v) => (
                <div
                  key={v.videoId}
                  onClick={() => { onMobileClose?.(); setModalVideo({ videoId: v.videoId, isShorts: false }); }}
                  className="flex items-center gap-2 py-1.5 px-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors group min-h-[36px]"
                >
                  <div className="w-10 h-6 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-dark-card relative">
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <i className="ri-play-fill absolute inset-0 flex items-center justify-center text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity bg-black/30"></i>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-white/50 group-hover:text-gray-900 dark:group-hover:text-off-white truncate transition-colors leading-tight flex-1">
                    {v.title}
                  </span>
                </div>
              ))
            )}
            {savedVideosList.length > 4 && (
              <Link
                to="/"
                className="text-xs text-gray-400 dark:text-white/25 hover:text-gray-600 dark:hover:text-white/50 px-1 mt-1 block transition-colors cursor-pointer"
              >
                +{savedVideosList.length - 4} more
              </Link>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-100 dark:border-dark-border mt-2">
            <div className="flex flex-col gap-1 mb-3">
              <a href="#" className="text-xs text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 cursor-pointer transition-colors">{t('sidebar_terms')}</a>
              <a href="#" className="text-xs text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 cursor-pointer transition-colors">{t('sidebar_privacy')}</a>
              <a href="#" className="text-xs text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 cursor-pointer transition-colors">{t('sidebar_about')}</a>
            </div>
            <p className="text-xs text-gray-400 dark:text-white/20">© 2026 DIFF., Inc.</p>
          </div>
        </div>
      </nav>
      {modalVideo && (
        <VideoModal videoId={modalVideo.videoId} isShorts={modalVideo.isShorts} onClose={() => setModalVideo(null)} />
      )}
    </>
  );
};

export default GlobalSidebar;
