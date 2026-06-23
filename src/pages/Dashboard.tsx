import { useNavigate } from 'react-router-dom';
import {
  ImageIcon, Code2, Zap, ShieldCheck, Type,
  Minimize2, ArrowLeftRight, Layers, Braces, Search,
  Key, Volume2, FileText, Timer, Star, Clock,
  TrendingUp, Shield, Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TOOLS, CATEGORIES, TOOLS_BY_CATEGORY } from '@/constants/tools';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecentTools } from '@/hooks/useRecentTools';
import { AdBanner } from '@/components/features/AdBanner';
import type { Tool } from '@/types';
const heroImg = 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&h=400&fit=crop&auto=format';

const ICON_MAP: Record<string, React.ElementType> = {
  ImageIcon, Code2, Zap, ShieldCheck, Type,
  Minimize2, ArrowLeftRight, Layers, Braces, Search,
  Key, Volume2, FileText, Timer, Star, Clock,
};

function ToolCard({ tool, onNavigate }: { tool: Tool; onNavigate: (path: string) => void }) {
  const { isFavorite, toggle } = useFavorites();
  const IconComp = ICON_MAP[tool.icon] || Code2;
  const fav = isFavorite(tool.id);

  return (
    <div
      className="tool-card group relative p-5 rounded-2xl bg-card border border-border hover:border-primary/30 cursor-pointer shadow-sm hover:shadow-brand"
      onClick={() => onNavigate(tool.path)}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: tool.bgColor }}
        >
          <IconComp className="w-5 h-5" style={{ color: tool.color }} />
        </div>
        <button
          onClick={e => { e.stopPropagation(); toggle(tool.id); }}
          className={cn(
            'p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100',
            fav ? 'text-amber-400 opacity-100' : 'text-muted-foreground hover:text-amber-400'
          )}
          title="Toggle favorite"
        >
          <Star className={cn('w-4 h-4', fav && 'fill-current')} />
        </button>
      </div>
      <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
        {tool.name}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {tool.description}
      </p>
      {tool.isNew && (
        <span className="absolute top-3 right-3 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold">
          NEW
        </span>
      )}
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { recent } = useRecentTools();

  const stats = [
    { label: 'Total Tools', value: TOOLS.length.toString(), icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Categories', value: CATEGORIES.length.toString(), icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: '100% Private', value: 'Zero Data', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Works Offline', value: 'PWA Ready', icon: Wifi, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ];

  return (
    <div className="animate-fade-in space-y-8 pb-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl h-48 sm:h-56">
        <img
          src={heroImg}
          alt="ToolKit Pro Dashboard"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">ToolKit Pro</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            All-in-One Global<br />Utility Toolkit
          </h1>
          <p className="text-sm text-white/70 max-w-xs">
            {TOOLS.length} powerful tools, 100% private, zero servers, works offline.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => {
          const IconComp = stat.icon;
          return (
            <div key={stat.label} className="p-4 rounded-2xl bg-card border border-border">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', stat.bg)}>
                <IconComp className={cn('w-4 h-4', stat.color)} />
              </div>
              <div className="text-lg font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* AdSense Banner */}
      <AdBanner slot="dashboard-middle" className="h-16" label="Advertisement" />

      {/* Recent Tools */}
      {recent.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Recently Used</h2>
          </div>
          <div className="flex gap-3 flex-wrap">
            {recent.slice(0, 6).map(r => {
              const tool = TOOLS.find(t => t.id === r.id);
              if (!tool) return null;
              const IconComp = ICON_MAP[tool.icon] || Code2;
              return (
                <button
                  key={r.id}
                  onClick={() => navigate(r.path)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-sm"
                >
                  <IconComp className="w-3.5 h-3.5" style={{ color: tool.color }} />
                  <span className="font-medium text-foreground">{tool.name}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Tools by Category */}
      {CATEGORIES.map(cat => {
        const tools = TOOLS_BY_CATEGORY[cat.id] || [];
        if (!tools.length) return null;
        const CatIconComp = ICON_MAP[cat.icon] || Code2;

        return (
          <section key={cat.id} id={`category-${cat.id}`}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${cat.color}20` }}
              >
                <CatIconComp className="w-4 h-4" style={{ color: cat.color }} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">{cat.name}</h2>
                <p className="text-xs text-muted-foreground">{cat.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tools.map(tool => (
                <ToolCard key={tool.id} tool={tool} onNavigate={navigate} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
