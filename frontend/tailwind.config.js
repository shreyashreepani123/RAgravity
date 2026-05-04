/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aero-dark': '#0a0a0c',
        'aero-card': '#16161a',
        'aero-border': '#2a2a35',
        'aero-accent': '#6366f1',
        'aero-accent-hover': '#4f46e5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
