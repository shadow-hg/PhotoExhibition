import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        aurora: '0 20px 80px -15px rgba(14, 165, 233, 0.25)',
      },
      backgroundImage: {
        'gradient-aurora': 'radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.35), transparent 55%), radial-gradient(circle at 80% 0%, rgba(99, 102, 241, 0.35), transparent 45%), radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.25), transparent 60%)',
      },
      colors: {
        brand: {
          50: '#eef9ff',
          100: '#d8f0ff',
          200: '#afe0ff',
          300: '#7cc8ff',
          400: '#45a8ff',
          500: '#1c82ff',
          600: '#0860f0',
          700: '#0549c0',
          800: '#083e99',
          900: '#0c357a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
