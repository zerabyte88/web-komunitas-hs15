<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

const route = useRoute()
const { isDark, toggleTheme } = useTheme()
const { isRainEnabled, toggleRain } = useRainEffect()

const navLinks = [
  { path: '/', label: 'Beranda' },
  { path: '/gallery', label: 'Galeri' }
]

const isActive = (path: string) => route.path === path

const navRef = ref<HTMLElement | null>(null)
const linkRefs = new Map<string, HTMLElement>()
const indicator = ref<{ left: number; width: number } | null>(null)
const indicatorAnimated = ref(false)

const setLinkRef = (path: string, el: Element | ComponentPublicInstance | null) => {
  const domEl = el && '$el' in el ? (el.$el as HTMLElement | null) : (el as HTMLElement | null)
  if (domEl instanceof HTMLElement) {
    linkRefs.set(path, domEl)
  } else {
    linkRefs.delete(path)
  }
}

const updateIndicator = () => {
  const activeEl = linkRefs.get(route.path)
  if (!navRef.value || !activeEl || activeEl.offsetWidth === 0) {
    indicator.value = null
    return
  }
  indicator.value = {
    left: activeEl.offsetLeft,
    width: activeEl.offsetWidth
  }
}

const mobileMenuOpen = ref(false)
const mobileMenuRef = ref<HTMLElement | null>(null)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const handleOutsidePointerDown = (event: PointerEvent) => {
  if (!mobileMenuOpen.value || !mobileMenuRef.value) return
  if (event.target instanceof Node && !mobileMenuRef.value.contains(event.target)) {
    mobileMenuOpen.value = false
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && mobileMenuOpen.value) {
    mobileMenuOpen.value = false
  }
}

watch(() => route.path, () => {
  mobileMenuOpen.value = false
  nextTick(updateIndicator)
})

onMounted(() => {
  updateIndicator()
  requestAnimationFrame(() => {
    indicatorAnimated.value = true
  })
  window.addEventListener('resize', updateIndicator, { passive: true })
  document.addEventListener('pointerdown', handleOutsidePointerDown)
  document.addEventListener('keydown', handleKeyDown)
  document.fonts?.ready.then(updateIndicator)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIndicator)
  document.removeEventListener('pointerdown', handleOutsidePointerDown)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <header class="sticky top-0 z-40 w-full h-16 bg-[var(--bg-header)] backdrop-blur-sm border-b border-[var(--border-subtle)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
      <NuxtLink to="/" class="flex items-center gap-3 shrink-0">
        <img src="/img/logo.png" alt="Logo HS15" class="w-8 h-8 object-contain shrink-0">
        <div class="flex flex-col leading-tight">
          <span class="font-semibold text-base tracking-tight text-[var(--text-primary)]">
            HS15
          </span>
          <span class="text-xs text-[var(--text-muted)] hidden sm:inline">
            Komunitas Keliling Banjar
          </span>
        </div>
      </NuxtLink>

      <nav ref="navRef" class="relative hidden md:flex items-center gap-6 h-full" aria-label="Navigasi utama">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.path"
          :ref="(el) => setLinkRef(link.path, el)"
          :to="link.path"
          class="relative h-full inline-flex items-center text-sm transition-colors duration-150 ease-[var(--ease-out)]"
          :class="isActive(link.path)
            ? 'text-[var(--text-primary)] font-medium'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'"
        >
          {{ link.label }}
          <span
            v-if="!indicator && isActive(link.path)"
            class="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--accent)]"
          />
        </NuxtLink>
        <span
          v-if="indicator"
          aria-hidden="true"
          class="pointer-events-none absolute bottom-0 left-0 h-0.5 bg-[var(--accent)] motion-reduce:transition-none"
          :class="indicatorAnimated ? 'transition-[transform,width] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]' : ''"
          :style="{
            transform: `translateX(${indicator.left}px)`,
            width: `${indicator.width}px`
          }"
        />
      </nav>

      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          class="group w-9 h-9 rounded-lg border bg-[var(--bg-surface)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] flex items-center justify-center transition-[color,border-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100 shrink-0"
          :class="isRainEnabled
            ? 'text-[var(--text-primary)] border-[var(--border-strong)]'
            : 'text-[var(--text-muted)] border-[var(--border-subtle)]'"
          :title="isRainEnabled ? 'Matikan efek hujan' : 'Aktifkan efek hujan'"
          :aria-label="isRainEnabled ? 'Matikan efek hujan' : 'Aktifkan efek hujan'"
          :aria-pressed="isRainEnabled"
          @click="toggleRain"
        >
          <svg
            class="w-4 h-4 transition-transform duration-200 ease-[var(--ease-out)] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 3.25C12 3.25 6.5 9.7 6.5 14a5.5 5.5 0 0011 0c0-4.3-5.5-10.75-5.5-10.75z"
            />
            <path
              v-if="!isRainEnabled"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M4.5 4.5l15 15"
            />
          </svg>
        </button>

        <button
          type="button"
          class="group w-9 h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] flex items-center justify-center transition-[color,border-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100 shrink-0"
          :title="isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'"
          :aria-label="isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'"
          @click="toggleTheme"
        >
          <svg v-if="isDark" class="w-4 h-4 transition-transform duration-200 ease-[var(--ease-out)] group-hover:rotate-12 motion-reduce:transition-none motion-reduce:group-hover:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="w-4 h-4 transition-transform duration-200 ease-[var(--ease-out)] group-hover:rotate-12 motion-reduce:transition-none motion-reduce:group-hover:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <div ref="mobileMenuRef" class="relative md:hidden">
          <button
            type="button"
            :aria-label="mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'"
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-nav-menu"
            class="w-9 h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] flex items-center justify-center transition-[color,border-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100"
            @click="toggleMobileMenu"
          >
            <svg v-if="!mobileMenuOpen" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Transition
            enter-active-class="transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            enter-from-class="opacity-0 -translate-y-1.5 scale-[0.98]"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition-[opacity,transform] duration-120 ease-in motion-reduce:transition-none"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 -translate-y-1.5 scale-[0.98]"
          >
            <ul
              v-if="mobileMenuOpen"
              id="mobile-nav-menu"
              class="absolute right-0 top-full z-50 flex flex-col gap-1 p-1.5 shadow-lg rounded-xl w-48 mt-2 bg-[var(--bg-surface)] border border-[var(--border-strong)] origin-top-right"
            >
              <li v-for="link in navLinks" :key="link.path">
                <NuxtLink
                  :to="link.path"
                  class="py-2 px-3 rounded-lg flex items-center justify-between text-sm transition-colors duration-150"
                  :class="isActive(link.path)
                    ? 'bg-[var(--bg-raised)] text-[var(--text-primary)] font-medium'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]'"
                  @click="closeMobileMenu"
                >
                  <span>{{ link.label }}</span>
                  <span
                    v-if="isActive(link.path)"
                    class="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                  />
                </NuxtLink>
              </li>
            </ul>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>
