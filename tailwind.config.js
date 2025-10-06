/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
    },
  },
  plugins: [],
};
