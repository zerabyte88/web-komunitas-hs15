<script setup lang="ts">
import { Fancybox } from '@fancyapps/ui'
import type { MediaFilterOptions } from '~/types/drive'
import { useDragScroll } from '~/composables/useDragScroll'

const { getMedia, getFolders } = useGoogleDrive()

const currentFolder = ref<string>('all')
const searchTerm = ref<string>('')
const sortBy = ref<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest')
const currentPage = ref<number>(1)

const albumTabsRef = ref<HTMLElement | null>(null)
useDragScroll(albumTabsRef)

const filterOptions = computed<MediaFilterOptions>(() => ({
  type: 'photo',
  folderId: currentFolder.value === 'all' ? undefined : currentFolder.value,
  search: searchTerm.value || undefined,
  sort: sortBy.value,
  page: currentPage.value,
  limit: 16
}))

// Fetch folders and media
const { data: folders, pending: foldersPending } = await getFolders()
const { data: mediaResponse, pending: mediaPending, refresh } = await getMedia(filterOptions)

// Trigger Fancybox v5 on image click
const openGallery = (startIndex: number) => {
  if (!mediaResponse.value?.items?.length) return

  const galleryItems = mediaResponse.value.items.map(item => ({
    src: item.previewUrl,
    thumb: item.thumbnailUrl,
    caption: `
      <div class="space-y-1 text-left">
        <div class="font-bold text-white text-base">${item.title}</div>
        <div class="text-xs text-neutral-300 max-w-xl">${item.description || 'Dokumentasi Komunitas Keliling Banjar'}</div>
        <div class="flex items-center gap-3 text-[11px] text-crimson-400 font-mono mt-1">
          <span>📅 ${new Date(item.createdTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span>📁 ${item.folderName || 'Arsip HS15'}</span>
        </div>
      </div>
    `,
    downloadSrc: item.downloadUrl
  }))

  Fancybox.show(galleryItems, {
    startIndex,
    Carousel: {
      transition: 'slide'
    },
    Images: {
      zoom: true
    },
    Toolbar: {
      display: {
        left: ['infobar'],
        middle: ['zoomIn', 'zoomOut', 'toggle1to1', 'rotateCCW', 'rotateCW'],
        right: ['slideshow', 'thumbs', 'download', 'close']
      }
    }
  })
}

// Watch filters to reset page to 1
watch([currentFolder, searchTerm, sortBy], () => {
  currentPage.value = 1
})

// Calculate smart pagination range
const displayedPages = computed<(number | string)[]>(() => {
  if (!mediaResponse.value) return []
  const total = mediaResponse.value.pages
  const current = currentPage.value
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages: (number | string)[] = []
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i)
    pages.push('...')
    pages.push(total)
  } else if (current >= total - 3) {
    pages.push(1)
    pages.push('...')
    for (let i = total - 4; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    pages.push('...')
    for (let i = current - 1; i <= current + 1; i++) pages.push(i)
    pages.push('...')
    pages.push(total)
  }
  return pages
})
</script>

<template>
  <div class="space-y-8 py-2">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-500/10 border border-crimson-500/30 text-crimson-400 text-xs font-semibold">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Dokumentasi Foto HS15</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Galeri Foto Komunitas
        </h1>
        <p class="text-neutral-400 text-sm max-w-xl">
          Kumpulan foto touring, momen santai, dan rekaman perjalanan Komunitas Keliling Banjar.
        </p>
      </div>

      <!-- Quick Total Count -->
      <div class="text-right">
        <div class="text-xs text-neutral-400">Total Foto Ditemukan</div>
        <div class="text-2xl font-black text-crimson-400">
          {{ mediaResponse?.total ?? 0 }} <span class="text-xs text-neutral-400 font-normal">Foto</span>
        </div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="glass-panel p-4 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4 border border-neutral-800 shadow-md">
      <!-- Folder/Album Tabs -->
      <div
        ref="albumTabsRef"
        class="flex items-center gap-2 overflow-x-auto overflow-y-hidden w-full lg:w-auto py-1 scrollbar-none no-scrollbar cursor-grab active:cursor-grabbing select-none touch-pan-x"
      >
        <button
          type="button"
          class="btn btn-sm rounded-xl px-4 text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
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
          class="btn btn-sm rounded-xl px-4 text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
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
            placeholder="Cari foto..."
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

    <!-- Media Grid -->
    <div v-if="mediaPending" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="n in 8" :key="n" class="skeleton-shimmer aspect-[4/3] rounded-2xl" />
    </div>

    <div v-else-if="!mediaResponse?.items?.length" class="text-center py-16 glass-card rounded-3xl max-w-lg mx-auto p-8 space-y-4">
      <div class="w-16 h-16 rounded-2xl bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-white">Tidak ada foto ditemukan</h3>
      <p class="text-xs text-neutral-400">Coba ubah kata kunci pencarian atau pilih album kegiatan yang lain.</p>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      <div
        v-for="(photo, idx) in mediaResponse.items"
        :key="photo.id"
        class="glass-card rounded-2xl overflow-hidden group cursor-pointer border border-neutral-800/80 flex flex-col shadow-lg"
        @click="openGallery(idx)"
      >
        <!-- Photo Container -->
        <div class="relative aspect-[4/3] overflow-hidden bg-neutral-900">
          <img
            :src="photo.thumbnailUrl"
            :alt="photo.title"
            loading="lazy"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          >

          <!-- Hover Overlay Icon -->
          <div class="absolute inset-0 bg-crimson-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-crimson-600/90 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>

          <!-- Album Badge -->
          <span v-if="photo.folderName" class="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-crimson-300 border border-crimson-500/20">
            {{ photo.folderName }}
          </span>
        </div>

        <!-- Info Card Footer -->
        <div class="p-3.5 flex flex-col justify-between flex-1 bg-neutral-900/40">
          <h4 class="font-bold text-sm text-neutral-100 group-hover:text-crimson-400 transition-colors line-clamp-1">
            {{ photo.title }}
          </h4>
          <div class="flex items-center justify-between text-[11px] text-neutral-400 mt-2">
            <span>{{ new Date(photo.createdTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
            <span class="text-crimson-400 font-medium">Buka ↗</span>
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
        <template v-for="(p, i) in displayedPages" :key="i">
          <span v-if="p === '...'" class="join-item btn btn-sm btn-disabled btn-ghost text-neutral-500 font-bold px-2 pointer-events-none">...</span>
          <button
            v-else
            class="join-item btn btn-sm rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 mx-0.5"
            :class="p === currentPage 
              ? 'bg-crimson-600 hover:bg-crimson-500 text-white font-bold border-crimson-400 shadow-[0_0_12px_rgba(215,25,58,0.4)]' 
              : 'btn-ghost text-neutral-300 hover:bg-neutral-800/80 hover:text-white'"
            @click="currentPage = Number(p)"
          >
            {{ p }}
          </button>
        </template>
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
