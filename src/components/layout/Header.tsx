import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Download, Upload, Search, X, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TOOLS } from '@/constants/tools';
import { exportAllData, importData } from '@/lib/storage';
import { downloadFile } from '@/lib/utils';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isOnline] = useState(() => navigator.onLine);

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

      {/* Search */}
      <div className="relative flex-1 max-w-md">
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
