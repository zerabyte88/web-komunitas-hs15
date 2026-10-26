<script setup lang="ts">
import { Fancybox } from '@fancyapps/ui'
import type { DriveMediaItem } from '~/types/drive'

const { getStats, getMedia } = useGoogleDrive()

const { data: stats, pending: statsPending } = await getStats()
const { data: recentPhotos, pending: photosPending } = await getMedia({
  type: 'photo',
  limit: 4,
  sort: 'newest'
})

// Function to trigger Fancybox v5 for recent photos preview
const openLightbox = (index: number) => {
  if (!recentPhotos.value?.items) return

  const galleryItems = recentPhotos.value.items.map(item => ({
    src: item.previewUrl,
    thumb: item.thumbnailUrl,
    caption: `
      <div class="space-y-1">
        <div class="font-bold text-white text-base">${item.title}</div>
        <div class="text-xs text-neutral-300">${item.description || 'Dokumentasi Komunitas Keliling Banjar'}</div>
        <div class="text-[11px] text-crimson-400 font-mono mt-1">${new Date(item.createdTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
    `,
    downloadSrc: item.downloadUrl
  }))

  Fancybox.show(galleryItems, {
    startIndex: index
  })
}
</script>

<template>
  <div class="space-y-12 py-4">
    <!-- Hero Section -->
    <section class="text-center max-w-3xl mx-auto space-y-5">
      <!-- Welcome Chip -->
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-crimson-500/10 border border-crimson-500/30 text-crimson-400 text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(215,25,58,0.25)]">
        <span class="w-2 h-2 rounded-full bg-crimson-400 animate-pulse" />
        <span>Arsip Digital Resmi HS15</span>
        <span class="text-neutral-400">•</span>
        <span class="text-neutral-300">Komunitas Keliling Banjar</span>
      </div>

      <h1 class="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
        Jelajahi Arsip &amp; Dokumentasi <br>
        <span class="text-crimson-500">Komunitas HS15</span>
      </h1>

      <p class="text-neutral-300 text-base sm:text-lg leading-relaxed">
        Kumpulan dokumentasi foto dan video yang merangkum setiap perjalanan touring dan cerita kebersamaan komunitas HS15.
      </p>
    </section>

    <!-- Stats Cards Section -->
    <section class="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
      <!-- Stat Foto -->
      <div class="glass-card rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden group">
        <div class="w-14 h-14 rounded-2xl bg-crimson-500/20 text-crimson-400 flex items-center justify-center border border-crimson-500/30 shadow-[0_0_20px_rgba(215,25,58,0.3)] group-hover:scale-110 transition-transform">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <span class="text-xs uppercase font-bold tracking-wider text-neutral-400">Total Foto</span>
          <div class="text-3xl font-black text-white mt-0.5">
            <span v-if="statsPending" class="loading loading-dots loading-sm" />
            <span v-else>{{ stats?.photos ?? 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Stat Video -->
      <div class="glass-card rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden group">
        <div class="w-14 h-14 rounded-2xl bg-crimson-500/20 text-crimson-400 flex items-center justify-center border border-crimson-500/30 shadow-[0_0_20px_rgba(215,25,58,0.3)] group-hover:scale-110 transition-transform">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <span class="text-xs uppercase font-bold tracking-wider text-neutral-400">Total Video</span>
          <div class="text-3xl font-black text-white mt-0.5">
            <span v-if="statsPending" class="loading loading-dots loading-sm" />
            <span v-else>{{ stats?.videos ?? 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Stat Folder/Album -->
      <div class="glass-card rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden group">
        <div class="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <div>
          <span class="text-xs uppercase font-bold tracking-wider text-neutral-400">Album Kegiatan</span>
          <div class="text-3xl font-black text-white mt-0.5">
            <span v-if="statsPending" class="loading loading-dots loading-sm" />
            <span v-else>{{ stats?.folders ?? 0 }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Navigation Choice Cards (Matching choose.php) -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-4">
      <!-- Card Galeri Foto -->
      <NuxtLink
        to="/photos"
        class="glass-card rounded-3xl p-8 flex flex-col justify-between group relative overflow-hidden border border-neutral-700/60 hover:border-crimson-500/60"
      >
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-crimson-500/20 text-crimson-400 border border-crimson-500/30">
              📸 Koleksi Foto
            </span>
            <div class="w-12 h-12 rounded-2xl bg-crimson-600/20 text-crimson-400 flex items-center justify-center border border-crimson-500/30 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <h2 class="text-2xl font-bold text-white group-hover:text-crimson-400 transition-colors">
            Galeri Foto
          </h2>
          <p class="text-neutral-300 text-sm leading-relaxed">
            Lihat ratusan potret perjalanan, momen santai, dan keindahan alam Banjar dengan tampilan resolusi tinggi.
          </p>
        </div>

        <div class="mt-8 pt-4 border-t border-neutral-800 flex items-center text-sm font-semibold text-crimson-400 group-hover:text-crimson-300 transition-colors">
          <span>Buka Galeri Foto</span>
          <svg class="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </NuxtLink>

      <!-- Card Galeri Video -->
      <NuxtLink
        to="/videos"
        class="glass-card rounded-3xl p-8 flex flex-col justify-between group relative overflow-hidden border border-neutral-700/60 hover:border-crimson-500/60"
      >
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-crimson-500/20 text-crimson-400 border border-crimson-500/30">
              🎬 Rekaman Video
            </span>
            <div class="w-12 h-12 rounded-2xl bg-crimson-600/20 text-crimson-400 flex items-center justify-center border border-crimson-500/30 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <h2 class="text-2xl font-bold text-white group-hover:text-crimson-400 transition-colors">
            Galeri Video
          </h2>
          <p class="text-neutral-300 text-sm leading-relaxed">
            Tonton kembali keseruan dan rekaman video touring kegiatan dengan pemutaran lancar resolusi tinggi.
          </p>
        </div>

        <div class="mt-8 pt-4 border-t border-neutral-800 flex items-center text-sm font-semibold text-crimson-400 group-hover:text-crimson-300 transition-colors">
          <span>Buka Galeri Video</span>
          <svg class="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </NuxtLink>
    </section>

    <!-- Recent Highlights (Fancybox Lightbox Demonstration) -->
    <section class="max-w-6xl mx-auto pt-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-2xl font-bold text-white">Sorotan Foto Terbaru</h3>
          <p class="text-xs sm:text-sm text-neutral-400">Klik gambar untuk melihat ukuran penuh.</p>
        </div>
        <NuxtLink to="/photos" class="btn btn-sm btn-ghost text-crimson-400 hover:text-crimson-300 flex items-center gap-1">
          <span>Lihat Semua</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>

      <!-- Photos Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="(photo, idx) in recentPhotos?.items || []"
          :key="photo.id"
          class="group relative rounded-2xl overflow-hidden glass-card aspect-[4/3] cursor-pointer shadow-lg"
          @click="openLightbox(idx)"
        >
          <img
            :src="photo.thumbnailUrl"
            :alt="photo.title"
            loading="lazy"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
            <span class="text-xs font-bold text-white truncate">{{ photo.title }}</span>
            <span class="text-[10px] text-crimson-400">{{ photo.folderName }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
