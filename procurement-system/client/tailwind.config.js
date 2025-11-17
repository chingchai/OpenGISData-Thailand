/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ios-blue': '#007AFF',
        'ios-blue-dark': '#0051D5',
        'ios-gray': '#8E8E93',
        'ios-gray-light': '#E5E5EA',
        'ios-gray-lighter': '#F2F2F7',
        'ios-green': '#34C759',
        'ios-red': '#FF3B30',
        'ios-orange': '#FF9500',
        'ios-yellow': '#FFCC00',
      },
      borderRadius: {
        'ios': '12px',
        'ios-lg': '16px',
        'ios-xl': '20px',
        'ios-2xl': '24px',
      },
      boxShadow: {
        'ios': '0 2px 16px rgba(0, 0, 0, 0.06)',
        'ios-lg': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'ios-card': '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
      spacing: {
        'ios': '20px',
      },
      fontFamily: {
        'sans': ['Sarabun', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        'ios': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        'sarabun': ['Sarabun', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
      },
      scale: {
        '98': '0.98',
      },
    },
  },
  plugins: [],
}
