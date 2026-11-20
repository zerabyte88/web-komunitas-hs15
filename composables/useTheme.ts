let transitionTimer: ReturnType<typeof setTimeout> | null = null
let activeTransitionId = 0
let activeTransition: { skipTransition?: () => void } | null = null

export const useTheme = () => {
  // Cookie keeps SSR and client theme in sync to prevent hydration mismatch
  const themeCookie = useCookie<string | null>('hs15-theme', {
    default: () => null,
    watch: true,
    maxAge: 31536000
  })

  const isDark = useState<boolean>('theme-dark', () => {
    if (import.meta.client && document.documentElement.classList.contains('light')) {
      return false
    }
    return themeCookie.value !== 'light'
  })

  const syncMetaColorScheme = (value: 'light dark' | 'light' | 'dark') => {
    const meta = document.querySelector('meta[name="color-scheme"]')
    if (meta) {
      meta.setAttribute('content', value)
    }
  }

  const applyTheme = (override?: 'light' | 'dark' | null) => {
    if (!import.meta.client) return

    const html = document.documentElement
    syncMetaColorScheme(override ?? 'light dark')

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

  const initTheme = () => {
    if (!import.meta.client) return

    let stored: string | null = null
    try {
      stored = localStorage.getItem('hs15-theme')
    } catch {
      stored = themeCookie.value
    }

    const override = stored === 'light' || stored === 'dark' ? stored : null
    isDark.value = override
      ? override === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches

    applyTheme(override)
  }

  const runFallbackColorTransition = () => {
    const html = document.documentElement
    html.classList.add('theme-transitioning')
    if (transitionTimer) clearTimeout(transitionTimer)
    transitionTimer = setTimeout(() => {
      html.classList.remove('theme-transitioning')
      transitionTimer = null
    }, 300)
  }

  const toggleTheme = (event?: MouseEvent) => {
    const target: 'light' | 'dark' = isDark.value ? 'light' : 'dark'

    const commitTheme = () => {
      isDark.value = target === 'dark'
      if (!import.meta.client) return

      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const systemMode: 'light' | 'dark' = systemPrefersDark ? 'dark' : 'light'
      const nextOverride = target === systemMode ? null : target

      themeCookie.value = nextOverride
      try {
        if (nextOverride) {
          localStorage.setItem('hs15-theme', nextOverride)
        } else {
          localStorage.removeItem('hs15-theme')
        }
      } catch {
        // Ignore storage errors when site data is blocked
      }

      applyTheme(nextOverride)
    }

    if (!import.meta.client) {
      commitTheme()
      return
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const startViewTransition = (document as Document & {
      startViewTransition?: (cb: () => void | Promise<void>) => {
        finished: Promise<void>
        skipTransition?: () => void
      }
    }).startViewTransition?.bind(document)

    if (!reducedMotion && startViewTransition) {
      const html = document.documentElement
      const x = event?.clientX ?? window.innerWidth - 36
      const y = event?.clientY ?? 32
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )

      activeTransition?.skipTransition?.()
      const myId = ++activeTransitionId

      html.style.setProperty('--vt-x', `${x}px`)
      html.style.setProperty('--vt-y', `${y}px`)
      html.style.setProperty('--vt-r', `${Math.ceil(endRadius)}px`)
      html.classList.add('theme-view-transition')

      const transition = startViewTransition(async () => {
        commitTheme()
        await nextTick()
      })
      activeTransition = transition

      transition.finished.finally(() => {
        if (myId === activeTransitionId) {
          html.classList.remove('theme-view-transition')
          activeTransition = null
        }
      })
      return
    }

    runFallbackColorTransition()
    commitTheme()
  }

  return {
    isDark,
    initTheme,
    toggleTheme
  }
}
