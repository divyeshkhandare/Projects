import { Link, useNavigate } from 'react-router-dom';
import {
  Play, Square, Save, Share2, Download, Settings,
  Code2, PanelLeft, PanelBottom, Brain, Users,
  ChevronDown, GitFork, Moon, Sun, Loader2,
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useAuthStore } from '@/store/authStore';
import { projectsAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { useState } from 'react';
import clsx from 'clsx';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python',     label: 'Python'     },
  { value: 'java',       label: 'Java'       },
  { value: 'c',          label: 'C'          },
  { value: 'cpp',        label: 'C++'        },
  { value: 'csharp',     label: 'C#'         },
  { value: 'go',         label: 'Go'         },
  { value: 'php',        label: 'PHP'        },
  { value: 'ruby',       label: 'Ruby'       },
  { value: 'rust',       label: 'Rust'       },
];

interface Props {
  onRun: () => void;
  isRunning: boolean;
}

export default function EditorTopBar({ onRun, isRunning }: Props) {
  const { projectId, projectName, files, activeFileId, toggleFileTree, toggleOutput, toggleAI, showFileTree, showOutput, showAI, theme, setTheme } = useEditorStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const activeFile = files.find((f) => f.id === activeFileId);
  const downloadUrl = projectId ? projectsAPI.downloadUrl(projectId) : null;

  const copyShareLink = () => {
    if (!projectId) return;
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleTheme = () => {
    setTheme(theme === 'vs-dark' ? 'vs-light' : 'vs-dark');
  };

  return (
    <header className="flex items-center h-11 px-3 border-b border-editor-border bg-editor-surface flex-shrink-0 gap-2">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-1.5 mr-2">
        <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center">
          <Code2 className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-bold text-white hidden sm:block">CodeForge</span>
      </Link>

      {/* Project name */}
      <div className="flex items-center gap-2 border-l border-editor-border pl-3">
        <span className="text-sm text-editor-text font-medium truncate max-w-[120px]">
          {projectName}
        </span>
        {activeFile && (
          <span className="text-xs text-editor-muted">/ {activeFile.name}</span>
        )}
      </div>

      {/* Language selector */}
      {activeFile && (
        <div className="ml-2">
          <span className="badge badge-blue text-xs">{activeFile.language}</span>
        </div>
      )}

      <div className="flex-1" />

      {/* Panel toggles */}
      <div className="hidden md:flex items-center gap-1 border-r border-editor-border pr-2 mr-1">
        <button id="toggle-filetree" onClick={toggleFileTree} className={clsx('p-1.5 rounded transition-colors', showFileTree ? 'text-brand-400 bg-brand-900/30' : 'text-editor-muted hover:text-editor-text hover:bg-editor-highlight')} title="Toggle file tree">
          <PanelLeft className="w-4 h-4" />
        </button>
        <button id="toggle-output" onClick={toggleOutput} className={clsx('p-1.5 rounded transition-colors', showOutput ? 'text-brand-400 bg-brand-900/30' : 'text-editor-muted hover:text-editor-text hover:bg-editor-highlight')} title="Toggle output">
          <PanelBottom className="w-4 h-4" />
        </button>
        <button id="toggle-ai" onClick={toggleAI} className={clsx('p-1.5 rounded transition-colors', showAI ? 'text-brand-400 bg-brand-900/30' : 'text-editor-muted hover:text-editor-text hover:bg-editor-highlight')} title="Toggle AI panel">
          <Brain className="w-4 h-4" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button id="theme-toggle" onClick={toggleTheme} className="p-1.5 rounded text-editor-muted hover:text-editor-text hover:bg-editor-highlight transition-colors" title="Toggle theme">
          {theme === 'vs-dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {projectId && (
          <>
            <button id="share-btn" onClick={copyShareLink} className="p-1.5 rounded text-editor-muted hover:text-editor-text hover:bg-editor-highlight transition-colors" title="Share">
              <Share2 className="w-4 h-4" />
            </button>
            {downloadUrl && (
              <a id="download-btn" href={downloadUrl} className="p-1.5 rounded text-editor-muted hover:text-editor-text hover:bg-editor-highlight transition-colors" title="Download ZIP">
                <Download className="w-4 h-4" />
              </a>
            )}
          </>
        )}

        {/* Run button */}
        <button
          id="run-btn"
          onClick={isRunning ? undefined : onRun}
          disabled={isRunning}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
            isRunning
              ? 'bg-danger-600/80 text-white cursor-not-allowed'
              : 'bg-success-600 hover:bg-success-500 text-white shadow-sm hover:shadow-glow-sm'
          )}
        >
          {isRunning ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running</>
          ) : (
            <><Play className="w-3.5 h-3.5 fill-white" /> Run</>
          )}
        </button>

        {/* User menu */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              id="user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-editor-highlight transition-colors"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <ChevronDown className="w-3 h-3 text-editor-muted" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 glass-card py-1 z-50 shadow-editor">
                <div className="px-3 py-2 border-b border-editor-border">
                  <p className="text-sm font-medium text-editor-text">{user?.name}</p>
                  <p className="text-xs text-editor-muted">@{user?.username}</p>
                </div>
                <Link to="/dashboard" className="sidebar-item w-full" onClick={() => setShowUserMenu(false)}>Dashboard</Link>
                <Link to={`/u/${user?.username}`} className="sidebar-item w-full" onClick={() => setShowUserMenu(false)}>Profile</Link>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="sidebar-item w-full text-brand-400" onClick={() => setShowUserMenu(false)}>Admin Panel</Link>
                )}
                <div className="divider my-1" />
                <button onClick={handleLogout} className="sidebar-item w-full text-danger-400">Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="btn-primary text-xs px-3 py-1.5">Sign In</Link>
        )}
      </div>
    </header>
  );
}
