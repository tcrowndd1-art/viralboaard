import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'ko', label: '한국어' },
];

const HomeFooter = () => {
  const { t } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLangChange = (code: string) => {
    i18n.changeLanguage(code);
    setCurrentLang(code);
    setLangOpen(false);
  };

  const currentLangLabel = LANGUAGES.find((l) => l.code === currentLang)?.label ?? 'English';

  return (
    <footer className="bg-gray-50 dark:bg-[#181818] border-t border-gray-200 dark:border-white/10 mt-6 transition-colors">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 gap-3">
        <div className="flex items-center gap-4">
          {/* Language selector */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-white/60 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <i className="ri-global-line w-4 h-4 flex items-center justify-center"></i>
              <span>{currentLangLabel}</span>
              <i className="ri-arrow-down-s-line w-4 h-4 flex items-center justify-center"></i>
            </button>
            {langOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-36 bg-white dark:bg-[#242424] border border-gray-200 dark:border-white/10 rounded-lg z-50 overflow-hidden">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLangChange(lang.code)}
                    className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                      currentLang === lang.code
                        ? 'text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-600/10'
                        : 'text-gray-700 dark:text-white/70'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-white/60 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
            <i className="ri-money-dollar-circle-line w-4 h-4 flex items-center justify-center"></i>
            <span>MXN (MX$)</span>
            <i className="ri-arrow-down-s-line w-4 h-4 flex items-center justify-center"></i>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" rel="nofollow" className="text-sm text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 cursor-pointer transition-colors">{t('footer_about')}</a>
          <a href="#" rel="nofollow" className="text-sm text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 cursor-pointer transition-colors">{t('footer_terms')}</a>
          <a href="#" rel="nofollow" className="text-sm text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 cursor-pointer transition-colors">{t('footer_privacy')}</a>
        </div>
      </div>

      {/* About */}
      <div className="px-6 py-4 space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-white/40 mb-0.5">Eliteglobal Ltda</p>
            <p className="text-[11px] text-gray-400 dark:text-white/20">
              CNPJ: 00.000.000/0001-00 &nbsp;·&nbsp; Av. Paulista, 1374 — São Paulo, SP 01310-100, Brazil &nbsp;·&nbsp; contact@viralboard.co
            </p>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-white/20 whitespace-nowrap">{t('footer_copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
