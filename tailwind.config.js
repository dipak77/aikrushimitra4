
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        void: '#020617', // Deep Space Background
        glass: {
          100: 'rgba(255, 255, 255, 0.03)',
          200: 'rgba(255, 255, 255, 0.08)',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        neon: {
          mint: '#00FF9D', // Agri-Tech Green (Growth)
          cyan: '#06b6d4', // Data Blue (Science)
          gold: '#FFD700', // Wealth/Sun
          purple: '#c084fc', // AI
          danger: '#ff4d4d'
        }
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'float-reverse': 'floatReverse 25s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'spin-reverse-slow': 'spin 15s linear infinite reverse',
        'shimmer': 'shimmer 2.5s linear infinite',
        'enter': 'enter 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(30px, -30px)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-30px, 30px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        enter: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}
