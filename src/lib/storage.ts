import type { AppSettings, NoteData, PomodoroStats, ExportData } from '@/types';

const KEYS = {
  SETTINGS: 'toolkit_settings',
  NOTES: 'toolkit_notes',
  POMODORO_STATS: 'toolkit_pomodoro_stats',
  RECENT_TOOLS: 'toolkit_recent_tools',
  FAVORITES: 'toolkit_favorites',
};

// Simple hash for PIN (NOT cryptographic, for UX only)
export function hashPin(pin: string): string {
  let hash = 0;
  const salt = 'toolkit_salt_2024';
  const str = pin + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function verifyPin(pin: string, hash: string): boolean {
  return hashPin(pin) === hash;
}

// Generic get/set
export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage quota exceeded:', e);
  }
}

// Settings
export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  sidebarCollapsed: false,
  pinEnabled: false,
  pinHash: '',
  favoriteTools: [],
  recentTools: [],
};

export function getSettings(): AppSettings {
  return getStorage(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: Partial<AppSettings>): void {
  const current = getSettings();
  setStorage(KEYS.SETTINGS, { ...current, ...settings });
}

// Recent Tools
export function getRecentTools() {
  return getStorage<AppSettings['recentTools']>(KEYS.RECENT_TOOLS, []);
}

export function addRecentTool(tool: { id: string; name: string; path: string }) {
  const recent = getRecentTools().filter(t => t.id !== tool.id);
  const updated = [{ ...tool, visitedAt: Date.now() }, ...recent].slice(0, 8);
  setStorage(KEYS.RECENT_TOOLS, updated);
}

// Favorites
export function getFavorites(): string[] {
  return getStorage<string[]>(KEYS.FAVORITES, []);
}

export function toggleFavorite(toolId: string): string[] {
  const favorites = getFavorites();
  const updated = favorites.includes(toolId)
    ? favorites.filter(id => id !== toolId)
    : [...favorites, toolId];
  setStorage(KEYS.FAVORITES, updated);
  return updated;
}

// Notes
export function getNotes(): NoteData[] {
  return getStorage<NoteData[]>(KEYS.NOTES, []);
}

export function saveNote(note: NoteData): void {
  const notes = getNotes();
  const idx = notes.findIndex(n => n.id === note.id);
  if (idx >= 0) notes[idx] = note;
  else notes.unshift(note);
  setStorage(KEYS.NOTES, notes.slice(0, 50));
}

export function deleteNote(id: string): void {
  const notes = getNotes().filter(n => n.id !== id);
  setStorage(KEYS.NOTES, notes);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Pomodoro Stats
export const DEFAULT_POMODORO_STATS: PomodoroStats = {
  totalPomodoros: 0,
  totalMinutes: 0,
  todayPomodoros: 0,
  lastSession: 0,
};

export function getPomodoroStats(): PomodoroStats {
  const stats = getStorage<PomodoroStats>(KEYS.POMODORO_STATS, DEFAULT_POMODORO_STATS);
  // Reset today's count if it's a new day
  const lastSessionDate = new Date(stats.lastSession).toDateString();
  const today = new Date().toDateString();
  if (lastSessionDate !== today) {
    stats.todayPomodoros = 0;
  }
  return stats;
}

export function savePomodoroStats(stats: PomodoroStats): void {
  setStorage(KEYS.POMODORO_STATS, stats);
}

// Export/Import
export function exportAllData(): ExportData {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    settings: getSettings(),
    notes: getNotes(),
    pomodoroStats: getPomodoroStats(),
  };
}

export function importData(data: ExportData): void {
  if (data.settings) saveSettings(data.settings);
  if (data.notes) setStorage(KEYS.NOTES, data.notes);
  if (data.pomodoroStats) savePomodoroStats(data.pomodoroStats);
}

export function clearAllData(): void {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
}
