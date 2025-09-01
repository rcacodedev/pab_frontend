/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#1d4ed8", // azul principal
        brandLight: "#3b82f6", // azul más claro
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // fuente personalizada
      },
    },
  },
  plugins: [],
};
