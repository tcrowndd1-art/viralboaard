import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import CalculatorInputs from './components/CalculatorInputs';
import RevenueOutput from './components/RevenueOutput';
import type { Niche, Frequency } from './components/CalculatorInputs';

const RevenueCalculatorPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subscribers, setSubscribers] = useState(150000);
  const [avgViews, setAvgViews] = useState(500000);
  const [frequency, setFrequency] = useState<Frequency>('weekly');
  const [niche, setNiche] = useState<Niche>('Tech');
  const [shareToast, setShareToast] = useState(false);
  const [pdfToast, setPdfToast] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleSavePDF = () => {
    setPdfToast(true);
    setTimeout(() => setPdfToast(false), 2500);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/revenue-calculator?subs=${subscribers}&views=${avgViews}&freq=${frequency}&niche=${niche}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-white transition-colors">
      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10'
            : 'bg-white dark:bg-[#0f0f0f] border-b border-gray-100 dark:border-white/5'
        }`}
        ref={(el) => {
          if (!el) return;
          const obs = new IntersectionObserver(
            ([e]) => setScrolled(!e.isIntersecting),
            { threshold: 0 }
          );
          const sentinel = document.getElementById('scroll-sentinel');
          if (sentinel) obs.observe(sentinel);
        }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-black text-base tracking-widest text-gray-900 dark:text-white uppercase hover:text-green-600 transition-colors whitespace-nowrap">
              ViralBoard
            </Link>
            <span className="text-gray-300 dark:text-white/20 hidden sm:block">/</span>
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-calculator-line text-green-500 text-sm"></i>
              </div>
              <span className="text-sm text-gray-500 dark:text-white/50 font-medium">Revenue Calculator</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
            <Link to="/rankings" className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors">Rankings</Link>
            <Link to="/insights" className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors">Insights</Link>
            <Link to="/chrome-extension" className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors">Extension</Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isDark ? <i className="ri-sun-line text-base"></i> : <i className="ri-moon-line text-base"></i>}
            </button>
            <Link
              to="/dashboard"
              className="hidden md:flex items-center gap-1.5 text-sm px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap font-medium"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-dashboard-line text-sm"></i>
              </div>
              Dashboard
            </Link>
            <button
              className="md:hidden text-gray-600 dark:text-white/60 w-8 h-8 flex items-center justify-center cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className={mobileMenuOpen ? 'ri-close-line text-lg' : 'ri-menu-line text-lg'}></i>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-[#181818] border-t border-gray-200 dark:border-white/10 px-4 py-4 flex flex-col gap-3">
            <Link to="/" className="text-sm text-gray-600 dark:text-white/60 py-2">Home</Link>
            <Link to="/rankings" className="text-sm text-gray-600 dark:text-white/60 py-2">Rankings</Link>
            <Link to="/dashboard" className="text-sm text-green-600 dark:text-green-400 py-2 font-medium">Dashboard</Link>
          </div>
        )}
      </header>

      <div id="scroll-sentinel" className="h-0 w-0" />

      {/* Hero */}
      <section className="pt-24 pb-10 px-4 lg:px-6 bg-gradient-to-b from-green-50/60 dark:from-green-950/10 to-white dark:to-[#0f0f0f]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-600/10 border border-green-200 dark:border-green-600/20 rounded-full px-4 py-1.5 mb-5">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-calculator-line text-green-500 text-sm"></i>
            </div>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Free YouTube Revenue Calculator</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
            How Much Could Your Channel<br />
            <span className="text-green-500">Actually Earn?</span>
          </h1>
          <p className="text-gray-500 dark:text-white/50 max-w-xl mx-auto text-base">
            Enter your channel stats and niche to get an instant AdSense revenue estimate, CPM breakdown, and 6-month growth projection.
          </p>
        </div>
      </section>

      {/* Main Calculator */}
      <section className="px-4 lg:px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left: Inputs */}
            <div className="bg-[#f5f5f5] dark:bg-[#181818] rounded-2xl p-6 border border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-500/10 rounded-lg">
                  <i className="ri-settings-3-line text-green-500 text-base"></i>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Channel Parameters</h2>
                  <p className="text-xs text-gray-400 dark:text-white/30">Adjust to match your channel</p>
                </div>
              </div>
              <CalculatorInputs
                subscribers={subscribers}
                avgViews={avgViews}
                frequency={frequency}
                niche={niche}
                onSubscribersChange={setSubscribers}
                onAvgViewsChange={setAvgViews}
                onFrequencyChange={setFrequency}
                onNicheChange={setNiche}
              />
            </div>

            {/* Right: Output */}
            <div ref={outputRef}>
              <RevenueOutput
                subscribers={subscribers}
                avgViews={avgViews}
                frequency={frequency}
                niche={niche}
                onSavePDF={handleSavePDF}
                onShare={handleShare}
              />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 flex items-start gap-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-5 py-4">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-information-line text-gray-400 dark:text-white/30 text-base"></i>
            </div>
            <p className="text-xs text-gray-400 dark:text-white/30 leading-relaxed">
              <strong className="text-gray-600 dark:text-white/50">Disclaimer:</strong> These estimates are based on industry-average CPM rates and a 45% monetization ratio. Actual earnings vary based on audience geography, ad blockers, seasonality, and YouTube's policies. This tool is for educational purposes only.
            </p>
          </div>

          {/* How it works */}
          <div className="mt-10">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-5 text-center">How the Calculator Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: '01', icon: 'ri-user-line', title: 'Enter Subscribers', desc: 'Your current subscriber count helps estimate your channel\'s reach and authority.' },
                { step: '02', icon: 'ri-eye-line', title: 'Set Avg. Views', desc: 'Average views per video × upload frequency = total monthly views.' },
                { step: '03', icon: 'ri-price-tag-3-line', title: 'Select Niche', desc: 'Each niche has a different CPM. Finance pays 3× more than Entertainment.' },
                { step: '04', icon: 'ri-money-dollar-circle-line', title: 'Get Estimate', desc: 'We apply a 45% monetization rate to calculate your realistic AdSense range.' },
              ].map((item) => (
                <div key={item.step} className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-black text-green-500 font-mono">{item.step}</span>
                    <div className="w-8 h-8 flex items-center justify-center bg-green-50 dark:bg-green-500/10 rounded-lg">
                      <i className={`${item.icon} text-green-500 text-base`}></i>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CPM Table */}
          <div className="mt-10 bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-table-line text-green-500 text-sm"></i>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">CPM Reference Table by Niche</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {[
                { niche: 'Finance', cpm: 12.5, icon: 'ri-funds-line', color: 'text-green-500', bar: 100 },
                { niche: 'Tech', cpm: 10.1, icon: 'ri-cpu-line', color: 'text-blue-500', bar: 81 },
                { niche: 'Psychology', cpm: 9.2, icon: 'ri-brain-line', color: 'text-purple-500', bar: 74 },
                { niche: 'Health', cpm: 8.4, icon: 'ri-heart-pulse-line', color: 'text-red-500', bar: 67 },
                { niche: 'Education', cpm: 7.8, icon: 'ri-graduation-cap-line', color: 'text-yellow-500', bar: 62 },
                { niche: 'Entertainment', cpm: 4.2, icon: 'ri-movie-line', color: 'text-orange-500', bar: 34 },
              ].map((row) => (
                <div key={row.niche} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <i className={`${row.icon} ${row.color} text-sm`}></i>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-white/70 w-28 flex-shrink-0">{row.niche}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${row.bar}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-green-500 font-mono w-12 text-right">${row.cpm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Toast notifications */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full px-5 py-2.5 flex items-center gap-2 text-sm font-medium">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-check-line text-green-400 dark:text-green-600 text-sm"></i>
          </div>
          Link copied to clipboard!
        </div>
      )}
      {pdfToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full px-5 py-2.5 flex items-center gap-2 text-sm font-medium">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-file-pdf-line text-green-400 dark:text-green-600 text-sm"></i>
          </div>
          PDF export coming soon!
        </div>
      )}
    </div>
  );
};

export default RevenueCalculatorPage;
