/**
 * ViralBoard Data Collector
 * Usage: node scripts/collect.js --session=1 --region=KR
 *
 * Session 1 (08:00): KR  → API_KEY_1
 * Session 2 (14:00): US  → API_KEY_2
 * Session 3 (20:00): KR  → API_KEY_3 (성장률 급등 감지)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ── CLI args ──
const args = Object.fromEntries(
  process.argv.slice(2).map(a => a.replace('--', '').split('='))
);
const SESSION = parseInt(args.session ?? '1');
const REGION  = args.region ?? 'KR';

// ── API Key rotation ──
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const API_KEYS = [
  process.env.VITE_YT_API_KEY_1,
  process.env.VITE_YT_API_KEY_2,
  process.env.VITE_YT_API_KEY_3,
];
const API_KEY = API_KEYS[SESSION - 1];
if (!API_KEY) {
  console.error(`API_KEY_${SESSION} not set in .env`);
  process.exit(1);
}

const BASE = 'https://www.googleapis.com/youtube/v3';

// ── Hook classifier ──
const HOOK_PATTERNS = [
  { type: 'secret_reveal',      regex: /숨겨진|비밀|몰랐던|알려지지|hidden|secret|untold/i },
  { type: 'shock_stat',         regex: /\d+%|\d+명 중|\d+억|\d+조|top\s*\d+|#\d+/i },
  { type: 'time_limit',         regex: /지금|당장|마지막|년 안에|now|before it|deadline/i },
  { type: 'paradox',            regex: /역설|반대로|오히려|틀렸다|사실은|actually|paradox/i },
  { type: 'empathy_pain',       regex: /지친다면|힘들다면|혹시 당신|if you|당신도/i },
  { type: 'direct_challenge',   regex: /착각|당신의.*틀|가짜|you're wrong|myth/i },
  { type: 'comparison_reversal',regex: /vs|차이|진짜는|실제로는|difference|vs\./i },
  { type: 'immediate_value',    regex: /방법|하는 법|요약|정리|분 만에|how to|in \d+ min/i },
];

function classifyHook(title) {
  for (const { type, regex } of HOOK_PATTERNS) {
    if (regex.test(title)) return type;
  }
  return 'other';
}

// ── HTTP helper ──
function get(endpoint, params) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE}/${endpoint}`);
    url.searchParams.set('key', API_KEY);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    https.get(url.toString(), res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// ── Main collection ──
async function collect() {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`[Session ${SESSION}] ${today} ${REGION} 수집 시작`);

  // 1. mostPopular videos for region
  const videosData = await get('videos', {
    part: 'snippet,statistics,contentDetails',
    chart: 'mostPopular',
    regionCode: REGION,
    maxResults: '50',
  });
  const videos = videosData.items ?? [];
  if (videos.length === 0) { console.log('영상 없음'); return; }

  // 2. Unique channel IDs
  const channelIds = [...new Set(videos.map(v => v.snippet?.channelId).filter(Boolean))];

  // 3. Channel stats
  const channelData = await get('channels', {
    part: 'snippet,statistics',
    id: channelIds.slice(0, 50).join(','),
  });
  const channelMap = new Map(
    (channelData.items ?? []).map(ch => [ch.id, ch])
  );

  // ── Build video snapshots ──
  const videoSnapshots = videos.map(v => {
    const publishedAt = v.snippet?.publishedAt ?? '';
    const ageDays = publishedAt
      ? Math.max(1, Math.round((Date.now() - new Date(publishedAt)) / 86400000))
      : 1;
    const views = parseInt(v.statistics?.viewCount ?? '0');
    const durationSec = parseDurationSec(v.contentDetails?.duration ?? '');

    return {
      videoId: v.id,
      channelId: v.snippet?.channelId ?? '',
      date: today,
      session: SESSION,
      title: v.snippet?.title ?? '',
      publishedAt,
      ageDays,
      views,
      likes: parseInt(v.statistics?.likeCount ?? '0'),
      comments: parseInt(v.statistics?.commentCount ?? '0'),
      durationSec,
      isShorts: durationSec <= 60,
      hookType: classifyHook(v.snippet?.title ?? ''),
      viralVelocity: Math.round(views / ageDays),
    };
  });

  // ── Build channel snapshots ──
  const channelSnapshots = [...channelMap.values()].map(ch => ({
    channelId: ch.id,
    name: ch.snippet?.title ?? '',
    country: ch.snippet?.country ?? REGION,
    date: today,
    session: SESSION,
    subscribers: parseInt(ch.statistics?.subscriberCount ?? '0'),
    totalViews: parseInt(ch.statistics?.viewCount ?? '0'),
    videoCount: parseInt(ch.statistics?.videoCount ?? '0'),
  }));

  // ── Save ──
  const dataDir = path.join(__dirname, '../data');
  const vFile = path.join(dataDir, `snapshots/videos/${today}_session${SESSION}_${REGION}.json`);
  const cFile = path.join(dataDir, `snapshots/channels/${today}_session${SESSION}_${REGION}.json`);

  fs.writeFileSync(vFile, JSON.stringify(videoSnapshots, null, 2));
  fs.writeFileSync(cFile, JSON.stringify(channelSnapshots, null, 2));

  console.log(`✅ 영상 ${videoSnapshots.length}개 저장 → ${vFile}`);
  console.log(`✅ 채널 ${channelSnapshots.length}개 저장 → ${cFile}`);

  // ── Hook summary ──
  const hookCounts = {};
  for (const v of videoSnapshots) {
    const k = v.hookType;
    if (!hookCounts[k]) hookCounts[k] = { count: 0, totalVelocity: 0 };
    hookCounts[k].count++;
    hookCounts[k].totalVelocity += v.viralVelocity;
  }
  console.log('\n📊 훅 분포:');
  for (const [type, stat] of Object.entries(hookCounts).sort((a, b) => b[1].count - a[1].count)) {
    const avg = Math.round(stat.totalVelocity / stat.count);
    console.log(`  ${type.padEnd(22)} ${stat.count}개  avg velocity: ${avg.toLocaleString()}/day`);
  }
}

function parseDurationSec(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] ?? 0) * 3600) + (parseInt(m[2] ?? 0) * 60) + parseInt(m[3] ?? 0);
}

collect().catch(err => {
  console.error('수집 실패:', err.message);
  process.exit(1);
});
