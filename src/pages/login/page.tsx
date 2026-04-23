import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { ViralBoardIcon } from '@/components/ViralBoardIcon';

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signInWithGoogle, signInWithEmail, error, clearError, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const displayError = localError || error || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email || !password) { setLocalError(t('login_error_fill')); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setLocalError(t('login_error_email')); return; }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
      navigate('/dashboard');
    } catch {
      // error set by useAuth
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    setLoading(true);
    try {
      await signInWithGoogle();
      // redirect happens via OAuth redirect
    } catch {
      // error set by useAuth
    } finally {
      setLoading(false);
    }
  };

  const busy = loading || authLoading;

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2 group transition-opacity hover:opacity-85 whitespace-nowrap cursor-pointer">
          <ViralBoardIcon size={24} />
          <span className="font-black text-[12px] tracking-[0.1em] text-white uppercase">
            ViralBoard
          </span>
        </Link>
        <div className="flex items-center gap-2 text-sm text-white/50">
          <span>{t('login_no_account')}</span>
          <Link to="/signup" className="text-white font-medium hover:text-red-400 transition-colors cursor-pointer">
            {t('login_signup_link')}
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">{t('login_title')}</h1>
            <p className="text-sm text-white/40">{t('login_subtitle')}</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap mb-5 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {t('login_google')}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-white/30">{t('login_or')}</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {displayError && (
              <div className="bg-red-600/10 border border-red-600/30 rounded-lg px-4 py-3">
                <p className="text-sm text-red-400">{displayError}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">{t('login_email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-white/60">{t('login_password')}</label>
                <a href="#" className="text-xs text-white/40 hover:text-white/70 cursor-pointer transition-colors">
                  {t('login_forgot')}
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer w-5 h-5 flex items-center justify-center"
                >
                  <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap mt-2"
            >
              {busy ? t('login_submitting') : t('login_submit')}
            </button>
          </form>

          <p className="text-center text-sm text-white/30 mt-6">
            {t('login_new_to')}{' '}
            <Link to="/signup" className="text-white hover:text-red-400 font-medium transition-colors cursor-pointer">
              {t('login_create')}
            </Link>
          </p>
        </div>
      </div>

      <footer className="px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-white/20">{t('footer_copyright')}</p>
        <div className="flex items-center gap-4">
          <a href="#" className="text-xs text-white/20 hover:text-white/40 cursor-pointer">{t('footer_terms')}</a>
          <a href="#" className="text-xs text-white/20 hover:text-white/40 cursor-pointer">{t('footer_privacy')}</a>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
