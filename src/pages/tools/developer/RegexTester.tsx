import { useState, useMemo } from 'react';
import { Copy, Check, Search } from 'lucide-react';
import { ToolPageWrapper } from '@/components/features/ToolPageWrapper';
import { TOOLS } from '@/constants/tools';
import { copyToClipboard } from '@/lib/utils';

const tool = TOOLS.find(t => t.id === 'regex-tester')!;

const PRESETS = [
  { label: 'Email', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', flags: 'gi' },
  { label: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)', flags: 'gi' },
  { label: 'IPv4', pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b', flags: 'g' },
  { label: 'Phone', pattern: '(\\+?\\d{1,3}[\\s-]?)?(\\(?\\d{3}\\)?[\\s.-]?)\\d{3}[\\s.-]?\\d{4}', flags: 'g' },
  { label: 'Hex Color', pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b', flags: 'g' },
  { label: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])', flags: 'g' },
];

const SAMPLE_TEXT = `Contact us at hello@toolkit.pro or support@example.com
Website: https://www.toolkit-pro.app or http://example.com
My IP is 192.168.1.1 and server IP is 10.0.0.254
Phone: +1 (555) 123-4567 or 800-555-0100
Colors: #6366f1, #8b5cf6, #fff
Date: 2024-01-15 and 2024-12-31`;

export function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState(SAMPLE_TEXT);
  const [copied, setCopied] = useState(false);

  const { matches, error, highlightedHtml } = useMemo(() => {
    if (!pattern) return { matches: [], error: '', highlightedHtml: testString };
    try {
      const re = new RegExp(pattern, flags);
      const allMatches: { start: number; end: number; match: string }[] = [];
      let m;
      const gRe = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      while ((m = gRe.exec(testString)) !== null) {
        allMatches.push({ start: m.index, end: m.index + m[0].length, match: m[0] });
        if (!flags.includes('g')) break;
        if (m[0].length === 0) gRe.lastIndex++;
      }
      // Build highlighted HTML
      let html = '';
      let lastIdx = 0;
      for (const match of allMatches) {
        html += testString.slice(lastIdx, match.start)
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html += `<mark class="bg-yellow-400/30 text-yellow-300 rounded px-0.5">${
          match.match.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        }</mark>`;
        lastIdx = match.end;
      }
      html += testString.slice(lastIdx).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return { matches: allMatches, error: '', highlightedHtml: html };
    } catch (e) {
      return { matches: [], error: (e as Error).message, highlightedHtml: testString };
    }
  }, [pattern, flags, testString]);

  const flagsList = ['g', 'i', 'm', 's', 'u'];
  const toggleFlag = (f: string) => {
    setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f);
  };

  const handleCopyPattern = async () => {
    await copyToClipboard(`/${pattern}/${flags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolPageWrapper tool={tool}>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Presets */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Quick presets:</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => { setPattern(p.pattern); setFlags(p.flags); }}
                className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Regex Input */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-lg">/</span>
              <input
                type="text"
                value={pattern}
                onChange={e => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className="w-full pl-8 pr-4 py-3 bg-secondary/50 border border-border rounded-xl font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                spellCheck={false}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-lg">/{flags}</span>
            </div>
            <button
              onClick={handleCopyPattern}
              className="p-3 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Flags */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Flags:</span>
            {flagsList.map(f => (
              <button
                key={f}
                onClick={() => toggleFlag(f)}
                title={{ g: 'Global', i: 'Case insensitive', m: 'Multiline', s: 'Dot all', u: 'Unicode' }[f]}
                className={`w-8 h-8 rounded-lg text-sm font-mono font-semibold border transition-all ${
                  flags.includes(f)
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              ✗ {error}
            </div>
          )}

          {/* Match count */}
          {pattern && !error && (
            <div className={`p-3 rounded-lg text-sm font-medium ${
              matches.length > 0
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-secondary border border-border text-muted-foreground'
            }`}>
              {matches.length > 0 ? `✓ ${matches.length} match${matches.length !== 1 ? 'es' : ''} found` : 'No matches found'}
            </div>
          )}
        </div>

        {/* Test String */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Test String</span>
            <span className="text-xs text-muted-foreground">{testString.length} chars</span>
          </div>
          <textarea
            value={testString}
            onChange={e => setTestString(e.target.value)}
            className="w-full p-4 font-mono text-sm bg-transparent text-foreground focus:outline-none min-h-[140px] resize-y"
            spellCheck={false}
          />
        </div>

        {/* Highlighted Matches */}
        {matches.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <span className="text-sm font-medium text-foreground">Match Highlights</span>
            </div>
            <div
              className="p-4 font-mono text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </div>
        )}

        {/* Match List */}
        {matches.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">All Matches</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
              {matches.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50">
                  <span className="text-xs text-muted-foreground w-6 text-right font-mono">{i + 1}</span>
                  <code className="flex-1 text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">{m.match}</code>
                  <span className="text-xs text-muted-foreground font-mono">pos {m.start}–{m.end}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageWrapper>
  );
}
