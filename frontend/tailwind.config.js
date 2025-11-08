/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007A7A',
        secondary: '#FF6B6B',
      },
    },
  },
  plugins: [],
}
