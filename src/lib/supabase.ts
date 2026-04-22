import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Supabase 환경변수 누락');
}

// ANON_KEY만 사용 (service_key 금지 - rejected #007)
export const supabase = createClient(url, anonKey);
