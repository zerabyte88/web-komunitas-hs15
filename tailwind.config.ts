import type { Config } from 'tailwindcss'

export default <Config>{
  future: {
    hoverOnlyWhenSupported: true
  },
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        hs15: {
          bg: '#0a0a0a',
          card: '#111111',
          border: 'rgba(255,255,255,0.1)',
          red: '#D7193A',
          'red-hover': '#B01430'
        },
        crimson: {
          50: '#fdf2f4', 100: '#fce4e8', 200: '#f9c5ce', 300: '#f493a5', 400: '#ec5470', 500: '#D7193A', 600: '#c3163a', 700: '#B01430', 800: '#8f1129', 900: '#6e0e21', 950: '#3d0711'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    }
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        hs15dark: {
          primary: '#D7193A',
          'primary-focus': '#B01430',
          'primary-content': '#ffffff',
          secondary: '#ffffff',
          accent: '#D7193A',
          neutral: '#171717',
          'base-100': '#0a0a0a',
          'base-200': '#111111',
          'base-300': '#1a1a1a',
          'base-content': '#fafafa',
          info: '#38bdf8',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444'
        },
        hs15light: {
          primary: '#D7193A',
          'primary-focus': '#B01430',
          'primary-content': '#ffffff',
          secondary: '#171717',
          accent: '#D7193A',
          neutral: '#e5e7eb',
          'base-100': '#f8fafc',
          'base-200': '#ffffff',
          'base-300': '#f1f5f9',
          'base-content': '#0f172a',
          info: '#0284c7',
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626'
        }
      }
    ],
    defaultTheme: 'hs15dark',
    darkTheme: 'hs15dark'
  }
}
