import { useState, useMemo } from 'react';
import { Copy, Check, Type } from 'lucide-react';
import { ToolPageWrapper } from '@/components/features/ToolPageWrapper';
import { TOOLS } from '@/constants/tools';
import { countWords, copyToClipboard } from '@/lib/utils';

const tool = TOOLS.find(t => t.id === 'word-counter')!;

const SAMPLE = `Welcome to ToolKit Pro — your all-in-one global utility toolkit!

This powerful, privacy-first toolkit runs entirely in your browser with zero server connections. Every tool you use, every note you write, stays 100% on your device.

Built for developers, writers, designers, and productivity enthusiasts worldwide.`;

export function WordCounter() {
  const [text, setText] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => countWords(text), [text]);

  const handleCopy = async () => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statCards = [
    { label: 'Words', value: stats.words.toLocaleString(), color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Characters', value: stats.chars.toLocaleString(), color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'No Spaces', value: stats.charsNoSpaces.toLocaleString(), color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Sentences', value: stats.sentences.toLocaleString(), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Paragraphs', value: stats.paragraphs.toLocaleString(), color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Reading Time', value: stats.readingTime === 0 ? '< 1 min' : `~${stats.readingTime} min`, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  // Highlight analysis
  const topWords = useMemo(() => {
    if (!text.trim()) return [];
    const wordMap: Record<string, number> = {};
    text.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
      .forEach(w => { wordMap[w] = (wordMap[w] || 0) + 1; });
    return Object.entries(wordMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [text]);

  return (
    <ToolPageWrapper tool={tool}>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {statCards.map(s => (
            <div key={s.label} className={`p-4 rounded-2xl ${s.bg} border border-border text-center`}>
              <div className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
              <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Text area */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Your Text</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setText('')}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={12}
            placeholder="Type or paste your text here to analyze it..."
            className="w-full p-4 bg-transparent text-foreground focus:outline-none text-sm leading-relaxed resize-none"
          />
        </div>

        {/* Density Analysis */}
        {topWords.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Top Words (4+ letters)</h3>
            <div className="space-y-2">
              {topWords.map(([word, count]) => {
                const maxCount = topWords[0][1];
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={word} className="flex items-center gap-3">
                    <span className="font-mono text-sm text-foreground w-28 truncate">{word}</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-brand rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{count}×</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Character breakdown */}
        {text && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Breakdown</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'Letters', value: (text.match(/[a-zA-Z]/g) || []).length },
                { label: 'Digits', value: (text.match(/[0-9]/g) || []).length },
                { label: 'Spaces', value: (text.match(/ /g) || []).length },
                { label: 'Newlines', value: (text.match(/\n/g) || []).length },
                { label: 'Punctuation', value: (text.match(/[^\w\s]/g) || []).length },
                { label: 'Unique words', value: new Set(text.toLowerCase().split(/\s+/).filter(Boolean)).size },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-bold text-foreground">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageWrapper>
  );
}
