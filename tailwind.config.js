/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aqi: {
          good: "#009966",
          satisfactory: "#ffde33",
          moderate: "#ff9933",
          poor: "#cc0033",
          veryPoor: "#660099",
          severe: "#7e0023",
        }
      }
    },
  },
  plugins: [],
};
