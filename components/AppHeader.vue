<script setup lang="ts">
const route = useRoute()
const { isDark, toggleTheme } = useTheme()

const navLinks = [
  {
    path: '/',
    label: 'Beranda',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  {
    path: '/photos',
    label: 'Galeri Foto',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
  },
  {
    path: '/videos',
    label: 'Galeri Video',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
  }
]

const navContainerRef = ref<HTMLElement | null>(null)
const linkRefs = ref<HTMLElement[]>([])

// Indicator pill style (sliding bubble indicator)
const indicatorStyle = ref({
  width: '0px',
  transform: 'translateX(0px)',
  opacity: 0
})

const updateIndicator = () => {
  nextTick(() => {
    const activeIndex = navLinks.findIndex(link => link.path === route.path)
    if (activeIndex !== -1 && linkRefs.value[activeIndex] && navContainerRef.value) {
      const activeEl = linkRefs.value[activeIndex]
      const containerLeft = navContainerRef.value.getBoundingClientRect().left
      const elLeft = activeEl.getBoundingClientRect().left
      const left = elLeft - containerLeft

      indicatorStyle.value = {
        width: `${activeEl.offsetWidth}px`,
        transform: `translateX(${left}px)`,
        opacity: 1
      }
    } else {
      indicatorStyle.value.opacity = 0
    }
  })
}

watch(() => route.path, () => {
  updateIndicator()
})

onMounted(() => {
  updateIndicator()
  window.addEventListener('resize', updateIndicator)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIndicator)
})

const isActive = (path: string) => {
  return route.path === path
}
</script>

<template>
  <header class="sticky top-0 z-40 w-full glass-panel border-b border-neutral-800/80 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-3 items-center h-16">
        <!-- Brand Logo (Left Column) -->
        <div class="flex items-center justify-start">
          <NuxtLink to="/" class="flex items-center gap-3 group">
            <div class="relative w-10 h-10 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 shrink-0">
              <img src="/img/logo.png" alt="HS15 Logo" class="w-full h-full object-contain">
            </div>
            <div class="flex flex-col">
              <span class="font-extrabold text-lg tracking-wide group-hover:text-crimson-400 transition-colors" :class="isDark ? 'text-white' : 'text-slate-900'">
                HS15
              </span>
              <span class="text-[11px] font-medium hidden sm:inline -mt-1" :class="isDark ? 'text-neutral-400' : 'text-slate-500'">
                Komunitas Keliling Banjar
              </span>
            </div>
          </NuxtLink>
        </div>

        <!-- Navigation Links with Sliding Pill Indicator (Center Column) -->
        <nav class="hidden md:flex items-center justify-center">
          <div 
            ref="navContainerRef"
            class="relative flex items-center p-1 rounded-2xl border transition-colors duration-300"
            :class="isDark 
              ? 'bg-neutral-900/60 border-neutral-800/80 shadow-inner' 
              : 'bg-slate-100/80 border-slate-200/80 shadow-inner'"
          >
            <!-- Sliding Indicator Pill -->
            <div
              class="absolute top-1 bottom-1 rounded-xl transition-all duration-300 ease-out pointer-events-none"
              :class="isDark 
                ? 'bg-crimson-600 border border-crimson-400 shadow-[0_0_20px_rgba(215,25,58,0.45)]' 
                : 'bg-crimson-600 border border-crimson-400 shadow-md'"
              :style="indicatorStyle"
            />

            <!-- Nav Links -->
            <NuxtLink
              v-for="(link, idx) in navLinks"
              :key="link.path"
              :ref="(el) => { if (el) linkRefs[idx] = (el as any).$el || el }"
              :to="link.path"
              class="relative z-10 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 group whitespace-nowrap"
              :class="isActive(link.path)
                ? '!text-white' 
                : (isDark 
                    ? 'text-neutral-400 hover:text-white' 
                    : 'text-slate-600 hover:text-slate-900')"
            >
              <svg 
                class="w-4 h-4 transition-transform duration-200 group-hover:scale-110" 
                :class="isActive(link.path) ? '!text-white' : ''"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="link.icon" />
              </svg>
              <span>{{ link.label }}</span>
            </NuxtLink>
          </div>
        </nav>

        <!-- Right Side: Theme Toggle & Mobile Menu (Right Column) -->
        <div class="flex items-center justify-end gap-2 col-start-3">
          <!-- Theme Toggle Button -->
          <button
            type="button"
            class="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border hover:scale-105 active:scale-95 shrink-0"
            :class="isDark 
              ? 'bg-neutral-900/80 hover:bg-neutral-800 text-amber-400 border-neutral-700/80 hover:border-amber-400/40 shadow-sm' 
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm'"
            :title="isDark ? 'Ganti ke Tema Terang' : 'Ganti ke Tema Gelap'"
            aria-label="Toggle theme"
            @click="toggleTheme"
          >
            <svg v-if="isDark" class="w-4 h-4 transition-transform hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <!-- Mobile Dropdown Navigation -->
          <div class="dropdown dropdown-end md:hidden">
            <button tabindex="0" class="btn btn-sm btn-circle btn-ghost" :class="isDark ? 'text-neutral-300' : 'text-slate-700'">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <ul tabindex="0" class="dropdown-content z-50 menu p-2 shadow-2xl glass-panel rounded-2xl w-52 mt-3 border border-neutral-700">
              <li>
                <NuxtLink to="/" class="py-2.5 flex items-center gap-2" :class="isActive('/') ? '!text-white font-bold bg-crimson-600 rounded-lg px-3' : (isDark ? 'text-neutral-200' : 'text-slate-800')">
                  Beranda
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/photos" class="py-2.5 flex items-center gap-2" :class="isActive('/photos') ? '!text-white font-bold bg-crimson-600 rounded-lg px-3' : (isDark ? 'text-neutral-200' : 'text-slate-800')">
                  Galeri Foto
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/videos" class="py-2.5 flex items-center gap-2" :class="isActive('/videos') ? '!text-white font-bold bg-crimson-600 rounded-lg px-3' : (isDark ? 'text-neutral-200' : 'text-slate-800')">
                  Galeri Video
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
