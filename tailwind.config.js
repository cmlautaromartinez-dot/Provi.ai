/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff4ee',
          100: '#ffe6d5',
          200: '#ffc8aa',
          300: '#ffa274',
          400: '#ff7a3c',
          500: '#ff6b35',
          600: '#ed4a14',
          700: '#c4360f',
          800: '#9b2c12',
          900: '#7d2812',
        },
        leaf: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#06a77d',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        cream: {
          50:  '#fffbf5',
          100: '#fdf4e7',
          200: '#fae6c8',
        },
        ink: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px rgba(15, 23, 42, 0.06)',
        pop:  '0 10px 30px rgba(255, 107, 53, 0.25)',
        card: '0 1px 4px rgba(15, 23, 42, 0.08), 0 4px 16px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};
