export default defineNuxtPlugin((nuxtApp) => {
  const { initTheme } = useTheme()
  nuxtApp.hook('app:mounted', () => {
    initTheme()
  })
})
