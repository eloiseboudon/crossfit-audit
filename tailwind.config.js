/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tulip: {
          green: '#5A8E92',
          beige: '#E8D7B5',
          'beige-light': '#FAF8F3',
          blue: '#2C5561',
          'blue-dark': '#1F3D47',
          red: '#D85858',
          'green-success': '#72C77A',
          'orange-accent': '#E8A356',
        },
        text: {
          primary: '#1A2F38',
          secondary: '#4A6370',
          muted: '#708A95',
        },
        bg: {
          cream: '#FDFCFA',
          light: '#F7F5F1',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 20px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'card': '12px',
      },
    },
  },
  plugins: [],
};
