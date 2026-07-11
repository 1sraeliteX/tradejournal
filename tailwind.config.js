/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        neutral: {
          300: 'rgb(var(--n3) / <alpha-value>)',
          400: 'rgb(var(--n4) / <alpha-value>)',
          500: 'rgb(var(--n5) / <alpha-value>)',
          600: 'rgb(var(--n6) / <alpha-value>)',
          700: 'rgb(var(--n7) / <alpha-value>)',
          800: 'rgb(var(--n8) / <alpha-value>)',
          900: 'rgb(var(--n9) / <alpha-value>)',
          950: 'rgb(var(--n95) / <alpha-value>)',
        },
        white: 'rgb(var(--white) / <alpha-value>)',
        black: 'rgb(var(--black) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
