<script setup lang="ts">
const route = useRoute()
const showButton = ref(false)

const handleScroll = () => {
  if (import.meta.client) {
    // Muncul segera saat user mulai scroll ke bawah (melewati 64px / tinggi header)
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

// Reset status scroll setiap kali berpindah halaman
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
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-6 scale-75"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-6 scale-75"
  >
    <button
      v-show="showButton"
      type="button"
      class="fixed bottom-6 right-6 z-50 p-3 rounded-2xl bg-crimson-600 hover:bg-crimson-500 text-white border border-crimson-400/80 shadow-[0_0_20px_rgba(215,25,58,0.5)] transition-all duration-200 hover:scale-110 active:scale-95 group focus:outline-none"
      title="Kembali ke atas"
      aria-label="Kembali ke atas"
      @click="scrollToTop"
    >
      <svg 
        class="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-1" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  </Transition>
</template>
