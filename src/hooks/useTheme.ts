import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '@/lib/storage';

export function useTheme() {
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    return getSettings().theme;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveSettings({ theme });
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return { theme, toggleTheme };
}
