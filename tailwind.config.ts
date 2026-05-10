/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          dark: '#B8960C',
          light: '#F4E4BA',
        },
        charcoal: '#1a1a1a',
        cream: '#FFF8E7',
        rose: '#B76E79',
      },
    },
  },
  plugins: [],
};