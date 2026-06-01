import { X, Circle } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import clsx from 'clsx';

const LANG_BADGE: Record<string, string> = {
  javascript: 'JS', typescript: 'TS', python: 'PY', java: 'JV',
  c: 'C', cpp: 'C++', csharp: 'C#', go: 'GO', php: 'PHP', ruby: 'RB', rust: 'RS',
};

export default function TabBar() {
  const { openTabs, activeFileId, files, setActiveFile, closeTab, openTab } = useEditorStore();

  if (openTabs.length === 0) return (
    <div className="h-9 border-b border-editor-border bg-editor-surface flex items-center px-4">
      <span className="text-xs text-editor-muted">No files open</span>
    </div>
  );

  return (
    <div className="flex items-end bg-editor-surface border-b border-editor-border overflow-x-auto scrollbar-none h-9">
      {openTabs.map((tab) => {
        const file = files.find((f) => f.id === tab.fileId);
        const isActive = activeFileId === tab.fileId;
        const ext = tab.name.split('.').pop() || 'js';

        return (
          <div
            key={tab.fileId}
            id={`tab-${tab.fileId}`}
            className={clsx(
              'flex items-center gap-2 px-3 h-full border-r border-editor-border cursor-pointer',
              'text-sm font-medium whitespace-nowrap group transition-colors duration-150',
              'min-w-0 max-w-[160px]',
              isActive
                ? 'bg-editor-bg text-editor-text border-t-2 border-t-brand-500'
                : 'text-editor-muted hover:text-editor-text hover:bg-editor-highlight/50'
            )}
            onClick={() => {
              setActiveFile(tab.fileId);
              if (file) openTab(file);
            }}
          >
            {/* Dirty indicator */}
            {tab.isDirty && (
              <Circle className="w-2 h-2 text-brand-400 fill-brand-400 flex-shrink-0" />
            )}
            <span className="truncate text-xs">{tab.name}</span>
            {/* Close button */}
            <button
              className="opacity-0 group-hover:opacity-100 hover:text-editor-text text-editor-muted transition-all flex-shrink-0"
              onClick={(e) => { e.stopPropagation(); closeTab(tab.fileId); }}
              title="Close tab"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
