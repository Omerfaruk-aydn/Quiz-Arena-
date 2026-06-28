/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        surface: '#13131A',
        'surface-2': '#1C1C28',
        border: '#2A2A3A',
        primary: {
          DEFAULT: '#7C3AED',
          glow: '#7C3AED40',
        },
        accent: {
          pink: '#EC4899',
          blue: '#3B82F6',
          amber: '#F59E0B',
          emerald: '#10B981',
        },
        correct: '#22C55E',
        wrong: '#EF4444',
        'text-muted': '#94A3B8',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(124, 58, 237, 0.35)',
        'glow-pink': '0 0 24px rgba(236, 72, 153, 0.35)',
      },
      backgroundImage: {
        'grid-glow':
          'radial-gradient(circle at 1px 1px, rgba(124,58,237,0.15) 1px, transparent 0)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(124,58,237,0.4)' },
          '50%': { boxShadow: '0 0 28px rgba(124,58,237,0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
