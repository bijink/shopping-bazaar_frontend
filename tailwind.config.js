/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        slide: {
          '0%': { transform: 'translateX(100%)', opacity: 0 },
          '50%': { transform: 'translateX(-10%)', opacity: 1 },
        },
      },
      animation: {
        'toast-slide': 'slide 0.5s ease-out',
      },
    },
  },
  plugins: [forms],
};
