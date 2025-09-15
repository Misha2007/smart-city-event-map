/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  safelist: [
    "bg-blue-100",
    "text-blue-800",
    "dark:bg-blue-900",
    "dark:text-blue-200",
    "bg-gray-100",
    "text-gray-800",
    "dark:bg-gray-900",
    "dark:text-gray-200",
  ],
  plugins: [],
};
