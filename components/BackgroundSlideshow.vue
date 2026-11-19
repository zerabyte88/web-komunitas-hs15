<script setup lang="ts">
const slides = [
  { src: '/img/background-1.webp', label: 'Pantai Asmara', alt: 'Dokumentasi HS15 di Pantai Asmara' },
  { src: '/img/background-2.webp', label: 'Tahura', alt: 'Dokumentasi HS15 di Tahura' },
  { src: '/img/background-3.webp', label: 'Danau Murung Batu Laba', alt: 'Dokumentasi HS15 di Danau Murung Batu Laba' },
  { src: '/img/background-4.webp', label: 'Lembah Bajuin', alt: 'Dokumentasi HS15 di Lembah Bajuin' },
  { src: '/img/background-5.webp', label: 'Bukber 2026', alt: 'Dokumentasi Bukber HS15 2026' },
  { src: '/img/background-6.webp', label: 'Bukber 2025', alt: 'Dokumentasi Bukber HS15 2025' }
]

const currentIndex = ref(0)
const loadedIndices = ref<number[]>([0])
const prefersReducedMotion = ref(false)
let timer: ReturnType<typeof setInterval> | null = null
let preloadTimeout: ReturnType<typeof setTimeout> | null = null
let mediaQuery: MediaQueryList | null = null

const ensureLoaded = (index: number) => {
  if (!loadedIndices.value.includes(index)) {
    loadedIndices.value.push(index)
  }
}

const preloadImage = (index: number) => {
  if (loadedIndices.value.includes(index) || !import.meta.client) return
  const img = new Image()
  img.src = slides[index].src
  img.onload = () => ensureLoaded(index)
}

const scheduleUpcomingPreload = (fromIndex: number) => {
  if (preloadTimeout) clearTimeout(preloadTimeout)
  const upcoming = (fromIndex + 1) % slides.length
  preloadTimeout = setTimeout(() => preloadImage(upcoming), 2000)
}

const stopAutoAdvance = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const startAutoAdvance = () => {
  stopAutoAdvance()
  if (prefersReducedMotion.value) return
  timer = setInterval(() => {
    const next = (currentIndex.value + 1) % slides.length
    ensureLoaded(next)
    currentIndex.value = next
    scheduleUpcomingPreload(next)
  }, 6000)
}

const goToSlide = (targetIndex: number) => {
  const normalized = (targetIndex + slides.length) % slides.length
  ensureLoaded(normalized)
  currentIndex.value = normalized
  scheduleUpcomingPreload(normalized)
  startAutoAdvance()
}

const prevSlide = () => goToSlide(currentIndex.value - 1)
const nextSlide = () => goToSlide(currentIndex.value + 1)

const formattedCounter = computed(() => {
  const current = String(currentIndex.value + 1).padStart(2, '0')
  const total = String(slides.length).padStart(2, '0')
  return `${current} / ${total}`
})

const handleMotionChange = (event: MediaQueryListEvent) => {
  prefersReducedMotion.value = event.matches
  if (event.matches) {
    stopAutoAdvance()
  } else {
    startAutoAdvance()
  }
}

onMounted(() => {
  if (import.meta.client) {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches
    mediaQuery.addEventListener('change', handleMotionChange)
  }
  scheduleUpcomingPreload(0)
  startAutoAdvance()
})

onUnmounted(() => {
  stopAutoAdvance()
  if (preloadTimeout) clearTimeout(preloadTimeout)
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleMotionChange)
  }
})
</script>

<template>
  <div class="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
    <template v-for="(slide, idx) in slides" :key="slide.src">
      <img
        v-if="loadedIndices.includes(idx)"
        :src="slide.src"
        :alt="slide.alt"
        :fetchpriority="idx === 0 ? 'high' : undefined"
        :loading="idx === 0 ? 'eager' : 'lazy'"
        decoding="async"
        class="absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-out)] motion-reduce:transition-none motion-reduce:scale-100"
        :class="idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02] pointer-events-none'"
        :aria-hidden="idx !== currentIndex"
      >
    </template>

    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-4 sm:px-6 pt-12 pb-4 flex items-end justify-between gap-4">
      <Transition name="caption-fade" mode="out-in">
        <p :key="slides[currentIndex].label" class="text-xs sm:text-sm font-medium text-white/90 truncate">
          {{ slides[currentIndex].label }}
        </p>
      </Transition>

      <div class="flex items-center gap-3 shrink-0">
        <Transition name="caption-fade" mode="out-in">
          <span :key="formattedCounter" class="font-mono text-xs text-white/85 tabular-nums">
            {{ formattedCounter }}
          </span>
        </Transition>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="w-8 h-8 rounded-lg bg-black/45 hover:bg-black/65 border border-white/15 text-white flex items-center justify-center transition-[background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100"
            aria-label="Foto sebelumnya"
            @click="prevSlide"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            class="w-8 h-8 rounded-lg bg-black/45 hover:bg-black/65 border border-white/15 text-white flex items-center justify-center transition-[background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100"
            aria-label="Foto berikutnya"
            @click="nextSlide"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
