import type { Config } from 'tailwindcss'

export default <Config>{
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
          bg: '#0b0f19',
          card: '#131b2e',
          border: '#1e293b',
          blue: '#3b82f6',
          purple: '#8b5cf6'
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
          primary: '#3b82f6',
          secondary: '#a855f7',
          accent: '#06b6d4',
          neutral: '#1e293b',
          'base-100': '#0b0f19',
          'base-200': '#131b2e',
          'base-300': '#1e293b',
          'base-content': '#f8fafc',
          info: '#38bdf8',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444'
        }
      },
      'dark'
    ],
    defaultTheme: 'hs15dark',
    darkTheme: 'hs15dark'
  }
}
