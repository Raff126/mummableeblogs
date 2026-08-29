import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Official MummaBeeBlog Color System
        'desert-blush': '#F8EDEF',
        'mumma-rose': {
          DEFAULT: '#B75B70',
          dark: '#934356',
          light: '#F8EDEF',
        },
        'date-burgundy': {
          DEFAULT: '#683846',
          dark: '#4A232F',
        },
        'warm-sand': {
          DEFAULT: '#D7BB91',
          light: '#F5EBE1',
        },
        'charcoal': {
          DEFAULT: '#332D2F',
          light: '#544B4E',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(104, 56, 70, 0.06)',
        'soft-hover': '0 12px 28px rgba(183, 91, 112, 0.14)',
        'card': '0 8px 24px rgba(104, 56, 70, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
