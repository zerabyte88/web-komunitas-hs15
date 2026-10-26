<script setup lang="ts">
import { Fancybox } from '@fancyapps/ui'
import type { MediaFilterOptions } from '~/types/drive'

const { getMedia, getFolders } = useGoogleDrive()

const currentFolder = ref<string>('all')
const searchTerm = ref<string>('')
const sortBy = ref<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest')
const currentPage = ref<number>(1)

const filterOptions = computed<MediaFilterOptions>(() => ({
  type: 'video',
  folderId: currentFolder.value === 'all' ? undefined : currentFolder.value,
  search: searchTerm.value || undefined,
  sort: sortBy.value,
  page: currentPage.value,
  limit: 12
}))

const { data: folders } = await getFolders()
const { data: mediaResponse, pending: mediaPending } = await getMedia(filterOptions)

// Format duration helper (milliseconds to MM:SS)
const formatDuration = (ms?: number) => {
  if (!ms) return ''
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// Trigger Fancybox v5 video playback
const playVideo = (startIndex: number) => {
  if (!mediaResponse.value?.items?.length) return

  const videoItems = mediaResponse.value.items.map(item => {
    const isDirectMp4 = item.previewUrl.endsWith('.mp4') || item.mimeType === 'video/mp4'
    const isDrivePreview = item.previewUrl.includes('drive.google.com')

    return {
      src: item.previewUrl,
      thumb: item.thumbnailUrl,
      type: isDrivePreview ? 'iframe' : 'html5video',
      caption: `
        <div class="space-y-1 text-left">
          <div class="font-bold text-white text-base">${item.title}</div>
          <div class="text-xs text-neutral-300 max-w-xl">${item.description || 'Rekaman Dokumentasi Komunitas Keliling Banjar'}</div>
          <div class="flex items-center gap-3 text-[11px] text-crimson-400 font-mono mt-1">
            <span>📅 ${new Date(item.createdTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>📁 ${item.folderName || 'Arsip Video HS15'}</span>
          </div>
        </div>
      `,
      downloadSrc: item.downloadUrl
    }
  })

  Fancybox.show(videoItems, {
    startIndex,
    Html: {
      video: {
        autoplay: true
      }
    }
  })
}

watch([currentFolder, searchTerm, sortBy], () => {
  currentPage.value = 1
})
</script>

<template>
  <div class="space-y-8 py-2">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-500/10 border border-crimson-500/30 text-crimson-400 text-xs font-semibold">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Dokumentasi Video HS15</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Galeri Video Komunitas
        </h1>
        <p class="text-neutral-400 text-sm max-w-xl">
          Kumpulan video touring, keseruan, dan rekaman perjalanan Komunitas Keliling Banjar.
        </p>
      </div>

      <!-- Quick Total Count -->
      <div class="text-right">
        <div class="text-xs text-neutral-400">Total Video Tersimpan</div>
        <div class="text-2xl font-black text-crimson-400">
          {{ mediaResponse?.total ?? 0 }} <span class="text-xs text-neutral-400 font-normal">Video</span>
        </div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="glass-panel p-4 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4 border border-neutral-800 shadow-md">
      <!-- Folder/Album Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
        <button
          type="button"
          class="btn btn-sm rounded-xl px-4 text-xs font-semibold whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
          :class="currentFolder === 'all' 
            ? 'bg-crimson-600 hover:bg-crimson-500 text-white border-crimson-400 shadow-[0_0_15px_rgba(215,25,58,0.4)]' 
            : 'btn-ghost text-neutral-300 hover:bg-neutral-800/80 hover:text-white border-transparent'"
          @click="currentFolder = 'all'"
        >
          Semua Album
        </button>
        <button
          v-for="folder in folders || []"
          :key="folder.id"
          type="button"
          class="btn btn-sm rounded-xl px-4 text-xs font-semibold whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
          :class="currentFolder === folder.id 
            ? 'bg-crimson-600 hover:bg-crimson-500 text-white border-crimson-400 shadow-[0_0_15px_rgba(215,25,58,0.4)]' 
            : 'btn-ghost text-neutral-300 hover:bg-neutral-800/80 hover:text-white border-transparent'"
          @click="currentFolder = folder.id"
        >
          {{ folder.name }}
        </button>
      </div>

      <!-- Search & Sort Controls -->
      <div class="flex items-center gap-3 w-full lg:w-auto">
        <!-- Search Input -->
        <div class="relative flex-1 lg:w-64">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Cari video..."
            class="input input-sm input-bordered w-full bg-neutral-900/80 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 rounded-xl pl-8 text-xs focus:border-crimson-500"
          >
          <svg class="w-4 h-4 text-neutral-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Sort Select -->
        <select
          v-model="sortBy"
          class="select select-sm select-bordered bg-neutral-900/80 border-neutral-700 text-neutral-200 rounded-xl text-xs focus:border-crimson-500"
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="name-asc">Nama A-Z</option>
          <option value="name-desc">Nama Z-A</option>
        </select>
      </div>
    </div>

    <!-- Video Grid -->
    <div v-if="mediaPending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="n in 6" :key="n" class="skeleton-shimmer aspect-video rounded-2xl" />
    </div>

    <div v-else-if="!mediaResponse?.items?.length" class="text-center py-16 glass-card rounded-3xl max-w-lg mx-auto p-8 space-y-4">
      <div class="w-16 h-16 rounded-2xl bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-white">Tidak ada video ditemukan</h3>
      <p class="text-xs text-neutral-400">Coba ubah kata kunci pencarian atau pilih folder lain.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(video, idx) in mediaResponse.items"
        :key="video.id"
        class="glass-card rounded-2xl overflow-hidden group cursor-pointer border border-neutral-800/80 flex flex-col shadow-lg"
        @click="playVideo(idx)"
      >
        <!-- Video Poster Container -->
        <div class="relative aspect-video overflow-hidden bg-neutral-900">
          <img
            :src="video.thumbnailUrl"
            :alt="video.title"
            loading="lazy"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          >

          <!-- Play Button Overlay -->
          <div class="absolute inset-0 bg-black/40 group-hover:bg-crimson-950/40 transition-colors flex items-center justify-center">
            <div class="w-14 h-14 rounded-full bg-crimson-600/90 text-white flex items-center justify-center shadow-[0_0_25px_rgba(215,25,58,0.6)] transform group-hover:scale-110 transition-transform pl-1">
              <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          <!-- Duration Badge -->
          <span v-if="video.durationMillis" class="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/75 text-white backdrop-blur-sm">
            {{ formatDuration(video.durationMillis) }}
          </span>

          <!-- Album Badge -->
          <span v-if="video.folderName" class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-crimson-300 border border-crimson-500/20">
            {{ video.folderName }}
          </span>
        </div>

        <!-- Video Card Info -->
        <div class="p-4 flex flex-col justify-between flex-1 bg-neutral-900/40">
          <div>
            <h4 class="font-bold text-base text-neutral-100 group-hover:text-crimson-400 transition-colors line-clamp-1">
              {{ video.title }}
            </h4>
            <p v-if="video.description" class="text-xs text-neutral-400 mt-1 line-clamp-2">
              {{ video.description }}
            </p>
          </div>
          <div class="flex items-center justify-between text-xs text-neutral-400 mt-4 pt-3 border-t border-neutral-800/80">
            <span>{{ new Date(video.createdTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
            <span class="text-crimson-400 font-semibold flex items-center gap-1">
              <span>Putar Video</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="mediaResponse && mediaResponse.pages > 1" class="flex justify-center pt-8">
      <div class="join glass-panel rounded-2xl border border-neutral-800 p-1.5 shadow-md">
        <button
          class="join-item btn btn-sm btn-ghost text-neutral-300 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
          :disabled="currentPage <= 1"
          @click="currentPage--"
        >
          « Sebelumnya
        </button>
        <button
          v-for="p in mediaResponse.pages"
          :key="p"
          class="join-item btn btn-sm rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 mx-0.5"
          :class="p === currentPage 
            ? 'bg-crimson-600 hover:bg-crimson-500 text-white font-bold border-crimson-400 shadow-[0_0_12px_rgba(215,25,58,0.4)]' 
            : 'btn-ghost text-neutral-300 hover:bg-neutral-800/80 hover:text-white'"
          @click="currentPage = p"
        >
          {{ p }}
        </button>
        <button
          class="join-item btn btn-sm btn-ghost text-neutral-300 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
          :disabled="currentPage >= mediaResponse.pages"
          @click="currentPage++"
        >
          Selanjutnya »
        </button>
      </div>
    </div>
  </div>
</template>
