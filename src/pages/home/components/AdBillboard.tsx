import { useState, useEffect } from 'react';

interface AdItem {
  id: number;
  bg: string;
  accent: string;
  brand: string;
  cat: string;
  symbol: string;
  headline: string[];
  sub: string;
  url: string;
  displayUrl: string;
  cta: string;
}

const ADS: AdItem[] = [
  { id: 1,  bg: '#06030f', accent: '#a855f7', brand: 'Canva',      cat: 'Design',      symbol: '✦', headline: ['Design', 'anything.'],       sub: '썸네일·쇼츠 커버 — 10초 만에 프로급 디자인',         url: 'https://www.canva.com',               displayUrl: 'canva.com',       cta: 'Free →' },
  { id: 2,  bg: '#030d08', accent: '#00c566', brand: 'CapCut',     cat: 'Video Edit',  symbol: '▶', headline: ['Edit like', 'a pro.'],        sub: 'AI 자막·자동 컷·배경 제거 — 쇼츠 최강 툴',           url: 'https://www.capcut.com',              displayUrl: 'capcut.com',      cta: 'Try →' },
  { id: 3,  bg: '#080c14', accent: '#4f8ef7', brand: 'Genspark',   cat: 'AI Agent',    symbol: '◈', headline: ['Research.', 'Ship.'],          sub: '유튜버를 위한 AI 슈퍼에이전트 — 기획부터 스크립트',   url: 'https://www.genspark.ai',             displayUrl: 'genspark.ai',     cta: 'Free →' },
  { id: 4,  bg: '#0c0803', accent: '#ff5c1a', brand: 'Higgsfield', cat: 'Video AI',    symbol: '◉', headline: ['Cinematic', 'AI Video.'],      sub: '텍스트 한 줄 → 할리우드급 쇼츠',                     url: 'https://higgsfield.ai',               displayUrl: 'higgsfield.ai',   cta: 'Try →' },
  { id: 5,  bg: '#08080f', accent: '#818cf8', brand: 'Hermes',     cat: 'Open LLM',    symbol: 'Ω', headline: ['Uncensored.', 'Unrestricted.'], sub: '로컬 실행 오픈소스 LLM — 검열 없는 대본 생성',        url: 'https://huggingface.co/NousResearch', displayUrl: 'huggingface.co',  cta: 'Free →' },
  { id: 6,  bg: '#0a0a0a', accent: '#ef4444', brand: 'Runway',     cat: 'Gen-3',       symbol: '▷', headline: ['Text to', 'Film.'],            sub: '이미지·텍스트로 영화 같은 인트로 영상',               url: 'https://runwayml.com',                displayUrl: 'runwayml.com',    cta: 'Start →' },
  { id: 7,  bg: '#040d06', accent: '#22c55e', brand: 'ElevenLabs', cat: 'Voice AI',    symbol: '≋', headline: ['Your Voice.', 'Every Lang.'],  sub: '내 목소리로 다국어 나레이션 — 영상 더빙 자동화',       url: 'https://elevenlabs.io',               displayUrl: 'elevenlabs.io',   cta: 'Clone →' },
  { id: 8,  bg: '#08090a', accent: '#38bdf8', brand: 'Descript',   cat: 'Edit AI',     symbol: '⌁', headline: ['Edit video', 'like a doc.'],   sub: '텍스트 편집으로 영상 컷·자막·제거 자동화',           url: 'https://www.descript.com',            displayUrl: 'descript.com',    cta: 'Free →' },
  { id: 9,  bg: '#0d0808', accent: '#fb923c', brand: 'HeyGen',     cat: 'Avatar AI',   symbol: '◉', headline: ['No Face.', 'Full Impact.'],    sub: 'AI 아바타 + 자동 립싱크 — 얼굴 없이 채널 운영',       url: 'https://www.heygen.com',              displayUrl: 'heygen.com',      cta: 'Demo →' },
  { id: 10, bg: '#050a12', accent: '#06b6d4', brand: 'Claude',     cat: 'Anthropic',   symbol: '⬡', headline: ['Smarter', 'Scripts.'],         sub: '대본·기획·SEO 분석 — 유튜버 전용 AI 파트너',          url: 'https://claude.ai',                   displayUrl: 'claude.ai',       cta: 'Use →' },
  { id: 11, bg: '#090909', accent: '#e879f9', brand: 'Midjourney', cat: 'Image AI',    symbol: '◐', headline: ['Thumbnails', 'that Convert.'], sub: 'CTR 3배 높이는 AI 썸네일 — 클릭을 부르는 비주얼',     url: 'https://midjourney.com',              displayUrl: 'midjourney.com',  cta: 'Join →' },
  { id: 12, bg: '#04090f', accent: '#60a5fa', brand: 'VidIQ',      cat: 'Growth Tool', symbol: '◈', headline: ['Grow faster.', 'Rank higher.'], sub: 'SEO·키워드·트렌드 분석 — 유튜브 1위 전략',           url: 'https://vidiq.com',                   displayUrl: 'vidiq.com',       cta: 'Analyze →' },
];

const AdLayer = ({ a, opacity }: { a: AdItem; opacity: number }) => (
  <div
    style={{
      position: 'absolute', inset: 0,
      background: a.bg,
      opacity,
      transition: 'opacity 1.2s ease',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      borderRadius: '10px',
      overflow: 'hidden',
    }}
  >
    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent 0%, ${a.accent} 40%, ${a.accent} 60%, transparent 100%)` }} />
    <div className="absolute top-0 left-0 bottom-0 w-[2px]" style={{ background: `linear-gradient(180deg, ${a.accent}90, ${a.accent}20, transparent)` }} />
    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: a.accent }} />
      <span className="text-[7px] font-black tracking-widest uppercase" style={{ color: `${a.accent}cc` }}>AD</span>
    </div>
    <span className="absolute right-2 top-1/2 -translate-y-1/2 font-black select-none pointer-events-none"
      style={{ fontSize: '90px', opacity: 0.05, color: a.accent, lineHeight: 1 }}>
      {a.symbol}
    </span>
    <div className="flex flex-col justify-between h-full px-3.5 py-3 relative z-10">
      <div className="flex items-center gap-1.5">
        <span style={{ color: a.accent }} className="text-base font-black leading-none">{a.symbol}</span>
        <div>
          <p className="text-white text-[11px] font-black tracking-tight leading-none">{a.brand}</p>
          <p className="text-[8px] font-bold tracking-widest uppercase mt-0.5" style={{ color: a.accent }}>{a.cat}</p>
        </div>
      </div>
      <div>
        {a.headline.map((line, i) => (
          <p key={i} className="text-white font-black leading-none" style={{ fontSize: '20px', letterSpacing: '-0.3px', lineHeight: 1.1 }}>{line}</p>
        ))}
      </div>
      <div>
        <p className="text-white/30 text-[9px] leading-snug mb-2.5">{a.sub}</p>
        <div className="flex items-center justify-between">
          <span className="text-white/20 text-[8px] font-mono">{a.displayUrl}</span>
          <span className="text-[9px] font-black px-2 py-1 rounded" style={{ background: a.accent, color: '#000' }}>
            {a.cta}
          </span>
        </div>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${a.accent}60, transparent)` }} />
  </div>
);

/* Vertical card billboard (192×210) — used in hero and content stream */
export const AdBillboard = ({ offset = 0 }: { offset?: number }) => {
  const [current, setCurrent] = useState(offset % ADS.length);
  const [next, setNext] = useState((offset + 1) % ADS.length);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const upcoming = (current + 1) % ADS.length;
      setNext(upcoming);
      setFading(true);
      setTimeout(() => {
        setCurrent(upcoming);
        setFading(false);
      }, 1200);
    }, 8000 + offset * 1600);
    return () => clearInterval(timer);
  }, [current, offset]);

  const ad = ADS[current];
  const adNext = ADS[next];

  return (
    <a
      href={fading ? adNext.url : ad.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden lg:block flex-shrink-0"
      style={{
        width: '192px', height: '210px',
        position: 'relative', borderRadius: '10px',
        border: `1px solid ${(fading ? adNext : ad).accent}28`,
        boxShadow: `0 0 18px ${(fading ? adNext : ad).accent}12`,
        textDecoration: 'none', cursor: 'pointer', flexShrink: 0,
        transition: 'border-color 1.2s ease, box-shadow 1.2s ease',
      }}
    >
      <AdLayer a={adNext} opacity={fading ? 1 : 0} />
      <AdLayer a={ad} opacity={fading ? 0 : 1} />
    </a>
  );
};

/* Horizontal strip ad — for in-content placement between sections */
export const AdStrip = ({ offset = 0 }: { offset?: number }) => {
  const [current, setCurrent] = useState(offset % ADS.length);
  const [next, setNext] = useState((offset + 1) % ADS.length);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const upcoming = (current + 1) % ADS.length;
      setNext(upcoming);
      setFading(true);
      setTimeout(() => { setCurrent(upcoming); setFading(false); }, 1000);
    }, 10000 + offset * 2000);
    return () => clearInterval(timer);
  }, [current, offset]);

  const renderAd = (a: AdItem, opacity: number) => (
    <div
      style={{
        position: 'absolute', inset: 0,
        background: a.bg,
        opacity,
        transition: 'opacity 1s ease',
        borderRadius: '10px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px 20px',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${a.accent}, transparent)` }} />
      <div className="absolute top-0 left-0 bottom-0 w-[2px]" style={{ background: `linear-gradient(180deg, ${a.accent}80, transparent)` }} />
      <div className="absolute top-2 right-3 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: a.accent }} />
        <span className="text-[7px] font-black tracking-widest uppercase" style={{ color: `${a.accent}99` }}>AD</span>
      </div>
      <span className="font-black text-3xl select-none flex-shrink-0" style={{ color: a.accent }}>{a.symbol}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white text-sm font-black">{a.brand}</span>
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${a.accent}22`, color: a.accent }}>{a.cat}</span>
        </div>
        <p className="text-white font-black text-base leading-tight" style={{ letterSpacing: '-0.3px' }}>
          {a.headline.join(' ')}
        </p>
        <p className="text-white/30 text-[10px] truncate mt-0.5">{a.sub}</p>
      </div>
      <span
        className="flex-shrink-0 text-xs font-black px-3 py-1.5 rounded cursor-pointer whitespace-nowrap"
        style={{ background: a.accent, color: '#000' }}
      >
        {a.cta}
      </span>
    </div>
  );

  const ad = fading ? ADS[next] : ADS[current];

  return (
    <a
      href={ad.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mx-4 sm:mx-6 rounded-[10px] cursor-pointer"
      style={{
        height: '68px',
        position: 'relative',
        border: `1px solid ${ad.accent}28`,
        boxShadow: `0 0 14px ${ad.accent}10`,
        textDecoration: 'none',
        transition: 'border-color 1s ease, box-shadow 1s ease',
      }}
    >
      {renderAd(ADS[current], fading ? 0 : 1)}
      {renderAd(ADS[next],    fading ? 1 : 0)}
    </a>
  );
};

export default AdBillboard;
