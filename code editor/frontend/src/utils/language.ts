/** Map file extension to CodeForge language identifier */
export function getLanguageFromExt(ext: string): string {
  const map: Record<string, string> = {
    js: 'javascript', jsx: 'javascript',
    ts: 'typescript', tsx: 'typescript',
    py: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp', cc: 'cpp', cxx: 'cpp',
    cs: 'csharp',
    go: 'go',
    php: 'php',
    rb: 'ruby',
    rs: 'rust',
  };
  return map[ext.toLowerCase()] || 'javascript';
}

export const LANGUAGE_LABELS: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python:     'Python',
  java:       'Java',
  c:          'C',
  cpp:        'C++',
  csharp:     'C#',
  go:         'Go',
  php:        'PHP',
  ruby:       'Ruby',
  rust:       'Rust',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  EASY:   'badge-green',
  MEDIUM: 'badge-orange',
  HARD:   'badge-red',
  EXPERT: 'badge-red',
};
