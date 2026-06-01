import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useEditorStore } from '@/store/editorStore';
import { useAuthStore } from '@/store/authStore';
import { projectsAPI, filesAPI, executionAPI } from '@/services/api';
import { connectSocket, disconnectSocket, joinRoom, leaveRoom } from '@/services/socket';
import EditorTopBar from '@/components/Editor/EditorTopBar';
import FileTree from '@/components/Editor/FileTree';
import MonacoEditor from '@/components/Editor/MonacoEditor';
import TabBar from '@/components/Editor/TabBar';
import OutputPanel from '@/components/Editor/OutputPanel';
import AIPanel from '@/components/Editor/AIPanel';
import CollabUsers from '@/components/Editor/CollabUsers';
import toast from 'react-hot-toast';

export default function EditorPage() {
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    setProject, setFiles, openTab, activeFileId, files,
    setRunning, setOutput, clearOutput, stdin, isRunning,
    showFileTree, showOutput, showAI,
    projectId: storeProjectId,
  } = useEditorStore();

  const [isLoading, setIsLoading] = useState(!!projectId);

  // ── Load project ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) {
      // Scratch pad mode (no project)
      setProject('', 'Untitled');
      const scratchFile = { id: 'scratch', name: 'main.js', path: 'main.js', content: '// Start coding!\nconsole.log("Hello, World!");\n', language: 'javascript', isFolder: false };
      setFiles([scratchFile]);
      openTab(scratchFile);
      setIsLoading(false);
      return;
    }

    projectsAPI.get(projectId).then((res) => {
      const { project } = res.data.data;
      setProject(project.id, project.name);
      setFiles(project.files || []);
      if (project.files?.length > 0) {
        openTab(project.files[0]);
      }
    }).catch(() => {
      toast.error('Project not found or access denied');
      navigate('/dashboard');
    }).finally(() => setIsLoading(false));
  }, [projectId]);

  // ── Socket.IO collaboration ───────────────────────────────────────────────
  useEffect(() => {
    if (!projectId || !isAuthenticated) return;
    connectSocket();
    joinRoom(projectId);
    return () => {
      leaveRoom(projectId);
      disconnectSocket();
    };
  }, [projectId, isAuthenticated]);

  // ── Auto-save (debounced, every 2 seconds of inactivity) ─────────────────
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();
  const handleContentChange = (fileId: string, content: string) => {
    clearTimeout(autoSaveTimer.current);
    useEditorStore.getState().updateFileContent(fileId, content);
    useEditorStore.getState().markDirty(fileId, true);

    if (fileId !== 'scratch' && projectId) {
      autoSaveTimer.current = setTimeout(async () => {
        try {
          await filesAPI.update(fileId, { content });
          useEditorStore.getState().markDirty(fileId, false);
        } catch {
          // Silent fail on auto-save
        }
      }, 2000);
    }
  };

  // ── Run code ──────────────────────────────────────────────────────────────
  const runCode = async () => {
    const activeFile = files.find((f) => f.id === activeFileId);
    if (!activeFile) return toast.error('No file selected');

    setRunning(true);
    clearOutput();

    try {
      const res = await executionAPI.run({
        language: activeFile.language,
        code: activeFile.content,
        stdin,
        projectId: projectId || undefined,
      });

      const { stdout, stderr, exitCode, durationMs, status } = res.data.data;
      const outputText = stdout || stderr || (status === 'timeout' ? '⏱ Execution timed out' : 'No output');
      const outType = stderr && !stdout ? 'stderr' : status === 'timeout' ? 'info' : 'stdout';
      setOutput(outputText, outType, exitCode, durationMs);
    } catch (err: any) {
      setOutput(err.response?.data?.message || 'Execution failed', 'stderr');
    } finally {
      setRunning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-editor-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-8 h-8 border-3" />
          <p className="text-editor-muted text-sm">Loading project...</p>
        </div>
      </div>
    );
  }

  const activeFile = files.find((f) => f.id === activeFileId);

  return (
    <div className="h-screen flex flex-col bg-editor-bg overflow-hidden">
      {/* Top navbar */}
      <EditorTopBar onRun={runCode} isRunning={isRunning} />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <PanelGroup direction="horizontal" className="flex-1">
          {/* File tree sidebar */}
          {showFileTree && (
            <>
              <Panel defaultSize={16} minSize={12} maxSize={30} className="bg-editor-surface border-r border-editor-border">
                <FileTree />
              </Panel>
              <PanelResizeHandle className="w-1 bg-editor-border hover:bg-brand-700/50 transition-colors cursor-col-resize" />
            </>
          )}

          {/* Editor + output panel */}
          <Panel className="flex flex-col overflow-hidden">
            <PanelGroup direction="vertical">
              {/* Editor area */}
              <Panel defaultSize={showOutput ? 65 : 100} minSize={30}>
                <div className="flex flex-col h-full">
                  <TabBar />
                  {activeFile ? (
                    <MonacoEditor
                      file={activeFile}
                      onChange={(content) => handleContentChange(activeFile.id, content)}
                      projectId={storeProjectId || ''}
                    />
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-editor-muted">
                      <div className="text-center">
                        <div className="text-4xl mb-4">📂</div>
                        <p className="text-sm">Select a file to start editing</p>
                      </div>
                    </div>
                  )}
                </div>
              </Panel>

              {/* Output panel */}
              {showOutput && (
                <>
                  <PanelResizeHandle className="h-1 bg-editor-border hover:bg-brand-700/50 transition-colors cursor-row-resize" />
                  <Panel defaultSize={35} minSize={15} maxSize={60}>
                    <OutputPanel />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>

          {/* AI Panel */}
          {showAI && (
            <>
              <PanelResizeHandle className="w-1 bg-editor-border hover:bg-brand-700/50 transition-colors cursor-col-resize" />
              <Panel defaultSize={25} minSize={20} maxSize={40} className="bg-editor-surface border-l border-editor-border">
                <AIPanel activeFile={activeFile || null} />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

      {/* Collab users indicator */}
      {projectId && <CollabUsers projectId={projectId} />}
    </div>
  );
}
