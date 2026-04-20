import { insightCategories } from '@/mocks/insights';

interface InsightFilterTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  counts: Record<string, number>;
}

const InsightFilterTabs = ({ activeCategory, onCategoryChange, counts }: InsightFilterTabsProps) => {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {insightCategories.map((cat) => {
        const count = cat.value === 'all' ? counts.all : (counts[cat.value] || 0);
        const isActive = activeCategory === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
            {count > 0 && (
              <span className={`ml-1.5 text-xs ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default InsightFilterTabs;
