<template>
  <div class="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)]">
    <AppHeader />

    <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <AppFooter />

    <ScrollToTop />
  </div>
</template>
