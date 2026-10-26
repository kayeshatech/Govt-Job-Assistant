/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      // Mandatory six-color system
      starlight: '#F3EEF8',
      opaline: '#CDC4DC',
      aurora: '#8EA4C4',
      wisteria: '#6E5A88',
      nocturne: '#2A2550',
      eclipse: '#0C0A16',
      gov: {
        starlight: '#F3EEF8',
        opaline: '#CDC4DC',
        aurora: '#8EA4C4',
        wisteria: '#6E5A88',
        nocturne: '#2A2550',
        eclipse: '#0C0A16',
      }
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(12, 10, 22, 0.08), 0 4px 16px -4px rgba(42, 37, 80, 0.06)',
        'elevated': '0 8px 30px -4px rgba(42, 37, 80, 0.12), 0 4px 12px -2px rgba(12, 10, 22, 0.08)',
        'modal': '0 20px 40px -8px rgba(12, 10, 22, 0.25)',
      },
    },
  },
  plugins: [],
};
