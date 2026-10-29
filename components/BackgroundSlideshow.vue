<script setup lang="ts">
const { isDark } = useTheme()

const backgrounds = [
  '/img/background-1.webp',
  '/img/background-2.webp',
  '/img/background-3.webp',
  '/img/background-4.webp',
  '/img/background-5.webp',
  '/img/background-6.webp'
]

const currentIndex = ref(0)
const loadedIndices = ref<number[]>([0])
let timer: ReturnType<typeof setInterval> | null = null

const preloadImage = (index: number) => {
  if (loadedIndices.value.includes(index)) return
  if (import.meta.client) {
    const img = new Image()
    img.src = backgrounds[index]
    img.onload = () => {
      if (!loadedIndices.value.includes(index)) {
        loadedIndices.value.push(index)
      }
    }
  }
}

onMounted(() => {
  // Preload slide 2 after initial page idle
  setTimeout(() => preloadImage(1), 2500)

  timer = setInterval(() => {
    const next = (currentIndex.value + 1) % backgrounds.length
    preloadImage(next)
    currentIndex.value = next

    // Preload next upcoming slide 2.5s before it transitions
    const upcoming = (next + 1) % backgrounds.length
    setTimeout(() => preloadImage(upcoming), 2500)
  }, 6000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div 
    class="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-500"
    :class="isDark ? 'bg-black' : 'bg-slate-100'"
  >
    <!-- Slideshow Images -->
    <div
      v-for="(bg, idx) in backgrounds"
      :key="bg"
      class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out scale-105"
      :style="loadedIndices.includes(idx) ? { backgroundImage: `url(${bg})` } : undefined"
      :class="idx === currentIndex ? 'opacity-100' : 'opacity-0'"
    />

    <!-- Overlay: 75% dark in dark mode, 70% light (white) in light mode -->
    <div 
      class="absolute inset-0 transition-colors duration-500" 
      :class="isDark ? 'bg-black/75' : 'bg-white/70'"
    />
  </div>
</template>
