<script setup lang="ts">
const { isDark } = useTheme()

const backgrounds = [
  '/img/background-1.webp',
  '/img/background-2.webp',
  '/img/background-3.webp',
  '/img/background-4.webp',
  '/img/background-5.webp'
]

const currentIndex = ref(0)
let timer: any = null

onMounted(() => {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % backgrounds.length
  }, 7000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
    <!-- Slideshow Images -->
    <div
      v-for="(bg, idx) in backgrounds"
      :key="bg"
      class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out transform scale-105"
      :style="{ backgroundImage: `url(${bg})` }"
      :class="[
        idx === currentIndex 
          ? (isDark ? 'opacity-25' : 'opacity-15') 
          : 'opacity-0'
      ]"
    />

    <!-- Gradient Vignette Overlay - Adaptive for Dark & Light -->
    <div 
      class="absolute inset-0 transition-colors duration-500" 
      :class="isDark 
        ? 'bg-gradient-to-b from-[#0a0a0a]/90 via-[#0a0a0a]/80 to-[#0a0a0a]' 
        : 'bg-gradient-to-b from-slate-50/90 via-slate-50/80 to-slate-50'" 
    />
    <div 
      class="absolute inset-0 transition-opacity duration-500"
      :class="isDark 
        ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-crimson-900/10 via-transparent to-[#0a0a0a]/90' 
        : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-crimson-500/5 via-transparent to-slate-100/80'" 
    />
  </div>
</template>
