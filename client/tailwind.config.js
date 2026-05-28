/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { primary: '#070d1a', secondary: '#0c1425', card: '#111827', elevated: '#1a2540' },
        border: { dim: '#1e2d4d', DEFAULT: '#243352', bright: '#2e4070' },
        accent: { blue: '#3b82f6', 'blue-dim': '#1d4ed8' },
        bull: { DEFAULT: '#00d4aa', dim: '#00b38a', bg: 'rgba(0,212,170,0.1)' },
        bear: { DEFAULT: '#ff4757', dim: '#e63946', bg: 'rgba(255,71,87,0.1)' },
        gold: { DEFAULT: '#f59e0b', dim: '#d97706', bg: 'rgba(245,158,11,0.1)' },
        xp: '#a855f7',
      },
    },
  },
  plugins: [],
}
