export const useTheme = () => {
  const isDark = useState<boolean>('theme-dark', () => true)

  const initTheme = () => {
    if (import.meta.client) {
      const stored = localStorage.getItem('hs15-theme')
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
      if (isDark.value) {
        html.classList.add('dark')
        html.classList.remove('light')
        html.setAttribute('data-theme', 'hs15dark')
        localStorage.setItem('hs15-theme', 'dark')
      } else {
        html.classList.remove('dark')
        html.classList.add('light')
        html.setAttribute('data-theme', 'hs15light')
        localStorage.setItem('hs15-theme', 'light')
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
