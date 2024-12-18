/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#99FFA9',      // Суурь өнгө
        'primary-bright': '#7DFF8C', // Илүү тод primary өнгө
        secondary: '#FFCE99',    // Нэмэлт өнгө
        'secondary-bright': '#FFB75F', // Илүү тод secondary өнгө
        accent: '#FF9999',      // Дамжуулагч өнгө
        'accent-bright': '#FF6F6F', // Илүү тод accent өнгө
        background: '#F0F0F0',  // Задлах өнгө
        text: '#333333',        // Текстийн өнгө
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'marquee-pause': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 20s linear infinite',
        'marquee-pause': 'marquee 15s linear paused',
      },
    },
  },
  variants: {},
  plugins: [],
}
