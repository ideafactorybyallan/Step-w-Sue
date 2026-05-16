import type { Config } from 'tailwindcss';

//  ── Brand color semantics ───────────────────────────────────────────────
//  sw-pink  → ACTION & primary CTA only (submit, refresh, primary buttons)
//  sw-teal  → LIVE / right-now state (active week, today's input, current submission)
//  gold     → ACHIEVEMENT / earned status (winners, podium, locked-in submissions, PBs)
//  navy     → STRUCTURE / text / headers / secondary buttons
//  cream    → CANVAS only

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B2F5E',
          light: '#2A4580',
          dark: '#101B3D',
        },
        'sw-pink': {
          DEFAULT: '#E8234A',
          light: '#FF4D72',
          dark: '#C01A38',
        },
        'sw-teal': {
          DEFAULT: '#2BB8AA',
          light: '#4CD6C8',
          dark: '#1A9B8E',
        },
        gold: {
          DEFAULT: '#F5C518',
          light: '#FFD84D',
          dark: '#D4A800',
        },
        cream: '#FFF7ED',
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Elevation scale — apply consistently across the app
        'el-1':       '0 1px 2px 0 rgba(27,47,94,0.06)',
        'el-2':       '0 2px 12px 0 rgba(27,47,94,0.10)',
        'el-3':       '0 8px 28px 0 rgba(27,47,94,0.14)',
        'el-4':       '0 16px 48px -4px rgba(27,47,94,0.22)',
        // Legacy aliases (kept until full migration)
        'card':       '0 2px 16px 0 rgba(27,47,94,0.08)',
        'card-hover': '0 8px 32px 0 rgba(27,47,94,0.16)',
        'card-lg':    '0 12px 48px -8px rgba(27,47,94,0.20)',
        'btn':        '0 4px 14px 0 rgba(232,35,74,0.30)',
        'btn-hover':  '0 8px 24px 0 rgba(232,35,74,0.40)',
        'btn-navy':   '0 4px 14px 0 rgba(27,47,94,0.30)',
        // Colored glows (for hero moments only)
        'glow-pink':  '0 0 24px 0 rgba(232,35,74,0.5)',
        'glow-teal':  '0 0 24px 0 rgba(43,184,170,0.5)',
        'glow-gold':  '0 0 32px 0 rgba(245,197,24,0.5)',
        'inset-light': 'inset 0 1px 0 0 rgba(255,255,255,0.6)',
      },
      backgroundImage: {
        'gradient-pink':   'linear-gradient(135deg, #FF4D72 0%, #E8234A 50%, #C01A38 100%)',
        'gradient-teal':   'linear-gradient(135deg, #4CD6C8 0%, #2BB8AA 50%, #1A9B8E 100%)',
        'gradient-navy':   'linear-gradient(135deg, #2A4580 0%, #1B2F5E 50%, #101B3D 100%)',
        'gradient-gold':   'linear-gradient(135deg, #FFD84D 0%, #F5C518 50%, #D4A800 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #E8234A 0%, #F5C518 100%)',
        'gradient-ocean':  'linear-gradient(135deg, #1B2F5E 0%, #2BB8AA 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
        'soft':   'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
};

export default config;
