const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string;

const MODEL_CHAIN = [
  (import.meta.env.VITE_AI_MODEL as string) || 'google/gemma-4-31b-it:free',
  (import.meta.env.VITE_AI_MODEL_FALLBACK as string) || 'meta-llama/llama-3.3-70b-instruct:free',
  (import.meta.env.VITE_AI_MODEL_FALLBACK_2 as string) || 'openai/gpt-4o-mini',
].filter(Boolean);

const FALLBACK_ALERTS = [
  'âš ï¸ Gemma 4 ì¿¼í„° ì´ˆê³¼. Llama 3.3ìœ¼ë¡œ ì „í™˜í•©ë‹ˆë‹¤.',
  'ðŸš¨ Llama 3.3ë„ ì¿¼í„° ì´ˆê³¼. GPT-5 Nano(ìœ ë£Œ)ë¡œ ì „í™˜í•©ë‹ˆë‹¤.',
  'âŒ ì „ì²´ AI ì—”ì§„ ì‹¤íŒ¨. ìˆ˜ë™ í™•ì¸ í•„ìš”.',
];

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

async function chatWithChain(prompt: string, maxTokens: number, index: number): Promise<string> {
  if (index >= MODEL_CHAIN.length) {
    if (!alertSent.has(MODEL_CHAIN.length)) {
      alertSent.add(MODEL_CHAIN.length);
      await sendTelegramAlert(FALLBACK_ALERTS[MODEL_CHAIN.length - 1] ?? 'âŒ ì „ì²´ AI ì—”ì§„ ì†Œì§„.');
    }
    throw new Error('All AI models exhausted or failed.');
  }

  const model = MODEL_CHAIN[index];
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
    if (!alertSent.has(index)) {
      alertSent.add(index);
      await sendTelegramAlert(FALLBACK_ALERTS[index] ?? `âš ï¸ ëª¨ë¸ ${index + 1} ì¿¼í„° ì´ˆê³¼. ë‹¤ìŒìœ¼ë¡œ ì „í™˜í•©ë‹ˆë‹¤.`);
    }
    return chatWithChain(prompt, maxTokens, index + 1);
  }

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status} (model: ${model})`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function chat(prompt: string, maxTokens = 400): Promise<string> {
  return chatWithChain(prompt, maxTokens, 0);
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
    ? `\nì°¸ê³  ì±„ë„ ë¶„ì„ (ì´ ì±„ë„ì˜ ìŠ¤íƒ€ì¼ì„ ìµœëŒ€í•œ ë°˜ì˜í•  ê²ƒ):\n- ì±„ë„ëª…: ${channelContext.channelName}\n- í›… íŒ¨í„´: ${channelContext.hookPattern}\n- ì„±ìž¥ ê³µì‹: ${channelContext.growthFormula}\n`
    : '';

  const prompt = `ë‹¹ì‹ ì€ ë°”ì´ëŸ´ ìˆí¼ ëŒ€ë³¸ ì „ë¬¸ê°€ìž…ë‹ˆë‹¤. ì£¼ì œ: "${topic}"${contextBlock}

ì•„ëž˜ JSON í˜•ì‹ìœ¼ë¡œë§Œ ë‹µí•˜ì„¸ìš”. ì„¤ëª…ì´ë‚˜ ë§ˆí¬ë‹¤ìš´ ì—†ì´ ìˆœìˆ˜ JSONë§Œ:
{
  "hook": "0-3ì´ˆ: ìŠ¤í¬ë¡¤ì„ ë©ˆì¶”ê²Œ í•˜ëŠ” ì§§ê³  ê°•ë ¬í•œ 1-2ë¬¸ìž¥",
  "shock": "3-15ì´ˆ: ì¶©ê²©ì ì¸ ì‚¬ì‹¤ì´ë‚˜ í†µê³„, 2-3ë¬¸ìž¥",
  "evidence": "15-30ì´ˆ: êµ¬ì²´ì ì¸ ê·¼ê±°ë‚˜ ì˜ˆì‹œ, 2-3ë¬¸ìž¥",
  "solution": "30-50ì´ˆ: ìˆ«ìžê°€ í¬í•¨ëœ êµ¬ì²´ì ì¸ í•´ê²°ì±…, 3-4ë¬¸ìž¥",
  "cta": "50-60ì´ˆ: ëŒ“ê¸€ ìœ ë„ (íŒ”ë¡œìš° ì–¸ê¸‰ ì ˆëŒ€ ê¸ˆì§€), 1-2ë¬¸ìž¥"
}

ê·œì¹™:
- í•œêµ­ì–´, êµ¬ì–´ì²´ (~ê±°ë“ ìš” ~ë”ë¼ê³ ìš” ~ìž–ì•„ìš”)
- hook: ì§§ì€ ë¬¸ìž¥, ì¶©ê²©ì , ì •ì²´ì„± ê³µê²©
- cta: "ëŒ“ê¸€ì— ì •ë¦¬í•´ë’€ì–´ìš”" ìŠ¤íƒ€ì¼
- ì‹œê°„ í‘œì‹œë‚˜ ì„¹ì…˜ëª… í¬í•¨ ê¸ˆì§€, ë³¸ë¬¸ë§Œ`;

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

export async function parseRawScript(rawScript: string): Promise<GeneratedScript> {
  const prompt = `ì•„ëž˜ ëŒ€ë³¸ì„ ì½ê³  HOOK/SHOCK/EVIDENCE/SOLUTION/CTA 5ê°œ ì„¹ì…˜ìœ¼ë¡œ ë¶„ë¥˜í•´ì„œ JSONìœ¼ë¡œë§Œ ë‹µí•´:

ëŒ€ë³¸:
${rawScript.slice(0, 3000)}

ì•„ëž˜ JSON í˜•ì‹ìœ¼ë¡œë§Œ:
{
  "hook": "0-3ì´ˆ í›… ë¬¸ìž¥",
  "shock": "3-15ì´ˆ ì¶©ê²© ì‚¬ì‹¤",
  "evidence": "15-30ì´ˆ ê·¼ê±°",
  "solution": "30-50ì´ˆ í•´ê²°ì±…",
  "cta": "50-60ì´ˆ í–‰ë™ ìœ ë„"
}
í•œêµ­ì–´ë¡œ, ì›ë¬¸ ë‚´ìš© ìµœëŒ€í•œ ë³´ì¡´.`;

  const text = await chat(prompt, 1200);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid response');
  const p = JSON.parse(jsonMatch[0]);
  return { hook: p.hook ?? '', shock: p.shock ?? '', evidence: p.evidence ?? '', solution: p.solution ?? '', cta: p.cta ?? '' };
}

export async function analyzeYouTubeVideos(videos: { title: string; description: string }[]): Promise<GeneratedScript> {
  const videoBlock = videos.map((v, i) => `ì˜ìƒ ${i + 1}: "${v.title}"\nì„¤ëª…: ${v.description.slice(0, 300)}`).join('\n\n');
  const prompt = `ì•„ëž˜ ìœ íŠœë¸Œ ì˜ìƒë“¤ì„ ë¶„ì„í•´ì„œ ë°”ì´ëŸ´ ìˆí¼ ëŒ€ë³¸ì„ ë§Œë“¤ì–´ì¤˜.

${videoBlock}

ì´ ì˜ìƒë“¤ì˜ ê³µí†µ í›… íŒ¨í„´, ì¶©ê²© í¬ì¸íŠ¸, ì¦ê±°, í•´ê²°ì±…ì„ ì°¸ê³ í•´ì„œ ìƒˆ ëŒ€ë³¸ì„ JSONìœ¼ë¡œë§Œ:
{
  "hook": "0-3ì´ˆ í›…",
  "shock": "3-15ì´ˆ ì¶©ê²©",
  "evidence": "15-30ì´ˆ ê·¼ê±°",
  "solution": "30-50ì´ˆ í•´ê²°ì±…",
  "cta": "50-60ì´ˆ CTA"
}
í•œêµ­ì–´ êµ¬ì–´ì²´ë¡œ.`;

  const text = await chat(prompt, 1200);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid response');
  const p = JSON.parse(jsonMatch[0]);
  return { hook: p.hook ?? '', shock: p.shock ?? '', evidence: p.evidence ?? '', solution: p.solution ?? '', cta: p.cta ?? '' };
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
    ? `ìµœê·¼ ì˜ìƒ ì œëª©:\n${channel.recentVideoTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
    : '';
  const datesBlock = channel.recentUploadDates?.length
    ? `ì—…ë¡œë“œ ë‚ ì§œ: ${channel.recentUploadDates.join(', ')}`
    : '';

  const prompt = `ì•„ëž˜ ìœ íŠœë¸Œ ì±„ë„ ë°ì´í„°ë¥¼ ë¶„ì„í•´ì„œ ì •í™•ížˆ JSON í˜•ì‹ìœ¼ë¡œ ë‹µí•´:

ì±„ë„ëª…: ${channel.name}
êµ¬ë…ìž: ${subs}ëª…
ì´ ì¡°íšŒìˆ˜: ${views}íšŒ
ì˜ìƒ ìˆ˜: ${channel.videoCount}ê°œ
êµ¬ë…ìž ëŒ€ë¹„ ì¡°íšŒìˆ˜ ë¹„ìœ¨: ${viralRatio}ë°°
ì±„ë„ ì„¤ëª…: ${channel.description.slice(0, 200)}
${titlesBlock}
${datesBlock}

ì‘ë‹µì€ ë°˜ë“œì‹œ ì•„ëž˜ JSON êµ¬ì¡°ì—¬ì•¼ í•˜ë©°, ë‹¤ë¥¸ ì„¤ëª… ì—†ì´ JSONë§Œ ì¶œë ¥í•´:
{
  "hookPattern": "ìµœê·¼ ì˜ìƒ ì œëª©ì—ì„œ ê³µí†µ í›… ìœ í˜• (ê³µí¬/í˜¸ê¸°ì‹¬/ê¶Œìœ„/ë¹„ë°€í­ë¡œ)",
  "thumbnailStrategy": "ì œëª©ì—ì„œ ì¶”ë¡ ë˜ëŠ” ì‹œê° ì „ëžµ",
  "uploadPattern": "ì˜ìƒ ê°„ ê°„ê²©ìœ¼ë¡œ ì¶”ì •ë˜ëŠ” ìµœì  ì—…ë¡œë“œ ì£¼ê¸°",
  "growthFormula": "êµ¬ë…ìž ëŒ€ë¹„ ì¡°íšŒìˆ˜ ë¹„ìœ¨ë¡œ íŒë‹¨í•œ ë°”ì´ëŸ´ ê°•ë„",
  "copyStrategy": ["ë³µì œ ì „ëžµ 1ì¤„", "ë³µì œ ì „ëžµ 2ì¤„", "ë³µì œ ì „ëžµ 3ì¤„"]
}
í•œêµ­ì–´ë¡œ ìž‘ì„±í•˜ê³  ê°„ê²°í•˜ê²Œ ë‹µí•´.`;

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

