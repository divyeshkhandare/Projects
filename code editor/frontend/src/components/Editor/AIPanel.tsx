import { useState, useRef, useEffect } from 'react';
import { Brain, Send, Copy, X, Loader2, MessageSquare, Code, Bug, Wrench, Zap, Sparkles } from 'lucide-react';
import { aiAPI } from '@/services/api';
import { FileNode } from '@/store/editorStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

type AIMode = 'chat' | 'explain' | 'debug' | 'refactor' | 'optimize' | 'generate';

const MODES: { key: AIMode; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'chat',     label: 'Chat',      icon: MessageSquare, desc: 'Ask anything about your code' },
  { key: 'explain',  label: 'Explain',   icon: Brain,         desc: 'Explain the current code' },
  { key: 'debug',    label: 'Debug',     icon: Bug,           desc: 'Find and fix bugs' },
  { key: 'refactor', label: 'Refactor',  icon: Wrench,        desc: 'Improve code quality' },
  { key: 'optimize', label: 'Optimize',  icon: Zap,           desc: 'Boost performance' },
  { key: 'generate', label: 'Generate',  icon: Sparkles,      desc: 'Generate code from description' },
];

interface Props {
  activeFile: FileNode | null;
}

export default function AIPanel({ activeFile }: Props) {
  const [mode, setMode] = useState<AIMode>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() && mode === 'chat') return;
    if (loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim() || `${mode} my code`,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let responseText = '';
      const code = activeFile?.content || '';
      const language = activeFile?.language || 'javascript';

      switch (mode) {
        case 'chat': {
          const res = await aiAPI.chat(
            [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
            code, language
          );
          responseText = res.data.data.message;
          break;
        }
        case 'explain': {
          const res = await aiAPI.explain(code, language);
          responseText = res.data.data.explanation;
          break;
        }
        case 'debug': {
          const res = await aiAPI.debug(code, language, input);
          responseText = res.data.data.analysis;
          break;
        }
        case 'refactor': {
          const res = await aiAPI.refactor(code, language);
          responseText = res.data.data.refactored;
          break;
        }
        case 'optimize': {
          const res = await aiAPI.optimize(code, language);
          responseText = res.data.data.optimized;
          break;
        }
        case 'generate': {
          const res = await aiAPI.generate(input, language);
          responseText = res.data.data.code;
          break;
        }
      }

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText || 'No response from AI.',
      }]);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'AI request failed';
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ ${errMsg}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => setMessages([]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-editor-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-semibold text-editor-text">AI Assistant</span>
        </div>
        <button onClick={clearMessages} className="p-1 hover:bg-editor-highlight rounded text-editor-muted hover:text-editor-text transition-colors" title="Clear">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mode selector */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-editor-border flex-shrink-0">
        {MODES.map((m) => (
          <button
            key={m.key}
            id={`ai-mode-${m.key}`}
            onClick={() => setMode(m.key)}
            title={m.desc}
            className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
              mode === m.key
                ? 'bg-brand-600 text-white'
                : 'text-editor-muted hover:text-editor-text hover:bg-editor-highlight'
            )}
          >
            <m.icon className="w-3 h-3" />
            {m.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Brain className="w-8 h-8 text-editor-muted mx-auto mb-3 opacity-50" />
            <p className="text-xs text-editor-muted">
              {mode === 'chat' ? 'Ask me anything about your code.' : `Click Send to ${mode} your current file.`}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={clsx(
              'max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed',
              msg.role === 'user'
                ? 'bg-brand-700/60 text-white'
                : 'bg-editor-highlight text-editor-text border border-editor-border'
            )}>
              <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              {msg.role === 'assistant' && (
                <button
                  onClick={() => { navigator.clipboard.writeText(msg.content); toast.success('Copied!'); }}
                  className="mt-1.5 flex items-center gap-1 text-editor-muted hover:text-editor-text transition-colors"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-editor-highlight border border-editor-border rounded-xl px-3 py-2">
              <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-2 border-t border-editor-border">
        <div className="flex gap-2">
          <textarea
            id="ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={mode === 'chat' ? 'Ask anything...' : mode === 'generate' ? 'Describe what to generate...' : 'Provide context (optional)'}
            rows={2}
            className="flex-1 input-field text-xs resize-none"
            disabled={loading}
          />
          <button
            id="ai-send-btn"
            onClick={sendMessage}
            disabled={loading || (mode !== 'generate' && !input && mode !== 'chat' && !activeFile?.content)}
            className="btn-primary px-3 py-2 self-end"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
