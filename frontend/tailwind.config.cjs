/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fira Sans"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
