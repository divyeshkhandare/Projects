import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useEditorStore } from '@/store/editorStore';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import EditorPage from '@/pages/EditorPage';
import ChallengePage from '@/pages/ChallengePage';
import ChallengeListPage from '@/pages/ChallengeListPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { useEffect } from 'react';
import { apiClient } from '@/services/api';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const { setUser, setLoading } = useAuthStore();
  const { theme } = useEditorStore();

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    apiClient.get('/auth/me')
      .then((res) => setUser(res.data.data.user))
      .catch(() => {
        localStorage.removeItem('accessToken');
        setLoading(false);
      });
  }, []);

  return (
    <Routes>
      {/* Public */}
      <Route path="/"           element={<LandingPage />} />
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/register"   element={<RegisterPage />} />
      <Route path="/challenges" element={<ChallengeListPage />} />
      <Route path="/challenges/:slug" element={<ChallengePage />} />
      <Route path="/u/:username" element={<ProfilePage />} />

      {/* Editor — public projects viewable without login */}
      <Route path="/editor/:projectId" element={<EditorPage />} />
      <Route path="/editor"            element={<EditorPage />} />

      {/* Protected */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin/*" element={<AdminRoute><AdminPage /></AdminRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
