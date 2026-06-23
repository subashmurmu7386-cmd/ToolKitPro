import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, Save, FileText, Eye, Edit3, Download } from 'lucide-react';
import { ToolPageWrapper } from '@/components/features/ToolPageWrapper';
import { TOOLS } from '@/constants/tools';
import { getNotes, saveNote, deleteNote, generateId } from '@/lib/storage';
import { markdownToHtml, downloadFile, countWords } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { NoteData } from '@/types';

const tool = TOOLS.find(t => t.id === 'markdown-notes')!;

const DEFAULT_CONTENT = `# Welcome to Markdown Notes

Write your notes in **Markdown** and see them rendered live!

## Features
- ✨ **Auto-save** every 2 seconds
- 📝 **Live preview** mode
- 💾 **Stored locally** in your browser
- 📤 **Export** as .md file

## Quick Reference

**Bold text** — \`**text**\`
*Italic text* — \`*text*\`
~~Strikethrough~~ — \`~~text~~\`

### Code
Inline \`code\` with backticks.

\`\`\`
// Code block
const hello = "world";
\`\`\`

> Blockquote with a \`>\` prefix

- List item 1
- List item 2

---

Start writing your notes below!
`;

export function MarkdownNotes() {
  const [notes, setNotes] = useState<NoteData[]>(() => getNotes());
  const [activeId, setActiveId] = useState<string>(() => {
    const saved = getNotes();
    return saved[0]?.id || '';
  });
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeNote = notes.find(n => n.id === activeId);

  const createNote = () => {
    const note: NoteData = {
      id: generateId(),
      title: 'Untitled Note',
      content: DEFAULT_CONTENT,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveNote(note);
    setNotes(getNotes());
    setActiveId(note.id);
  };

  useEffect(() => {
    if (notes.length === 0) createNote();
  }, []);

  const updateNote = useCallback((content: string) => {
    if (!activeId) return;
    setNotes(prev => prev.map(n => n.id === activeId ? { ...n, content, updatedAt: Date.now() } : n));
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      const note = getNotes().find(n => n.id === activeId);
      if (note) {
        const firstLine = content.trim().split('\n')[0].replace(/^#+\s/, '').trim();
        saveNote({ ...note, content, title: firstLine || 'Untitled Note', updatedAt: Date.now() });
        setNotes(getNotes());
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
      }
    }, 2000);
  }, [activeId]);

  const handleDelete = (id: string) => {
    if (!confirm('Delete this note?')) return;
    deleteNote(id);
    const remaining = getNotes();
    setNotes(remaining);
    if (activeId === id) setActiveId(remaining[0]?.id || '');
  };

  const handleExport = () => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: 'text/markdown' });
    downloadFile(blob, `${activeNote.title.replace(/[^a-z0-9]/gi, '_')}.md`);
  };

  const wordStats = activeNote ? countWords(activeNote.content) : null;

  const getTitle = (note: NoteData) => {
    return note.content.trim().split('\n')[0].replace(/^#+\s/, '').trim() || 'Untitled Note';
  };

  return (
    <ToolPageWrapper tool={tool}>
      <div className="max-w-6xl mx-auto flex gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Notes List */}
        <div className="w-56 flex-shrink-0 flex flex-col bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-3 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Notes</span>
            <button
              onClick={createNote}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
              title="New note"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
            {notes.map(note => (
              <div
                key={note.id}
                onClick={() => setActiveId(note.id)}
                className={cn(
                  'group flex items-start justify-between p-2.5 rounded-xl cursor-pointer transition-all',
                  activeId === note.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-secondary'
                )}
              >
                <div className="min-w-0">
                  <p className={cn('text-xs font-medium truncate', activeId === note.id ? 'text-primary' : 'text-foreground')}>
                    {getTitle(note)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(note.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-400 text-muted-foreground transition-all flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
            <div className="flex rounded-lg overflow-hidden border border-border">
              {([
                { key: 'edit', icon: Edit3, label: 'Edit' },
                { key: 'split', icon: FileText, label: 'Split' },
                { key: 'preview', icon: Eye, label: 'Preview' },
              ] as const).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                    mode === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {wordStats && (
                <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{wordStats.words} words</span>
                  <span>{wordStats.chars} chars</span>
                  <span>~{wordStats.readingTime || '<1'} min read</span>
                </div>
              )}
              {isSaving && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Save className="w-3 h-3" /> Saved
                </span>
              )}
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export .md
              </button>
            </div>
          </div>

          {/* Editor / Preview */}
          <div className={cn('flex-1 overflow-hidden flex', mode === 'split' ? 'divide-x divide-border' : '')}>
            {(mode === 'edit' || mode === 'split') && (
              <textarea
                value={activeNote?.content || ''}
                onChange={e => updateNote(e.target.value)}
                className="code-editor flex-1 p-5 bg-transparent text-foreground focus:outline-none resize-none overflow-y-auto scrollbar-thin"
                placeholder="Start writing in Markdown..."
                spellCheck={true}
              />
            )}
            {(mode === 'preview' || mode === 'split') && (
              <div
                className="flex-1 p-5 overflow-y-auto scrollbar-thin prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{
                  __html: `<p class="mb-2">${markdownToHtml(activeNote?.content || '')}</p>`
                }}
              />
            )}
          </div>
        </div>
      </div>
    </ToolPageWrapper>
  );
}
