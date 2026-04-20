import { useState, useCallback } from 'react';
import { generateScript } from '@/services/openrouter';

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
    id: 'hook',
    label: 'Hook',
    timeRange: '0 – 3s',
    duration: '3s',
    placeholder: 'Write your hook here...',
    accentColor: 'text-red-600',
    accentColorDark: 'dark:text-red-400',
    accentBg: 'bg-red-50',
    accentBgDark: 'dark:bg-red-500/10',
    borderColor: 'border-red-200',
    borderColorDark: 'dark:border-red-500/40',
    cardBg: 'bg-white',
    cardBgDark: 'dark:bg-dark-card',
    icon: 'ri-flashlight-line',
    defaultText: 'You\'ve been doing this WRONG your entire life. In the next 60 seconds, I\'ll show you the one trick that top creators use to go viral overnight.',
  },
  {
    id: 'shock',
    label: 'Shock',
    timeRange: '3 – 15s',
    duration: '12s',
    placeholder: 'Write your shocking statement...',
    accentColor: 'text-orange-600',
    accentColorDark: 'dark:text-orange-400',
    accentBg: 'bg-orange-50',
    accentBgDark: 'dark:bg-orange-500/10',
    borderColor: 'border-orange-200',
    borderColorDark: 'dark:border-orange-500/40',
    cardBg: 'bg-white',
    cardBgDark: 'dark:bg-dark-card',
    icon: 'ri-alarm-warning-line',
    defaultText: '95% of YouTube channels never reach 1,000 subscribers. Not because they lack talent — but because they\'re missing this single psychological trigger that makes viewers stop scrolling instantly.',
  },
  {
    id: 'evidence',
    label: 'Evidence',
    timeRange: '15 – 30s',
    duration: '15s',
    placeholder: 'Add your proof and data...',
    accentColor: 'text-yellow-600',
    accentColorDark: 'dark:text-yellow-400',
    accentBg: 'bg-yellow-50',
    accentBgDark: 'dark:bg-yellow-500/10',
    borderColor: 'border-yellow-200',
    borderColorDark: 'dark:border-yellow-500/40',
    cardBg: 'bg-white',
    cardBgDark: 'dark:bg-dark-card',
    icon: 'ri-bar-chart-2-line',
    defaultText: 'I tested this on 47 channels across 6 niches. Every single one saw a 340% increase in watch time within 30 days. MrBeast uses it. PewDiePie uses it. And now I\'m going to show you exactly how.',
  },
  {
    id: 'solution',
    label: 'Solution',
    timeRange: '30 – 50s',
    duration: '20s',
    placeholder: 'Describe your solution...',
    accentColor: 'text-sky-600',
    accentColorDark: 'dark:text-blue-400',
    accentBg: 'bg-sky-50',
    accentBgDark: 'dark:bg-blue-500/10',
    borderColor: 'border-sky-200',
    borderColorDark: 'dark:border-blue-500/40',
    cardBg: 'bg-white',
    cardBgDark: 'dark:bg-dark-card',
    icon: 'ri-lightbulb-line',
    defaultText: 'The Pattern Interrupt Method. In the first 3 seconds, you need a visual or audio break that forces the brain to pay attention. Cut to black for 0.5s, then hit them with your strongest visual. Pair it with a question they can\'t ignore.',
  },
  {
    id: 'cta',
    label: 'CTA',
    timeRange: '50 – 60s',
    duration: '10s',
    placeholder: 'Write your call to action...',
    accentColor: 'text-green-600',
    accentColorDark: 'dark:text-green-400',
    accentBg: 'bg-green-50',
    accentBgDark: 'dark:bg-green-500/10',
    borderColor: 'border-green-200',
    borderColorDark: 'dark:border-green-500/40',
    cardBg: 'bg-white',
    cardBgDark: 'dark:bg-dark-card',
    icon: 'ri-cursor-line',
    defaultText: 'Subscribe right now and I\'ll send you the full 47-channel case study for free. Hit the bell so you never miss a growth hack. Drop a comment: what\'s your biggest struggle with YouTube growth?',
  },
];

interface ScriptCardProps {
  section: ScriptSection;
  value: string;
  onChange: (id: string, text: string) => void;
}

const ScriptCard = ({ section, value, onChange }: ScriptCardProps) => {
  const [copied, setCopied] = useState(false);
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

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
            title="Copy to clipboard"
          >
            <i className={`${copied ? 'ri-check-line' : 'ri-file-copy-line'} text-xs`}></i>
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(section.id, e.target.value)}
        placeholder={section.placeholder}
        rows={4}
        className="w-full bg-transparent text-sm text-gray-700 dark:text-white/80 placeholder-gray-300 dark:placeholder-white/20 px-4 py-3 resize-none outline-none leading-relaxed font-light"
      />
    </div>
  );
};

interface ScriptEditorProps {
  topic: string;
  onTopicChange: (topic: string) => void;
  onSectionChange?: (id: string, text: string) => void;
  onScriptChange?: (fullScript: string) => void;
}

const ScriptEditor = ({ topic, onTopicChange, onSectionChange, onScriptChange }: ScriptEditorProps) => {
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(false);
  const [sectionTexts, setSectionTexts] = useState<Record<string, string>>(
    () => Object.fromEntries(SECTIONS.map((s) => [s.id, s.defaultText]))
  );

  const buildFullScript = (texts: Record<string, string>) =>
    SECTIONS.map((s) => `[${s.label.toUpperCase()} — ${s.timeRange}]\n${texts[s.id] ?? ''}`).join('\n\n');

  const handleChange = useCallback(
    (id: string, text: string) => {
      onSectionChange?.(id, text);
      setSectionTexts((prev) => {
        const next = { ...prev, [id]: text };
        onScriptChange?.(buildFullScript(next));
        return next;
      });
    },
    [onSectionChange, onScriptChange]
  );

  const handleGenerate = async () => {
    if (!topic.trim() || generating) return;
    setGenerating(true);
    setGenError(false);
    try {
      const result = await generateScript(topic);
      const newTexts: Record<string, string> = {
        hook: result.hook,
        shock: result.shock,
        evidence: result.evidence,
        solution: result.solution,
        cta: result.cta,
      };
      setSectionTexts(newTexts);
      onScriptChange?.(buildFullScript(newTexts));
    } catch {
      setGenError(true);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
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

      {/* Topic input + Generate button */}
      <div className="mb-4">
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
            disabled={generating || !topic.trim()}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            {generating ? (
              <>
                <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <i className="ri-sparkling-line w-3 h-3 flex items-center justify-center" />
                대본 생성
              </>
            )}
          </button>
        </div>
        {genError && (
          <p className="text-xs text-red-500 mt-1.5">생성 실패. OpenRouter API 키를 확인해주세요.</p>
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
