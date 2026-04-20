import { InsightPost } from '@/mocks/insights';

interface InsightCardProps {
  post: InsightPost;
  featured?: boolean;
}

const categoryColors: Record<string, string> = {
  ranking: 'bg-red-100 text-red-700',
  analysis: 'bg-emerald-100 text-emerald-700',
  trend: 'bg-orange-100 text-orange-700',
  report: 'bg-violet-100 text-violet-700',
  data: 'bg-sky-100 text-sky-700',
};

const InsightCard = ({ post, featured = false }: InsightCardProps) => {
  if (featured) {
    return (
      <article className="group bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-200 cursor-pointer">
        <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'}`}>
            {post.categoryLabel}
          </span>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-bold text-gray-900 leading-snug mb-2 group-hover:text-gray-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
            {post.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{post.date}</span>
            <span className="text-xs text-gray-400">{post.readTime}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-200 cursor-pointer flex gap-4 p-3">
      <div className="relative flex-shrink-0 w-36 h-20 rounded-md overflow-hidden">
        <img
          src={post.thumbnail}
          alt={post.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
        />
        <span className={`absolute top-1.5 left-1.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'}`}>
          {post.categoryLabel}
        </span>
      </div>
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1 group-hover:text-gray-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {post.description}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-400">{post.date}</span>
          <span className="text-xs text-gray-400">{post.readTime}</span>
          <div className="flex gap-1 ml-auto">
            {post.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};

export default InsightCard;
