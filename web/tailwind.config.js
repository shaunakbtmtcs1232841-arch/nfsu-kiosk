/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nfsu: {
          navy: '#0B2545',
          'navy-dark': '#061629',
          'navy-light': '#133966',
          gold: '#C9A227',
          'gold-light': '#E0B738',
          'gold-dark': '#9E7E1B',
          accent: '#1E4E8C',
          surface: '#F8FAFC',
        }
      },
      fontSize: {
        'kiosk-base': '22px',
        'kiosk-lg': '26px',
        'kiosk-xl': '32px',
        'kiosk-2xl': '40px',
        'kiosk-3xl': '52px',
      },
      minHeight: {
        'touch': '72px',
      },
      minWidth: {
        'touch': '72px',
      }
    },
  },
  plugins: [],
}
