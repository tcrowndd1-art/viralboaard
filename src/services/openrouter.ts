const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string;
const MODEL = (import.meta.env.VITE_AI_MODEL as string) || 'google/gemma-4-31b-it:free';

async function chat(prompt: string, maxTokens = 400): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://viralboard.app',
      'X-Title': 'ViralBoard',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.85,
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export interface GeneratedScript {
  hook: string;
  shock: string;
  evidence: string;
  solution: string;
  cta: string;
}

export async function generateScript(topic: string): Promise<GeneratedScript> {
  const prompt = `당신은 바이럴 숏폼 대본 전문가입니다. 주제: "${topic}"

아래 JSON 형식으로만 답하세요. 설명이나 마크다운 없이 순수 JSON만:
{
  "hook": "0-3초: 스크롤을 멈추게 하는 짧고 강렬한 1-2문장",
  "shock": "3-15초: 충격적인 사실이나 통계, 2-3문장",
  "evidence": "15-30초: 구체적인 근거나 예시, 2-3문장",
  "solution": "30-50초: 숫자가 포함된 구체적인 해결책, 3-4문장",
  "cta": "50-60초: 댓글 유도 (팔로우 언급 절대 금지), 1-2문장"
}

규칙:
- 한국어, 구어체 (~거든요 ~더라고요 ~잖아요)
- hook: 짧은 문장, 충격적, 정체성 공격
- cta: "댓글에 정리해뒀어요" 스타일
- 시간 표시나 섹션명 포함 금지, 본문만`;

  const text = await chat(prompt, 1200);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid response');
  const p = JSON.parse(jsonMatch[0]);
  return {
    hook: p.hook ?? '',
    shock: p.shock ?? '',
    evidence: p.evidence ?? '',
    solution: p.solution ?? '',
    cta: p.cta ?? '',
  };
}

export interface ChannelAnalysis {
  hookPattern: string;
  thumbnailStrategy: string;
  uploadPattern: string;
  growthFormula: string;
  copyStrategy: string[];
}

export async function analyzeChannelGrowth(channel: {
  name: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  description: string;
  recentVideoTitles?: string[];
  recentUploadDates?: string[];
}): Promise<ChannelAnalysis> {
  const subs = channel.subscribers.toLocaleString();
  const views = channel.totalViews.toLocaleString();
  const viralRatio = channel.videoCount > 0
    ? (channel.totalViews / channel.subscribers).toFixed(1)
    : '0';
  const titlesBlock = channel.recentVideoTitles?.length
    ? `최근 영상 제목:\n${channel.recentVideoTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
    : '';
  const datesBlock = channel.recentUploadDates?.length
    ? `업로드 날짜: ${channel.recentUploadDates.join(', ')}`
    : '';

  const prompt = `아래 유튜브 채널 데이터를 분석해서 정확히 5가지를 답해:

채널명: ${channel.name}
구독자: ${subs}명
총 조회수: ${views}회
영상 수: ${channel.videoCount}개
구독자 대비 조회수 비율: ${viralRatio}배
채널 설명: ${channel.description.slice(0, 200)}
${titlesBlock}
${datesBlock}

1. 훅 패턴: 최근 영상 제목에서 공통 훅 유형 (공포/호기심/권위/비밀폭로)
2. 썸네일 전략: 제목에서 추론되는 시각 전략
3. 업로드 패턴: 영상 간 간격으로 추정되는 최적 업로드 주기
4. 성장 공식: 구독자 대비 조회수 비율로 판단한 바이럴 강도
5. 복제 전략: 이 채널을 따라하려면 뭘 해야 하는지 3줄

형식: 각 항목을 "1.", "2.", "3.", "4.", "5."로 시작. 한국어. 번호와 제목 제외하고 내용만 간결하게.`;

  const text = await chat(prompt, 800);

  const extract = (n: number): string => {
    const re = new RegExp(`${n}[.)][^\\n]*\\n?([\\s\\S]*?)(?=\\n${n + 1}[.)]|$)`);
    const m = text.match(re);
    if (m) return m[1]?.trim() ?? '';
    // fallback: split by numbered lines
    const lines = text.split('\n').filter(Boolean);
    const idx = lines.findIndex((l) => l.trim().startsWith(`${n}.`) || l.trim().startsWith(`${n})`));
    return idx >= 0 ? lines[idx].replace(/^\d+[.)]\s*/, '').trim() : '';
  };

  const item5 = text.match(/5[.)][^\n]*\n?([\s\S]*?)$/)?.[1]?.trim() ?? '';
  const copyLines = item5
    .split('\n')
    .map((l) => l.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 3);

  return {
    hookPattern: extract(1),
    thumbnailStrategy: extract(2),
    uploadPattern: extract(3),
    growthFormula: extract(4),
    copyStrategy: copyLines.length > 0 ? copyLines : [item5],
  };
}
