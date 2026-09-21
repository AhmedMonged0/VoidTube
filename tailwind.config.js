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
        void: {
          950: '#060608',
          900: '#0a0a0c', // Primary OLED Background
          850: '#0f0f13',
          800: '#141419', // Card surface
          750: '#1a1a22', // Hover / elevated surface
          700: '#22222e', // Borders
          600: '#323244',
          500: '#63637a', // Dim text
          400: '#9494a8', // Muted text
          200: '#d8d8e4',
          100: '#f1f1f5', // Primary text
        },
        neon: {
          purple: '#8b5cf6',
          violet: '#a855f7',
          crimson: '#f43f5e',
          ruby: '#e11d48',
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Outfit"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'neon-purple': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'neon-crimson': '0 0 25px -5px rgba(244, 63, 94, 0.35)',
        'void-card': '0 8px 30px rgba(0, 0, 0, 0.5)',
        'glow-sm': '0 0 15px rgba(139, 92, 246, 0.2)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
