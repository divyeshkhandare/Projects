import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { challengesAPI } from '@/services/api';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import { useEditorStore } from '@/store/editorStore';
import { useAuthStore } from '@/store/authStore';
import { executionAPI } from '@/services/api';
import { Play, ChevronLeft, CheckCircle, XCircle, Loader2, Clock, Cpu } from 'lucide-react';
import { DIFFICULTY_COLORS } from '@/utils/language';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function ChallengePage() {
  const { slug } = useParams<{ slug: string }>();
  const { theme } = useEditorStore();
  const { isAuthenticated } = useAuthStore();
  const [challenge, setChallenge] = useState<any>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!slug) return;
    challengesAPI.get(slug).then((res) => {
      const ch = res.data.data.challenge;
      setChallenge(ch);
      setLanguage(ch.language);
      setCode(ch.starterCode);
    }).finally(() => setLoading(false));
  }, [slug]);

  const submit = async () => {
    if (!isAuthenticated) { toast.error('Please sign in to submit'); return; }
    if (!challenge) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await challengesAPI.submit({ challengeId: challenge.id, code, language });
      setResult(res.data.data.submission);
      if (res.data.data.submission.status === 'ACCEPTED') {
        toast.success('🎉 All tests passed!');
      } else {
        toast.error('Some tests failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen bg-editor-bg flex items-center justify-center">
      <div className="spinner w-8 h-8" />
    </div>
  );

  if (!challenge) return (
    <div className="h-screen bg-editor-bg flex items-center justify-center text-editor-muted">
      Challenge not found
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-editor-bg">
      {/* Nav */}
      <div className="h-11 flex items-center px-4 border-b border-editor-border bg-editor-surface flex-shrink-0 gap-3">
        <Link to="/challenges" className="btn-ghost text-xs gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <span className="text-editor-muted text-xs">|</span>
        <span className="text-sm font-semibold text-editor-text">{challenge.title}</span>
        <span className={`badge ${DIFFICULTY_COLORS[challenge.difficulty]}`}>{challenge.difficulty}</span>
        <div className="flex-1" />
        <button id="submit-btn" onClick={submit} disabled={submitting} className="btn-primary text-sm gap-1.5">
          {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...</> : <><Play className="w-3.5 h-3.5" /> Submit</>}
        </button>
      </div>

      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* Problem description */}
        <Panel defaultSize={40} minSize={25}>
          <div className="h-full overflow-y-auto p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`badge ${DIFFICULTY_COLORS[challenge.difficulty]}`}>{challenge.difficulty}</span>
              <span className="badge badge-blue">{challenge.language}</span>
              <span className="flex items-center gap-1 text-xs text-editor-muted"><Clock className="w-3 h-3" /> {challenge.timeLimit}ms</span>
              <span className="flex items-center gap-1 text-xs text-editor-muted"><Cpu className="w-3 h-3" /> {challenge.memoryLimit}MB</span>
            </div>
            <h1 className="text-xl font-bold text-white mb-4">{challenge.title}</h1>
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="text-editor-text text-sm leading-relaxed whitespace-pre-wrap">{challenge.description}</div>
            </div>

            {/* Test cases (visible) */}
            {Array.isArray(challenge.testCases) && challenge.testCases.filter((tc: any) => !tc.isHidden).length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-editor-text mb-3">Examples</h3>
                {challenge.testCases.filter((tc: any) => !tc.isHidden).slice(0, 3).map((tc: any, i: number) => (
                  <div key={i} className="mb-3 glass-card p-3">
                    <div className="text-xs text-editor-muted mb-1">Input:</div>
                    <code className="code-block text-xs py-1 px-2 block mb-2">{tc.input || '(none)'}</code>
                    <div className="text-xs text-editor-muted mb-1">Expected Output:</div>
                    <code className="code-block text-xs py-1 px-2 block">{tc.expected}</code>
                  </div>
                ))}
              </div>
            )}

            {/* Submission result */}
            {result && (
              <div className={clsx('mt-6 p-4 rounded-xl border', result.status === 'ACCEPTED' ? 'border-success-500/30 bg-success-500/10' : 'border-danger-500/30 bg-danger-500/10')}>
                <div className={clsx('flex items-center gap-2 font-semibold mb-3', result.status === 'ACCEPTED' ? 'text-success-400' : 'text-danger-400')}>
                  {result.status === 'ACCEPTED' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  {result.status === 'ACCEPTED' ? 'Accepted' : 'Wrong Answer'}
                </div>
                <p className="text-xs text-editor-muted">{result.passedTests}/{result.totalTests} tests passed</p>
                <div className="mt-3 space-y-2">
                  {result.testResults?.map((tr: any, i: number) => (
                    <div key={i} className={clsx('flex items-center gap-2 text-xs', tr.passed ? 'text-success-400' : 'text-danger-400')}>
                      {tr.passed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      Test {i + 1}: {tr.hidden ? (tr.passed ? 'Passed' : 'Failed') : tr.actual}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-editor-border hover:bg-brand-700/50 cursor-col-resize" />

        {/* Code editor */}
        <Panel defaultSize={60}>
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-editor-border bg-editor-surface">
              <span className="text-xs text-editor-muted">Language:</span>
              <span className="badge badge-blue text-xs">{language}</span>
            </div>
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language === 'csharp' ? 'csharp' : language}
              value={code}
              theme={theme}
              onChange={(v) => setCode(v || '')}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
