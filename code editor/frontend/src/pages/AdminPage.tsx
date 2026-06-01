import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '@/services/api';
import { Users, Code2, Zap, BarChart3, Shield, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'users' | 'executions'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.stats(), adminAPI.listUsers(), adminAPI.executions()]).then(([s, u, e]) => {
      setStats(s.data.data);
      setUsers(u.data.data.users);
      setExecutions(e.data.data.executions);
    }).finally(() => setLoading(false));
  }, []);

  const toggleUserActive = async (id: string, current: boolean) => {
    try {
      await adminAPI.updateUser(id, { isActive: !current });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isActive: !current } : u));
      toast.success(`User ${!current ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update user');
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  if (loading) return (
    <div className="h-screen bg-editor-bg flex items-center justify-center">
      <div className="spinner w-8 h-8" />
    </div>
  );

  return (
    <div className="min-h-screen bg-editor-bg">
      {/* Header */}
      <div className="border-b border-editor-border px-6 py-4 bg-editor-surface flex items-center gap-3">
        <Shield className="w-5 h-5 text-brand-400" />
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        <Link to="/dashboard" className="ml-auto btn-ghost text-sm">← Dashboard</Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-editor-border px-6 flex gap-1">
        {(['overview', 'users', 'executions'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`tab-btn capitalize ${tab === t ? 'active' : ''}`}>{t}</button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {tab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card p-5">
                <Users className="w-6 h-6 text-brand-400 mb-2" />
                <div className="text-3xl font-bold text-white">{stats.stats.totalUsers}</div>
                <div className="text-sm text-editor-muted">Total Users</div>
              </div>
              <div className="glass-card p-5">
                <Code2 className="w-6 h-6 text-purple-400 mb-2" />
                <div className="text-3xl font-bold text-white">{stats.stats.totalProjects}</div>
                <div className="text-sm text-editor-muted">Total Projects</div>
              </div>
              <div className="glass-card p-5">
                <Zap className="w-6 h-6 text-yellow-400 mb-2" />
                <div className="text-3xl font-bold text-white">{stats.stats.totalExecutions}</div>
                <div className="text-sm text-editor-muted">Code Executions</div>
              </div>
            </div>

            {/* Language stats */}
            <div className="glass-card p-5">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Executions by Language</h2>
              <div className="space-y-2">
                {stats.languageStats?.map((s: any) => {
                  const max = stats.languageStats[0]?.count || 1;
                  return (
                    <div key={s.language} className="flex items-center gap-3">
                      <span className="text-sm text-editor-muted w-20 font-mono">{s.language}</span>
                      <div className="flex-1 bg-editor-highlight rounded-full h-2">
                        <div className="bg-brand-600 h-2 rounded-full" style={{ width: `${(s.count / max) * 100}%` }} />
                      </div>
                      <span className="text-sm text-editor-text w-12 text-right">{s.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent users */}
            <div className="glass-card p-5">
              <h2 className="text-lg font-bold text-white mb-4">Recent Users</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-editor-muted text-xs border-b border-editor-border">
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Role</th>
                    <th className="text-left py-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers?.map((u: any) => (
                    <tr key={u.id} className="border-b border-editor-border/50 hover:bg-editor-highlight/30">
                      <td className="py-2 text-editor-text font-medium">{u.name}</td>
                      <td className="py-2 text-editor-muted">{u.email}</td>
                      <td className="py-2"><span className={`badge ${u.role === 'ADMIN' ? 'badge-red' : 'badge-gray'}`}>{u.role}</span></td>
                      <td className="py-2 text-editor-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-editor-muted text-xs border-b border-editor-border bg-editor-highlight/30">
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Projects</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-editor-border/50 hover:bg-editor-highlight/20">
                    <td className="px-4 py-3 font-medium text-editor-text">{u.name}</td>
                    <td className="px-4 py-3 text-editor-muted">{u.email}</td>
                    <td className="px-4 py-3"><span className={`badge ${u.role === 'ADMIN' ? 'badge-red' : 'badge-gray'}`}>{u.role}</span></td>
                    <td className="px-4 py-3 text-editor-muted">{u._count?.projects || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                        {u.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleUserActive(u.id, u.isActive)} className="p-1.5 hover:bg-editor-highlight rounded text-editor-muted hover:text-editor-text transition-colors" title={u.isActive ? 'Deactivate' : 'Activate'}>
                          {u.isActive ? <ToggleRight className="w-4 h-4 text-success-400" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteUser(u.id)} className="p-1.5 hover:bg-editor-highlight rounded text-editor-muted hover:text-danger-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'executions' && (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-editor-muted text-xs border-b border-editor-border bg-editor-highlight/30">
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Language</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Duration</th>
                  <th className="text-left px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {executions.map((e) => (
                  <tr key={e.id} className="border-b border-editor-border/50 hover:bg-editor-highlight/20">
                    <td className="px-4 py-3 text-editor-muted">{e.user?.username || 'anonymous'}</td>
                    <td className="px-4 py-3"><span className="badge badge-blue">{e.language}</span></td>
                    <td className="px-4 py-3"><span className={`badge ${e.status === 'SUCCESS' ? 'badge-green' : e.status === 'TIMEOUT' ? 'badge-orange' : 'badge-red'}`}>{e.status}</span></td>
                    <td className="px-4 py-3 text-editor-muted font-mono">{e.durationMs}ms</td>
                    <td className="px-4 py-3 text-editor-muted">{new Date(e.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
