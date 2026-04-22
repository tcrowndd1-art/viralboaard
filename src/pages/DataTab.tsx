import { useState } from 'react';
import { useTrending } from '../hooks/useTrending';
import { TrendingFilters } from '../components/TrendingFilters';
import { TrendingCard } from '../components/TrendingCard';
import type { CategoryFilter, ShortsFilter, SortOrder } from '../types/trending';

export function DataTab() {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [shorts, setShorts] = useState<ShortsFilter>('all');
  const [sort, setSort] = useState<SortOrder>('views');
  const [referenceOnly, setReferenceOnly] = useState(false);

  const { data, loading, error } = useTrending({ category, shorts, sort, referenceOnly });

  const handleChange = (updates: Partial<{
    category: CategoryFilter;
    shorts: ShortsFilter;
    sort: SortOrder;
    referenceOnly: boolean;
  }>) => {
    if ('category' in updates) setCategory(updates.category!);
    if ('shorts' in updates) setShorts(updates.shorts!);
    if ('sort' in updates) setSort(updates.sort!);
    if ('referenceOnly' in updates) setReferenceOnly(updates.referenceOnly!);
  };

  return (
    <div data-testid="data-tab">
      <h2 className="text-2xl font-bold mb-4">트렌드 대시보드</h2>

      <TrendingFilters
        category={category}
        shorts={shorts}
        sort={sort}
        referenceOnly={referenceOnly}
        onChange={handleChange}
      />

      {loading && (
        <div data-testid="loading" className="text-center py-12 text-gray-500">
          로딩 중...
        </div>
      )}

      {error && (
        <div data-testid="error" className="text-center py-12 text-red-500">
          <p>데이터 로드 실패</p>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div data-testid="empty" className="text-center py-12 text-gray-500">
          표시할 데이터가 없습니다.
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div
          data-testid="trending-grid"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {data.map(v => <TrendingCard key={v.id} video={v} />)}
        </div>
      )}
    </div>
  );
}
