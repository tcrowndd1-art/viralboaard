import { useTranslation } from 'react-i18next';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) => {
  const { t } = useTranslation();
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const getPages = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-3">
      <p className="text-xs text-gray-400 dark:text-off-white/30">
        {t('rankings_showing')}{' '}
        <span className="text-gray-600 dark:text-off-white/60">{start}–{end}</span>{' '}
        {t('rankings_of')}{' '}
        <span className="text-gray-600 dark:text-off-white/60">{totalItems}</span>{' '}
        {t('rankings_channels')}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-off-white/30 hover:text-gray-700 dark:hover:text-off-white hover:bg-gray-100 dark:hover:bg-dark-surface disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <i className="ri-arrow-left-s-line"></i>
        </button>

        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-300 dark:text-off-white/20 text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap ${
                currentPage === p
                  ? 'bg-red-600 text-white font-semibold'
                  : 'text-gray-500 dark:text-off-white/40 hover:text-gray-800 dark:hover:text-off-white hover:bg-gray-100 dark:hover:bg-dark-surface'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-off-white/30 hover:text-gray-700 dark:hover:text-off-white hover:bg-gray-100 dark:hover:bg-dark-surface disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <i className="ri-arrow-right-s-line"></i>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
