/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1E1B4B',
        'accent': '#FF6B6B',
        'secondary': '#FFE2C9',
        'dark': '#1A1A2E',
        'light': '#FFFAF5',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #FF6B6B 0%, #FFE2C9 100%)',
        'card-gradient': 'linear-gradient(145deg, #1E1B4B 0%, #4C1D95 100%)',
        'button-gradient': 'linear-gradient(to right, #FF6B6B, #FF8E8E)',
      }
    },
  },
  plugins: [],
}
