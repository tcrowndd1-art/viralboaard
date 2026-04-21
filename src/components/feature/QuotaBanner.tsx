import { useEffect, useState } from 'react';
import { isQuotaExhausted, getQuotaResetTime, clearQuotaFlag } from '@/services/quotaGuard';

/** D-3: Graceful quota exhaustion banner — shows when API quota is exceeded */
const QuotaBanner = () => {
  const [show, setShow] = useState(false);
  const [resetTime, setResetTime] = useState<Date | null>(null);

  useEffect(() => {
    const check = () => {
      const exhausted = isQuotaExhausted();
      setShow(exhausted);
      setResetTime(exhausted ? getQuotaResetTime() : null);
    };
    check();
    const id = setInterval(check, 5000);
    window.addEventListener('vb-quota-exhausted', check);
    return () => { clearInterval(id); window.removeEventListener('vb-quota-exhausted', check); };
  }, []);

  if (!show) return null;

  const resetStr = resetTime
    ? resetTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : '잠시 후';

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-600/50 rounded-xl px-4 py-3 shadow-lg max-w-md w-[90%]">
      <i className="ri-database-2-line text-yellow-600 dark:text-yellow-400 text-lg flex-shrink-0"></i>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">YouTube API 쿼터 초과</p>
        <p className="text-xs text-yellow-600 dark:text-yellow-400/70 mt-0.5">
          캐시된 데이터를 표시합니다 · 재시도 가능 시간: {resetStr}
        </p>
      </div>
      <button
        onClick={() => { clearQuotaFlag(); setShow(false); }}
        className="text-yellow-500 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-200 flex-shrink-0 cursor-pointer"
        title="닫기"
      >
        <i className="ri-close-line text-base"></i>
      </button>
    </div>
  );
};

export default QuotaBanner;
