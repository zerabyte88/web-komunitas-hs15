<script setup lang="ts">
const { isDark } = useTheme()
</script>

<template>
  <div 
    class="min-h-screen flex flex-col relative transition-colors duration-300"
    :class="isDark ? 'text-neutral-100 bg-[#0a0a0a]' : 'text-slate-900 bg-slate-50'"
  >
    <!-- Dynamic background slideshow -->
    <BackgroundSlideshow />

    <!-- Application Top Navigation -->
    <AppHeader />

    <!-- Main Content Area -->
    <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Back to top floating button -->
    <ScrollToTop />
  </div>
</template>
