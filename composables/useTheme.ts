export const useTheme = () => {
  // Use a cookie so SSR and client immediately agree on the theme, preventing hydration mismatch
  const themeCookie = useCookie<string>('hs15-theme', {
    default: () => 'dark',
    watch: true,
    maxAge: 31536000 // 1 year
  })

  const isDark = useState<boolean>('theme-dark', () => {
    if (import.meta.client && document.documentElement.classList.contains('light')) {
      return false
    }
    return themeCookie.value !== 'light'
  })

  const initTheme = () => {
    if (import.meta.client) {
      const stored = localStorage.getItem('hs15-theme') || themeCookie.value
      if (stored) {
        isDark.value = stored === 'dark'
      } else {
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      applyTheme()
    }
  }

  const applyTheme = () => {
    if (import.meta.client) {
      const html = document.documentElement
      const mode = isDark.value ? 'dark' : 'light'
      themeCookie.value = mode
      localStorage.setItem('hs15-theme', mode)

      if (isDark.value) {
        html.classList.add('dark')
        html.classList.remove('light')
        html.setAttribute('data-theme', 'hs15dark')
      } else {
        html.classList.remove('dark')
        html.classList.add('light')
        html.setAttribute('data-theme', 'hs15light')
      }
    }
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
  }

  return {
    isDark,
    initTheme,
    toggleTheme
  }
}
