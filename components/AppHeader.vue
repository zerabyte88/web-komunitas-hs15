<script setup lang="ts">
const route = useRoute()
const { isDark, toggleTheme } = useTheme()

const navLinks = [
  { path: '/', label: 'Beranda' },
  { path: '/gallery', label: 'Galeri' }
]

const isActive = (path: string) => route.path === path

const closeMobileDropdown = () => {
  if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}
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

      <nav class="hidden md:flex items-center gap-6 h-full" aria-label="Navigasi utama">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="relative h-full inline-flex items-center text-sm transition-colors duration-150"
          :class="isActive(link.path)
            ? 'text-[var(--text-primary)] font-medium'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'"
        >
          {{ link.label }}
          <span
            v-if="isActive(link.path)"
            class="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--accent)]"
          />
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          class="w-9 h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] flex items-center justify-center transition-colors duration-150 shrink-0"
          :title="isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'"
          :aria-label="isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'"
          @click="toggleTheme"
        >
          <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <div class="dropdown dropdown-end md:hidden">
          <button
            type="button"
            tabindex="0"
            aria-label="Buka menu navigasi"
            class="w-9 h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] flex items-center justify-center transition-colors duration-150"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <ul
            tabindex="0"
            class="dropdown-content z-50 flex flex-col gap-1 p-1.5 shadow-lg rounded-xl w-48 mt-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
          >
            <li v-for="link in navLinks" :key="link.path">
              <NuxtLink
                :to="link.path"
                class="py-2 px-3 rounded-lg flex items-center justify-between text-sm transition-colors duration-150"
                :class="isActive(link.path)
                  ? 'bg-[var(--bg-raised)] text-[var(--text-primary)] font-medium'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]'"
                @click="closeMobileDropdown"
              >
                <span>{{ link.label }}</span>
                <span
                  v-if="isActive(link.path)"
                  class="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                />
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>
