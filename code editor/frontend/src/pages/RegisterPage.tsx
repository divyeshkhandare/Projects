import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Mail, Lock, User, AtSign, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';

const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains a number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains a letter', test: (p: string) => /[a-zA-Z]/.test(p) },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      const { user, accessToken } = res.data.data;
      login(user, accessToken);
      toast.success('Account created! Welcome to CodeForge 🚀');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-editor-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow-sm">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">CodeForge</span>
          </Link>

          <div className="glass-card p-8">
            <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-editor-muted text-sm mb-8">Free forever. No credit card required.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-editor-text mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-editor-muted" />
                  <input id="reg-name" type="text" value={form.name} onChange={update('name')} placeholder="John Doe" className="input-field pl-10" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-editor-text mb-1.5">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-editor-muted" />
                  <input id="reg-username" type="text" value={form.username} onChange={update('username')} placeholder="johndoe" className="input-field pl-10" required pattern="^[a-zA-Z0-9_]+$" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-editor-text mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-editor-muted" />
                  <input id="reg-email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" className="input-field pl-10" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-editor-text mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-editor-muted" />
                  <input id="reg-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="••••••••" className="input-field pl-10 pr-10" required minLength={8} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-editor-muted hover:text-editor-text transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2 space-y-1">
                    {PASSWORD_REQUIREMENTS.map((req) => (
                      <div key={req.label} className={`flex items-center gap-1.5 text-xs ${req.test(form.password) ? 'text-success-400' : 'text-editor-muted'}`}>
                        <CheckCircle className="w-3 h-3" />
                        {req.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
                {loading ? <span className="spinner" /> : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-editor-muted mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
