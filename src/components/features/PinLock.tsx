import { useState, useEffect, useCallback } from 'react';
import { Shield, Delete, Eye, EyeOff, LogIn } from 'lucide-react';
import { verifyPin } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface PinLockProps {
  pinHash: string;
  onUnlock: () => void;
}

const PAD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

export function PinLock({ pinHash, onUnlock }: PinLockProps) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockoutEnd) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutEnd - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutEnd(null);
        setCountdown(0);
        setAttempts(0);
        setError('');
        clearInterval(interval);
      } else {
        setCountdown(remaining);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [lockoutEnd]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = useCallback((currentPin: string) => {
    if (lockoutEnd) return;
    if (!currentPin) return;

    if (verifyPin(currentPin, pinHash)) {
      onUnlock();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      triggerShake();
      setPin('');

      if (newAttempts >= MAX_ATTEMPTS) {
        const end = Date.now() + LOCKOUT_SECONDS * 1000;
        setLockoutEnd(end);
        setCountdown(LOCKOUT_SECONDS);
        setError(`Too many attempts. Locked for ${LOCKOUT_SECONDS}s.`);
      } else {
        const remaining = MAX_ATTEMPTS - newAttempts;
        setError(`Incorrect PIN. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
      }
    }
  }, [pinHash, onUnlock, attempts, lockoutEnd]);

  const handleKeyPress = useCallback((key: string) => {
    if (lockoutEnd) return;

    if (key === '⌫') {
      setPin(prev => prev.slice(0, -1));
      setError('');
      return;
    }

    if (key === '') return;

    const newPin = pin + key;
    setPin(newPin);
    setError('');

    // Auto-submit when PIN reaches 6 digits
    if (newPin.length >= 6) {
      setTimeout(() => handleSubmit(newPin), 120);
    }
  }, [pin, lockoutEnd, handleSubmit]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lockoutEnd) return;
      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeyPress('⌫');
      } else if (e.key === 'Enter' && pin.length >= 1) {
        handleSubmit(pin);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleSubmit, pin, lockoutEnd]);

  const isLocked = !!lockoutEnd;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-background/95 backdrop-blur-xl">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className={cn(
        'relative w-full max-w-sm mx-4 flex flex-col items-center gap-6',
        shake && 'animate-shake'
      )}>
        {/* Logo / Icon */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground tracking-tight">ToolKit Pro</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Enter your PIN to continue</p>
          </div>
        </div>

        {/* PIN dots display */}
        <div className="flex items-center gap-3">
          {Array.from({ length: Math.max(pin.length, 4) }, (_, i) => (
            <div
              key={i}
              className={cn(
                'rounded-full transition-all duration-200',
                i < pin.length
                  ? 'w-4 h-4 bg-primary shadow-md shadow-primary/30 scale-110'
                  : 'w-3.5 h-3.5 bg-border'
              )}
            />
          ))}
        </div>

        {/* PIN text input (when showPin is true) */}
        {showPin && pin.length > 0 && (
          <div className="font-mono text-2xl font-bold text-primary tracking-[0.4em] -mt-2">
            {pin}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className={cn(
            'w-full px-4 py-3 rounded-xl text-sm text-center font-medium transition-all',
            isLocked
              ? 'bg-red-500/10 border border-red-500/20 text-red-400'
              : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
          )}>
            {isLocked ? `Locked — try again in ${countdown}s` : error}
          </div>
        )}

        {/* Pin pad */}
        <div className="w-full bg-card border border-border rounded-2xl p-4 shadow-xl">
          <div className="grid gap-3">
            {PAD_KEYS.map((row, ri) => (
              <div key={ri} className="grid grid-cols-3 gap-3">
                {row.map((key, ci) => {
                  if (key === '') return <div key={ci} />;

                  const isDelete = key === '⌫';
                  const isDisabled = isLocked;

                  return (
                    <button
                      key={ci}
                      onClick={() => handleKeyPress(key)}
                      disabled={isDisabled}
                      className={cn(
                        'h-14 rounded-xl text-lg font-semibold transition-all duration-150 select-none',
                        'active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50',
                        isDelete
                          ? 'bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground'
                          : 'bg-secondary text-foreground hover:bg-secondary/70',
                        isDisabled && 'opacity-40 cursor-not-allowed',
                        !isDisabled && 'cursor-pointer'
                      )}
                    >
                      {isDelete
                        ? <Delete className="w-5 h-5 mx-auto" />
                        : key
                      }
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Submit & Show/Hide row */}
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => setShowPin(s => !s)}
              className="flex-1 h-11 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center justify-center gap-2 text-sm"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPin ? 'Hide' : 'Show'}
            </button>
            <button
              onClick={() => handleSubmit(pin)}
              disabled={pin.length === 0 || isLocked}
              className={cn(
                'flex-[2] h-11 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
                pin.length > 0 && !isLocked
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]'
                  : 'bg-primary/20 text-primary/40 cursor-not-allowed'
              )}
            >
              <LogIn className="w-4 h-4" />
              Unlock
            </button>
          </div>
        </div>

        {/* Hint */}
        <p className="text-xs text-muted-foreground text-center">
          You can also use your keyboard to enter the PIN
        </p>
      </div>
    </div>
  );
}
