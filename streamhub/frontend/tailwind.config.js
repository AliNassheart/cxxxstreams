/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Broadcast-dark surfaces
        surface: {
          950: '#0A0C10',
          900: '#12151C',
          800: '#1B1F29',
          700: '#262B38',
          600: '#38404F',
        },
        // Signal violet — primary brand/interaction color
        signal: {
          400: '#9C8BFF',
          500: '#7C5CFF',
          600: '#6446E8',
          700: '#4E33C4',
        },
        // Live pulse — reserved for "LIVE" state only
        live: {
          400: '#FF6B8A',
          500: '#FF3B69',
          600: '#E01F4F',
        },
        ink: {
          100: '#F4F5F7',
          300: '#C7CBD6',
          500: '#8B93A7',
          700: '#565D6E',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.35)', opacity: '0.55' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'pulse-dot': 'pulseDot 1.6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.4s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124,92,255,0.25), 0 8px 30px -8px rgba(124,92,255,0.35)',
      },
    },
  },
  plugins: [],
};
