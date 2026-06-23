import { useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecentTools } from '@/hooks/useRecentTools';
import type { Tool } from '@/types';

interface ToolPageWrapperProps {
  tool: Tool;
  children: ReactNode;
}

export function ToolPageWrapper({ tool, children }: ToolPageWrapperProps) {
  const navigate = useNavigate();
  const { isFavorite, toggle } = useFavorites();
  const { trackVisit } = useRecentTools();
  const fav = isFavorite(tool.id);

  useEffect(() => {
    trackVisit({ id: tool.id, name: tool.name, path: tool.path });
    document.title = `${tool.name} — ToolKit Pro`;
  }, [tool.id, tool.name, tool.path, trackVisit]);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Tool Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: tool.bgColor }}
        >
          <span className="text-sm font-bold" style={{ color: tool.color }}>
            {tool.name.charAt(0)}
          </span>
        </div>

        <div className="min-w-0">
          <h1 className="text-lg font-bold text-foreground">{tool.name}</h1>
          <p className="text-sm text-muted-foreground truncate">{tool.description}</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* AdSense Tool Banner */}
          <div className="hidden lg:flex items-center justify-center w-[200px] h-8 rounded border border-dashed border-border/40 text-[10px] text-muted-foreground/30">
            {/* AdSense: tool-banner */}
          </div>
          <button
            onClick={() => toggle(tool.id)}
            className={cn(
              'p-2.5 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center',
              fav
                ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                : 'text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10'
            )}
            title={fav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={cn('w-4 h-4', fav && 'fill-current')} />
          </button>
        </div>
      </div>

      {/* Tool Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        {children}
      </div>
    </div>
  );
}
