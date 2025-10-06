/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0891b2", // cyan-600
          light: "#22d3ee",  // cyan-400
          dark: "#0e7490",   // cyan-700
        },
        accent: {
          DEFAULT: "#6366f1", // indigo-500
        },
      },
      keyframes: {
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        slideInLeft: 'slideInLeft 0.2s ease-out',
        slideInRight: 'slideInRight 0.2s ease-out',
        slideInUp: 'slideInUp 0.2s ease-out',
        slideInDown: 'slideInDown 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
