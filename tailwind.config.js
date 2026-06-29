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
        primary: '#4285F4',
        danger: '#EA4335',
        success: '#34A853',
      },
      spacing: {
        '18': '4.5rem',
      }
    },
  },
  plugins: [],
}