<script setup lang="ts">
const backgrounds = [
  '/img/background-1.webp',
  '/img/background-2.webp',
  '/img/background-3.webp',
  '/img/background-4.webp',
  '/img/background-5.webp',
  '/img/background-6.webp'
]

const currentIndex = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % backgrounds.length
  }, 6000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
    <!-- Slideshow Images -->
    <div
      v-for="(bg, idx) in backgrounds"
      :key="bg"
      class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out scale-105"
      :style="{ backgroundImage: `url(${bg})` }"
      :class="idx === currentIndex ? 'opacity-100' : 'opacity-0'"
    />

    <!-- 75% Black Overlay -->
    <div class="absolute inset-0 bg-black/75" />
  </div>
</template>
