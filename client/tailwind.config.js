/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F6F8',
        ink: {
          DEFAULT: '#12172B',
          soft: '#3B4160',
          faint: '#8A8FA8',
        },
        signal: {
          DEFAULT: '#0C8F8F',
          soft: '#E4F5F3',
          dark: '#076B6B',
        },
        amber: {
          DEFAULT: '#E2A63B',
          soft: '#FBF0DD',
        },
        line: '#E3E5EA',
        danger: '#D6493A',
        dangerSoft: '#FBEAE7',
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 23, 43, 0.04), 0 1px 12px rgba(18, 23, 43, 0.04)',
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
};
