import { useState, useCallback } from 'react';
import { getFavorites, toggleFavorite } from '@/lib/storage';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());

  const toggle = useCallback((toolId: string) => {
    const updated = toggleFavorite(toolId);
    setFavorites(updated);
  }, []);

  const isFavorite = useCallback((toolId: string) => {
    return favorites.includes(toolId);
  }, [favorites]);

  return { favorites, toggle, isFavorite };
}
