import { useEffect, useRef, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import Editor, { OnMount } from '@monaco-editor/react';
import { useEditorStore, FileNode } from '@/store/editorStore';
import { getSocket } from '@/services/socket';
import { emitCursorChange, emitEditorChange, emitSelection } from '@/services/socket';

// Language extension map to Monaco language IDs
const MONACO_LANGUAGES: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python:     'python',
  java:       'java',
  c:          'c',
  cpp:        'cpp',
  csharp:     'csharp',
  go:         'go',
  php:        'php',
  ruby:       'ruby',
  rust:       'rust',
};

interface Props {
  file: FileNode;
  onChange: (content: string) => void;
  projectId: string;
}

export default function MonacoEditor({ file, onChange, projectId }: Props) {
  const { theme, fontSize, tabSize, wordWrap, minimap, markDirty } = useEditorStore();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;

    // ── Keyboard shortcuts ────────────────────────────────────────────────
    // Ctrl+S → save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const content = editor.getValue();
      onChange(content);
    });

    // Ctrl+Shift+F → format
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument')?.run();
    });

    // ── Cursor position tracking ──────────────────────────────────────────
    if (projectId) {
      editor.onDidChangeCursorPosition((e) => {
        emitCursorChange(projectId, file.id, {
          lineNumber: e.position.lineNumber,
          column: e.position.column,
        });
      });

      editor.onDidChangeCursorSelection((e) => {
        if (!e.selection.isEmpty()) {
          emitSelection(projectId, file.id, {
            startLine: e.selection.startLineNumber,
            startColumn: e.selection.startColumn,
            endLine: e.selection.endLineNumber,
            endColumn: e.selection.endColumn,
          });
        }
      });

      // ── Receive remote changes ─────────────────────────────────────────
      const socket = getSocket();
      socket.on('editor:change', ({ fileId, changes }: { fileId: string; changes: monaco.editor.IModelContentChange[] }) => {
        if (fileId !== file.id) return;
        const model = editor.getModel();
        if (!model) return;
        model.applyEdits(changes.map((c) => ({
          range: c.range as monaco.IRange,
          text: c.text,
        })));
      });

      // ── Remote cursors ─────────────────────────────────────────────────
      socket.on('editor:cursor', ({ socketId, fileId, position }: {
        socketId: string; fileId: string;
        position: { lineNumber: number; column: number };
      }) => {
        if (fileId !== file.id) return;
        // Remote cursor rendering via decorations
        const newDecorations = editor.createDecorationsCollection([{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          options: {
            className: 'collab-cursor',
            hoverMessage: { value: `User ${socketId.slice(0, 4)}` },
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        }]);
      });
    }
  }, [file.id, projectId]);

  // Emit changes to collaborators
  const handleChange = useCallback((value: string | undefined) => {
    if (value === undefined) return;
    onChange(value);
    markDirty(file.id, true);

    if (projectId && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        // Emit the last change event
        const changes = (model as any)._commandManager?._currentChunk?.ops ?? [];
        emitEditorChange(projectId, file.id, changes, model.getVersionId());
      }
    }
  }, [file.id, projectId, onChange]);

  return (
    <div className="flex-1 overflow-hidden">
      <Editor
        height="100%"
        language={MONACO_LANGUAGES[file.language] || 'plaintext'}
        value={file.content}
        theme={theme}
        onChange={handleChange}
        onMount={handleMount}
        options={{
          fontSize,
          tabSize,
          wordWrap,
          minimap: { enabled: minimap },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'line',
          lineNumbers: 'on',
          glyphMargin: true,
          folding: true,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          formatOnPaste: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: { other: true, comments: true, strings: true },
          acceptSuggestionOnCommitCharacter: true,
          snippetSuggestions: 'top',
          fontLigatures: true,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        }}
      />
    </div>
  );
}
