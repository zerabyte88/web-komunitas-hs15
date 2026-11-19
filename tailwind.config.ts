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
          bg: '#11100f',
          card: '#181715',
          border: 'rgba(242,239,233,0.09)',
          red: '#D7193A',
          'red-hover': '#B01430'
        },
        crimson: {
          50: '#fdf2f4', 100: '#fce4e8', 200: '#f9c5ce', 300: '#f493a5', 400: '#ec5470', 500: '#D7193A', 600: '#c3163a', 700: '#B01430', 800: '#8f1129', 900: '#6e0e21', 950: '#3d0711'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
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
          secondary: '#f2efe9',
          accent: '#D7193A',
          neutral: '#22201d',
          'base-100': '#11100f',
          'base-200': '#181715',
          'base-300': '#22201d',
          'base-content': '#f2efe9',
          info: '#38bdf8',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444'
        },
        hs15light: {
          primary: '#D7193A',
          'primary-focus': '#B01430',
          'primary-content': '#ffffff',
          secondary: '#181614',
          accent: '#D7193A',
          neutral: '#ede9e2',
          'base-100': '#f6f4f0',
          'base-200': '#ffffff',
          'base-300': '#ede9e2',
          'base-content': '#181614',
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
