import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Mail, Lock, Eye, EyeOff, Chrome } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      const { user, accessToken } = res.data.data;
      login(user, accessToken);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-editor-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow-sm">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">CodeForge</span>
          </Link>

          <div className="glass-card p-8">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-editor-muted text-sm mb-8">Sign in to your CodeForge account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-editor-text mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-editor-muted" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-editor-text">Password</label>
                  <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-editor-muted" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-editor-muted hover:text-editor-text transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5"
              >
                {loading ? <span className="spinner" /> : 'Sign In'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="divider" />
              <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-editor-surface px-3 text-xs text-editor-muted">
                or continue with
              </span>
            </div>

            <button
              id="google-login"
              className="btn-ghost w-full justify-center border border-editor-border py-2.5"
              onClick={() => toast('Google OAuth: configure GOOGLE_CLIENT_ID in .env')}
            >
              <Chrome className="w-4 h-4 text-brand-400" />
              Continue with Google
            </button>

            <p className="text-center text-sm text-editor-muted mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Sign up free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
