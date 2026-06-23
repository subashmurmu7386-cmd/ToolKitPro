import { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, StopCircle, Download } from 'lucide-react';
import { ToolPageWrapper } from '@/components/features/ToolPageWrapper';
import { TOOLS } from '@/constants/tools';

const tool = TOOLS.find(t => t.id === 'text-to-speech')!;

const SAMPLE_TEXT = "Welcome to ToolKit Pro! This is a text-to-speech demonstration. Your data is 100% private and never leaves your device. Powered entirely by your browser's built-in speech synthesis technology.";

export function TextToSpeech() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSupported] = useState(() => 'speechSynthesis' in window);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isSupported) return;
    const loadVoices = () => {
      const available = speechSynthesis.getVoices();
      setVoices(available);
      if (available.length > 0 && !selectedVoice) {
        const englishVoice = available.find(v => v.lang.startsWith('en'));
        setSelectedVoice(englishVoice?.name || available[0].name);
      }
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    return () => { speechSynthesis.onvoiceschanged = null; };
  }, [isSupported, selectedVoice]);

  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const speak = () => {
    if (!text.trim()) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => { setIsPlaying(true); setIsPaused(false); setProgress(0); };
    utterance.onend = () => { setIsPlaying(false); setIsPaused(false); setProgress(100); if (intervalRef.current) clearInterval(intervalRef.current); };
    utterance.onerror = () => { setIsPlaying(false); setIsPaused(false); };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);

    // Simulate progress
    const duration = (text.length / 15) / rate * 1000;
    const startTime = Date.now();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 99);
      setProgress(pct);
      if (pct >= 99 && intervalRef.current) clearInterval(intervalRef.current);
    }, 100);
  };

  const pause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const resume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    }
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const estDuration = Math.round((wordCount / 150) / rate * 60);

  return (
    <ToolPageWrapper tool={tool}>
      <div className="max-w-2xl mx-auto space-y-5">
        {!isSupported && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            Your browser does not support Speech Synthesis. Please try Chrome, Edge, or Safari.
          </div>
        )}

        {/* Text Input */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-medium text-foreground">Text to Speak</span>
            <span className="text-xs text-muted-foreground">{wordCount} words · ~{estDuration}s</span>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={6}
            placeholder="Enter text to convert to speech..."
            className="w-full p-4 bg-transparent text-foreground focus:outline-none text-sm leading-relaxed resize-none"
          />
        </div>

        {/* Progress bar */}
        {(isPlaying || isPaused || progress > 0) && (
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-gradient-brand rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isPlaying && !isPaused ? (
            <button
              onClick={speak}
              disabled={!isSupported || !text.trim()}
              className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-2xl font-semibold text-base hover:bg-primary/90 disabled:opacity-50 transition-all shadow-brand"
            >
              <Play className="w-5 h-5" />
              Speak
            </button>
          ) : isPaused ? (
            <button
              onClick={resume}
              className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-2xl font-semibold text-base hover:bg-primary/90 transition-all"
            >
              <Play className="w-5 h-5" />
              Resume
            </button>
          ) : (
            <button
              onClick={pause}
              className="flex items-center gap-2 px-8 py-3.5 bg-secondary text-foreground border border-border rounded-2xl font-semibold text-base hover:bg-secondary/80 transition-all"
            >
              <Pause className="w-5 h-5" />
              Pause
            </button>
          )}
          <button
            onClick={stop}
            disabled={!isPlaying && !isPaused}
            className="flex items-center gap-2 px-5 py-3.5 border border-border text-muted-foreground rounded-2xl font-semibold text-base hover:bg-secondary hover:text-foreground disabled:opacity-30 transition-all"
          >
            <StopCircle className="w-5 h-5" />
            Stop
          </button>
        </div>

        {/* Settings */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
          <h3 className="font-semibold text-foreground">Speech Settings</h3>

          {/* Voice */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Voice</label>
            <select
              value={selectedVoice}
              onChange={e => setSelectedVoice(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {voices.map(v => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Rate */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Speed</label>
              <span className="text-sm font-bold text-primary">{rate}×</span>
            </div>
            <input type="range" min={0.5} max={2} step={0.1} value={rate}
              onChange={e => setRate(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0.5× (slow)</span>
              <span>2× (fast)</span>
            </div>
          </div>

          {/* Pitch */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Pitch</label>
              <span className="text-sm font-bold text-primary">{pitch.toFixed(1)}</span>
            </div>
            <input type="range" min={0} max={2} step={0.1} value={pitch}
              onChange={e => setPitch(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Volume */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Volume</label>
              <span className="text-sm font-bold text-primary">{Math.round(volume * 100)}%</span>
            </div>
            <input type="range" min={0} max={1} step={0.05} value={volume}
              onChange={e => setVolume(Number(e.target.value))} className="w-full" />
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary/50 text-xs text-muted-foreground">
          <Volume2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Uses your browser's built-in Speech Synthesis API. No data is sent to any server.
          Available voices depend on your operating system and browser.
        </div>
      </div>
    </ToolPageWrapper>
  );
}
