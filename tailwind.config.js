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
        background: '#09090b', // zinc-950
        foreground: '#fafafa', // zinc-50
        card: {
          DEFAULT: '#18181b', // zinc-900
          foreground: '#fafafa',
        },
        primary: {
          DEFAULT: '#6366f1', // indigo-500
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#3b82f6', // blue-500
        },
        success: {
          DEFAULT: '#10b981', // emerald-500
        },
        error: {
          DEFAULT: '#ef4444', // red-500
        },
        warning: {
          DEFAULT: '#f59e0b', // amber-500
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        arabic: ['Cairo', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99, 102, 241, 0.15)',
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
