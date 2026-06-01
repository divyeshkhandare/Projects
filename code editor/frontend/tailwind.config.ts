/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Editor dark theme
        editor: {
          bg:         '#0d1117',
          surface:    '#161b22',
          border:     '#30363d',
          muted:      '#8b949e',
          text:       '#c9d1d9',
          highlight:  '#1f2937',
          accent:     '#388bfd',
        },
        // Syntax colors
        syntax: {
          keyword:  '#ff7b72',
          string:   '#a5d6ff',
          number:   '#79c0ff',
          comment:  '#8b949e',
          function: '#d2a8ff',
          variable: '#ffa657',
        },
        // Status colors
        success: { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a' },
        warning: { 400: '#fb923c', 500: '#f97316', 600: '#ea580c' },
        danger:  { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(22,27,34,0.9), rgba(13,17,23,0.8))',
      },
      boxShadow: {
        'glow-brand': '0 0 20px rgba(59,130,246,0.3)',
        'glow-sm':    '0 0 10px rgba(59,130,246,0.2)',
        'editor':     '0 8px 32px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in':       'fadeIn 0.3s ease-out',
        'slide-up':      'slideUp 0.3s ease-out',
        'slide-down':    'slideDown 0.2s ease-out',
        'pulse-slow':    'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'typing':        'typing 1.2s steps(3) infinite',
        'glow':          'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        typing:    { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
        glow:      { from: { boxShadow: '0 0 10px rgba(59,130,246,0.2)' }, to: { boxShadow: '0 0 25px rgba(59,130,246,0.5)' } },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34,1.56,0.64,1)',
      },
    },
  },
  plugins: [],
};
