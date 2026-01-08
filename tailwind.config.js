/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#0B0B0F", sun: "#FFD400", snow: "#FFFFFF" },
      boxShadow: { glow: "0 0 0 3px rgba(255, 212, 0, 0.35)" },
    },
  },
  plugins: [],
};
