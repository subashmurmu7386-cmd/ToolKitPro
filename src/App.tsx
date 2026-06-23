import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Dashboard } from '@/pages/Dashboard';
import { Settings } from '@/pages/Settings';
import { NotFound } from '@/pages/NotFound';
import { ImageCompressor } from '@/pages/tools/image/ImageCompressor';
import { WebPConverter } from '@/pages/tools/image/WebPConverter';
import { SvgToPng } from '@/pages/tools/image/SvgToPng';
import { JsonFormatter } from '@/pages/tools/developer/JsonFormatter';
import { CodeBeautifier } from '@/pages/tools/developer/CodeBeautifier';
import { RegexTester } from '@/pages/tools/developer/RegexTester';
import { PasswordGenerator } from '@/pages/tools/security/PasswordGenerator';
import { TextToSpeech } from '@/pages/tools/text/TextToSpeech';
import { WordCounter } from '@/pages/tools/text/WordCounter';
import { MarkdownNotes } from '@/pages/tools/daily/MarkdownNotes';
import { PomodoroTimer } from '@/pages/tools/daily/PomodoroTimer';
import { useTheme } from '@/hooks/useTheme';
import { useRecentTools } from '@/hooks/useRecentTools';
import { getSettings, saveSettings } from '@/lib/storage';
import { PinLock } from '@/components/features/PinLock';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      console.log('Service Worker registration failed (dev mode is fine)');
    });
  });
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { recent } = useRecentTools();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => getSettings().sidebarCollapsed);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // PIN lock state — locked on load if PIN is enabled
  const [pinSettings] = useState(() => {
    const s = getSettings();
    return { enabled: s.pinEnabled, hash: s.pinHash };
  });
  const [isUnlocked, setIsUnlocked] = useState(() => !getSettings().pinEnabled);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      saveSettings({ sidebarCollapsed: !prev });
      return !prev;
    });
  };

  // Apply dark class on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Show PIN lock overlay if PIN is enabled and not yet unlocked
  if (!isUnlocked && pinSettings.enabled) {
    return (
      <>
        {/* Apply theme even on lock screen */}
        <PinLock
          pinHash={pinSettings.hash}
          onUnlock={() => setIsUnlocked(true)}
        />
      </>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar — desktop */}
        <div className="hidden lg:flex flex-shrink-0">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
            recentTools={recent}
          />
        </div>

        {/* Sidebar — mobile */}
        <div className={`
          fixed inset-y-0 left-0 z-40 lg:hidden transition-transform duration-300
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar
            collapsed={false}
            onToggle={() => setMobileSidebarOpen(false)}
            recentTools={recent}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header theme={theme} onToggleTheme={toggleTheme} />

          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-4 lg:p-6 h-full">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />

                {/* Image tools */}
                <Route path="/tools/image/compressor" element={<ImageCompressor />} />
                <Route path="/tools/image/webp-converter" element={<WebPConverter />} />
                <Route path="/tools/image/svg-to-png" element={<SvgToPng />} />

                {/* Developer tools */}
                <Route path="/tools/developer/json-formatter" element={<JsonFormatter />} />
                <Route path="/tools/developer/code-beautifier" element={<CodeBeautifier />} />
                <Route path="/tools/developer/regex-tester" element={<RegexTester />} />

                {/* Security tools */}
                <Route path="/tools/security/password-generator" element={<PasswordGenerator />} />

                {/* Text tools */}
                <Route path="/tools/text/text-to-speech" element={<TextToSpeech />} />
                <Route path="/tools/text/word-counter" element={<WordCounter />} />

                {/* Daily tools */}
                <Route path="/tools/daily/markdown-notes" element={<MarkdownNotes />} />
                <Route path="/tools/daily/pomodoro" element={<PomodoroTimer />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}
