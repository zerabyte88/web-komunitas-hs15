<script setup lang="ts">
const { isDark } = useTheme()
</script>

<template>
  <footer class="w-full glass-panel border-t border-neutral-800/80 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col items-center justify-center text-center gap-1.5">
      <div class="flex items-center gap-2">
        <img src="/img/logo.png" alt="HS15 Logo" class="w-6 h-6 object-contain">
        <span class="font-bold text-sm tracking-wide" :class="isDark ? 'text-white' : 'text-slate-900'">HS15</span>
        <span :class="isDark ? 'text-neutral-700' : 'text-slate-300'">·</span>
        <span class="text-xs" :class="isDark ? 'text-neutral-400' : 'text-slate-600'">Komunitas Keliling Banjar</span>
      </div>
      <p class="text-[11px]" :class="isDark ? 'text-neutral-500' : 'text-slate-400'">
        &copy; {{ new Date().getFullYear() }} HS15. All rights reserved.
      </p>
    </div>
  </footer>
</template>
