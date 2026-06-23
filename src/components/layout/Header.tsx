import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Download, Upload, Search, X, Wifi, WifiOff, LayoutGrid, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TOOLS, CATEGORIES, TOOLS_BY_CATEGORY } from '@/constants/tools';
import { exportAllData, importData } from '@/lib/storage';
import { downloadFile } from '@/lib/utils';

const ICON_EMOJI: Record<string, string> = {
  image: '🖼️',
  developer: '⚡',
  daily: '📋',
  security: '🔐',
  text: '🔤',
};

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

interface CategoryExploreProps {
  onClose: () => void;
}

function CategoryExplorePanel({ onClose }: CategoryExploreProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategoryClick = (catId: string) => {
    onClose();
    if (location.pathname === '/') {
      // Already on dashboard — scroll to section
      const el = document.getElementById(`category-${catId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Navigate to dashboard, then scroll after a brief delay
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(`category-${catId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 250);
    }
  };

  return (
    <>
      {/* Backdrop for mobile drawer & desktop dismiss */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] sm:bg-black/20"
        onClick={onClose}
      />

      {/* Panel — bottom drawer on mobile, dropdown on sm+ */}
      <div className="
        fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl
        sm:absolute sm:bottom-auto sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:rounded-2xl sm:w-72
        bg-card border border-border shadow-glass animate-fade-in
        overflow-hidden
      ">
        {/* Handle bar (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Explore Categories</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category list */}
        <div className="p-2">
          {CATEGORIES.map(cat => {
            const toolCount = (TOOLS_BY_CATEGORY[cat.id] || []).length;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-all group min-h-[52px] text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: `${cat.color}18` }}
                >
                  <span>{ICON_EMOJI[cat.id]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {toolCount} tool{toolCount !== 1 ? 's' : ''} · {cat.description}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="px-4 pb-4 pt-1">
          <p className="text-[11px] text-muted-foreground/60 text-center">
            Tap a category to jump directly to it on the dashboard
          </p>
        </div>
      </div>
    </>
  );
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);
  const [isOnline] = useState(() => navigator.onLine);
  const categoryBtnRef = useRef<HTMLButtonElement>(null);

  // Close panel on route change
  useEffect(() => {
    setShowCategoryPanel(false);
  }, [navigate]);

  const searchResults = searchQuery.trim()
    ? TOOLS.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 6)
    : [];

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `toolkit-pro-backup-${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          importData(data);
          window.location.reload();
        } catch {
          alert('Invalid backup file. Please select a valid ToolKit Pro backup.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <header className="h-16 flex items-center gap-4 px-4 lg:px-6 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0 relative z-20">
      {/* AdSense Top Banner */}
      <div className="hidden xl:flex items-center justify-center w-[320px] h-8 rounded border border-dashed border-border/40 text-[10px] text-muted-foreground/30 flex-shrink-0">
        {/* AdSense: header-banner */}
      </div>

      {/* Category Explore Button + Search group */}
      <div className="relative flex flex-1 max-w-md items-center gap-2">
        {/* Category Explore Button */}
        <div className="relative">
          <button
            ref={categoryBtnRef}
            onClick={() => setShowCategoryPanel(s => !s)}
            title="Explore categories"
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all min-h-[38px] flex-shrink-0',
              showCategoryPanel
                ? 'bg-primary text-primary-foreground border-primary shadow-brand'
                : 'bg-secondary/80 border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-primary/40'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Explore</span>
          </button>

          {showCategoryPanel && (
            <CategoryExplorePanel onClose={() => setShowCategoryPanel(false)} />
          )}
        </div>

      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Search tools..."
          className="w-full pl-9 pr-9 py-2 rounded-lg bg-secondary/80 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setShowResults(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-glass overflow-hidden z-50">
            {searchResults.map(tool => (
              <button
                key={tool.id}
                onClick={() => { navigate(tool.path); setSearchQuery(''); setShowResults(false); }}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: tool.bgColor }}
                >
                  <span className="text-xs font-bold" style={{ color: tool.color }}>
                    {tool.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{tool.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{tool.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Online status */}
        <div className={cn(
          'hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full',
          isOnline
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        )}>
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Export */}
        <button
          onClick={handleExport}
          title="Export all data as JSON"
          className="p-2.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Import */}
        <button
          onClick={handleImport}
          title="Import data from JSON backup"
          className="p-2.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <Upload className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="p-2.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
