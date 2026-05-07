// One-off DB check script — not committed
// Run: node scripts/db_check.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = {};
try {
  readFileSync('c:/Ai_Wiki/viralboard/.env', 'utf-8')
    .split('\n')
    .forEach(line => {
      const clean = line.replace(/\r$/, '');
      const m = clean.match(/^([^#=\s]+)\s*=\s*(.*)$/);
      if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    });
} catch (e) { console.error('Cannot read .env:', e.message); process.exit(1); }

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Missing Supabase env vars'); process.exit(1); }
const sb = createClient(url, key);

async function run() {
  // A. video_snapshots 테이블 존재 확인
  console.log('\n[A] video_snapshots 최근 20개');
  const { data: snap, error: snapErr } = await sb
    .from('video_snapshots').select('published_at, title, country')
    .order('published_at', { ascending: false }).limit(20);
  if (snapErr) console.log('  ❌ 오류:', snapErr.message);
  else if (!snap?.length) console.log('  ⚠️  결과 없음');
  else snap.forEach((r, i) =>
    console.log(`  ${i+1}. ${(r.published_at??'').slice(0,10)} | ${r.country??'?'} | ${(r.title??'').slice(0,50)}`));

  // B. viralboard_data 최근 20개
  console.log('\n[B] viralboard_data 최근 20개 (published_at 기준)');
  const { data: vb, error: vbErr } = await sb
    .from('viralboard_data').select('published_at, title, country')
    .order('published_at', { ascending: false }).limit(20);
  if (vbErr) console.log('  ❌ 오류:', vbErr.message);
  else if (!vb?.length) console.log('  ⚠️  결과 없음');
  else vb.forEach((r, i) =>
    console.log(`  ${i+1}. ${(r.published_at??'').slice(0,10)} | ${r.country??'?'} | ${(r.title??'').slice(0,50)}`));

  // C. 날짜 분포
  console.log('\n[C] viralboard_data 날짜 분포');
  const { data: all } = await sb
    .from('viralboard_data').select('published_at').order('published_at', { ascending: false }).limit(500);
  if (all?.length) {
    const now = Date.now();
    const b = { today: 0, w7: 0, d30: 0, old: 0 };
    for (const r of all) {
      if (!r.published_at) continue;
      const d = (now - new Date(r.published_at)) / 86400000;
      if (d <= 1) b.today++;
      else if (d <= 7) b.w7++;
      else if (d <= 30) b.d30++;
      else b.old++;
    }
    console.log(`  오늘(1일이내): ${b.today}개`);
    console.log(`  최근 7일:      ${b.w7}개`);
    console.log(`  최근 30일:     ${b.d30}개`);
    console.log(`  30일 초과:     ${b.old}개`);
    console.log(`  합계(쿼리):    ${all.length}개`);
  }

  // D. fetched_at 기준 최신
  const { data: ft } = await sb
    .from('viralboard_data').select('fetched_at').order('fetched_at', { ascending: false }).limit(1);
  if (ft?.[0]?.fetched_at) console.log(`\n[D] 마지막 fetched_at: ${ft[0].fetched_at}`);

  // E. 전체 row 수 + 국가 분포
  console.log('\n[E] 국가별 영상 수 (Top 10)');
  const { data: ctry } = await sb
    .from('viralboard_data').select('country').limit(2000);
  if (ctry?.length) {
    const m = {};
    for (const r of ctry) { const c = r.country ?? 'null'; m[c] = (m[c]||0)+1; }
    Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,10)
      .forEach(([k,v]) => console.log(`  ${k}: ${v}`));
  }
}

run().catch(e => { console.error(e); process.exit(1); });
