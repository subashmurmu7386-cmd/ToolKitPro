import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ImageIcon, Code2, Zap, ShieldCheck, Type,
  ChevronDown, ChevronRight, PanelLeftClose, PanelLeft,
  Heart, Coffee, Minimize2, ArrowLeftRight, Layers,
  Braces, Search, Key, Volume2, FileText, Timer,
  Star, Clock, Home, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES, TOOLS, TOOLS_BY_CATEGORY } from '@/constants/tools';
import { useFavorites } from '@/hooks/useFavorites';
import type { ToolCategory } from '@/types';

const ICON_MAP: Record<string, React.ElementType> = {
  ImageIcon, Code2, Zap, ShieldCheck, Type,
  Minimize2, ArrowLeftRight, Layers, Braces, Search,
  Key, Volume2, FileText, Timer, Star, Clock,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  recentTools: Array<{ id: string; name: string; path: string; visitedAt: number }>;
}

const CATEGORY_COLORS: Record<ToolCategory, string> = {
  image: 'text-cyan-400',
  developer: 'text-indigo-400',
  daily: 'text-emerald-400',
  security: 'text-amber-400',
  text: 'text-rose-400',
};

export function Sidebar({ collapsed, onToggle, recentTools }: SidebarProps) {
  const location = useLocation();
  const { favorites, isFavorite } = useFavorites();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['image', 'developer', 'daily'])
  );

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const favoriteTools = TOOLS.filter(t => isFavorite(t.id));

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-card border-r border-border sidebar-transition overflow-hidden',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-border flex-shrink-0',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center flex-shrink-0">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base gradient-text">ToolKit Pro</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <Code2 className="w-4 h-4 text-white" />
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3">
        {/* Home */}
        <div className="px-2 mb-1">
          <Link
            to="/"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
              location.pathname === '/'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Dashboard</span>}
          </Link>
        </div>

        {/* Favorites */}
        {favoriteTools.length > 0 && !collapsed && (
          <div className="px-2 mb-2">
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-3 h-3" />
              Favorites
            </div>
            {favoriteTools.map(tool => {
              const IconComp = ICON_MAP[tool.icon] || Code2;
              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors min-h-[44px]',
                    location.pathname === tool.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <IconComp className="w-4 h-4 flex-shrink-0" style={{ color: tool.color }} />
                  <span className="truncate">{tool.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Recent */}
        {recentTools.length > 0 && !collapsed && (
          <div className="px-2 mb-2">
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Recent
            </div>
            {recentTools.slice(0, 4).map(tool => {
              const toolDef = TOOLS.find(t => t.id === tool.id);
              const IconComp = toolDef ? (ICON_MAP[toolDef.icon] || Code2) : Clock;
              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors min-h-[44px]',
                    location.pathname === tool.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <IconComp className="w-4 h-4 flex-shrink-0" style={{ color: toolDef?.color }} />
                  <span className="truncate">{tool.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Separator */}
        {!collapsed && <div className="mx-4 border-t border-border mb-2" />}

        {/* Categories */}
        {CATEGORIES.map(cat => {
          const CatIcon = ICON_MAP[cat.icon] || Code2;
          const tools = TOOLS_BY_CATEGORY[cat.id] || [];
          const isExpanded = expandedCategories.has(cat.id);
          const colorClass = CATEGORY_COLORS[cat.id];

          return (
            <div key={cat.id} className="px-2 mb-1">
              {collapsed ? (
                <div className="flex flex-col items-center gap-1">
                  {tools.map(tool => {
                    const ToolIcon = ICON_MAP[tool.icon] || Code2;
                    return (
                      <Link
                        key={tool.id}
                        to={tool.path}
                        title={tool.name}
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                          location.pathname === tool.path
                            ? 'bg-primary/20'
                            : 'hover:bg-secondary'
                        )}
                      >
                        <ToolIcon className="w-4 h-4" style={{ color: tool.color }} />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-secondary min-h-[44px]"
                  >
                    <span className={cn('flex items-center gap-2', colorClass)}>
                      <CatIcon className="w-3.5 h-3.5" />
                      {cat.name}
                    </span>
                    {isExpanded
                      ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                  </button>
                  {isExpanded && tools.map(tool => {
                    const ToolIcon = ICON_MAP[tool.icon] || Code2;
                    const isActive = location.pathname === tool.path;
                    return (
                      <Link
                        key={tool.id}
                        to={tool.path}
                        className={cn(
                          'flex items-center gap-3 pl-7 pr-3 py-2 rounded-lg text-sm transition-colors min-h-[44px]',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        )}
                      >
                        <ToolIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: tool.color }} />
                        <span className="truncate">{tool.name}</span>
                        {tool.isNew && (
                          <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-semibold">NEW</span>
                        )}
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="flex-shrink-0 p-3 border-t border-border space-y-2">
          {/* AdSense Sidebar */}
          <div className="w-full h-16 rounded-lg border border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground/40">
            {/* AdSense: sidebar-ad */}
          </div>

          {/* Donation */}
          <a
            href="https://www.buymeacoffee.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 transition-all group"
          >
            <Coffee className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-amber-400 group-hover:text-amber-300">Buy Me a Coffee</div>
              <div className="text-[10px] text-muted-foreground truncate">Support the developer</div>
            </div>
            <Heart className="w-3 h-3 text-rose-400 flex-shrink-0 ml-auto" />
          </a>

          {/* Privacy notice */}
          <div className="px-2 py-1.5 rounded-md bg-emerald-500/5 border border-emerald-500/10">
            <p className="text-[10px] text-emerald-400/70 text-center leading-relaxed">
              🔒 100% Private & Serverless<br />
              <span className="text-muted-foreground/50">Your data never leaves your device</span>
            </p>
          </div>

          {/* Settings link */}
          <Link
            to="/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors min-h-[44px]"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
