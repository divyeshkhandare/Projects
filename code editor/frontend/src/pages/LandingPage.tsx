import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2, Zap, Users, Brain, Shield, Globe,
  ChevronRight, Terminal, Play, Star, GitFork,
  CheckCircle, ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'Ruby', 'PHP', 'C#'];

const FEATURES = [
  { icon: Code2,   title: 'Monaco Editor',       desc: 'VS Code editor in the browser with full IntelliSense and syntax highlighting.' },
  { icon: Zap,     title: 'Instant Execution',    desc: 'Run code in isolated Docker containers with output in milliseconds.' },
  { icon: Users,   title: 'Real-time Collab',    desc: 'Live cursors, shared editing, and in-editor chat with your team.' },
  { icon: Brain,   title: 'AI Assistant',         desc: 'GPT-powered code explanation, debugging, refactoring, and generation.' },
  { icon: Shield,  title: 'Secure Sandbox',       desc: 'Every run is isolated with resource limits and network isolation.' },
  { icon: Globe,   title: '11+ Languages',        desc: 'Python, JavaScript, Java, C++, Go, Rust, and more out of the box.' },
];

const DEMO_CODE = `# Python — Fibonacci with memoization
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)

results = [fib(i) for i in range(10)]
print("Fibonacci:", results)
# Output: Fibonacci: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`;

const STATS = [
  { value: '11+',   label: 'Languages' },
  { value: '100ms', label: 'Avg. Runtime' },
  { value: '256MB', label: 'Memory Limit' },
  { value: 'Free',  label: 'Forever' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-editor-bg text-editor-text overflow-x-hidden">
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-editor-border bg-editor-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            CodeForge
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-editor-muted">
            <Link to="/challenges" className="hover:text-white transition-colors">Challenges</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#languages" className="hover:text-white transition-colors">Languages</a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-sm">
                Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-brand-900/60 text-brand-300 border border-brand-700/50 mb-6">
              <Zap className="w-3 h-3" />
              Now with AI Code Assistance
            </span>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              Code. Run.{' '}
              <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                Collaborate.
              </span>
            </h1>

            <p className="text-xl text-editor-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              A professional online code editor supporting 11+ languages, real-time collaboration,
              AI assistance, and secure Docker-based execution — all in your browser.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/editor" className="btn-primary text-base px-6 py-3 gap-2">
                <Play className="w-5 h-5" />
                Start Coding Free
              </Link>
              <Link to="/challenges" className="btn-ghost text-base px-6 py-3 gap-2">
                <Terminal className="w-5 h-5" />
                Try Challenges
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-8 mt-16"
          >
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-sm text-editor-muted">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Live Editor Preview ───────────────────────────────────────── */}
      <section className="px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="max-w-5xl mx-auto"
        >
          <div className="rounded-2xl overflow-hidden border border-editor-border shadow-editor">
            {/* Editor chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-editor-surface border-b border-editor-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-danger-500" />
                <div className="w-3 h-3 rounded-full bg-warning-500" />
                <div className="w-3 h-3 rounded-full bg-success-500" />
              </div>
              <span className="text-xs text-editor-muted ml-2 font-mono">main.py</span>
              <div className="ml-auto flex items-center gap-2">
                <span className="badge badge-blue">Python</span>
                <button className="btn-primary text-xs py-1 px-3">
                  <Play className="w-3 h-3" /> Run
                </button>
              </div>
            </div>
            {/* Code */}
            <div className="code-block rounded-none bg-editor-bg border-0 p-6 text-sm leading-relaxed">
              <pre className="text-editor-text">
                <span className="text-editor-muted">{`# Python — Fibonacci with memoization\n`}</span>
                <span className="text-syntax-keyword">from </span>
                <span className="text-editor-text">functools </span>
                <span className="text-syntax-keyword">import </span>
                <span className="text-editor-text">lru_cache{`\n\n`}</span>
                <span className="text-editor-muted">@lru_cache(maxsize=None){`\n`}</span>
                <span className="text-syntax-keyword">def </span>
                <span className="text-syntax-function">fib</span>
                <span className="text-editor-text">(n: </span>
                <span className="text-syntax-keyword">int</span>
                <span className="text-editor-text">) -&gt; </span>
                <span className="text-syntax-keyword">int</span>
                <span className="text-editor-text">:{`\n    `}</span>
                <span className="text-syntax-keyword">if </span>
                <span className="text-editor-text">n &lt; </span>
                <span className="text-syntax-number">2</span>
                <span className="text-editor-text">:{`\n        `}</span>
                <span className="text-syntax-keyword">return </span>
                <span className="text-editor-text">n{`\n    `}</span>
                <span className="text-syntax-keyword">return </span>
                <span className="text-syntax-function">fib</span>
                <span className="text-editor-text">(n-</span>
                <span className="text-syntax-number">1</span>
                <span className="text-editor-text">) + </span>
                <span className="text-syntax-function">fib</span>
                <span className="text-editor-text">(n-</span>
                <span className="text-syntax-number">2</span>
                <span className="text-editor-text">)</span>
              </pre>
            </div>
            {/* Output */}
            <div className="border-t border-editor-border bg-editor-surface p-4">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-3.5 h-3.5 text-editor-muted" />
                <span className="text-xs text-editor-muted font-mono">Output</span>
                <span className="ml-auto badge badge-green">✓ 42ms</span>
              </div>
              <div className="terminal-output text-success-400">
                Fibonacci: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need to code</h2>
            <p className="text-editor-muted text-lg max-w-xl mx-auto">
              Built for developers who want a professional experience — not a toy.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 hover:border-brand-700/50 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-900/60 border border-brand-700/50 flex items-center justify-center mb-4 group-hover:bg-brand-800/60 transition-colors">
                  <f.icon className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-editor-muted text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Languages ────────────────────────────────────────────────── */}
      <section id="languages" className="px-6 py-20 border-y border-editor-border bg-editor-surface/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">11+ Languages Supported</h2>
          <p className="text-editor-muted mb-10">All running in isolated Docker containers with resource limits.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {LANGUAGES.map((lang) => (
              <span key={lang} className="badge badge-gray text-sm px-4 py-2 font-mono">{lang}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 border-brand-700/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 to-transparent" />
            <div className="relative">
              <Star className="w-10 h-10 text-brand-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-white mb-4">Ready to start coding?</h2>
              <p className="text-editor-muted mb-8">
                Join thousands of developers using CodeForge to write, run, and share code.
              </p>
              <Link to="/register" className="btn-primary text-base px-8 py-3 gap-2 animate-glow">
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-editor-border px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-editor-muted">
            <Code2 className="w-4 h-4 text-brand-500" />
            <span className="font-semibold text-white">CodeForge</span>
            <span>— Built with ❤️ for developers</span>
          </div>
          <div className="flex gap-6 text-sm text-editor-muted">
            <Link to="/challenges" className="hover:text-white transition-colors">Challenges</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
