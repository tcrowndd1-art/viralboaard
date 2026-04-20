const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string;
const MODEL = (import.meta.env.VITE_AI_MODEL as string) || 'google/gemma-4-31b-it:free';
const MODEL_FALLBACK = (import.meta.env.VITE_AI_MODEL_FALLBACK as string) || 'meta-llama/llama-3.3-70b-instruct:free';
const MODEL_FALLBACK_2 = (import.meta.env.VITE_AI_MODEL_FALLBACK_2 as string) || 'openai/gpt-4o-mini';

const alertSent = new Set<string>();

async function sendTelegramAlert(message: string) {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    });
  } catch {}
}

async function chatWithModel(prompt: string, maxTokens: number, model: string): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://viralboard.app',
      'X-Title': 'ViralBoard',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.85,
    }),
  });

  if (res.status === 429) {
    if (model === MODEL) {
      if (!alertSent.has(MODEL)) {
        await sendTelegramAlert('⚠️ Gemma 4 쿼터 초과. Llama 3.3으로 전환합니다.');
        alertSent.add(MODEL);
      }
      return chatWithModel(prompt, maxTokens, MODEL_FALLBACK);
    } else if (model === MODEL_FALLBACK) {
      if (!alertSent.has(MODEL_FALLBACK)) {
        await sendTelegramAlert('🚨 Llama 3.3도 쿼터 초과. GPT-5 Nano(유료)로 전환합니다.');
        alertSent.add(MODEL_FALLBACK);
      }
      return chatWithModel(prompt, maxTokens, MODEL_FALLBACK_2);
    } else if (model === MODEL_FALLBACK_2) {
      await sendTelegramAlert('❌ 전체 AI 엔진 실패. 수동 확인 필요.');
      throw new Error('All AI models exhausted or failed.');
    }
  }

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function chat(prompt: string, maxTokens = 400): Promise<string> {
  return chatWithModel(prompt, maxTokens, MODEL);
}

export interface GeneratedScript {
  hook: string;
  shock: string;
  evidence: string;
  solution: string;
  cta: string;
}

export interface ChannelContext {
  channelName: string;
  hookPattern: string;
  growthFormula: string;
}

export async function generateScript(topic: string, channelContext?: ChannelContext): Promise<GeneratedScript> {
  const contextBlock = channelContext
    ? `\n참고 채널 분석 (이 채널의 스타일을 최대한 반영할 것):\n- 채널명: ${channelContext.channelName}\n- 훅 패턴: ${channelContext.hookPattern}\n- 성장 공식: ${channelContext.growthFormula}\n`
    : '';

  const prompt = `당신은 바이럴 숏폼 대본 전문가입니다. 주제: "${topic}"${contextBlock}

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

  const prompt = `아래 유튜브 채널 데이터를 분석해서 정확히 JSON 형식으로 답해:

채널명: ${channel.name}
구독자: ${subs}명
총 조회수: ${views}회
영상 수: ${channel.videoCount}개
구독자 대비 조회수 비율: ${viralRatio}배
채널 설명: ${channel.description.slice(0, 200)}
${titlesBlock}
${datesBlock}

응답은 반드시 아래 JSON 구조여야 하며, 다른 설명 없이 JSON만 출력해:
{
  "hookPattern": "최근 영상 제목에서 공통 훅 유형 (공포/호기심/권위/비밀폭로)",
  "thumbnailStrategy": "제목에서 추론되는 시각 전략",
  "uploadPattern": "영상 간 간격으로 추정되는 최적 업로드 주기",
  "growthFormula": "구독자 대비 조회수 비율로 판단한 바이럴 강도",
  "copyStrategy": ["복제 전략 1줄", "복제 전략 2줄", "복제 전략 3줄"]
}
한국어로 작성하고 간결하게 답해.`;

  const text = await chat(prompt, 1000);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response: No JSON found');

  const p = JSON.parse(jsonMatch[0]);
  return {
    hookPattern: p.hookPattern ?? '',
    thumbnailStrategy: p.thumbnailStrategy ?? '',
    uploadPattern: p.uploadPattern ?? '',
    growthFormula: p.growthFormula ?? '',
    copyStrategy: Array.isArray(p.copyStrategy) ? p.copyStrategy.slice(0, 3) : [p.copyStrategy || ''],
  };
}
