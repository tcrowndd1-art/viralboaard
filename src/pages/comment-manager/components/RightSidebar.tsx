import { useState, useRef, KeyboardEvent } from 'react';

type Tone = 'friendly' | 'professional' | 'casual' | 'empathetic' | 'witty';

const TONES: { key: Tone; label: string; emoji: string; desc: string }[] = [
  { key: 'friendly', label: 'Friendly', emoji: '😊', desc: 'Warm, approachable, encouraging' },
  { key: 'professional', label: 'Professional', emoji: '💼', desc: 'Formal, authoritative, precise' },
  { key: 'casual', label: 'Casual', emoji: '😎', desc: 'Relaxed, conversational, fun' },
  { key: 'empathetic', label: 'Empathetic', emoji: '🤝', desc: 'Understanding, supportive, kind' },
  { key: 'witty', label: 'Witty', emoji: '⚡', desc: 'Clever, humorous, engaging' },
];

const DETECTED_LANGUAGES = [
  { code: 'EN', label: 'English', flag: '🇺🇸', count: 5 },
  { code: 'KO', label: '한국어', flag: '🇰🇷', count: 1 },
  { code: 'PT', label: 'Português', flag: '🇧🇷', count: 1 },
  { code: 'ES', label: 'Español', flag: '🇪🇸', count: 1 },
];

const DEFAULT_BLOCKED = ['spam', 'scam', 'hate', 'buy now', 'click here'];

const RightSidebar = () => {
  const [tone, setTone] = useState<Tone>('friendly');
  const [toneOpen, setToneOpen] = useState(false);
  const [blockedWords, setBlockedWords] = useState<string[]>(DEFAULT_BLOCKED);
  const [newWord, setNewWord] = useState('');
  const [autoReply, setAutoReply] = useState(true);
  const [replyDelay, setReplyDelay] = useState('5');
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedTone = TONES.find((t) => t.key === tone)!;

  const addWord = () => {
    const w = newWord.trim().toLowerCase();
    if (w && !blockedWords.includes(w)) {
      setBlockedWords((prev) => [...prev, w]);
      setNewWord('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addWord();
  };

  const removeWord = (w: string) => {
    setBlockedWords((prev) => prev.filter((x) => x !== w));
  };

  const sectionClass = 'rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden transition-colors';
  const headerClass = 'px-4 py-3 border-b border-gray-100 dark:border-white/5';
  const headerTextClass = 'text-xs font-semibold text-gray-500 dark:text-white/70 uppercase tracking-wider';

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">

      {/* AI Status */}
      <div className="rounded-xl border border-sky-200 dark:border-dark-border bg-sky-50 dark:bg-dark-card px-4 py-3 flex items-center gap-3 transition-colors">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-sky-100 dark:bg-blue-500/15 flex-shrink-0">
          <i className="ri-robot-line text-sky-500 dark:text-blue-400 text-sm"></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 dark:text-white">AI Engine Active</p>
          <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">ViralBoard Reply v2.1</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-green-600 dark:text-green-400">Live</span>
        </div>
      </div>

      {/* Reply Tone Selector */}
      <div className={sectionClass}>
        <div className={headerClass}>
          <p className={headerTextClass}>Reply Tone</p>
        </div>
        <div className="px-4 py-3">
          <div className="relative">
            <button
              onClick={() => setToneOpen(!toneOpen)}
              className="w-full flex items-center justify-between gap-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/8 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 rounded-lg px-3 py-2.5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{selectedTone.emoji}</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedTone.label}</p>
                  <p className="text-xs text-gray-400 dark:text-white/30">{selectedTone.desc}</p>
                </div>
              </div>
              <i className={`ri-arrow-down-s-line text-gray-400 dark:text-white/40 w-4 h-4 flex items-center justify-center transition-transform ${toneOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {toneOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden z-20">
                {TONES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => { setTone(t.key); setToneOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                      tone === t.key ? 'bg-sky-50 dark:bg-blue-600/15' : ''
                    }`}
                  >
                    <span className="text-base">{t.emoji}</span>
                    <div>
                      <p className={`text-sm font-medium ${tone === t.key ? 'text-sky-600 dark:text-blue-400' : 'text-gray-800 dark:text-white/80'}`}>{t.label}</p>
                      <p className="text-xs text-gray-400 dark:text-white/30">{t.desc}</p>
                    </div>
                    {tone === t.key && (
                      <i className="ri-check-line text-sky-500 dark:text-blue-400 ml-auto w-4 h-4 flex items-center justify-center"></i>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auto-Reply Settings */}
      <div className={sectionClass}>
        <div className={headerClass}>
          <p className={headerTextClass}>Auto-Reply</p>
        </div>
        <div className="px-4 py-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 dark:text-white/80 font-medium">Auto-reply positive</p>
              <p className="text-xs text-gray-400 dark:text-white/30">Automatically send for positive comments</p>
            </div>
            <button
              onClick={() => setAutoReply(!autoReply)}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                autoReply ? 'bg-sky-500 dark:bg-blue-600' : 'bg-gray-200 dark:bg-white/15'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  autoReply ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              ></span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-white/60">Reply delay</p>
            <select
              value={replyDelay}
              onChange={(e) => setReplyDelay(e.target.value)}
              className="bg-gray-100 dark:bg-white/8 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
            >
              <option value="0">Instant</option>
              <option value="5">5 min</option>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="60">1 hour</option>
            </select>
          </div>
        </div>
      </div>

      {/* Language Auto-Detect */}
      <div className={sectionClass}>
        <div className={`${headerClass} flex items-center justify-between`}>
          <p className={headerTextClass}>Language Detected</p>
          <span className="text-xs bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/25 px-2 py-0.5 rounded-full font-medium">
            Auto
          </span>
        </div>
        <div className="px-4 py-3 flex flex-col gap-2">
          {DETECTED_LANGUAGES.map((lang) => (
            <div key={lang.code} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{lang.flag}</span>
                <div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-white/70">{lang.code}</span>
                  <span className="text-xs text-gray-400 dark:text-white/30 ml-1.5">{lang.label}</span>
                </div>
              </div>
              <span className="text-xs text-gray-400 dark:text-white/30 font-mono">{lang.count} comments</span>
            </div>
          ))}
          <p className="text-xs text-gray-400 dark:text-white/20 mt-1 pt-2 border-t border-gray-100 dark:border-white/5">
            AI replies in the same language as the comment
          </p>
        </div>
      </div>

      {/* Blocked Words */}
      <div className={sectionClass}>
        <div className={`${headerClass} flex items-center justify-between`}>
          <p className={headerTextClass}>Blocked Words</p>
          <span className="text-xs text-gray-400 dark:text-white/30 font-mono">{blockedWords.length} words</span>
        </div>
        <div className="px-4 py-3 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add word..."
              className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-sky-400 dark:focus:border-blue-500/50 text-gray-700 dark:text-white/70 text-xs rounded-lg px-3 py-2 outline-none placeholder-gray-300 dark:placeholder-white/20 transition-colors"
            />
            <button
              onClick={addWord}
              className="w-8 h-8 flex items-center justify-center bg-sky-500 dark:bg-blue-600 hover:bg-sky-400 dark:hover:bg-blue-500 rounded-lg transition-colors cursor-pointer flex-shrink-0"
            >
              <i className="ri-add-line text-white text-sm"></i>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {blockedWords.map((w) => (
              <span
                key={w}
                className="flex items-center gap-1 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs px-2 py-1 rounded-full"
              >
                {w}
                <button
                  onClick={() => removeWord(w)}
                  className="w-3 h-3 flex items-center justify-center hover:text-red-800 dark:hover:text-red-300 cursor-pointer transition-colors"
                >
                  <i className="ri-close-line text-xs"></i>
                </button>
              </span>
            ))}
          </div>

          <p className="text-xs text-gray-400 dark:text-white/20">
            Comments containing these words will be flagged for manual review
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={`${sectionClass} px-4 py-3`}>
        <p className={`${headerTextClass} mb-3`}>This Session</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Approved', value: '0', color: 'text-green-600 dark:text-green-400' },
            { label: 'Skipped', value: '0', color: 'text-gray-500 dark:text-white/60' },
            { label: 'Edited', value: '0', color: 'text-sky-600 dark:text-blue-400' },
            { label: 'Blocked', value: '3', color: 'text-red-600 dark:text-red-400' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
