import type { Config } from 'tailwindcss';

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
        'card':       '0 2px 16px 0 rgba(27,47,94,0.08)',
        'card-hover': '0 6px 28px 0 rgba(27,47,94,0.14)',
        'btn':        '0 2px 8px 0 rgba(27,47,94,0.18)',
        'btn-hover':  '0 4px 16px 0 rgba(27,47,94,0.22)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
