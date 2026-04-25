import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ViralBoardIcon } from '@/components/ViralBoardIcon';
import { useTheme } from '@/hooks/useTheme';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Kim',
    role: 'YouTube Creator · 280K subs',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20young%20asian%20woman%20smiling%20portrait%20clean%20white%20background%20studio%20lighting&width=80&height=80&seq=ext-avatar-1&orientation=squarish',
    rating: 5,
    text: 'ViralBoard\'s extension changed how I research competitors. I can see revenue estimates and hook types instantly on any video — saved me hours every week.',
  },
  {
    id: 2,
    name: 'Marcus Oliveira',
    role: 'Content Strategist · Agency Owner',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20young%20latin%20man%20smiling%20portrait%20clean%20white%20background%20studio%20lighting&width=80&height=80&seq=ext-avatar-2&orientation=squarish',
    rating: 5,
    text: 'The Viral Score gauge is insanely accurate. I\'ve been using it to predict which videos will blow up before they do. My clients love the data-driven approach.',
  },
  {
    id: 3,
    name: 'Yuna Park',
    role: 'Tech YouTuber · 1.2M subs',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20young%20korean%20woman%20smiling%20portrait%20clean%20white%20background%20studio%20lighting&width=80&height=80&seq=ext-avatar-3&orientation=squarish',
    rating: 5,
    text: 'Best upload time suggestions alone are worth it. My last 3 videos hit 500K+ views within 48 hours. The hook type analysis is a game changer for scripting.',
  },
];

const benefits = [
  {
    icon: 'ri-flashlight-line',
    title: 'Instant Analysis',
    desc: 'Get viral score, CPM, and revenue estimates the moment you open any YouTube video. No extra clicks, no waiting.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-500/10',
  },
  {
    icon: 'ri-money-dollar-circle-line',
    title: 'Revenue Estimate',
    desc: 'See estimated monthly revenue ranges for any channel based on real CPM data and view counts across niches.',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-500/10',
  },
  {
    icon: 'ri-lightbulb-flash-line',
    title: 'Hook Suggestions',
    desc: 'AI identifies the hook type used in every video and suggests the best hooks for your next upload based on your niche.',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-500/10',
  },
];

const overlayStats = [
  { label: 'Viral Score', value: '94', unit: '/100', color: 'text-red-400', icon: 'ri-fire-line' },
  { label: 'Est. Monthly Revenue', value: '$1.8M', unit: '– $4.2M', color: 'text-green-400', icon: 'ri-money-dollar-circle-line' },
  { label: 'Hook Type', value: 'Shock', unit: 'Statement', color: 'text-orange-400', icon: 'ri-flashlight-line' },
  { label: 'Best Upload Time', value: 'Fri', unit: '3–5 PM EST', color: 'text-yellow-400', icon: 'ri-time-line' },
  { label: 'Competition Score', value: '72', unit: '/100', color: 'text-white/70', icon: 'ri-bar-chart-line' },
];

const ChromeExtensionPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viralScore, setViralScore] = useState(0);
  const [competitionWidth, setCompetitionWidth] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setViralScore(94);
      setCompetitionWidth(72);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    const formData = new URLSearchParams();
    formData.append('email', email);
    try {
      await fetch('https://readdy.ai/api/form/d7ijjgk6o6v9400gqhp0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (viralScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-white transition-colors">
      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:text-red-500 transition-colors whitespace-nowrap">
            <ViralBoardIcon size={22} />
            <span className="font-black text-lg tracking-widest text-gray-900 dark:text-white uppercase">ViralBoard</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
            <Link to="/rankings" className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors">Rankings</Link>
            <Link to="/insights" className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors">Insights</Link>
            <a href="#features" className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isDark ? <i className="ri-sun-line text-base"></i> : <i className="ri-moon-line text-base"></i>}
            </button>
            <Link
              to="/login"
              className="hidden md:block text-sm px-4 py-1.5 border border-gray-300 dark:border-white/20 rounded-md text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors whitespace-nowrap cursor-pointer"
            >
              Sign in
            </Link>
            <button
              className="lg:hidden text-gray-600 dark:text-white/60 w-8 h-8 flex items-center justify-center cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className={mobileMenuOpen ? 'ri-close-line text-lg' : 'ri-menu-line text-lg'}></i>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-[#181818] border-t border-gray-200 dark:border-white/10 px-4 py-4 flex flex-col gap-3">
            <Link to="/" className="text-sm text-gray-600 dark:text-white/60 py-2">Home</Link>
            <Link to="/rankings" className="text-sm text-gray-600 dark:text-white/60 py-2">Rankings</Link>
            <Link to="/insights" className="text-sm text-gray-600 dark:text-white/60 py-2">Insights</Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 lg:px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-red-950/20 dark:via-[#0f0f0f] dark:to-orange-950/10 pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-red-100 dark:bg-red-900/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-100 dark:bg-orange-900/10 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-chrome-line text-red-500 text-sm"></i>
              </div>
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">Chrome Extension · Coming Soon</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-6 tracking-tight">
              YouTube Analytics<br />
              <span className="text-red-500">Right in Your Browser</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
              See viral scores, revenue estimates, hook types, and competition data on any YouTube video — without leaving the page.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#waitlist"
                className="relative inline-flex items-center gap-2 px-8 py-3.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap text-base"
                style={{ boxShadow: '0 0 30px rgba(239,68,68,0.4)' }}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-chrome-line text-base"></i>
                </div>
                Get Extension — Coming Soon
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer whitespace-nowrap text-sm font-medium"
              >
                See how it works
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-arrow-down-line text-sm"></i>
                </div>
              </a>
            </div>
          </div>

          {/* Browser Mockup */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
              {/* Browser chrome */}
              <div className="bg-gray-200 dark:bg-[#242424] px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-white dark:bg-[#181818] rounded-md px-3 py-1 flex items-center gap-2">
                  <div className="w-3 h-3 flex items-center justify-center">
                    <i className="ri-lock-line text-gray-400 dark:text-white/30 text-xs"></i>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-white/30 font-mono">youtube.com/watch?v=dQw4w9WgXcQ</span>
                </div>
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-puzzle-line text-gray-500 dark:text-white/40 text-sm"></i>
                </div>
              </div>

              {/* YouTube page mockup */}
              <div className="flex gap-0 relative">
                {/* Main video area */}
                <div className="flex-1 p-4 min-w-0">
                  {/* Video player */}
                  <div className="w-full aspect-video bg-gray-900 rounded-lg overflow-hidden relative mb-3">
                    <img
                      src="https://readdy.ai/api/search-image?query=YouTube%20video%20player%20dark%20interface%20showing%20a%20viral%20challenge%20video%20with%20millions%20of%20views%20dramatic%20thumbnail&width=640&height=360&seq=yt-mockup-1&orientation=landscape"
                      alt="YouTube video mockup"
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 flex items-center justify-center bg-black/60 rounded-full">
                        <i className="ri-play-fill text-white text-2xl"></i>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div className="h-full bg-red-500 w-1/3"></div>
                    </div>
                  </div>
                  {/* Video title */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-1/2"></div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10"></div>
                      <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-24"></div>
                      <div className="ml-auto flex gap-2">
                        <div className="h-7 w-16 bg-gray-200 dark:bg-white/10 rounded-full"></div>
                        <div className="h-7 w-16 bg-gray-200 dark:bg-white/10 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ViralBoard Sidebar Overlay */}
                <div className="w-64 flex-shrink-0 bg-[#0f0f0f] border-l border-white/10 p-3 flex flex-col gap-2">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-bar-chart-box-line text-red-400 text-sm"></i>
                      </div>
                      <span className="text-xs font-black text-white tracking-widest uppercase">ViralBoard</span>
                    </div>
                    <span className="text-xs text-white/30">Live</span>
                  </div>

                  {/* Viral Score Gauge */}
                  <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                        <circle
                          cx="40" cy="40" r="36"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-white leading-none">{viralScore}</span>
                        <span className="text-xs text-white/40">/100</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-0.5">Viral Score</p>
                      <p className="text-sm font-bold text-red-400">Explosive</p>
                      <p className="text-xs text-white/30 mt-0.5">Top 1% globally</p>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="bg-white/5 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-3 h-3 flex items-center justify-center">
                        <i className="ri-money-dollar-circle-line text-green-400 text-xs"></i>
                      </div>
                      <span className="text-xs text-white/40">Est. Monthly Revenue</span>
                    </div>
                    <p className="text-sm font-bold text-green-400">$1.8M – $4.2M</p>
                  </div>

                  {/* Hook Type */}
                  <div className="bg-white/5 rounded-lg px-3 py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Hook Type</p>
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-medium">Shock Statement</span>
                    </div>
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-flashlight-line text-orange-400 text-sm"></i>
                    </div>
                  </div>

                  {/* Best Upload Time */}
                  <div className="bg-white/5 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-3 h-3 flex items-center justify-center">
                        <i className="ri-time-line text-yellow-400 text-xs"></i>
                      </div>
                      <span className="text-xs text-white/40">Best Upload Time</span>
                    </div>
                    <p className="text-sm font-bold text-yellow-400">Fri 3–5 PM EST</p>
                  </div>

                  {/* Competition Score */}
                  <div className="bg-white/5 rounded-lg px-3 py-2.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/40">Competition Score</span>
                      <span className="text-xs text-white/60 font-mono">{competitionWidth}/100</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-1000"
                        style={{ width: `${competitionWidth}%` }}
                      />
                    </div>
                    <p className="text-xs text-white/30 mt-1">High competition niche</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="features" className="py-20 px-4 lg:px-6 bg-[#f5f5f5] dark:bg-[#181818]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
              Everything you need, <span className="text-red-500">instantly</span>
            </h2>
            <p className="text-gray-500 dark:text-white/50 max-w-xl mx-auto">
              No more switching tabs or copy-pasting URLs. ViralBoard lives right inside YouTube.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 rounded-xl p-6 hover:border-red-300 dark:hover:border-red-600/30 transition-colors group"
              >
                <div className={`w-12 h-12 ${b.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <i className={`${b.icon} ${b.color} text-xl`}></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: 'ri-bar-chart-2-line', label: 'Viral Score Gauge' },
              { icon: 'ri-money-dollar-circle-line', label: 'Revenue Estimator' },
              { icon: 'ri-flashlight-line', label: 'Hook Type Detector' },
              { icon: 'ri-time-line', label: 'Best Upload Time' },
              { icon: 'ri-shield-line', label: 'Competition Score' },
              { icon: 'ri-global-line', label: 'Multi-language' },
              { icon: 'ri-refresh-line', label: 'Real-time Updates' },
              { icon: 'ri-lock-line', label: 'Privacy First' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2 bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`${f.icon} text-red-500 text-sm`}></i>
                </div>
                <span className="text-xs text-gray-700 dark:text-white/70 font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section id="waitlist" className="py-20 px-4 lg:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">1,247 creators on the waitlist</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
            Be the first to get it
          </h2>
          <p className="text-gray-500 dark:text-white/50 mb-8">
            Join the waitlist and get early access + 3 months free Pro when we launch.
          </p>

          {submitted ? (
            <div className="bg-green-50 dark:bg-green-600/10 border border-green-200 dark:border-green-600/20 rounded-xl px-6 py-8">
              <div className="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-600/20 rounded-full mx-auto mb-3">
                <i className="ri-check-line text-green-600 dark:text-green-400 text-xl"></i>
              </div>
              <p className="text-green-700 dark:text-green-400 font-semibold text-lg mb-1">You're on the list!</p>
              <p className="text-green-600/70 dark:text-green-400/60 text-sm">We'll email you the moment the extension launches.</p>
            </div>
          ) : (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              data-readdy-form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-4 py-3 bg-white dark:bg-[#181818] border border-gray-300 dark:border-white/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-red-400 dark:focus:border-red-500 transition-colors"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap text-sm"
                style={{ boxShadow: '0 0 20px rgba(239,68,68,0.3)' }}
              >
                {submitting ? 'Joining...' : 'Join Waitlist'}
              </button>
            </form>
          )}

          <p className="text-xs text-gray-400 dark:text-white/25 mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 lg:px-6 bg-[#f5f5f5] dark:bg-[#181818]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Loved by creators</h2>
            <p className="text-gray-500 dark:text-white/50">Early testers are already seeing results</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 rounded-xl p-6 hover:border-red-200 dark:hover:border-red-600/20 transition-colors"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <div key={i} className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-star-fill text-yellow-400 text-sm"></i>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed mb-5 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-white/10 flex-shrink-0">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-400 dark:text-white/40">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-white/10 py-10 px-4 lg:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="font-black text-base tracking-widest text-gray-900 dark:text-white uppercase hover:text-red-500 transition-colors">
            ViralBoard
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 transition-colors">Home</Link>
            <Link to="/rankings" className="text-sm text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 transition-colors">Rankings</Link>
            <Link to="/insights" className="text-sm text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 transition-colors">Insights</Link>
          </div>
          <p className="text-xs text-gray-400 dark:text-white/20">© 2026 DIFF., Inc. All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default ChromeExtensionPage;
