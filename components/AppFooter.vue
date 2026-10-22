<template>
  <footer class="w-full glass-panel border-t border-slate-800/80 py-8 mt-auto text-slate-400 text-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <img src="/img/logo.png" alt="HS15 Logo" class="w-7 h-7 rounded-full object-cover border border-blue-500/40">
        <div>
          <span class="font-bold text-slate-200">HS15</span>
          <span class="text-xs text-slate-400 block sm:inline sm:ml-2">Arsip Dokumentasi Komunitas Keliling Banjar</span>
        </div>
      </div>

      <div class="flex items-center gap-6 text-xs text-slate-400">
        <NuxtLink to="/" class="hover:text-blue-400 transition-colors">Beranda</NuxtLink>
        <NuxtLink to="/photos" class="hover:text-blue-400 transition-colors">Galeri Foto</NuxtLink>
        <NuxtLink to="/videos" class="hover:text-purple-400 transition-colors">Galeri Video</NuxtLink>
      </div>

      <div class="text-xs text-slate-500 text-center md:text-right">
        &copy; {{ new Date().getFullYear() }} HS15. Powered by Nuxt 3 & Google Drive API.
      </div>
    </div>
  </footer>
</template>
