export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  color: string;
  bgColor: string;
  path: string;
  tags: string[];
  isPremium?: boolean;
  isNew?: boolean;
}

export type ToolCategory = 'image' | 'developer' | 'daily' | 'security' | 'text';

export interface Category {
  id: ToolCategory;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  pinEnabled: boolean;
  pinHash: string;
  favoriteTools: string[];
  recentTools: RecentTool[];
}

export interface RecentTool {
  id: string;
  name: string;
  path: string;
  visitedAt: number;
}

export interface ExportData {
  version: string;
  exportedAt: string;
  settings: Partial<AppSettings>;
  notes: NoteData[];
  pomodoroStats: PomodoroStats;
}

export interface NoteData {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  createdAt: number;
}

export interface PomodoroStats {
  totalPomodoros: number;
  totalMinutes: number;
  todayPomodoros: number;
  lastSession: number;
}

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export interface RegexMatch {
  start: number;
  end: number;
  match: string;
  groups?: Record<string, string | undefined>;
}
