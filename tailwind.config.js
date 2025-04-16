/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#e6ebf9",
        input: "#e0e6f9",
        button: "#3162f0",
      },
    },
  },
  plugins: [],
};
