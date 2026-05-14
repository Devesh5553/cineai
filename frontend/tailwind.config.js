/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cinema: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        dark: {
          950: '#080c14',
          900: '#0d1117',
          800: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '4.5': '1.125rem',
      },
      fontSize: {
        '2xs': '0.65rem',
      },
      animation: {
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-orange': '0 0 30px rgba(249,115,22,0.3)',
        'glow-sm': '0 0 15px rgba(249,115,22,0.2)',
      },
    },
  },
  plugins: [],
}
