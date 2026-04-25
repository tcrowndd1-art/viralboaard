import { Link, useLocation } from 'react-router-dom';

const TABS = [
  { href: '/',               icon: 'ri-home-4-fill',      iconOff: 'ri-home-4-line',      label: '홈',    exact: true  },
  { href: '/video-rankings', icon: 'ri-bar-chart-fill',   iconOff: 'ri-bar-chart-line',   label: '랭킹',  exact: false },
  { href: '/search',         icon: 'ri-search-2-fill',    iconOff: 'ri-search-2-line',    label: '검색',  exact: false },
  { href: '/rankings',       icon: 'ri-trophy-fill',      iconOff: 'ri-trophy-line',      label: '채널',  exact: false },
  { href: '/dashboard',      icon: 'ri-user-fill',        iconOff: 'ri-user-line',        label: '저장',  exact: false },
];

const MobileBottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-base border-t border-gray-200 dark:border-dark-border flex items-stretch h-14 safe-area-pb">
      {TABS.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            to={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              active ? 'text-red-500' : 'text-gray-400 dark:text-white/40'
            }`}
          >
            <i className={`${active ? tab.icon : tab.iconOff} text-[20px] leading-none`} />
            <span className={`text-[9px] font-bold leading-none ${active ? 'text-red-500' : 'text-gray-400 dark:text-white/40'}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
