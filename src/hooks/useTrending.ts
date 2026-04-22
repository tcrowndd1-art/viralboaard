import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { TrendingVideo, CategoryFilter, ShortsFilter, SortOrder } from '../types/trending';

interface UseTrendingParams {
  category: CategoryFilter;
  shorts: ShortsFilter;
  sort: SortOrder;
  referenceOnly: boolean;
}

export function useTrending({ category, shorts, sort, referenceOnly }: UseTrendingParams) {
  const [data, setData] = useState<TrendingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        let query = supabase.from('viralboard_data').select('*').limit(40);

        if (category !== 'all') {
          query = query.eq('category', category);
        }
        if (referenceOnly) {
          query = query.eq('reference_channel', true);
        }
        if (shorts === 'real') {
          query = query.eq('is_real_shorts', true);
        } else if (shorts === 'fake') {
          query = query.eq('is_fake_shorts', true);
        } else if (shorts === 'longform') {
          query = query.eq('is_shorts', false);
        }

        if (sort === 'views') {
          query = query.order('views', { ascending: false });
        } else {
          query = query.order('fetched_at', { ascending: false });
        }

        const { data: rows, error: queryError } = await query;

        if (queryError) throw queryError;
        if (!cancelled) setData(rows || []);
      } catch (e) {
        if (!cancelled) {
          setError(e as Error);
          console.error('[useTrending] FAIL:', e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [category, shorts, sort, referenceOnly]);

  return { data, loading, error };
}
