<script setup lang="ts">
const { isDark } = useTheme()
</script>

<template>
  <div 
    class="min-h-screen flex flex-col relative isolate transition-colors duration-300"
    :class="isDark ? 'text-neutral-100' : 'text-slate-900'"
  >
    <!-- Dynamic background slideshow -->
    <BackgroundSlideshow />

    <!-- Application Top Navigation -->
    <AppHeader />

    <!-- Main Content Area -->
    <main class="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <AppFooter class="relative z-10" />

    <!-- Back to top floating button -->
    <ScrollToTop />
  </div>
</template>
