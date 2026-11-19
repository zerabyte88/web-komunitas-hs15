<template>
  <footer class="w-full bg-[var(--bg-page)] border-t border-[var(--border-subtle)] mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-center">
      <div class="flex items-center gap-2">
        <img src="/img/logo.png" alt="Logo HS15" class="w-6 h-6 object-contain">
        <span class="text-sm font-medium text-[var(--text-primary)]">HS15</span>
        <span class="text-[var(--text-muted)]">·</span>
        <span class="text-xs text-[var(--text-secondary)]">Komunitas Keliling Banjar</span>
      </div>
      <span class="hidden sm:inline text-[var(--border-strong)]" aria-hidden="true">|</span>
      <p class="font-mono text-xs text-[var(--text-muted)] tabular-nums">
        &copy; {{ new Date().getFullYear() }} Komunitas HS15
      </p>
    </div>
  </footer>
</template>
