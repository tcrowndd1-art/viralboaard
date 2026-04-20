interface SearchFilterTabsProps {
  activeTab: 'all' | 'channels' | 'videos';
  onTabChange: (tab: 'all' | 'channels' | 'videos') => void;
  totalCount: number;
  channelCount: number;
  videoCount: number;
}

const SearchFilterTabs = ({
  activeTab,
  onTabChange,
  totalCount,
  channelCount,
  videoCount,
}: SearchFilterTabsProps) => {
  const tabs = [
    { key: 'all' as const, label: 'All', count: totalCount },
    { key: 'channels' as const, label: 'Channels', count: channelCount },
    { key: 'videos' as const, label: 'Videos', count: videoCount },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-gray-200 dark:border-dark-border">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === tab.key
              ? 'border-red-500 text-gray-900 dark:text-off-white'
              : 'border-transparent text-gray-400 dark:text-off-white/40 hover:text-gray-700 dark:hover:text-off-white/70'
          }`}
        >
          {tab.label}
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key
                ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                : 'bg-gray-100 dark:bg-dark-card text-gray-400 dark:text-off-white/30'
            }`}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default SearchFilterTabs;
