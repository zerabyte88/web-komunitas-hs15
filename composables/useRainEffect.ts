export const useRainEffect = () => {
  const isRainEnabled = useState<boolean>('hs15-rain-enabled', () => true)
  const initialized = useState<boolean>('hs15-rain-initialized', () => false)

  const initRain = () => {
    if (!import.meta.client || initialized.value) return
    initialized.value = true

    try {
      const stored = localStorage.getItem('hs15-rain')
      if (stored === 'off') {
        isRainEnabled.value = false
      } else if (stored === 'on') {
        isRainEnabled.value = true
      } else if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        isRainEnabled.value = false
      }
    } catch {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        isRainEnabled.value = false
      }
    }
  }

  const toggleRain = () => {
    isRainEnabled.value = !isRainEnabled.value
    if (import.meta.client) {
      try {
        localStorage.setItem('hs15-rain', isRainEnabled.value ? 'on' : 'off')
      } catch {
        // Ignore storage errors in restricted contexts
      }
    }
  }

  return {
    isRainEnabled,
    initRain,
    toggleRain
  }
}
