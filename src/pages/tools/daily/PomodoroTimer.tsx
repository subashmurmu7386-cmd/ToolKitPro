import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Timer, CheckCircle2, Coffee, TrendingUp } from 'lucide-react';
import { ToolPageWrapper } from '@/components/features/ToolPageWrapper';
import { TOOLS } from '@/constants/tools';
import { getPomodoroStats, savePomodoroStats } from '@/lib/storage';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { PomodoroStats } from '@/types';

const tool = TOOLS.find(t => t.id === 'pomodoro-timer')!;

type Phase = 'work' | 'short-break' | 'long-break';

interface PomodoroConfig {
  workDuration: number;
  shortBreak: number;
  longBreak: number;
  sessionsBeforeLongBreak: number;
  autoStart: boolean;
}

const DEFAULT_CONFIG: PomodoroConfig = {
  workDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsBeforeLongBreak: 4,
  autoStart: false,
};

const PHASE_LABELS: Record<Phase, string> = {
  'work': 'Focus Time',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
};

const PHASE_COLORS: Record<Phase, string> = {
  'work': '#6366f1',
  'short-break': '#10b981',
  'long-break': '#06b6d4',
};

export function PomodoroTimer() {
  const [config, setConfig] = useState<PomodoroConfig>(DEFAULT_CONFIG);
  const [phase, setPhase] = useState<Phase>('work');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_CONFIG.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [stats, setStats] = useState<PomodoroStats>(() => getPomodoroStats());
  const [showSettings, setShowSettings] = useState(false);
  const [tempConfig, setTempConfig] = useState(DEFAULT_CONFIG);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalTime = phase === 'work'
    ? config.workDuration * 60
    : phase === 'short-break'
    ? config.shortBreak * 60
    : config.longBreak * 60;

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const phaseColor = PHASE_COLORS[phase];

  const completePhase = useCallback(() => {
    if (phase === 'work') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      const newStats: PomodoroStats = {
        totalPomodoros: stats.totalPomodoros + 1,
        totalMinutes: stats.totalMinutes + config.workDuration,
        todayPomodoros: stats.todayPomodoros + 1,
        lastSession: Date.now(),
      };
      setStats(newStats);
      savePomodoroStats(newStats);

      // Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('ToolKit Pro — Pomodoro Complete!', {
          body: 'Great work! Time for a break.',
          icon: '/favicon.svg',
        });
      }

      if (newCount % config.sessionsBeforeLongBreak === 0) {
        setPhase('long-break');
        setTimeLeft(config.longBreak * 60);
      } else {
        setPhase('short-break');
        setTimeLeft(config.shortBreak * 60);
      }
    } else {
      setPhase('work');
      setTimeLeft(config.workDuration * 60);
    }
    setIsRunning(config.autoStart);
  }, [phase, sessionCount, stats, config]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            completePhase();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, completePhase]);

  // Update title
  useEffect(() => {
    document.title = isRunning
      ? `${formatTime(timeLeft)} — ${PHASE_LABELS[phase]} | ToolKit Pro`
      : 'Pomodoro Timer — ToolKit Pro';
    return () => { document.title = 'ToolKit Pro'; };
  }, [timeLeft, isRunning, phase]);

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(config.workDuration * 60);
    setPhase('work');
  };

  const switchPhase = (p: Phase) => {
    setIsRunning(false);
    setPhase(p);
    setTimeLeft(
      p === 'work' ? config.workDuration * 60
      : p === 'short-break' ? config.shortBreak * 60
      : config.longBreak * 60
    );
  };

  const saveSettings = () => {
    setConfig(tempConfig);
    setTimeLeft(tempConfig.workDuration * 60);
    setPhase('work');
    setIsRunning(false);
    setShowSettings(false);
  };

  const requestNotification = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  return (
    <ToolPageWrapper tool={tool}>
      <div className="max-w-lg mx-auto space-y-6">
        {/* Phase selector */}
        <div className="flex rounded-2xl overflow-hidden border border-border p-1 bg-secondary/30 gap-1">
          {(['work', 'short-break', 'long-break'] as Phase[]).map(p => (
            <button
              key={p}
              onClick={() => switchPhase(p)}
              className={cn(
                'flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all',
                phase === p ? 'text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
              style={phase === p ? { background: phaseColor } : {}}
            >
              {PHASE_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Timer Circle */}
        <div className="flex justify-center">
          <div className="relative w-72 h-72">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 272 272">
              {/* Background circle */}
              <circle cx="136" cy="136" r="120" fill="none" strokeWidth="8"
                className="stroke-border" />
              {/* Progress circle */}
              <circle
                cx="136" cy="136" r="120"
                fill="none"
                strokeWidth="8"
                stroke={phaseColor}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="progress-ring-circle"
                style={{ filter: `drop-shadow(0 0 8px ${phaseColor}60)` }}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold font-mono tabular-nums" style={{ color: phaseColor }}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-muted-foreground mt-2 font-medium">
                {PHASE_LABELS[phase]}
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                {Array.from({ length: config.sessionsBeforeLongBreak }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      i < (sessionCount % config.sessionsBeforeLongBreak) ? '' : 'bg-border opacity-50'
                    )}
                    style={{
                      background: i < (sessionCount % config.sessionsBeforeLongBreak) ? phaseColor : undefined
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="p-3.5 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => { setIsRunning(r => !r); requestNotification(); }}
            className="flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg text-white transition-all shadow-lg hover:scale-105 active:scale-95"
            style={{ background: phaseColor, boxShadow: `0 4px 24px ${phaseColor}50` }}
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            {isRunning ? 'Pause' : 'Start'}
          </button>

          <button
            onClick={() => { setShowSettings(s => !s); setTempConfig(config); }}
            className="p-3.5 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Session progress */}
        <div className="text-center text-sm text-muted-foreground">
          Session {(sessionCount % config.sessionsBeforeLongBreak) + 1} of {config.sessionsBeforeLongBreak} before long break
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: CheckCircle2, label: "Today's Sessions", value: stats.todayPomodoros, color: 'text-emerald-400' },
            { icon: TrendingUp, label: 'Total Pomodoros', value: stats.totalPomodoros, color: 'text-indigo-400' },
            { icon: Timer, label: 'Total Minutes', value: stats.totalMinutes, color: 'text-cyan-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center">
              <Icon className={cn('w-5 h-5 mx-auto mb-2', color)} />
              <div className="text-xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground leading-tight">{label}</div>
            </div>
          ))}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-fade-in">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Timer Settings
            </h3>

            {[
              { key: 'workDuration', label: 'Focus Duration', min: 1, max: 90, unit: 'min' },
              { key: 'shortBreak', label: 'Short Break', min: 1, max: 30, unit: 'min' },
              { key: 'longBreak', label: 'Long Break', min: 5, max: 60, unit: 'min' },
              { key: 'sessionsBeforeLongBreak', label: 'Sessions Before Long Break', min: 2, max: 8, unit: '' },
            ].map(({ key, label, min, max, unit }) => (
              <div key={key}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">{label}</label>
                  <span className="text-sm font-bold text-primary">
                    {tempConfig[key as keyof PomodoroConfig]}{unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={tempConfig[key as keyof PomodoroConfig] as number}
                  onChange={e => setTempConfig(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
            ))}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tempConfig.autoStart}
                onChange={e => setTempConfig(prev => ({ ...prev, autoStart: e.target.checked }))}
                className="w-4 h-4 rounded accent-primary"
              />
              <span className="text-sm text-foreground">Auto-start next phase</span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={saveSettings}
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
              >
                Save & Reset
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2.5 border border-border text-foreground rounded-xl text-sm font-medium hover:bg-secondary transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolPageWrapper>
  );
}
