import { useState, useCallback } from 'react';
import { getRecentTools, addRecentTool } from '@/lib/storage';
import type { AppSettings } from '@/types';

export function useRecentTools() {
  const [recent, setRecent] = useState<AppSettings['recentTools']>(() => getRecentTools());

  const trackVisit = useCallback((tool: { id: string; name: string; path: string }) => {
    addRecentTool(tool);
    setRecent(getRecentTools());
  }, []);

  return { recent, trackVisit };
}
