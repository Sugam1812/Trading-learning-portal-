/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:  '#020817',
          secondary:'#03101f',
          card:     '#040e1c',
          elevated: '#071528',
          glass:    'rgba(4,14,28,0.85)',
        },
        border: {
          dim:    '#0a1f3a',
          DEFAULT:'#0d2850',
          bright: '#1a4a7a',
          glow:   '#00e5ff',
        },
        cyber: {
          cyan:       '#00e5ff',
          'cyan-dim': '#00a8bb',
          purple:     '#8b5cf6',
          'purple-dim':'#6d28d9',
          green:      '#00ff88',
          'green-dim':'#00cc6a',
          red:        '#ff3355',
          'red-dim':  '#cc2244',
          gold:       '#ffd700',
          orange:     '#ff8c00',
        },
        bull:  { DEFAULT: '#00ff88', dim: '#00cc6a' },
        bear:  { DEFAULT: '#ff3355', dim: '#cc2244' },
        gold:  { DEFAULT: '#ffd700', dim: '#ccac00' },
        accent:{ blue: '#00e5ff', 'blue-dim': '#00a8bb' },
        xp:    '#8b5cf6',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        hud:  ['"Share Tech Mono"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        'neon-cyan':   '0 0 8px #00e5ff, 0 0 20px rgba(0,229,255,0.3)',
        'neon-green':  '0 0 8px #00ff88, 0 0 20px rgba(0,255,136,0.3)',
        'neon-red':    '0 0 8px #ff3355, 0 0 20px rgba(255,51,85,0.3)',
        'neon-purple': '0 0 8px #8b5cf6, 0 0 20px rgba(139,92,246,0.3)',
        'panel':       '0 0 0 1px #0d2850, 0 4px 24px rgba(0,0,0,0.6)',
        'glow-sm':     '0 0 12px rgba(0,229,255,0.15)',
      },
      animation: {
        'pulse-fast':  'pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'scan':        'scan 4s linear infinite',
        'fade-in':     'fadeIn 0.4s ease-out',
        'slide-in':    'slideIn 0.3s ease-out',
        'blink':       'blink 1.2s step-end infinite',
        'float':       'float 3s ease-in-out infinite',
      },
      keyframes: {
        scan:   { '0%':{ transform:'translateY(-100%)' }, '100%':{ transform:'translateY(100vh)' } },
        fadeIn: { from:{ opacity:'0', transform:'translateY(8px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        slideIn:{ from:{ opacity:'0', transform:'translateX(-16px)' }, to:{ opacity:'1', transform:'translateX(0)' } },
        blink:  { '0%,100%':{ opacity:'1' }, '50%':{ opacity:'0' } },
        float:  { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-4px)' } },
      },
      backgroundImage: {
        'grid-cyan': 'linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)',
        'grid-dark': 'linear-gradient(rgba(13,40,80,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(13,40,80,0.5) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}
