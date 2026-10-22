<template>
  <div class="min-h-screen flex flex-col relative text-slate-100 bg-[#0b0f19]">
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
  </div>
</template>
