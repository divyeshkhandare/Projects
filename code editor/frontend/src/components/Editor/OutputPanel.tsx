import { useState } from 'react';
import { Terminal, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import clsx from 'clsx';

type TabType = 'output' | 'input';

export default function OutputPanel() {
  const { output, outputType, exitCode, executionDuration, stdin, setStdin, clearOutput, isRunning } = useEditorStore();
  const [activeTab, setActiveTab] = useState<TabType>('output');

  const statusColor = exitCode === 0 ? 'text-success-400' : exitCode !== null ? 'text-danger-400' : 'text-editor-muted';

  return (
    <div className="h-full flex flex-col bg-editor-surface border-t border-editor-border">
      {/* Panel header */}
      <div className="flex items-center border-b border-editor-border px-2 h-8 flex-shrink-0">
        <div className="flex gap-1">
          {(['output', 'input'] as TabType[]).map((tab) => (
            <button
              key={tab}
              id={`panel-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={clsx('tab-btn text-xs capitalize py-1', activeTab === tab && 'active')}
            >
              {tab === 'output' ? <Terminal className="w-3 h-3" /> : null}
              {tab}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Execution status */}
          {isRunning && (
            <span className="text-xs text-brand-400 animate-pulse">⚡ Running...</span>
          )}
          {exitCode !== null && (
            <span className={`text-xs font-mono ${statusColor}`}>
              exit: {exitCode}
            </span>
          )}
          {executionDuration !== null && (
            <span className="text-xs text-editor-muted font-mono">{executionDuration}ms</span>
          )}
          <button
            id="clear-output-btn"
            onClick={clearOutput}
            className="p-1 hover:bg-editor-highlight rounded text-editor-muted hover:text-editor-text transition-colors"
            title="Clear output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-auto p-3">
        {activeTab === 'output' ? (
          <div className="terminal-output">
            {isRunning ? (
              <span className="text-brand-400 animate-pulse">Executing...</span>
            ) : output ? (
              <span className={clsx(
                outputType === 'stderr' && 'stderr',
                outputType === 'stdout' && 'stdout',
                outputType === 'info' && 'info',
              )}>
                {output}
              </span>
            ) : (
              <span className="text-editor-muted text-xs">
                Output will appear here. Click ▶ Run or press Ctrl+Enter.
              </span>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col gap-2">
            <p className="text-xs text-editor-muted">Provide stdin input for your program:</p>
            <textarea
              id="stdin-input"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Enter input here..."
              className="flex-1 input-field font-mono text-xs resize-none"
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
