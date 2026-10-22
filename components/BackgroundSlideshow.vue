<script setup lang="ts">
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
      :class="idx === currentIndex ? 'opacity-25' : 'opacity-0'"
    />

    <!-- Gradient Dark Vignette Overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-[#0b0f19]/90 via-[#0b0f19]/80 to-[#0b0f19]" />
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-[#0b0f19]/90" />
  </div>
</template>
