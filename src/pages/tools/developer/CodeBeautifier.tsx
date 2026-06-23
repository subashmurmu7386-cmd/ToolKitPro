import { useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';
import { ToolPageWrapper } from '@/components/features/ToolPageWrapper';
import { TOOLS } from '@/constants/tools';
import { copyToClipboard } from '@/lib/utils';

const tool = TOOLS.find(t => t.id === 'code-beautifier')!;

type Lang = 'javascript' | 'css' | 'html';

const SAMPLES: Record<Lang, string> = {
  javascript: `function fibonacci(n){if(n<=1)return n;return fibonacci(n-1)+fibonacci(n-2);}const result=fibonacci(10);console.log("Fibonacci(10):",result);const arr=[1,2,3,4,5];const doubled=arr.map(x=>x*2).filter(x=>x>4);`,
  css: `.container{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 24px;background-color:#1a1a2e;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.3);}`,
  html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Page</title></head><body><div class="container"><h1>Hello World</h1><p>Welcome to ToolKit Pro</p></div></body></html>`,
};

function beautifyJS(code: string, indent: number): string {
  let result = '';
  let level = 0;
  const indentStr = ' '.repeat(indent);
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    if (inString) {
      result += char;
      if (char === stringChar && code[i - 1] !== '\\') inString = false;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      inString = true; stringChar = char; result += char; continue;
    }
    if (char === '{' || char === '[') {
      result += char + '\n' + indentStr.repeat(level + 1); level++;
    } else if (char === '}' || char === ']') {
      level = Math.max(0, level - 1);
      result = result.trimEnd() + '\n' + indentStr.repeat(level) + char;
    } else if (char === ';') {
      result += char + '\n' + indentStr.repeat(level);
    } else if (char === ',') {
      result += char + '\n' + indentStr.repeat(level);
    } else {
      result += char;
    }
  }
  return result.trim();
}

function beautifyCSS(code: string, indent: number): string {
  const indentStr = ' '.repeat(indent);
  return code
    .replace(/\s*{\s*/g, ' {\n' + indentStr)
    .replace(/;\s*/g, ';\n' + indentStr)
    .replace(/\s*}\s*/g, '\n}\n')
    .replace(/,\s*/g, ',\n')
    .trim();
}

function beautifyHTML(code: string, indent: number): string {
  const indentStr = ' '.repeat(indent);
  let level = 0;
  const voidTags = ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'];
  return code
    .replace(/></g, '>\n<')
    .split('\n')
    .map(line => {
      line = line.trim();
      if (!line) return '';
      const isClosing = /^<\//.test(line);
      const isVoid = voidTags.some(t => new RegExp(`^<${t}[\\s>]`, 'i').test(line));
      if (isClosing) level = Math.max(0, level - 1);
      const indented = indentStr.repeat(level) + line;
      if (!isClosing && !isVoid && /^<[^/!?]/.test(line) && !line.includes('</')) level++;
      return indented;
    })
    .filter(Boolean)
    .join('\n');
}

function minify(code: string, lang: Lang): string {
  if (lang === 'javascript') {
    return code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}();,:])\s*/g, '$1')
      .trim();
  }
  if (lang === 'css') {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}:;,])\s*/g, '$1')
      .trim();
  }
  return code.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
}

export function CodeBeautifier() {
  const [lang, setLang] = useState<Lang>('javascript');
  const [input, setInput] = useState(SAMPLES.javascript);
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [mode, setMode] = useState<'beautify' | 'minify'>('beautify');
  const [copied, setCopied] = useState(false);

  const handleLangChange = (l: Lang) => {
    setLang(l);
    setInput(SAMPLES[l]);
    setOutput('');
  };

  const process = () => {
    if (mode === 'beautify') {
      if (lang === 'javascript') setOutput(beautifyJS(input, indent));
      else if (lang === 'css') setOutput(beautifyCSS(input, indent));
      else setOutput(beautifyHTML(input, indent));
    } else {
      setOutput(minify(input, lang));
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const savings = mode === 'minify' && output
    ? Math.round((1 - output.length / input.length) * 100)
    : 0;

  return (
    <ToolPageWrapper tool={tool}>
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Language */}
          <div className="flex rounded-xl overflow-hidden border border-border">
            {(['javascript', 'css', 'html'] as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => handleLangChange(l)}
                className={`px-4 py-2 text-sm font-medium uppercase transition-colors ${
                  lang === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Mode */}
          <div className="flex rounded-xl overflow-hidden border border-border">
            {(['beautify', 'minify'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {mode === 'beautify' && (
            <select
              value={indent}
              onChange={e => setIndent(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          )}

          <button
            onClick={process}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Code2 className="w-4 h-4" />
            {mode === 'beautify' ? 'Beautify' : 'Minify'}
          </button>
        </div>

        {/* Panes */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-medium text-foreground">Input Code</span>
              <span className="text-xs text-muted-foreground">{input.length} chars</span>
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              className="code-editor w-full p-4 bg-transparent text-foreground focus:outline-none min-h-[400px]"
              spellCheck={false}
            />
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-medium text-foreground">Output</span>
              <div className="flex items-center gap-3">
                {savings > 0 && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">-{savings}%</span>
                )}
                {output && (
                  <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
            </div>
            <pre className="p-4 text-sm font-mono text-foreground overflow-auto min-h-[400px] whitespace-pre-wrap break-words">
              {output || <span className="text-muted-foreground/50 italic">Output will appear here...</span>}
            </pre>
          </div>
        </div>
      </div>
    </ToolPageWrapper>
  );
}
