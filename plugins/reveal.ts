type RevealElement = HTMLElement & {
  __revealObserver?: IntersectionObserver
  __revealTimeout?: ReturnType<typeof setTimeout>
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', {
    getSSRProps() {
      return {}
    },
    mounted(el: RevealElement) {
      if (
        typeof window === 'undefined' ||
        typeof IntersectionObserver === 'undefined' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return
      }

      if (el.getBoundingClientRect().top < window.innerHeight * 0.94) {
        return
      }

      el.classList.add('reveal-hidden', 'reveal-ready')

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            el.classList.remove('reveal-hidden')
            el.classList.add('reveal-visible')
            observer.disconnect()
            el.__revealObserver = undefined
            el.__revealTimeout = setTimeout(() => {
              el.classList.remove('reveal-ready')
              el.__revealTimeout = undefined
            }, 500)
            break
          }
        },
        {
          threshold: 0.08,
          rootMargin: '0px 0px -32px 0px'
        }
      )

      el.__revealObserver = observer
      observer.observe(el)
    },
    unmounted(el: RevealElement) {
      el.__revealObserver?.disconnect()
      el.__revealObserver = undefined
      if (el.__revealTimeout) {
        clearTimeout(el.__revealTimeout)
        el.__revealTimeout = undefined
      }
    }
  })
})
