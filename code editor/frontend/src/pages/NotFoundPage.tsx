import { Link } from 'react-router-dom';
import { Code2, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-editor-bg flex items-center justify-center">
      <div className="text-center">
        <div className="font-mono text-8xl font-bold text-brand-600/30 mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-editor-muted mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary gap-2"><Home className="w-4 h-4" /> Home</Link>
          <Link to="/editor" className="btn-ghost gap-2 border border-editor-border"><Code2 className="w-4 h-4" /> Editor</Link>
        </div>
      </div>
    </div>
  );
}
