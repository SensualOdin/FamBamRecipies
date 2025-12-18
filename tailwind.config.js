/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        detroit: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#38acf6',
          500: '#0e91e9',
          600: '#0074c8',
          700: '#005da3',
          800: '#004f86',
          900: '#064270',
          950: '#042a4a',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e5ebe5',
          200: '#ced9ce',
          300: '#adc0ad',
          400: '#83a083',
          500: '#648164',
          600: '#4d654d',
          700: '#3f523f',
          800: '#354335',
          900: '#2d382d',
          950: '#181e18',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
