     1|const API_KEY=import..._KEY as string;
     2|const MODEL = (import.meta.env.VITE_AI_MODEL as string) || 'deepseek/deepseek-chat';
     3|const MODEL_FALLBACK = (import.meta.env.VITE_AI_MODEL_FALLBACK as string) || 'deepseek/deepseek-r1-0528:free';
     6|
     7|async function chatWithModel(prompt: string, maxTokens: number, model: string): Promise<string> {
     8|  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
     9|    method: 'POST',
    10|    headers: {
    11|      Authorization: `Bearer ${API_KEY}`,
    12|      'Content-Type': 'application/json',
    13|      'HTTP-Referer': 'https://viralboard.app',
    14|      'X-Title': 'ViralBoard',
    15|    },
    16|    body: JSON.stringify({
    17|      model,
    18|      messages: [{ role: 'user', content: prompt }],
    19|      max_tokens: maxTokens,
    20|      temperature: 0.85,
    21|    }),
    22|  });
    23|
    24|  if (res.status === 429 && MODEL_FALLBACK && model !== MODEL_FALLBACK) {
    25|    return chatWithModel(prompt, maxTokens, MODEL_FALLBACK);
    26|  }
    27|  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
    28|  const data = await res.json();
    29|  return data.choices?.[0]?.message?.content ?? '';
    30|}
    31|
    32|async function chat(prompt: string, maxTokens = 400): Promise<string> {
    33|  return chatWithModel(prompt, maxTokens, MODEL);
    34|}
    35|
    36|export interface GeneratedScript {
    37|  hook: string;
    38|  shock: string;
    39|  evidence: string;
    40|  solution: string;
    41|  cta: string;
    42|}
    43|
    44|export interface ChannelContext {
    45|  channelName: string;
    46|  hookPattern: string;
    47|  growthFormula: string;
    48|}
    49|
    50|export async function generateScript(topic: string, channelContext?: ChannelContext): Promise<GeneratedScript> {
    51|  const contextBlock = channelContext
    52|    ? `\nì°¸ê³  ì±„ë„ ë¶„ì„ (ì´ ì±„ë„ì˜ ìŠ¤íƒ€ì¼ì„ ìµœëŒ€í•œ ë°˜ì˜í•  ê²ƒ):\n- ì±„ë„ëª…: ${channelContext.channelName}\n- í›… íŒ¨í„´: ${channelContext.hookPattern}\n- ì„±ìž¥ ê³µì‹: ${channelContext.growthFormula}\n`
    53|    : '';
    54|
    55|  const prompt = `ë‹¹ì‹ ì€ ë°”ì´ëŸ´ ìˆí¼ ëŒ€ë³¸ ì „ë¬¸ê°€ìž…ë‹ˆë‹¤. ì£¼ì œ: "${topic}"${contextBlock}
    56|
    57|ì•„ëž˜ JSON í˜•ì‹ìœ¼ë¡œë§Œ ë‹µí•˜ì„¸ìš”. ì„¤ëª…ì´ë‚˜ ë§ˆí¬ë‹¤ìš´ ì—†ì´ ìˆœìˆ˜ JSONë§Œ:
    58|{
    59|  "hook": "0-3ì´ˆ: ìŠ¤í¬ë¡¤ì„ ë©ˆì¶”ê²Œ í•˜ëŠ” ì§§ê³  ê°•ë ¬í•œ 1-2ë¬¸ìž¥",
    60|  "shock": "3-15ì´ˆ: ì¶©ê²©ì ì¸ ì‚¬ì‹¤ì´ë‚˜ í†µê³„, 2-3ë¬¸ìž¥",
    61|  "evidence": "15-30ì´ˆ: êµ¬ì²´ì ì¸ ê·¼ê±°ë‚˜ ì˜ˆì‹œ, 2-3ë¬¸ìž¥",
    62|  "solution": "30-50ì´ˆ: ìˆ«ìžê°€ í¬í•¨ëœ êµ¬ì²´ì ì¸ í•´ê²°ì±…, 3-4ë¬¸ìž¥",
    63|  "cta": "50-60ì´ˆ: ëŒ“ê¸€ ìœ ë„ (íŒ”ë¡œìš° ì–¸ê¸‰ ì ˆëŒ€ ê¸ˆì§€), 1-2ë¬¸ìž¥"
    64|}
    65|
    66|ê·œì¹™:
    67|- í•œêµ­ì–´, êµ¬ì–´ì²´ (~ê±°ë“ ìš” ~ë”ë¼ê³ ìš” ~ìž–ì•„ìš”)
    68|- hook: ì§§ì€ ë¬¸ìž¥, ì¶©ê²©ì , ì •ì²´ì„± ê³µê²©
    69|- cta: "ëŒ“ê¸€ì— ì •ë¦¬í•´ë’€ì–´ìš”" ìŠ¤íƒ€ì¼
    70|- ì‹œê°„ í‘œì‹œë‚˜ ì„¹ì…˜ëª… í¬í•¨ ê¸ˆì§€, ë³¸ë¬¸ë§Œ`;
    71|
    72|  const text = await chat(prompt, 1200);
    73|  const jsonMatch = text.match(/\{[\s\S]*\}/);
    74|  if (!jsonMatch) throw new Error('Invalid response');
    75|  const p = JSON.parse(jsonMatch[0]);
    76|  return {
    77|    hook: p.hook ?? '',
    78|    shock: p.shock ?? '',
    79|    evidence: p.evidence ?? '',
    80|    solution: p.solution ?? '',
    81|    cta: p.cta ?? '',
    82|  };
    83|}
    84|
    85|export interface ChannelAnalysis {
    86|  hookPattern: string;
    87|  thumbnailStrategy: string;
    88|  uploadPattern: string;
    89|  growthFormula: string;
    90|  copyStrategy: string[];
    91|}
    92|
    93|export async function analyzeChannelGrowth(channel: {
    94|  name: string;
    95|  subscribers: number;
    96|  totalViews: number;
    97|  videoCount: number;
    98|  description: string;
    99|  recentVideoTitles?: string[];
   100|  recentUploadDates?: string[];
   101|}): Promise<ChannelAnalysis> {
   102|  const subs = channel.subscribers.toLocaleString();
   103|  const views = channel.totalViews.toLocaleString();
   104|  const viralRatio = channel.videoCount > 0
   105|    ? (channel.totalViews / channel.subscribers).toFixed(1)
   106|    : '0';
   107|  const titlesBlock = channel.recentVideoTitles?.length
   108|    ? `ìµœê·¼ ì˜ìƒ ì œëª©:\n${channel.recentVideoTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
   109|    : '';
   110|  const datesBlock = channel.recentUploadDates?.length
   111|    ? `ì—…ë¡œë“œ ë‚ ì§œ: ${channel.recentUploadDates.join(', ')}`
   112|    : '';
   113|
   114|  const prompt = `ì•„ëž˜ ìœ íŠœë¸Œ ì±„ë„ ë°ì´í„°ë¥¼ ë¶„ì„í•´ì„œ ì •í™•ížˆ JSON í˜•ì‹ìœ¼ë¡œ ë‹µí•´:
   115|
   116|ì±„ë„ëª…: ${channel.name}
   117|êµ¬ë…ìž: ${subs}ëª…
   118|ì´ ì¡°íšŒìˆ˜: ${views}íšŒ
   119|ì˜ìƒ ìˆ˜: ${channel.videoCount}ê°œ
   120|êµ¬ë…ìž ëŒ€ë¹„ ì¡°íšŒìˆ˜ ë¹„ìœ¨: ${viralRatio}ë°°
   121|ì±„ë„ ì„¤ëª…: ${channel.description.slice(0, 200)}
   122|${titlesBlock}
   123|${datesBlock}
   124|
   125|ì‘ë‹µì€ ë°˜ë“œì‹œ ì•„ëž˜ JSON êµ¬ì¡°ì—¬ì•¼ í•˜ë©°, ë‹¤ë¥¸ ì„¤ëª… ì—†ì´ JSONë§Œ ì¶œë ¥í•´:
   126|{
   127|  "hookPattern": "ìµœê·¼ ì˜ìƒ ì œëª©ì—ì„œ ê³µí†µ í›… ìœ í˜• (ê³µí¬/í˜¸ê¸°ì‹¬/ê¶Œìœ„/ë¹„ë°€í­ë¡œ)",
   128|  "thumbnailStrategy": "ì œëª©ì—ì„œ ì¶”ë¡ ë˜ëŠ” ì‹œê° ì „ëžµ",
   129|  "uploadPattern": "ì˜ìƒ ê°„ ê°„ê²©ìœ¼ë¡œ ì¶”ì •ë˜ëŠ” ìµœì  ì—…ë¡œë“œ ì£¼ê¸°",
   130|  "growthFormula": "êµ¬ë…ìž ëŒ€ë¹„ ì¡°íšŒìˆ˜ ë¹„ìœ¨ë¡œ íŒë‹¨í•œ ë°”ì´ëŸ´ ê°•ë„",
   131|  "copyStrategy": ["ë³µì œ ì „ëžµ 1ì¤„", "ë³µì œ ì „ëžµ 2ì¤„", "ë³µì œ ì „ëžµ 3ì¤„"]
   132|}
   133|í•œêµ­ì–´ë¡œ ìž‘ì„±í•˜ê³  ê°„ê²°í•˜ê²Œ ë‹µí•´.`;
   134|
   135|  const text = await chat(prompt, 1000);
   136|  const jsonMatch = text.match(/\{[\s\S]*\}/);
   137|  if (!jsonMatch) throw new Error('Invalid AI response: No JSON found');
   138|
   139|  const p = JSON.parse(jsonMatch[0]);
   140|  return {
   141|    hookPattern: p.hookPattern ?? '',
   142|    thumbnailStrategy: p.thumbnailStrategy ?? '',
   143|    uploadPattern: p.uploadPattern ?? '',
   144|    growthFormula: p.growthFormula ?? '',
   145|    copyStrategy: Array.isArray(p.copyStrategy) ? p.copyStrategy.slice(0, 3) : [p.copyStrategy || ''],
   146|  };
   147|}
   148|