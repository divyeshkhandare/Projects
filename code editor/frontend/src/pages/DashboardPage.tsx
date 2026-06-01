import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { projectsAPI, usersAPI } from '@/services/api';
import {
  Plus, Code2, Globe, Lock, GitFork, Trash2, Copy,
  Clock, TrendingUp, Target, Zap, Search, Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: '#F7DF1E', typescript: '#3178C6', python: '#3572A5',
  java: '#B07219', cpp: '#F34B7D', c: '#555555', go: '#00ADD8',
  rust: '#DEA584', php: '#4F5D95', ruby: '#701516', csharp: '#178600',
};

const TEMPLATE_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'go', 'rust',
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', language: 'javascript', visibility: 'PRIVATE' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([
      projectsAPI.list(),
      usersAPI.myStats(),
    ]).then(([projRes, statsRes]) => {
      setProjects(projRes.data.data.projects);
      setStats(statsRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const createProject = async () => {
    if (!newProject.name.trim()) return;
    setCreating(true);
    try {
      const res = await projectsAPI.create(newProject);
      navigate(`/editor/${res.data.data.project.id}`);
      toast.success('Project created!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const deleteProject = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    try {
      await projectsAPI.delete(id);
      setProjects((p) => p.filter((proj) => proj.id !== id));
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const forkProject = async (id: string) => {
    try {
      const res = await projectsAPI.fork(id);
      navigate(`/editor/${res.data.data.project.id}`);
      toast.success('Project forked!');
    } catch {
      toast.error('Failed to fork project');
    }
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-editor-bg">
      {/* Top nav */}
      <nav className="sticky top-0 z-40 border-b border-editor-border bg-editor-bg/90 backdrop-blur-md px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Code2 className="w-3.5 h-3.5 text-white" />
          </div>
          CodeForge
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/challenges" className="text-sm text-editor-muted hover:text-white transition-colors">Challenges</Link>
          <Link to="/editor" className="btn-ghost text-sm">Scratch Pad</Link>
          <button id="new-project-btn" onClick={() => setShowNewModal(true)} className="btn-primary text-sm gap-1.5">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-editor-muted">Here's what's happening with your projects.</p>
        </motion.div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Code2,      label: 'Projects',       value: stats.projectCount,    color: 'text-brand-400' },
              { icon: Zap,        label: 'Code Runs',      value: stats.executionCount,  color: 'text-yellow-400' },
              { icon: Target,     label: 'Submissions',    value: stats.submissionCount, color: 'text-purple-400' },
              { icon: TrendingUp, label: 'Acceptance',     value: `${stats.acceptanceRate}%`, color: 'text-success-400' },
            ].map((s) => (
              <div key={s.label} className="glass-card p-4">
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-editor-muted">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Projects section */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-bold text-white">My Projects</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-editor-muted" />
              <input
                id="project-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="input-field pl-8 text-sm py-1.5 w-48"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-5 h-40">
                <div className="skeleton h-4 w-2/3 mb-3" />
                <div className="skeleton h-3 w-full mb-2" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <Code2 className="w-12 h-12 text-editor-muted mx-auto mb-4 opacity-50" />
            <p className="text-editor-text font-medium mb-2">No projects yet</p>
            <p className="text-editor-muted text-sm mb-6">Create your first project to start coding.</p>
            <button onClick={() => setShowNewModal(true)} className="btn-primary gap-2">
              <Plus className="w-4 h-4" /> Create Project
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 hover:border-editor-accent/30 transition-all duration-200 group cursor-pointer"
                onClick={() => navigate(`/editor/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: LANGUAGE_COLORS[project.language] || '#888' }} />
                    <span className="text-xs text-editor-muted font-mono">{project.language}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {project.visibility === 'PUBLIC'
                      ? <Globe className="w-3.5 h-3.5 text-success-400" />
                      : <Lock className="w-3.5 h-3.5 text-editor-muted" />
                    }
                    <button
                      className="p-1 hover:text-brand-400 text-editor-muted rounded transition-colors"
                      onClick={(e) => { e.stopPropagation(); forkProject(project.id); }}
                      title="Fork"
                    >
                      <GitFork className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1 hover:text-danger-400 text-editor-muted rounded transition-colors"
                      onClick={(e) => { e.stopPropagation(); deleteProject(project.id, project.name); }}
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-editor-text text-sm mb-1 truncate">{project.name}</h3>
                {project.description && (
                  <p className="text-xs text-editor-muted line-clamp-2 mb-3">{project.description}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-editor-border/50">
                  <span className="text-xs text-editor-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-editor-muted">{project._count?.files || 0} files</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-6">Create New Project</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-editor-text mb-1.5">Project Name</label>
                <input
                  id="new-project-name"
                  autoFocus
                  value={newProject.name}
                  onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
                  placeholder="My Awesome Project"
                  className="input-field"
                  onKeyDown={(e) => { if (e.key === 'Enter') createProject(); }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-editor-text mb-1.5">Language</label>
                <select
                  id="new-project-language"
                  value={newProject.language}
                  onChange={(e) => setNewProject((p) => ({ ...p, language: e.target.value }))}
                  className="input-field"
                >
                  {TEMPLATE_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-editor-text mb-1.5">Visibility</label>
                <select
                  id="new-project-visibility"
                  value={newProject.visibility}
                  onChange={(e) => setNewProject((p) => ({ ...p, visibility: e.target.value }))}
                  className="input-field"
                >
                  <option value="PRIVATE">🔒 Private</option>
                  <option value="PUBLIC">🌍 Public</option>
                  <option value="UNLISTED">🔗 Unlisted</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNewModal(false)} className="btn-ghost flex-1 justify-center border border-editor-border">
                Cancel
              </button>
              <button id="create-project-submit" onClick={createProject} disabled={creating || !newProject.name.trim()} className="btn-primary flex-1 justify-center">
                {creating ? <span className="spinner" /> : 'Create Project'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
