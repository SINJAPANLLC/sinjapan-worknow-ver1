/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Turquoise gradient palette
        primary: {
          DEFAULT: '#00C6A7',
          light: '#4BE1CA',
          dark: '#007E7A',
          50: '#E6F9F7',
          100: '#C2F0EB',
          200: '#9AE7DE',
          300: '#72DDD1',
          400: '#4BE1CA',
          500: '#00C6A7',
          600: '#00A88F',
          700: '#007E7A',
          800: '#006664',
          900: '#004E4E',
        },
        secondary: {
          DEFAULT: '#009F8D',
          light: '#00C6A7',
          dark: '#006A6C',
        },
        // Neutral palette
        neutral: {
          50: '#FFFFFF',
          100: '#F5F7FA',
          200: '#E4E7EB',
          300: '#CBD2D9',
          400: '#A0AEC0',
          500: '#718096',
          600: '#4A5568',
          700: '#2D3748',
          800: '#1A2E35',
          900: '#0F1419',
        },
        // Status colors
        success: '#13CE66',
        warning: '#F6AD55',
        danger: '#F56565',
        info: '#3B82F6',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00C6A7 0%, #007E7A 100%)',
        'gradient-primary-soft': 'linear-gradient(135deg, #4BE1CA 0%, #00A88F 100%)',
        'gradient-radial': 'radial-gradient(circle, #00C6A7 0%, #007E7A 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 198, 167, 0.1)',
        'medium': '0 4px 16px rgba(0, 198, 167, 0.15)',
        'hard': '0 8px 24px rgba(0, 198, 167, 0.2)',
      },
    },
  },
  plugins: [],
}
