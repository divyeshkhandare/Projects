import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { challengesAPI } from '@/services/api';
import { Search, Target, Filter } from 'lucide-react';
import { DIFFICULTY_COLORS } from '@/utils/language';

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];
const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust'];

export default function ChallengeListPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', difficulty: '', language: '' });

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.difficulty) params.difficulty = filters.difficulty;
    if (filters.language) params.language = filters.language;

    challengesAPI.list(params).then((res) => {
      setChallenges(res.data.data.challenges || []);
    }).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="min-h-screen bg-editor-bg">
      <div className="border-b border-editor-border px-6 py-4 bg-editor-surface">
        <h1 className="text-2xl font-bold text-white mb-1">Coding Challenges</h1>
        <p className="text-editor-muted text-sm">Practice and improve your problem-solving skills.</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-editor-muted" />
            <input
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Search challenges..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters((f) => ({ ...f, difficulty: e.target.value }))}
            className="input-field w-auto"
          >
            <option value="">All Difficulties</option>
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={filters.language}
            onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value }))}
            className="input-field w-auto"
          >
            <option value="">All Languages</option>
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Challenge list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card p-4 h-16 skeleton" />
            ))}
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-20 text-editor-muted">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No challenges found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((ch, i) => (
              <Link
                key={ch.id}
                to={`/challenges/${ch.slug}`}
                className="glass-card p-4 flex items-center gap-4 hover:border-editor-accent/30 transition-all group"
              >
                <span className="text-editor-muted text-sm w-8 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-editor-text font-medium group-hover:text-white transition-colors truncate">{ch.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge badge-blue text-xs">{ch.language}</span>
                    {ch.tags?.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="badge badge-gray text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`badge ${DIFFICULTY_COLORS[ch.difficulty]}`}>{ch.difficulty}</span>
                  <span className="text-xs text-editor-muted">{ch._count?.submissions || 0} submissions</span>
                  <span className="text-xs text-brand-400 font-medium">{ch.points}pts</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
