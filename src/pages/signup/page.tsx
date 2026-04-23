import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { ViralBoardIcon } from '@/components/ViralBoardIcon';

const SignupPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signInWithGoogle, signUpWithEmail, error, clearError, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);

  const displayError = localError || error || '';

  const getPasswordStrength = (pw: string) => {
    if (!pw) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: t('signup_weak'), color: 'bg-red-500' };
    if (score === 2) return { level: 2, label: t('signup_fair'), color: 'bg-orange-400' };
    if (score === 3) return { level: 3, label: t('signup_good'), color: 'bg-yellow-400' };
    return { level: 4, label: t('signup_strong'), color: 'bg-green-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email || !password || !confirmPassword) { setLocalError(t('signup_error_fill')); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setLocalError(t('signup_error_email')); return; }
    if (password.length < 6) { setLocalError(t('signup_error_length')); return; }
    if (password !== confirmPassword) { setLocalError(t('signup_error_match')); return; }

    setLoading(true);
    try {
      await signUpWithEmail(email, password);
      setSuccess(true);
    } catch {
      // error set by useAuth
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    clearError();
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      // error set by useAuth
    } finally {
      setLoading(false);
    }
  };

  const busy = loading || authLoading;

  if (success) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <i className="ri-mail-check-line text-green-400 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">이메일을 확인해주세요</h2>
          <p className="text-sm text-white/50 mb-6">{email}로 인증 링크를 보냈습니다. 링크를 클릭하면 로그인됩니다.</p>
          <Link to="/login" className="text-red-400 hover:text-red-300 text-sm font-medium">
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

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
          <span>{t('signup_have_account')}</span>
          <Link to="/login" className="text-white font-medium hover:text-red-400 transition-colors cursor-pointer">
            {t('signup_signin_link')}
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">{t('signup_title')}</h1>
            <p className="text-sm text-white/40">{t('signup_subtitle')}</p>
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap mb-5 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {t('signup_google')}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-white/30">{t('signup_or')}</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {displayError && (
              <div className="bg-red-600/10 border border-red-600/30 rounded-lg px-4 py-3">
                <p className="text-sm text-red-400">{displayError}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">{t('signup_email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">{t('signup_password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6자 이상"
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
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.level ? strength.color : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-white/30">{t('signup_strength')} <span className="text-white/60">{strength.label}</span></p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">{t('signup_confirm')}</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className={`w-full bg-[#1e1e1e] border rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-colors pr-10 ${
                    confirmPassword && confirmPassword !== password ? 'border-red-500/50' : confirmPassword && confirmPassword === password ? 'border-green-500/50' : 'border-white/10 focus:border-white/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer w-5 h-5 flex items-center justify-center"
                >
                  <i className={showConfirm ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
                {confirmPassword && (
                  <div className="absolute right-9 top-1/2 -translate-y-1/2">
                    {confirmPassword === password ? <i className="ri-check-line text-green-500 text-sm"></i> : <i className="ri-close-line text-red-500 text-sm"></i>}
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-white/30 leading-relaxed">
              {t('signup_terms_text')}{' '}
              <a href="#" className="text-white/50 hover:text-white underline cursor-pointer">{t('signup_terms')}</a>{' '}
              {t('signup_and')}{' '}
              <a href="#" className="text-white/50 hover:text-white underline cursor-pointer">{t('signup_privacy')}</a>.
            </p>

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              {busy ? t('signup_submitting') : t('signup_submit')}
            </button>
          </form>

          <p className="text-center text-sm text-white/30 mt-6">
            {t('signup_have_account')}{' '}
            <Link to="/login" className="text-white hover:text-red-400 font-medium transition-colors cursor-pointer">
              {t('signup_signin_link')}
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

export default SignupPage;
