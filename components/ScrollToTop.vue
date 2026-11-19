<script setup lang="ts">
const route = useRoute()
const showButton = ref(false)

const handleScroll = () => {
  if (import.meta.client) {
    showButton.value = window.scrollY > 60
  }
}

const scrollToTop = () => {
  if (import.meta.client) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

watch(() => route.path, () => {
  nextTick(() => {
    handleScroll()
  })
})

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <button
      v-show="showButton"
      type="button"
      class="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-raised)] shadow-sm transition-colors duration-150 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      title="Kembali ke atas"
      aria-label="Kembali ke atas"
      @click="scrollToTop"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  </Transition>
</template>
