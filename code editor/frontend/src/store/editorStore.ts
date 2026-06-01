import { create } from 'zustand';

export interface FileNode {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isFolder: boolean;
  parentId?: string;
  children?: FileNode[];
}

export interface Tab {
  fileId: string;
  name: string;
  path: string;
  isDirty: boolean;
}

interface EditorState {
  // Project
  projectId: string | null;
  projectName: string;
  
  // Files
  files: FileNode[];
  activeFileId: string | null;
  openTabs: Tab[];
  
  // Editor settings
  theme: 'vs-dark' | 'vs-light' | 'hc-black';
  fontSize: number;
  tabSize: number;
  wordWrap: 'on' | 'off';
  minimap: boolean;
  
  // Execution
  isRunning: boolean;
  output: string;
  outputType: 'stdout' | 'stderr' | 'info';
  exitCode: number | null;
  executionDuration: number | null;
  stdin: string;
  
  // UI panels
  showFileTree: boolean;
  showOutput: boolean;
  showAI: boolean;
  showCollabChat: boolean;
  splitView: boolean;
  
  // Actions
  setProject: (id: string, name: string) => void;
  setFiles: (files: FileNode[]) => void;
  updateFileContent: (fileId: string, content: string) => void;
  openTab: (file: FileNode) => void;
  closeTab: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  markDirty: (fileId: string, dirty: boolean) => void;
  addFile: (file: FileNode) => void;
  removeFile: (fileId: string) => void;
  
  setTheme: (theme: EditorState['theme']) => void;
  setFontSize: (size: number) => void;
  setRunning: (running: boolean) => void;
  setOutput: (output: string, type?: EditorState['outputType'], exitCode?: number, duration?: number) => void;
  clearOutput: () => void;
  setStdin: (stdin: string) => void;
  
  toggleFileTree: () => void;
  toggleOutput: () => void;
  toggleAI: () => void;
  toggleSplitView: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  projectId: null,
  projectName: 'Untitled Project',
  files: [],
  activeFileId: null,
  openTabs: [],
  
  theme: 'vs-dark',
  fontSize: 14,
  tabSize: 2,
  wordWrap: 'on',
  minimap: true,
  
  isRunning: false,
  output: '',
  outputType: 'stdout',
  exitCode: null,
  executionDuration: null,
  stdin: '',
  
  showFileTree: true,
  showOutput: true,
  showAI: false,
  showCollabChat: false,
  splitView: false,

  setProject: (id, name) => set({ projectId: id, projectName: name }),
  
  setFiles: (files) => set({ files }),
  
  updateFileContent: (fileId, content) =>
    set((state) => ({
      files: state.files.map((f) => f.id === fileId ? { ...f, content } : f),
    })),

  openTab: (file) =>
    set((state) => {
      const exists = state.openTabs.find((t) => t.fileId === file.id);
      if (exists) return { activeFileId: file.id };
      return {
        openTabs: [...state.openTabs, { fileId: file.id, name: file.name, path: file.path, isDirty: false }],
        activeFileId: file.id,
      };
    }),

  closeTab: (fileId) =>
    set((state) => {
      const tabs = state.openTabs.filter((t) => t.fileId !== fileId);
      const newActive = state.activeFileId === fileId
        ? (tabs.at(-1)?.fileId ?? null)
        : state.activeFileId;
      return { openTabs: tabs, activeFileId: newActive };
    }),

  setActiveFile: (fileId) => set({ activeFileId: fileId }),

  markDirty: (fileId, dirty) =>
    set((state) => ({
      openTabs: state.openTabs.map((t) => t.fileId === fileId ? { ...t, isDirty: dirty } : t),
    })),

  addFile: (file) => set((state) => ({ files: [...state.files, file] })),

  removeFile: (fileId) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== fileId),
      openTabs: state.openTabs.filter((t) => t.fileId !== fileId),
      activeFileId: state.activeFileId === fileId ? null : state.activeFileId,
    })),

  setTheme: (theme) => set({ theme }),
  setFontSize: (fontSize) => set({ fontSize }),
  setRunning: (isRunning) => set({ isRunning }),

  setOutput: (output, outputType = 'stdout', exitCode: number | null = null, executionDuration: number | null = null) =>
    set({ output, outputType, exitCode, executionDuration }),

  clearOutput: () => set({ output: '', exitCode: null, executionDuration: null }),
  setStdin: (stdin) => set({ stdin }),

  toggleFileTree: () => set((s) => ({ showFileTree: !s.showFileTree })),
  toggleOutput: () => set((s) => ({ showOutput: !s.showOutput })),
  toggleAI: () => set((s) => ({ showAI: !s.showAI })),
  toggleSplitView: () => set((s) => ({ splitView: !s.splitView })),
}));
