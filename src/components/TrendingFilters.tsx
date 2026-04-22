import type { CategoryFilter, ShortsFilter, SortOrder } from '../types/trending';

interface Props {
  category: CategoryFilter;
  shorts: ShortsFilter;
  sort: SortOrder;
  referenceOnly: boolean;
  onChange: (updates: Partial<{
    category: CategoryFilter;
    shorts: ShortsFilter;
    sort: SortOrder;
    referenceOnly: boolean;
  }>) => void;
}

const CATEGORIES: { v: CategoryFilter; l: string }[] = [
  { v: 'all', l: '전체' },
  { v: 'people_blogs', l: 'People&Blogs' },
  { v: 'entertainment', l: 'Entertainment' },
  { v: 'news_politics', l: 'News' },
  { v: 'howto_style', l: 'Howto' },
  { v: 'science_tech', l: 'Science&Tech' },
  { v: 'reference', l: '참고채널' },
];

const SHORTS: { v: ShortsFilter; l: string }[] = [
  { v: 'all', l: '전체' },
  { v: 'real', l: '🟢 진짜 Shorts' },
  { v: 'fake', l: '🔴 위장 Shorts' },
  { v: 'longform', l: '롱폼' },
];

export function TrendingFilters({ category, shorts, sort, referenceOnly, onChange }: Props) {
  return (
    <div data-testid="filters" className="space-y-3 mb-6">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button
            key={c.v}
            data-testid={`filter-cat-${c.v}`}
            onClick={() => onChange({ category: c.v })}
            className={`px-3 py-1 rounded-full text-sm ${
              category === c.v ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {c.l}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {SHORTS.map(s => (
          <button
            key={s.v}
            data-testid={`filter-shorts-${s.v}`}
            onClick={() => onChange({ shorts: s.v })}
            className={`px-3 py-1 rounded text-sm ${
              shorts === s.v ? 'bg-purple-500 text-white' : 'bg-gray-200'
            }`}
          >
            {s.l}
          </button>
        ))}
        <select
          data-testid="filter-sort"
          value={sort}
          onChange={e => onChange({ sort: e.target.value as SortOrder })}
          className="px-3 py-1 rounded border text-sm"
        >
          <option value="views">조회수 순</option>
          <option value="recent">최신 순</option>
        </select>
        <label className="flex items-center gap-1 text-sm cursor-pointer">
          <input
            type="checkbox"
            data-testid="filter-reference"
            checked={referenceOnly}
            onChange={e => onChange({ referenceOnly: e.target.checked })}
            className="rounded"
          />
          참고채널만
        </label>
      </div>
    </div>
  );
}
