/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0d0f12',
          800: '#14171d',
          750: '#1a1e26',
          700: '#212631',
          600: '#2d3342',
          500: '#3c4456',
        },
        widget: {
          bg: '#181a1f',
          surface: '#1f2229',
          border: 'rgba(255, 255, 255, 0.08)',
          glow: 'rgba(255, 255, 255, 0.03)',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
        sans: ['var(--widget-font-family, Inter)', 'system-ui', '-apple-system', 'sans-serif'],
        goth: ['"Cinzel Decorative"', 'Cinzel', 'serif'],
        cursive: ['"Caveat"', 'cursive', 'system-ui'],
      },
      boxShadow: {
        'widget-dark': '0 20px 35px -10px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'flip-card': '0 10px 25px -5px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glow-soft': '0 0 25px rgba(255, 255, 255, 0.04)',
      },
      animation: {
        'flip-down': 'flipDown 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        flipDown: {
          '0%': { transform: 'rotateX(0deg)' },
          '100%': { transform: 'rotateX(-180deg)' }
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
