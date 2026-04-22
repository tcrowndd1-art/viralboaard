/**
 * ViralBoard Aggregator
 * Usage: node scripts/aggregate.js
 *
 * 스냅샷 JSON → hook_performance + weekly/monthly rankings 생성
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

function loadAllVideoSnapshots() {
  const dir = path.join(dataDir, 'snapshots/videos');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const all = [];
  for (const f of files) {
    const date = f.slice(0, 10);
    const items = JSON.parse(fs.readFileSync(path.join(dir, f)));
    all.push(...items.map(v => ({ ...v, snapshotDate: date })));
  }
  return all;
}

function loadAllChannelSnapshots() {
  const dir = path.join(dataDir, 'snapshots/channels');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const all = [];
  for (const f of files) {
    const date = f.slice(0, 10);
    const items = JSON.parse(fs.readFileSync(path.join(dir, f)));
    all.push(...items.map(c => ({ ...c, snapshotDate: date })));
  }
  return all;
}

function getWeekKey(dateStr) {
  const d = new Date(dateStr);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function aggregate() {
  const videos = loadAllVideoSnapshots();
  const channels = loadAllChannelSnapshots();

  // ── 1. Hook Performance by week + country ──
  const hookMap = {};
  for (const v of videos) {
    const week = getWeekKey(v.snapshotDate);
    const key = `${week}_${v.hookType}_${v.country || 'ALL'}`;
    if (!hookMap[key]) {
      hookMap[key] = {
        hookType: v.hookType,
        week,
        country: v.country || 'ALL',
        samples: [],
      };
    }
    hookMap[key].samples.push(v.viralVelocity);
  }

  const hookPerf = Object.values(hookMap).map(h => {
    const sorted = h.samples.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return {
      hookType: h.hookType,
      week: h.week,
      country: h.country,
      sampleCount: sorted.length,
      avgVelocity: Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length),
      medianVelocity: sorted[mid],
      maxVelocity: sorted[sorted.length - 1],
    };
  }).sort((a, b) => b.avgVelocity - a.avgVelocity);

  const hookFile = path.join(dataDir, 'aggregated/hook_performance/latest.json');
  fs.writeFileSync(hookFile, JSON.stringify(hookPerf, null, 2));
  console.log(`✅ hook_performance: ${hookPerf.length}개 → ${hookFile}`);

  // ── 2. Weekly channel rankings via snapshot diff ──
  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const todaySnaps   = channels.filter(c => c.snapshotDate === today);
  const weekAgoSnaps = channels.filter(c => c.snapshotDate === sevenDaysAgo);
  const monthAgoSnaps = channels.filter(c => c.snapshotDate === thirtyDaysAgo);

  const todayMap    = new Map(todaySnaps.map(c => [c.channelId, c]));
  const weekMap     = new Map(weekAgoSnaps.map(c => [c.channelId, c]));
  const monthMap    = new Map(monthAgoSnaps.map(c => [c.channelId, c]));

  // Weekly ranking
  const weeklyRanking = [...todayMap.entries()]
    .filter(([id]) => weekMap.has(id))
    .map(([id, now]) => {
      const prev = weekMap.get(id);
      const weeklyViews = now.totalViews - prev.totalViews;
      return { channelId: id, name: now.name, country: now.country, weeklyViews, subscribers: now.subscribers };
    })
    .sort((a, b) => b.weeklyViews - a.weeklyViews)
    .slice(0, 25)
    .map((c, i) => ({ rank: i + 1, ...c }));

  const wFile = path.join(dataDir, `aggregated/weekly_rankings/${today}.json`);
  fs.writeFileSync(wFile, JSON.stringify(weeklyRanking, null, 2));
  console.log(`✅ weekly_rankings: ${weeklyRanking.length}개 → ${wFile}`);

  // Monthly ranking
  const monthlyRanking = [...todayMap.entries()]
    .filter(([id]) => monthMap.has(id))
    .map(([id, now]) => {
      const prev = monthMap.get(id);
      const monthlyViews = now.totalViews - prev.totalViews;
      return { channelId: id, name: now.name, country: now.country, monthlyViews, subscribers: now.subscribers };
    })
    .sort((a, b) => b.monthlyViews - a.monthlyViews)
    .slice(0, 25)
    .map((c, i) => ({ rank: i + 1, ...c }));

  const mFile = path.join(dataDir, `aggregated/monthly_rankings/${today}.json`);
  fs.mkdirSync(path.dirname(mFile), { recursive: true });
  fs.writeFileSync(mFile, JSON.stringify(monthlyRanking, null, 2));
  console.log(`✅ monthly_rankings: ${monthlyRanking.length}개 → ${mFile}`);

  // ── Summary ──
  console.log('\n📊 훅 TOP 5 (이번 주 velocity 기준):');
  hookPerf.slice(0, 5).forEach(h => {
    console.log(`  ${h.hookType.padEnd(22)} avg ${h.avgVelocity.toLocaleString()}/day  n=${h.sampleCount}`);
  });
}

aggregate();
