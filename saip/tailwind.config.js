/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'saip-blue': '#0013A6',
        'saip-yellow': '#FFFF00',
      },
    },
  },
  plugins: [],
}