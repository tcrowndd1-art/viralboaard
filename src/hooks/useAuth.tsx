import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseError(err: unknown): string {
  const msg = (err as AuthError)?.message ?? (err instanceof Error ? err.message : '');
  const map: Record<string, string> = {
    'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'Email not confirmed': '이메일 인증이 필요합니다. 메일함을 확인해주세요.',
    'User already registered': '이미 등록된 이메일입니다.',
    'Password should be at least 6 characters': '비밀번호는 6자 이상이어야 합니다.',
    'provider is not enabled': 'Google 로그인이 아직 설정되지 않았습니다. 이메일로 로그인해주세요.',
    'Unsupported provider': 'Google 로그인이 아직 설정되지 않았습니다. 이메일로 로그인해주세요.',
  };
  for (const [key, val] of Object.entries(map)) {
    if (msg.includes(key)) return val;
  }
  return msg || '오류가 발생했습니다.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    // Pre-flight: check if Google OAuth is enabled before redirecting browser
    try {
      const settingsRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/settings`, {
        headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '' },
      });
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        if (!settings?.external?.google) {
          const msg = 'Google 로그인이 아직 설정되지 않았습니다. 이메일로 로그인해주세요.';
          setError(msg);
          throw new Error('provider is not enabled');
        }
      }
    } catch (preflight) {
      if ((preflight as Error).message === 'provider is not enabled') throw preflight;
      // settings fetch failed — proceed anyway, Supabase will handle it
    }
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (err) { setError(parseError(err)); throw err; }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(parseError(err)); throw err; }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setError(null);
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) { setError(parseError(err)); throw err; }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, error, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, clearError: () => setError(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
