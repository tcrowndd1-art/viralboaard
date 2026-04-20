import { useState, useMemo } from 'react';
import { insightPosts, insightCategories } from '@/mocks/insights';
import InsightCard from './components/InsightCard';
import InsightFilterTabs from './components/InsightFilterTabs';
import GlobalSidebar from '@/components/feature/GlobalSidebar';
import TopHeader from '@/pages/home/components/TopHeader';

const InsightsPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const featuredPosts = useMemo(() => insightPosts.filter((p) => p.featured), []);

  const filteredPosts = useMemo(() => {
    let posts = insightPosts;
    if (activeCategory !== 'all') {
      posts = posts.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return posts;
  }, [activeCategory, searchQuery]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: insightPosts.length };
    insightCategories.forEach((cat) => {
      if (cat.value !== 'all') {
        result[cat.value] = insightPosts.filter((p) => p.category === cat.value).length;
      }
    });
    return result;
  }, []);

  const nonFeaturedFiltered = useMemo(() => {
    if (activeCategory !== 'all' || searchQuery.trim()) return filteredPosts;
    return filteredPosts.filter((p) => !p.featured);
  }, [filteredPosts, activeCategory, searchQuery]);

  const showFeatured = activeCategory === 'all' && !searchQuery.trim();

  return (
    <div className="min-h-screen bg-white dark:bg-dark-base transition-colors">
      <TopHeader onMobileMenuToggle={() => setSidebarOpen((v) => !v)} />
      <GlobalSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <main className="lg:ml-52 pt-12">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <i className="ri-lightbulb-flash-line w-5 h-5 flex items-center justify-center text-amber-500 text-lg"></i>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Insights</h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-white/40">
              YouTube 데이터 분석 리포트와 트렌드 인사이트를 확인하세요.
            </p>
          </div>

          {/* Featured Posts */}
          {showFeatured && featuredPosts.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider mb-4">Featured</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {featuredPosts.map((post) => (
                  <InsightCard key={post.id} post={post} featured />
                ))}
              </div>
            </section>
          )}

          {/* Filter + Search Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <InsightFilterTabs
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              counts={counts}
            />
            <div className="relative sm:ml-auto w-full sm:w-auto">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 w-4 h-4 flex items-center justify-center text-sm"></i>
              <input
                type="text"
                placeholder="Search insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-full bg-white dark:bg-dark-card text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 w-full sm:w-48 min-h-[44px] sm:min-h-0 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-white/30 dark:hover:text-white/60 cursor-pointer w-4 h-4 flex items-center justify-center"
                >
                  <i className="ri-close-line text-sm"></i>
                </button>
              )}
            </div>
          </div>

          {/* All Posts Label */}
          {showFeatured && (
            <h2 className="text-xs font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider mb-4">All Insights</h2>
          )}

          {/* Posts */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <i className="ri-file-search-line text-4xl text-gray-300 dark:text-white/20 w-12 h-12 flex items-center justify-center mx-auto mb-3"></i>
              <p className="text-sm text-gray-500 dark:text-white/40">No insights found.</p>
              <button
                onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                className="mt-3 text-xs text-gray-600 dark:text-white/50 underline cursor-pointer hover:text-gray-900 dark:hover:text-white whitespace-nowrap min-h-[44px] px-4"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {(showFeatured ? nonFeaturedFiltered : filteredPosts).map((post) => (
                <InsightCard key={post.id} post={post} featured={false} />
              ))}
            </div>
          )}

          {/* Load More */}
          {filteredPosts.length > 0 && (
            <div className="mt-8 text-center">
              <button className="whitespace-nowrap px-6 py-3 min-h-[44px] text-sm border border-gray-200 dark:border-white/10 rounded-full text-gray-600 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors">
                Load more insights
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InsightsPage;
