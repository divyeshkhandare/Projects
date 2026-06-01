import { useState } from 'react';
import { useEditorStore, FileNode } from '@/store/editorStore';
import { filesAPI } from '@/services/api';
import {
  ChevronRight, ChevronDown, FileCode, Folder, FolderOpen,
  Plus, FilePlus, FolderPlus, Trash2, Edit3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getLanguageFromExt } from '@/utils/language';

// Language icon colors
const LANG_COLORS: Record<string, string> = {
  js: 'text-yellow-400', ts: 'text-blue-400', py: 'text-green-400',
  java: 'text-orange-400', cpp: 'text-blue-300', c: 'text-blue-300',
  go: 'text-cyan-400', rs: 'text-orange-500', rb: 'text-red-400',
  php: 'text-purple-400', cs: 'text-green-500',
};

interface TreeItemProps {
  file: FileNode;
  depth?: number;
}

function TreeItem({ file, depth = 0 }: TreeItemProps) {
  const [expanded, setExpanded] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const { openTab, removeFile, activeFileId, files, projectId } = useEditorStore();

  const children = files.filter((f) => f.parentId === file.id);
  const ext = file.name.split('.').pop() || '';
  const iconColor = LANG_COLORS[ext] || 'text-editor-muted';

  const handleClick = () => {
    if (file.isFolder) {
      setExpanded(!expanded);
    } else {
      openTab(file);
    }
  };

  const handleRename = async () => {
    if (!newName.trim() || newName === file.name) {
      setRenaming(false);
      return;
    }
    try {
      await filesAPI.update(file.id, { name: newName.trim() });
      toast.success('File renamed');
    } catch {
      toast.error('Failed to rename file');
    }
    setRenaming(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete ${file.name}?`)) return;
    try {
      await filesAPI.delete(file.id);
      removeFile(file.id);
      toast.success('File deleted');
    } catch {
      toast.error('Failed to delete file');
    }
  };

  return (
    <div>
      <div
        className={`file-tree-item group ${activeFileId === file.id ? 'active' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {/* Folder expand icon */}
        {file.isFolder ? (
          <span className="text-editor-muted">
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        ) : (
          <span className="w-3.5" />
        )}

        {/* Icon */}
        {file.isFolder ? (
          expanded ? <FolderOpen className="w-4 h-4 text-yellow-500/80" /> : <Folder className="w-4 h-4 text-yellow-500/80" />
        ) : (
          <FileCode className={`w-4 h-4 ${iconColor}`} />
        )}

        {/* Name */}
        {renaming ? (
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false); }}
            className="flex-1 bg-editor-bg border border-brand-500 rounded px-1 text-xs text-editor-text outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate text-xs">{file.name}</span>
        )}

        {/* Actions on hover */}
        <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
          <button
            className="p-0.5 hover:text-editor-text text-editor-muted rounded transition-colors"
            onClick={(e) => { e.stopPropagation(); setRenaming(true); }}
            title="Rename"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            className="p-0.5 hover:text-danger-400 text-editor-muted rounded transition-colors"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Children */}
      {file.isFolder && expanded && children.map((child) => (
        <TreeItem key={child.id} file={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function FileTree() {
  const { files, projectId, addFile } = useEditorStore();
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const rootFiles = files.filter((f) => !f.parentId);

  const createFile = async () => {
    if (!newFileName.trim()) return;
    const name = newFileName.trim();
    const ext = name.split('.').pop() || 'js';
    try {
      const res = await filesAPI.create({
        projectId,
        name,
        path: name,
        content: '',
        language: getLanguageFromExt(ext),
        isFolder: false,
      });
      addFile(res.data.data.file);
      toast.success('File created');
    } catch {
      toast.error('Failed to create file');
    }
    setNewFileName('');
    setShowNewFile(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-editor-border">
        <span className="panel-title">Files</span>
        <div className="flex gap-1">
          <button
            id="new-file-btn"
            className="p-1 hover:bg-editor-highlight rounded text-editor-muted hover:text-editor-text transition-colors"
            onClick={() => setShowNewFile(true)}
            title="New file"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* New file input */}
      {showNewFile && (
        <div className="px-3 py-2 border-b border-editor-border">
          <input
            autoFocus
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') createFile(); if (e.key === 'Escape') setShowNewFile(false); }}
            onBlur={() => { if (!newFileName) setShowNewFile(false); }}
            placeholder="filename.py"
            className="input-field text-xs py-1"
          />
        </div>
      )}

      {/* File list */}
      <div className="flex-1 overflow-y-auto py-1">
        {rootFiles.length === 0 ? (
          <div className="text-center text-editor-muted text-xs py-8 px-4">
            <p className="mb-2">No files yet</p>
            <button onClick={() => setShowNewFile(true)} className="text-brand-400 hover:text-brand-300 transition-colors">
              + Create a file
            </button>
          </div>
        ) : (
          rootFiles.map((f) => <TreeItem key={f.id} file={f} />)
        )}
      </div>
    </div>
  );
}
