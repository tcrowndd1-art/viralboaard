import { dataStats } from '@/mocks/playboardData';

const DataStats = () => {
  return (
    <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-sm overflow-hidden transition-colors">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Data analysis status</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100 dark:divide-white/10">
        {dataStats.map((stat) => (
          <div key={stat.label} className="px-6 py-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
            <p className="text-xs text-gray-500 dark:text-white/40 mb-1">{stat.label}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DataStats;
