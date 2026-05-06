import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout';
import SavedChannels from './components/SavedChannels';
import RecentSearches from './components/RecentSearches';
import TrendingAlerts from './components/TrendingAlerts';
import Recommendations from './components/Recommendations';
import { useAuth } from '@/hooks/useAuth';
import { useSavedChannels } from '@/hooks/useSavedChannels';
import { trendingAlerts } from '@/mocks/userDashboard';

const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { channels: savedChannels } = useSavedChannels();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-base flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayName = user.user_metadata?.full_name
    ?? user.user_metadata?.name
    ?? user.email?.split('@')[0]?.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    ?? 'User';

  const avatarUrl = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? '';

  const newAlertsCount = trendingAlerts.filter((a) => a.isNew).length;
  const liveCount = savedChannels.filter((c) => c.isLive).length;

  const statCards = [
    {
      labelKey: 'dash_stat_saved',
      value: String(savedChannels.length),
      icon: 'ri-heart-line',
      color: 'text-red-500 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-500/10',
      subKey: 'dash_stat_saved_sub',
      subColor: 'text-green-600 dark:text-green-400',
    },
    {
      labelKey: 'dash_stat_live',
      value: String(liveCount),
      icon: 'ri-live-line',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-500/10',
      subKey: 'dash_stat_live_sub',
      subColor: 'text-gray-400 dark:text-white/30',
    },
    {
      labelKey: 'dash_stat_alerts',
      value: String(newAlertsCount),
      icon: 'ri-notification-3-line',
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-500/10',
      subKey: 'dash_stat_alerts_sub',
      subColor: 'text-gray-400 dark:text-white/30',
    },
    {
      labelKey: 'dash_stat_growth',
      value: savedChannels.length > 0 ? `${(savedChannels.reduce((s, c) => s + c.weeklyGrowth, 0) / savedChannels.length).toFixed(1)}%` : '—',
      icon: 'ri-arrow-up-line',
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-500/10',
      subKey: 'dash_stat_growth_sub',
      subColor: 'text-gray-400 dark:text-white/30',
    },
  ];

  const quickActions = [
    { icon: 'ri-bar-chart-line', titleKey: 'dash_quick_rankings', descKey: 'dash_quick_rankings_desc', path: '/rankings', color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
    { icon: 'ri-video-line', titleKey: 'dash_quick_video', descKey: 'dash_quick_video_desc', path: '/video-rankings', color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    { icon: 'ri-search-line', titleKey: 'dash_quick_search', descKey: 'dash_quick_search_desc', path: '/search', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
  ];

  return (
    <DashboardLayout>
      <div className="px-4 lg:px-6 py-6 space-y-6">

        {/* Welcome banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-50 via-orange-50 to-white dark:from-[#1a0a0a] dark:via-[#1f1010] dark:to-[#0f0f0f] border border-red-100 dark:border-red-900/30 rounded-lg px-6 py-5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(220,38,38,0.06)_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_left,_rgba(220,38,38,0.12)_0%,_transparent_60%)]"></div>
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {avatarUrl && (
                <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full border border-red-200 dark:border-red-900/40 flex-shrink-0" />
              )}
              <div>
                <p className="text-xs text-red-500 dark:text-red-400/70 font-medium uppercase tracking-widest mb-1">
                  {t('dashboard_welcome')}
                </p>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h1>
                <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">{user.email}</p>
                <p className="text-sm text-gray-500 dark:text-white/70 mt-1">
                  {t('dash_you_have')}{' '}
                  <span className="text-gray-900 dark:text-white font-medium">{newAlertsCount} {t('dash_new_alerts')}</span>{' '}
                  {t('dash_and')}{' '}
                  <span className="text-gray-900 dark:text-white font-medium">{liveCount} {t('dash_channels_live')}</span>{' '}
                  {t('dash_right_now')}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link to="/rankings" className="px-4 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/25 text-gray-700 dark:text-white font-medium text-sm rounded-md hover:bg-gray-50 dark:hover:bg-white/18 transition-colors cursor-pointer whitespace-nowrap">
                {t('dash_browse_rankings')}
              </Link>
              <button
                onClick={signOut}
                className="px-4 py-2 border border-gray-200 dark:border-white/20 text-gray-500 dark:text-white/60 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((stat) => (
            <div key={stat.labelKey} className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/15 rounded-lg px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500 dark:text-white/60">{t(stat.labelKey)}</p>
                <div className={`w-7 h-7 flex items-center justify-center rounded-md ${stat.bg}`}>
                  <i className={`${stat.icon} ${stat.color} text-sm w-4 h-4 flex items-center justify-center`}></i>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className={`text-xs mt-1 ${stat.subColor}`}>{t(stat.subKey)}</p>
            </div>
          ))}
        </div>

        <SavedChannels />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentSearches />
          <TrendingAlerts />
        </div>

        <Recommendations />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link key={action.titleKey} to={action.path} className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/15 rounded-lg px-5 py-4 hover:border-gray-300 dark:hover:border-white/25 transition-colors cursor-pointer flex items-start gap-3">
              <div className={`w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 ${action.bg}`}>
                <i className={`${action.icon} ${action.color} text-base w-5 h-5 flex items-center justify-center`}></i>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t(action.titleKey)}</h3>
                <p className="text-xs text-gray-400 dark:text-white/60 mt-0.5 leading-relaxed">{t(action.descKey)}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
