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
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
