<script setup lang="ts">
import type { MediaFilterOptions } from '~/types/drive'
import { useDragScroll } from '~/composables/useDragScroll'

const route = useRoute()
const router = useRouter()
const { isDark } = useTheme()
const { getMedia, getFolders } = useGoogleDrive()

const initialType = (route.query.type === 'photo' || route.query.type === 'video') ? route.query.type : 'all'
const mediaType = ref<'all' | 'photo' | 'video'>(initialType)
const currentFolder = ref<string>('all')
const searchTerm = ref<string>('')
const sortBy = ref<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest')
const currentPage = ref<number>(1)

const albumTabsRef = ref<HTMLElement | null>(null)
useDragScroll(albumTabsRef)

watch(() => route.query.type, (newType) => {
  if (newType === 'photo' || newType === 'video') {
    mediaType.value = newType
  } else if (!newType) {
    mediaType.value = 'all'
  }
})

const setMediaType = (type: 'all' | 'photo' | 'video') => {
  mediaType.value = type
  router.replace({
    query: {
      ...route.query,
      type: type === 'all' ? undefined : type
    }
  })
}

const filterOptions = computed<MediaFilterOptions>(() => ({
  type: mediaType.value === 'all' ? undefined : mediaType.value,
  folderId: currentFolder.value === 'all' ? undefined : currentFolder.value,
  search: searchTerm.value || undefined,
  sort: sortBy.value,
  page: currentPage.value,
  limit: 16
}))

// Fetch folders and media
const [{ data: folders }, { data: mediaResponse, pending: mediaPending }] = await Promise.all([
  getFolders(),
  getMedia(filterOptions)
])

// Format duration helper (milliseconds to MM:SS)
const formatDuration = (ms?: number) => {
  if (!ms) return ''
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// Format date helper
const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Makassar'
    })
  } catch {
    return ''
  }
}

const openLightbox = (startIndex: number) => openMediaLightbox(mediaResponse.value?.items ?? [], startIndex)

// Watch filters to reset page to 1
watch([mediaType, currentFolder, searchTerm, sortBy], () => {
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
    <div 
      class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6"
      :class="isDark ? 'border-neutral-800/80' : 'border-slate-300'"
    >
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-600 text-white border border-crimson-400 text-xs font-semibold shadow-sm">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Galeri Dokumentasi</span>
        </div>
        <h1 
          class="text-3xl sm:text-4xl font-extrabold tracking-tight"
          :class="isDark ? 'text-white' : 'text-slate-900'"
        >
          Galeri Foto &amp; Video
        </h1>
        <p 
          class="text-sm max-w-xl"
          :class="isDark ? 'text-neutral-300' : 'text-slate-600'"
        >
          Kumpulan hasil dokumentasi foto dan video dari perjalanan Komunitas HS15.
        </p>
      </div>

      <!-- Quick Total Count -->
      <div class="text-left md:text-right">
        <div class="inline-flex flex-col items-start md:items-end px-3.5 py-1.5 rounded-2xl border border-white/60 bg-white/40 dark:bg-black/20 dark:border-white/15 backdrop-blur-sm shadow-sm">
          <div 
            class="text-[11px] font-medium"
            :class="isDark ? 'text-neutral-400' : 'text-slate-600'"
          >
            {{ mediaType === 'photo' ? 'Total Foto' : mediaType === 'video' ? 'Total Video' : 'Total Arsip' }}
          </div>
          <div class="text-2xl font-black text-crimson-500">
            {{ mediaResponse?.total ?? 0 }}
            <span 
              class="text-xs font-normal"
              :class="isDark ? 'text-neutral-400' : 'text-slate-600'"
            >
              {{ mediaType === 'photo' ? 'Foto' : mediaType === 'video' ? 'Video' : 'Arsip' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="glass-panel p-4 rounded-2xl flex flex-col gap-4 border border-neutral-800 shadow-md">
      <!-- Top Row: Media Type Filter & Album Tabs -->
      <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <!-- Media Type Selector -->
        <div class="flex items-center gap-1.5 p-1 rounded-2xl border border-neutral-800 bg-neutral-900/60 shrink-0 self-start">
          <button
            type="button"
            class="btn btn-sm rounded-xl px-3.5 text-xs font-semibold whitespace-nowrap transition-all duration-200"
            :class="mediaType === 'all' 
              ? 'bg-crimson-600 hover:bg-crimson-500 !text-white btn-active-album border-crimson-400 shadow-[0_0_12px_rgba(215,25,58,0.4)]' 
              : 'btn-ghost album-tab-inactive border-transparent'"
            @click="setMediaType('all')"
          >
            Semua
          </button>
          <button
            type="button"
            class="btn btn-sm rounded-xl px-3.5 text-xs font-semibold whitespace-nowrap transition-all duration-200"
            :class="mediaType === 'photo' 
              ? 'bg-crimson-600 hover:bg-crimson-500 !text-white btn-active-album border-crimson-400 shadow-[0_0_12px_rgba(215,25,58,0.4)]' 
              : 'btn-ghost album-tab-inactive border-transparent'"
            @click="setMediaType('photo')"
          >
            Foto
          </button>
          <button
            type="button"
            class="btn btn-sm rounded-xl px-3.5 text-xs font-semibold whitespace-nowrap transition-all duration-200"
            :class="mediaType === 'video' 
              ? 'bg-crimson-600 hover:bg-crimson-500 !text-white btn-active-album border-crimson-400 shadow-[0_0_12px_rgba(215,25,58,0.4)]' 
              : 'btn-ghost album-tab-inactive border-transparent'"
            @click="setMediaType('video')"
          >
            Video
          </button>
        </div>

        <!-- Folder/Album Tabs -->
        <div
          ref="albumTabsRef"
          class="flex items-center gap-2 overflow-x-auto overflow-y-hidden w-full lg:w-auto py-1 scrollbar-none no-scrollbar cursor-grab active:cursor-grabbing select-none touch-pan-x"
        >
          <button
            type="button"
            class="btn btn-sm rounded-xl px-4 text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
            :class="currentFolder === 'all' 
              ? 'bg-crimson-600 hover:bg-crimson-500 !text-white btn-active-album border-crimson-400 shadow-[0_0_12px_rgba(215,25,58,0.4)]' 
              : 'btn-ghost album-tab-inactive border-transparent'"
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
              ? 'bg-crimson-600 hover:bg-crimson-500 !text-white btn-active-album border-crimson-400 shadow-[0_0_12px_rgba(215,25,58,0.4)]' 
              : 'btn-ghost album-tab-inactive border-transparent'"
            @click="currentFolder = folder.id"
          >
            {{ folder.name }}
          </button>
        </div>
      </div>

      <!-- Bottom Row: Search & Sort Controls -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-neutral-800/60">
        <!-- Search Input -->
        <div class="relative w-full sm:w-80">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Cari foto atau video..."
            class="input input-sm input-bordered w-full bg-neutral-900 border-neutral-700 search-control-white rounded-xl pl-8 text-xs focus:border-crimson-500"
          >
          <svg class="w-4 h-4 text-neutral-300 absolute left-2.5 top-2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Sort Select -->
        <div class="w-full sm:w-auto flex items-center justify-end">
          <select
            v-model="sortBy"
            class="select select-sm select-bordered bg-neutral-900 border-neutral-700 select-control-white rounded-xl text-xs focus:border-crimson-500 w-full sm:w-auto"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="name-asc">Nama A-Z</option>
            <option value="name-desc">Nama Z-A</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Media Grid -->
    <div v-if="mediaPending" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      <div v-for="n in 8" :key="n" class="skeleton-shimmer aspect-[4/3] rounded-2xl" />
    </div>

    <div v-else-if="!mediaResponse?.items?.length" class="text-center py-16 glass-card rounded-3xl max-w-lg mx-auto p-8 space-y-4">
      <div class="w-16 h-16 rounded-2xl bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 
        class="text-lg font-bold"
        :class="isDark ? 'text-white' : 'text-slate-900'"
      >
        Tidak ada dokumentasi ditemukan
      </h2>
      <p 
        class="text-xs"
        :class="isDark ? 'text-neutral-300' : 'text-slate-600'"
      >
        Coba ubah kata kunci pencarian, sesuaikan filter media, atau pilih album kegiatan yang lain.
      </p>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      <div
        v-for="(item, idx) in mediaResponse.items"
        :key="item.id"
        class="glass-card rounded-2xl overflow-hidden group cursor-pointer border border-neutral-800/80 flex flex-col shadow-lg hover:border-crimson-500/60 transition-all duration-300"
        @click="openLightbox(idx)"
      >
        <!-- Media Container -->
        <div class="relative aspect-[4/3] overflow-hidden bg-neutral-900">
          <img
            :src="item.thumbnailUrl"
            :alt="item.title || item.name"
            loading="lazy"
            width="400"
            height="300"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          >

          <!-- Video Overlays -->
          <template v-if="item.type === 'video'">
            <!-- Center Play Button Overlay -->
            <div class="absolute inset-0 bg-black/35 group-hover:bg-crimson-950/40 transition-colors flex items-center justify-center pointer-events-none">
              <div class="w-12 h-12 rounded-full bg-crimson-600/90 text-white flex items-center justify-center shadow-[0_0_20px_rgba(215,25,58,0.6)] transform group-hover:scale-110 transition-transform pl-0.5">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            <!-- Duration Badge -->
            <span v-if="item.durationMillis" class="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/80 text-white backdrop-blur-sm">
              {{ formatDuration(item.durationMillis) }}
            </span>
          </template>

          <!-- Photo Overlays -->
          <template v-else>
            <!-- Center Zoom Overlay on Hover -->
            <div class="absolute inset-0 bg-crimson-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <div class="w-10 h-10 rounded-full bg-crimson-600/90 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </template>
        </div>

        <!-- Info Card Footer -->
        <div 
          class="p-2.5 sm:p-3.5 flex flex-col justify-between flex-1 transition-colors media-card-footer"
          :class="isDark ? 'bg-neutral-900/40' : 'bg-white/90'"
        >
          <h2 
            class="font-bold text-xs sm:text-sm group-hover:text-crimson-500 transition-colors line-clamp-1"
            :class="isDark ? 'text-neutral-100' : 'text-slate-900'"
          >
            {{ item.name || item.title }}
          </h2>
          <div 
            class="flex items-center justify-between text-[11px] mt-1.5 sm:mt-2"
            :class="isDark ? 'text-neutral-400' : 'text-slate-600'"
          >
            <span>{{ formatDate(item.createdTime) }}</span>
            <span class="hidden sm:inline text-crimson-500 font-medium">
              {{ item.type === 'video' ? 'Putar Video ↗' : 'Lihat Foto ↗' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="mediaResponse && mediaResponse.pages > 1" class="flex justify-center pt-8">
      <div class="join glass-panel rounded-2xl border border-neutral-800 p-1.5 shadow-md">
        <button
          class="join-item btn btn-sm btn-ghost album-tab-inactive rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
          :disabled="currentPage <= 1"
          @click="currentPage--"
        >
          &laquo;<span class="hidden sm:inline">&nbsp;Sebelumnya</span>
        </button>
        <template v-for="(p, i) in displayedPages" :key="i">
          <span v-if="p === '...'" class="join-item btn btn-sm btn-disabled btn-ghost text-neutral-500 font-bold px-2 pointer-events-none">...</span>
          <button
            v-else
            class="join-item btn btn-sm rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 mx-0.5"
            :class="p === currentPage 
              ? 'bg-crimson-600 hover:bg-crimson-500 !text-white font-bold border-crimson-400 shadow-[0_0_12px_rgba(215,25,58,0.4)]' 
              : 'btn-ghost album-tab-inactive'"
            @click="currentPage = Number(p)"
          >
            {{ p }}
          </button>
        </template>
        <button
          class="join-item btn btn-sm btn-ghost album-tab-inactive rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
          :disabled="currentPage >= mediaResponse.pages"
          @click="currentPage++"
        >
          <span class="hidden sm:inline">Selanjutnya&nbsp;</span>&raquo;
        </button>
      </div>
    </div>
  </div>
</template>

