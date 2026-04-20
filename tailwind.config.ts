/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'dark-base': '#020202',
          'dark-surface': '#0d0d0d',
          'dark-card': '#141414',
          'dark-border': '#1f1f1f',
          'off-white': '#f5f5f5',
        },
      },
    },
    plugins: [],
  }