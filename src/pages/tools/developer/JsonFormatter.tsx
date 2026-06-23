import { useState } from 'react';
import { Copy, Check, Braces, Minimize2 } from 'lucide-react';
import { ToolPageWrapper } from '@/components/features/ToolPageWrapper';
import { TOOLS } from '@/constants/tools';
import { copyToClipboard } from '@/lib/utils';

const tool = TOOLS.find(t => t.id === 'json-formatter')!;

const SAMPLE_JSON = `{"name":"ToolKit Pro","version":"1.0.0","tools":["JSON Formatter","Image Compressor","Password Generator"],"settings":{"theme":"dark","offline":true},"stats":{"users":10000,"countries":150}}`;

export function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'format' | 'minify'>('format');
  const [copied, setCopied] = useState(false);

  const process = () => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      if (mode === 'format') {
        setOutput(JSON.stringify(parsed, null, indent));
      } else {
        setOutput(JSON.stringify(parsed));
      }
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError(e.message);
        setOutput('');
      }
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validate = () => {
    setError('');
    setOutput('');
    try {
      JSON.parse(input);
      setOutput('✓ Valid JSON');
    } catch (e) {
      if (e instanceof SyntaxError) setError(e.message);
    }
  };

  const getLineCount = (text: string) => text.split('\n').length;

  return (
    <ToolPageWrapper tool={tool}>
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl overflow-hidden border border-border">
            {(['format', 'minify'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {m === 'format' ? 'Beautify' : 'Minify'}
              </button>
            ))}
          </div>

          {mode === 'format' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Indent:</label>
              {[2, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setIndent(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium border transition-all ${
                    indent === n ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={process}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <Braces className="w-4 h-4" />
            {mode === 'format' ? 'Beautify' : 'Minify'}
          </button>
          <button
            onClick={validate}
            className="px-5 py-2 border border-border text-foreground rounded-xl text-sm font-medium hover:bg-secondary transition-all"
          >
            Validate
          </button>
          <button
            onClick={() => { setInput(''); setOutput(''); setError(''); }}
            className="px-5 py-2 border border-border text-muted-foreground rounded-xl text-sm font-medium hover:bg-secondary transition-all"
          >
            Clear
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <span className="font-semibold">JSON Error: </span>{error}
          </div>
        )}

        {/* Editor panes */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Input */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-medium text-foreground">Input JSON</span>
              <span className="text-xs text-muted-foreground">{input.length} chars</span>
            </div>
            <div className="flex">
              <div className="py-3 pl-3 pr-2 bg-secondary/30 text-muted-foreground text-xs font-mono text-right select-none min-w-[40px]">
                {input.split('\n').map((_, i) => (
                  <div key={i} className="leading-6">{i + 1}</div>
                ))}
              </div>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                className="code-editor flex-1 p-3 bg-transparent text-foreground focus:outline-none resize-none min-h-[380px]"
                placeholder="Paste your JSON here..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Output */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-medium text-foreground">Output</span>
              <div className="flex items-center gap-2">
                {output && <span className="text-xs text-muted-foreground">{getLineCount(output)} lines</span>}
                {output && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
            </div>
            <div className="flex">
              {output && (
                <div className="py-3 pl-3 pr-2 bg-secondary/30 text-muted-foreground text-xs font-mono text-right select-none min-w-[40px]">
                  {output.split('\n').map((_, i) => (
                    <div key={i} className="leading-6">{i + 1}</div>
                  ))}
                </div>
              )}
              <pre className="flex-1 p-3 text-sm font-mono text-foreground overflow-auto min-h-[380px] whitespace-pre-wrap break-words">
                {output || <span className="text-muted-foreground/50 italic">Formatted output will appear here...</span>}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </ToolPageWrapper>
  );
}
