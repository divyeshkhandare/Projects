import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usersAPI } from '@/services/api';
import { Code2, Target, Zap, Calendar, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    usersAPI.profile(username).then((res) => {
      setProfile(res.data.data.user);
    }).catch(() => setProfile(null)).finally(() => setLoading(false));
  }, [username]);

  if (loading) return (
    <div className="min-h-screen bg-editor-bg flex items-center justify-center">
      <div className="spinner w-8 h-8" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-editor-bg flex items-center justify-center text-editor-muted">
      User not found
    </div>
  );

  return (
    <div className="min-h-screen bg-editor-bg">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Profile header */}
        <div className="glass-card p-8 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} className="w-20 h-20 rounded-full border-2 border-editor-border" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-3xl font-bold text-white">
              {profile.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
            <p className="text-editor-muted">@{profile.username}</p>
            {profile.bio && <p className="text-editor-text text-sm mt-2">{profile.bio}</p>}
            <p className="text-xs text-editor-muted mt-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{profile._count?.projects}</div>
              <div className="text-xs text-editor-muted">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{profile._count?.submissions}</div>
              <div className="text-xs text-editor-muted">Submissions</div>
            </div>
          </div>
        </div>

        {/* Public projects */}
        <h2 className="text-xl font-bold text-white mb-4">Public Projects</h2>
        {profile.projects?.length === 0 ? (
          <div className="text-center py-10 text-editor-muted text-sm">No public projects yet</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {profile.projects?.map((proj: any) => (
              <Link key={proj.id} to={`/editor/${proj.id}`} className="glass-card p-4 hover:border-editor-accent/30 transition-all group">
                <h3 className="font-medium text-editor-text group-hover:text-white transition-colors">{proj.name}</h3>
                {proj.description && <p className="text-xs text-editor-muted mt-1 line-clamp-2">{proj.description}</p>}
                <div className="flex items-center gap-2 mt-3">
                  <span className="badge badge-blue text-xs">{proj.language}</span>
                  <span className="text-xs text-editor-muted ml-auto">{new Date(proj.updatedAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
