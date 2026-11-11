/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          main: '#080808',
          secondary: '#151515',
          card: '#202020',
          hover: '#282828',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F4D068',
          dark: '#AA8820',
        },
        brandRed: {
          DEFAULT: '#E53935',
          light: '#FF6F60',
          dark: '#AB000D',
        },
        brandGreen: {
          DEFAULT: '#00C853',
          light: '#5EFC82',
          dark: '#009624',
        },
        brandOrange: {
          DEFAULT: '#FF9800',
          light: '#FFC947',
          dark: '#C66900',
        },
        borderGold: '#66531C',
        textPrimary: '#FFFFFF',
        textSecondary: '#BDBDBD',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
