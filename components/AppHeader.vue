<script setup lang="ts">
const route = useRoute()
const showSettings = ref(false)

const isActive = (path: string) => {
  return route.path === path
}
</script>

<template>
  <header class="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Brand Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <div class="relative w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:border-purple-400 transition-all duration-300">
            <img src="/img/logo.png" alt="HS15 Logo" class="w-full h-full object-cover">
          </div>
          <div class="flex flex-col">
            <span class="font-extrabold text-lg text-white tracking-wide group-hover:text-blue-400 transition-colors">
              HS15
            </span>
            <span class="text-[11px] text-slate-400 font-medium hidden sm:inline -mt-1">
              Komunitas Keliling Banjar
            </span>
          </div>
        </NuxtLink>

        <!-- Navigation Links (Desktop) -->
        <nav class="hidden md:flex items-center gap-2">
          <NuxtLink
            to="/"
            class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
            :class="isActive('/') ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.2)]' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Beranda</span>
          </NuxtLink>

          <NuxtLink
            to="/photos"
            class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
            :class="isActive('/photos') ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.2)]' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Galeri Foto</span>
          </NuxtLink>

          <NuxtLink
            to="/videos"
            class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
            :class="isActive('/videos') ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Galeri Video</span>
          </NuxtLink>
        </nav>

        <!-- Right Side: Google Drive Status & Settings Button -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="btn btn-sm btn-ghost border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 text-xs font-medium text-slate-300 flex items-center gap-2 px-3 rounded-xl shadow-sm"
            title="Konfigurasi Google Drive API"
            @click="showSettings = true"
          >
            <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span class="hidden sm:inline">Google Drive</span>
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <!-- Mobile Dropdown Navigation -->
          <div class="dropdown dropdown-end md:hidden">
            <button tabindex="0" class="btn btn-sm btn-circle btn-ghost text-slate-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <ul tabindex="0" class="dropdown-content z-50 menu p-2 shadow-2xl glass-panel rounded-2xl w-52 mt-3 border border-slate-700">
              <li>
                <NuxtLink to="/" class="py-2.5 flex items-center gap-2" :class="isActive('/') ? 'text-blue-400 font-bold' : 'text-slate-200'">
                  Beranda
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/photos" class="py-2.5 flex items-center gap-2" :class="isActive('/photos') ? 'text-blue-400 font-bold' : 'text-slate-200'">
                  Galeri Foto
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/videos" class="py-2.5 flex items-center gap-2" :class="isActive('/videos') ? 'text-purple-400 font-bold' : 'text-slate-200'">
                  Galeri Video
                </NuxtLink>
              </li>
              <div class="divider my-1 border-slate-800" />
              <li>
                <button type="button" class="py-2.5 text-xs text-slate-300" @click="showSettings = true">
                  Setelan Google Drive
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Drive Settings Modal Component -->
    <DriveSettingsModal v-model="showSettings" />
  </header>
</template>
