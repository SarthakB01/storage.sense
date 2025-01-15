/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        guminert: ['Guminert', 'sans-serif'], // Add the Guminert font
      },
      colors: {
        primaryGradient: {
          from: '#3282B8',
          to: '#0F4C75',
        },
      },
    },
  },
  plugins: [],
};
