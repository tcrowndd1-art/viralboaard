import { liveCategories } from '@/mocks/trendingLive';

interface CategoryTabsProps {
  active: string;
  onChange: (cat: string) => void;
}

const CategoryTabs = ({ active, onChange }: CategoryTabsProps) => {
  return (
    <div className="flex flex-wrap gap-1.5">
      {liveCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer ${
            active === cat
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
