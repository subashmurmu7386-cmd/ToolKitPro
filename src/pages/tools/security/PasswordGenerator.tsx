import { useState, useCallback } from 'react';
import { Copy, Check, RefreshCw, Key, Shield } from 'lucide-react';
import { ToolPageWrapper } from '@/components/features/ToolPageWrapper';
import { TOOLS } from '@/constants/tools';
import { copyToClipboard } from '@/lib/utils';
import type { PasswordOptions } from '@/types';

const tool = TOOLS.find(t => t.id === 'password-generator')!;

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: 'l1O0I',
};

function generatePassword(opts: PasswordOptions): string {
  let charset = '';
  if (opts.uppercase) charset += CHARSETS.uppercase;
  if (opts.lowercase) charset += CHARSETS.lowercase;
  if (opts.numbers) charset += CHARSETS.numbers;
  if (opts.symbols) charset += CHARSETS.symbols;
  if (opts.excludeAmbiguous) {
    charset = charset.split('').filter(c => !CHARSETS.ambiguous.includes(c)).join('');
  }
  if (!charset) return '';
  const array = new Uint32Array(opts.length);
  crypto.getRandomValues(array);
  return Array.from(array, v => charset[v % charset.length]).join('');
}

function generateKey(bits: number): string {
  const bytes = bits / 8;
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: 'None', color: 'bg-border' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const normalized = Math.min(score, 5);
  const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500', 'bg-emerald-500'];
  return { score: normalized, label: labels[normalized], color: colors[normalized] };
}

export function PasswordGenerator() {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  const [passwords, setPasswords] = useState<string[]>([generatePassword({ length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true, excludeAmbiguous: false })]);
  const [count, setCount] = useState(5);
  const [cryptoKey, setCryptoKey] = useState('');
  const [keyBits, setKeyBits] = useState(256);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [mode, setMode] = useState<'password' | 'key'>('password');

  const generate = useCallback(() => {
    const newPasswords = Array.from({ length: count }, () => generatePassword(options));
    setPasswords(newPasswords);
  }, [options, count]);

  const generateCryptoKey = () => {
    setCryptoKey(generateKey(keyBits));
  };

  const handleCopy = async (pwd: string, idx: number) => {
    await copyToClipboard(pwd);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleCopyKey = async () => {
    await copyToClipboard(cryptoKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const setOpt = (key: keyof PasswordOptions, val: boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: val }));
  };

  const primaryPwd = passwords[0] || '';
  const strength = getStrength(primaryPwd);

  return (
    <ToolPageWrapper tool={tool}>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Mode Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-border w-fit">
          {(['password', 'key'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors ${
                mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              {m === 'password' ? '🔑 Password' : '🗝️ Crypto Key'}
            </button>
          ))}
        </div>

        {mode === 'password' ? (
          <>
            {/* Main Password Display */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Generated Password</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold text-white ${strength.color}`}>
                    {strength.label}
                  </span>
                  <Shield className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="relative">
                <div className="font-mono text-lg font-semibold text-primary bg-secondary/50 rounded-xl px-4 py-4 pr-24 break-all min-h-[60px] flex items-center">
                  {primaryPwd || <span className="text-muted-foreground text-sm">Click Generate to create password</span>}
                </div>
                <button
                  onClick={() => handleCopy(primaryPwd, -1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-all"
                >
                  {copiedIdx === -1 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedIdx === -1 ? 'Copied!' : 'Copy'}
                </button>
              </div>
              {/* Strength bar */}
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className={`flex-1 h-1.5 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-border'}`}
                  />
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
              <h3 className="font-semibold text-foreground">Options</h3>

              {/* Length */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Length</label>
                  <span className="text-sm font-bold text-primary">{options.length}</span>
                </div>
                <input
                  type="range" min={4} max={128} value={options.length}
                  onChange={e => setOpt('length', Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>4 (minimum)</span>
                  <span>128 (maximum)</span>
                </div>
              </div>

              {/* Character sets */}
              <div className="grid grid-cols-2 gap-3">
                {([
                  ['uppercase', 'Uppercase (A-Z)'],
                  ['lowercase', 'Lowercase (a-z)'],
                  ['numbers', 'Numbers (0-9)'],
                  ['symbols', 'Symbols (!@#$...)'],
                  ['excludeAmbiguous', 'Exclude ambiguous (l, 1, O, 0)'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer col-span-1">
                    <input
                      type="checkbox"
                      checked={options[key] as boolean}
                      onChange={e => setOpt(key, e.target.checked)}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    <span className="text-sm text-foreground">{label}</span>
                  </label>
                ))}
              </div>

              {/* Count */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground">Generate count:</label>
                <select
                  value={count}
                  onChange={e => setCount(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {[1, 3, 5, 10, 20].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <button
                onClick={generate}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Generate {count > 1 ? `${count} Passwords` : 'Password'}
              </button>
            </div>

            {/* Password List */}
            {passwords.length > 1 && (
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <h3 className="font-semibold text-foreground">Generated Passwords</h3>
                {passwords.map((pwd, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                    <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}</span>
                    <span className="flex-1 font-mono text-sm text-foreground break-all">{pwd}</span>
                    <button
                      onClick={() => handleCopy(pwd, i)}
                      className="p-2 rounded-lg hover:bg-card text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                    >
                      {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Crypto Key Generator */
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Cryptographic Key Generator</h3>
              <p className="text-sm text-muted-foreground">Generate cryptographically secure random keys using the Web Crypto API.</p>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Key Size</label>
                <div className="flex gap-3">
                  {[128, 256, 512].map(bits => (
                    <button
                      key={bits}
                      onClick={() => setKeyBits(bits)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        keyBits === bits ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {bits}-bit
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateCryptoKey}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-400 transition-all"
              >
                <Key className="w-4 h-4" />
                Generate {keyBits}-bit Key
              </button>

              {cryptoKey && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Hex-encoded key</span>
                    <button
                      onClick={handleCopyKey}
                      className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey ? 'Copied!' : 'Copy Key'}
                    </button>
                  </div>
                  <div className="font-mono text-sm text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 break-all">
                    {cryptoKey}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {cryptoKey.length / 2 * 8} bits · {cryptoKey.length / 2} bytes · {cryptoKey.length} hex chars
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolPageWrapper>
  );
}
