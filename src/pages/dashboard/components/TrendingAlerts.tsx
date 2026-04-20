import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trendingAlerts } from '@/mocks/userDashboard';
import type { TrendingAlert } from '@/mocks/userDashboard';

const timeAgo = (timestamp: string): string => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
};

const alertConfig: Record<TrendingAlert['type'], { icon: string; color: string; bg: string }> = {
  viral_video: { icon: 'ri-fire-line', color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10' },
  growth_spike: { icon: 'ri-arrow-up-line', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
  milestone: { icon: 'ri-trophy-line', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
  live_peak: { icon: 'ri-live-line', color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
};

const TrendingAlerts = () => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<TrendingAlert[]>(trendingAlerts);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      setDismissed((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }, 300);
  };

  const newCount = alerts.filter((a) => a.isNew).length;

  return (
    <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/15 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2">
          <i className="ri-notification-3-line text-red-500 dark:text-red-400 w-4 h-4 flex items-center justify-center"></i>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('dashboard_trending')}</h2>
          {newCount > 0 && (
            <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-full font-medium">
              {newCount} {t('dash_new_badge')}
            </span>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <i className="ri-notification-off-line text-gray-300 dark:text-white/20 text-2xl mb-2 w-8 h-8 flex items-center justify-center mx-auto"></i>
          <p className="text-xs text-gray-400 dark:text-white/30">{t('dash_no_alerts')}</p>
        </div>
      ) : (
        <ul>
          {alerts.map((alert) => {
            const cfg = alertConfig[alert.type];
            return (
              <li
                key={alert.id}
                className={`flex items-start gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-white/5 transition-all duration-300 ${
                  dismissed.has(alert.id) ? 'opacity-0 scale-95' : 'opacity-100'
                } ${alert.isNew ? 'bg-red-50/50 dark:bg-white/2' : ''}`}
              >
                {/* Alert icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                  <i className={`${cfg.icon} text-sm ${cfg.color} w-4 h-4 flex items-center justify-center`}></i>
                </div>

                {/* Channel avatar */}
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                  <img src={alert.channelAvatar} alt={alert.channelName} className="w-full h-full object-cover object-top" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{alert.channelName}</span>
                    {alert.isNew && (
                      <span className="text-xs bg-red-100 dark:bg-red-600/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full">
                        {t('dash_new_badge')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white/65 mt-0.5 leading-relaxed">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-semibold ${cfg.color}`}>{alert.value}</span>
                    <span className="text-xs text-gray-300 dark:text-white/30">·</span>
                    <span className="text-xs text-gray-400 dark:text-white/50">{timeAgo(alert.timestamp)}</span>
                  </div>
                </div>

                {/* Dismiss */}
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="text-gray-300 dark:text-white/20 hover:text-gray-500 dark:hover:text-white/50 cursor-pointer w-5 h-5 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5"
                >
                  <i className="ri-close-line text-xs"></i>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default TrendingAlerts;
