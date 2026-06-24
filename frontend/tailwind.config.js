/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        cinzel: ['Cinzel', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        rose: '#d4a5a5',
        gold: '#f5d6a8',
        cream: '#fdf6f0',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'crown': 'crownFloat 3s ease-in-out infinite',
        'fade-up': 'fadeInUp 0.8s ease forwards',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        crownFloat: {
          '0%,100%': { transform: 'translateY(0) rotate(-3deg)' },
          '50%': { transform: 'translateY(-18px) rotate(3deg)' },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(40px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
  colors: {
  rose: '#d4a5a5',
  gold: '#f5d6a8',
  cream: '#fdf6f0',
  'gold-100': '#fce4c5',
  'gold-400': '#e8b86d',
},
colors: {
  rose: '#d4a5a5',
  gold: '#f5d6a8',
  cream: '#fdf6f0',
  'gold-300': '#e8c88a',
  'gold-400': '#d4a373',
  'gold-500': '#c4925a',
  'gold-600': '#b0804a',
}
}
