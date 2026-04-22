import { useState, useCallback, useEffect, useRef } from 'react';
import { generateScript, parseRawScript, analyzeYouTubeVideos, type ChannelContext } from '@/services/openrouter';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string;

interface ScriptSection {
  id: string;
  label: string;
  timeRange: string;
  duration: string;
  placeholder: string;
  accentColor: string;
  accentColorDark: string;
  accentBg: string;
  accentBgDark: string;
  borderColor: string;
  borderColorDark: string;
  cardBg: string;
  cardBgDark: string;
  icon: string;
  defaultText: string;
}

const SECTIONS: ScriptSection[] = [
  {
    id: 'hook', label: 'Hook', timeRange: '0 – 3s', duration: '3s',
    placeholder: 'Write your hook here...',
    accentColor: 'text-red-600', accentColorDark: 'dark:text-red-400',
    accentBg: 'bg-red-50', accentBgDark: 'dark:bg-red-500/10',
    borderColor: 'border-red-200', borderColorDark: 'dark:border-red-500/40',
    cardBg: 'bg-white', cardBgDark: 'dark:bg-dark-card', icon: 'ri-flashlight-line',
    defaultText: 'You\'ve been doing this WRONG your entire life.',
  },
  {
    id: 'shock', label: 'Shock', timeRange: '3 – 15s', duration: '12s',
    placeholder: 'Write your shocking statement...',
    accentColor: 'text-orange-600', accentColorDark: 'dark:text-orange-400',
    accentBg: 'bg-orange-50', accentBgDark: 'dark:bg-orange-500/10',
    borderColor: 'border-orange-200', borderColorDark: 'dark:border-orange-500/40',
    cardBg: 'bg-white', cardBgDark: 'dark:bg-dark-card', icon: 'ri-alarm-warning-line',
    defaultText: '95% of YouTube channels never reach 1,000 subscribers.',
  },
  {
    id: 'evidence', label: 'Evidence', timeRange: '15 – 30s', duration: '15s',
    placeholder: 'Add your proof and data...',
    accentColor: 'text-yellow-600', accentColorDark: 'dark:text-yellow-400',
    accentBg: 'bg-yellow-50', accentBgDark: 'dark:bg-yellow-500/10',
    borderColor: 'border-yellow-200', borderColorDark: 'dark:border-yellow-500/40',
    cardBg: 'bg-white', cardBgDark: 'dark:bg-dark-card', icon: 'ri-bar-chart-2-line',
    defaultText: 'I tested this on 47 channels. Every single one saw a 340% increase.',
  },
  {
    id: 'solution', label: 'Solution', timeRange: '30 – 50s', duration: '20s',
    placeholder: 'Describe your solution...',
    accentColor: 'text-sky-600', accentColorDark: 'dark:text-blue-400',
    accentBg: 'bg-sky-50', accentBgDark: 'dark:bg-blue-500/10',
    borderColor: 'border-sky-200', borderColorDark: 'dark:border-blue-500/40',
    cardBg: 'bg-white', cardBgDark: 'dark:bg-dark-card', icon: 'ri-lightbulb-line',
    defaultText: 'The Pattern Interrupt Method. Cut to black 0.5s then hit with your strongest visual.',
  },
  {
    id: 'cta', label: 'CTA', timeRange: '50 – 60s', duration: '10s',
    placeholder: 'Write your call to action...',
    accentColor: 'text-green-600', accentColorDark: 'dark:text-green-400',
    accentBg: 'bg-green-50', accentBgDark: 'dark:bg-green-500/10',
    borderColor: 'border-green-200', borderColorDark: 'dark:border-green-500/40',
    cardBg: 'bg-white', cardBgDark: 'dark:bg-dark-card', icon: 'ri-cursor-line',
    defaultText: 'Drop a comment below with your biggest YouTube struggle.',
  },
];

type InputMode = 'topic' | 'script' | 'youtube';

function extractVideoId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

interface ScriptCardProps {
  section: ScriptSection;
  value: string;
  onChange: (id: string, text: string) => void;
}

const ScriptCard = ({ section, value, onChange }: ScriptCardProps) => {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }, [value]);

  return (
    <div className={`rounded-xl border ${section.borderColor} ${section.borderColorDark} ${section.cardBg} ${section.cardBgDark} overflow-hidden transition-all hover:shadow-sm`}>
      <div className={`flex items-center justify-between px-4 py-2.5 ${section.accentBg} ${section.accentBgDark} border-b ${section.borderColor} ${section.borderColorDark}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${section.accentBg} ${section.accentBgDark}`}>
            <i className={`${section.icon} ${section.accentColor} ${section.accentColorDark} text-sm`}></i>
          </div>
          <div>
            <span className={`text-sm font-bold ${section.accentColor} ${section.accentColorDark}`}>{section.label}</span>
            <span className="text-xs text-gray-400 dark:text-white/30 ml-2">{section.timeRange}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-white/30 font-mono">{wordCount}w</span>
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${section.accentBg} ${section.accentBgDark} ${section.accentColor} ${section.accentColorDark} font-semibold`}>
            {section.duration}
          </span>
          <button
            onClick={handleCopy}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
              copied
                ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white/70'
            }`}
          >
            <i className={`${copied ? 'ri-check-line' : 'ri-file-copy-line'} text-xs`}></i>
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(section.id, e.target.value)}
        placeholder={section.placeholder}
        rows={3}
        className="w-full bg-transparent text-sm text-gray-700 dark:text-white/80 placeholder-gray-300 dark:placeholder-white/20 px-4 py-3 resize-none outline-none leading-relaxed font-light overflow-hidden"
      />
    </div>
  );
};

interface ScriptEditorProps {
  topic: string;
  onTopicChange: (topic: string) => void;
  onSectionChange?: (id: string, text: string) => void;
  onScriptChange?: (fullScript: string) => void;
  onSectionsChange?: (sections: Record<string, string>) => void;
  channelContext?: ChannelContext;
}

const ScriptEditor = ({ topic, onTopicChange, onSectionChange, onScriptChange, onSectionsChange, channelContext }: ScriptEditorProps) => {
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('topic');
  const [rawScript, setRawScript] = useState('');
  const [youtubeUrls, setYoutubeUrls] = useState(['', '', '']);
  const [sectionTexts, setSectionTexts] = useState<Record<string, string>>(
    () => Object.fromEntries(SECTIONS.map((s) => [s.id, s.defaultText]))
  );
  const autoTriggered = useRef(false);

  useEffect(() => {
    if (channelContext && topic.trim() && !autoTriggered.current) {
      autoTriggered.current = true;
      handleGenerateTopic(channelContext);
    }
  }, []);

  const buildFullScript = (texts: Record<string, string>) =>
    SECTIONS.map((s) => `[${s.label.toUpperCase()} — ${s.timeRange}]\n${texts[s.id] ?? ''}`).join('\n\n');

  const applyResult = (result: { hook: string; shock: string; evidence: string; solution: string; cta: string }) => {
    const newTexts: Record<string, string> = {
      hook: result.hook, shock: result.shock, evidence: result.evidence,
      solution: result.solution, cta: result.cta,
    };
    setSectionTexts(newTexts);
    onScriptChange?.(buildFullScript(newTexts));
    onSectionsChange?.(newTexts);
  };

  const handleChange = useCallback((id: string, text: string) => {
    onSectionChange?.(id, text);
    setSectionTexts((prev) => {
      const next = { ...prev, [id]: text };
      onScriptChange?.(buildFullScript(next));
      onSectionsChange?.(next);
      return next;
    });
  }, [onSectionChange, onScriptChange, onSectionsChange]);

  const handleGenerateTopic = async (ctx?: ChannelContext) => {
    if (!topic.trim() || generating) return;
    setGenerating(true); setGenError(false);
    try { applyResult(await generateScript(topic, ctx ?? channelContext)); }
    catch { setGenError(true); }
    finally { setGenerating(false); }
  };

  const handleParseScript = async () => {
    if (!rawScript.trim() || generating) return;
    setGenerating(true); setGenError(false);
    try { applyResult(await parseRawScript(rawScript)); }
    catch { setGenError(true); }
    finally { setGenerating(false); }
  };

  const handleYouTubeAnalyze = async () => {
    const validUrls = youtubeUrls.filter((u) => u.trim() && extractVideoId(u));
    if (!validUrls.length || generating) return;
    setGenerating(true); setGenError(false);
    try {
      const videoData = await Promise.all(
        validUrls.map(async (url) => {
          const vid = extractVideoId(url)!;
          const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${vid}&key=${API_KEY}`);
          const data = await res.json();
          const item = data.items?.[0];
          return {
            title: item?.snippet?.title ?? vid,
            description: item?.snippet?.description ?? '',
          };
        })
      );
      applyResult(await analyzeYouTubeVideos(videoData));
    } catch { setGenError(true); }
    finally { setGenerating(false); }
  };

  const handleGenerate = () => {
    if (inputMode === 'topic') handleGenerateTopic();
    else if (inputMode === 'script') handleParseScript();
    else handleYouTubeAnalyze();
  };

  const canGenerate = inputMode === 'topic'
    ? topic.trim().length > 0
    : inputMode === 'script'
    ? rawScript.trim().length > 0
    : youtubeUrls.some((u) => u.trim() && extractVideoId(u));

  const MODE_TABS: { key: InputMode; label: string; icon: string }[] = [
    { key: 'topic', label: '주제 입력', icon: 'ri-edit-line' },
    { key: 'script', label: '대본 입력', icon: 'ri-file-text-line' },
    { key: 'youtube', label: '유튜브 분석', icon: 'ri-youtube-line' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <i className="ri-edit-2-line text-red-500 dark:text-blue-400 w-4 h-4 flex items-center justify-center"></i>
            Script Editor
          </h2>
          <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">5 timed sections · 60s total</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
      </div>

      {/* Input mode tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1 mb-4">
        {MODE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setInputMode(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              inputMode === tab.key
                ? 'bg-white dark:bg-dark-card text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
            }`}
          >
            <i className={`${tab.icon} w-3 h-3 flex items-center justify-center`}></i>
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="mb-4">
        {inputMode === 'topic' && (
          <div className="flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="주제 입력 (예: 아침 식사와 뇌 건강)"
              className="flex-1 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
            />
            <button
              onClick={handleGenerate}
              disabled={generating || !canGenerate}
              className="flex items-center gap-1.5 bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              {generating ? (
                <><div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />생성 중...</>
              ) : (
                <><i className="ri-sparkling-line w-3 h-3 flex items-center justify-center" />대본 생성</>
              )}
            </button>
          </div>
        )}

        {inputMode === 'script' && (
          <div className="flex flex-col gap-2">
            <textarea
              value={rawScript}
              onChange={(e) => setRawScript(e.target.value)}
              placeholder="완성된 대본을 여기에 붙여넣으세요. AI가 HOOK/SHOCK/EVIDENCE/SOLUTION/CTA로 자동 분류합니다."
              rows={6}
              className="w-full text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors resize-none"
            />
            <button
              onClick={handleGenerate}
              disabled={generating || !canGenerate}
              className="flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              {generating ? (
                <><div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />AI 분류 중...</>
              ) : (
                <><i className="ri-sparkling-line w-3 h-3 flex items-center justify-center" />AI 자동 섹션 분류</>
              )}
            </button>
          </div>
        )}

        {inputMode === 'youtube' && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-400 dark:text-white/40 mb-1">참고 영상 최대 3개 — AI가 패턴을 분석해서 새 대본 생성</p>
            {youtubeUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 flex-shrink-0">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">{i + 1}</span>
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    const next = [...youtubeUrls];
                    next[i] = e.target.value;
                    setYoutubeUrls(next);
                  }}
                  placeholder="https://youtube.com/watch?v=..."
                  className={`flex-1 text-sm bg-gray-50 dark:bg-white/5 border rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors ${
                    url && extractVideoId(url)
                      ? 'border-green-300 dark:border-green-500/40'
                      : 'border-gray-200 dark:border-white/10'
                  }`}
                />
                {url && extractVideoId(url) && (
                  <i className="ri-checkbox-circle-fill text-green-500 text-sm flex-shrink-0"></i>
                )}
              </div>
            ))}
            <button
              onClick={handleGenerate}
              disabled={generating || !canGenerate}
              className="flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer mt-1"
            >
              {generating ? (
                <><div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />분석 중...</>
              ) : (
                <><i className="ri-youtube-line w-3 h-3 flex items-center justify-center" />유튜브 분석 후 대본 생성</>
              )}
            </button>
          </div>
        )}

        {genError && (
          <p className="text-xs text-red-500 mt-1.5">생성 실패. API 키 또는 네트워크를 확인해주세요.</p>
        )}
      </div>

      {/* Timeline bar */}
      <div className="flex rounded-full overflow-hidden h-1.5 mb-5 gap-px">
        <div className="bg-red-500" style={{ width: '5%' }}></div>
        <div className="bg-orange-500" style={{ width: '20%' }}></div>
        <div className="bg-yellow-500" style={{ width: '25%' }}></div>
        <div className="bg-sky-500 dark:bg-blue-500" style={{ width: '33%' }}></div>
        <div className="bg-green-500" style={{ width: '17%' }}></div>
      </div>

      {/* Script cards */}
      <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1">
        {SECTIONS.map((section) => (
          <ScriptCard
            key={section.id}
            section={section}
            value={sectionTexts[section.id] ?? section.defaultText}
            onChange={handleChange}
          />
        ))}
      </div>
    </div>
  );
};

export default ScriptEditor;
