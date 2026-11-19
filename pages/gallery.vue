<script setup lang="ts">
import type { MediaFilterOptions } from '~/types/drive'
import { useDragScroll } from '~/composables/useDragScroll'
import { openMediaLightbox } from '~/composables/useLightbox'

const route = useRoute()
const router = useRouter()
const { getMedia, getFolders } = useGoogleDrive()

const initialType = (route.query.type === 'photo' || route.query.type === 'video') ? route.query.type : 'all'
const mediaType = ref<'all' | 'photo' | 'video'>(initialType)
const currentFolder = ref<string>('all')
const searchTerm = ref<string>('')
const sortBy = ref<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest')
const currentPage = ref<number>(1)

const albumTabsRef = ref<HTMLElement | null>(null)
useDragScroll(albumTabsRef)

const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const updateAlbumScrollState = () => {
  const el = albumTabsRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 2
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
}

const scrollAlbums = (direction: -1 | 1) => {
  const el = albumTabsRef.value
  if (!el) return
  el.scrollBy({ left: direction * Math.max(200, Math.round(el.clientWidth * 0.65)), behavior: 'smooth' })
}

const onAlbumWheel = (e: WheelEvent) => {
  const el = albumTabsRef.value
  if (!el || el.scrollWidth <= el.clientWidth) return
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault()
    el.scrollLeft += e.deltaY
  }
}

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

const { data: folders } = getFolders()
const { data: mediaResponse, pending: mediaPending } = getMedia(filterOptions)

watch(folders, () => {
  nextTick(updateAlbumScrollState)
})

onMounted(() => {
  nextTick(updateAlbumScrollState)
  window.addEventListener('resize', updateAlbumScrollState)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateAlbumScrollState)
})

const formatDuration = (ms?: number) => {
  if (!ms) return ''
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

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

watch([mediaType, currentFolder, searchTerm, sortBy], () => {
  currentPage.value = 1
})

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

const totalLabel = computed(() => {
  const count = mediaResponse.value?.total ?? 0
  const unit = mediaType.value === 'photo' ? 'foto' : mediaType.value === 'video' ? 'video' : 'arsip'
  return `${count} ${unit}`
})
</script>

<template>
  <div class="space-y-8 py-4 sm:py-8">
    <header class="anim-fade-up flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6" style="--delay: 0ms">
      <div class="space-y-1.5">
        <h1 class="text-2xl sm:text-4xl font-medium tracking-[-0.02em] text-[var(--text-primary)]">
          Galeri Foto &amp; Video
        </h1>
        <p class="text-sm text-[var(--text-secondary)] max-w-xl">
          Dokumentasi perjalanan Komunitas HS15 berdasarkan album dan jenis media.
        </p>
      </div>

      <p class="font-mono text-sm text-[var(--text-secondary)] tabular-nums shrink-0">
        {{ totalLabel }}
      </p>
    </header>

    <div class="anim-fade-up bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-4" style="--delay: 60ms">
      <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div class="inline-flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-subtle)] shrink-0 self-start">
          <button
            type="button"
            class="h-8 px-3 rounded-md text-xs font-medium whitespace-nowrap transition-[color,background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
            :class="mediaType === 'all'
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'"
            @click="setMediaType('all')"
          >
            Semua
          </button>
          <button
            type="button"
            class="h-8 px-3 rounded-md text-xs font-medium whitespace-nowrap transition-[color,background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
            :class="mediaType === 'photo'
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'"
            @click="setMediaType('photo')"
          >
            Foto
          </button>
          <button
            type="button"
            class="h-8 px-3 rounded-md text-xs font-medium whitespace-nowrap transition-[color,background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
            :class="mediaType === 'video'
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'"
            @click="setMediaType('video')"
          >
            Video
          </button>
        </div>

        <div class="flex items-center gap-1.5 min-w-0 flex-1 w-full lg:w-auto">
          <button
            v-if="canScrollLeft || canScrollRight"
            type="button"
            class="w-8 h-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-page)] hover:bg-[var(--bg-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center shrink-0 transition-[color,background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 disabled:opacity-30 disabled:pointer-events-none"
            :disabled="!canScrollLeft"
            aria-label="Geser daftar album ke kiri"
            @click="scrollAlbums(-1)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            ref="albumTabsRef"
            class="flex items-center gap-2 overflow-x-auto overflow-y-hidden flex-1 min-w-0 no-scrollbar cursor-grab active:cursor-grabbing select-none touch-pan-x"
            @scroll.passive="updateAlbumScrollState"
            @wheel="onAlbumWheel"
          >
            <button
              type="button"
              class="h-9 px-3 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-[color,background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
              :class="currentFolder === 'all'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]'"
              @click="currentFolder = 'all'"
            >
              Semua Album
            </button>
            <button
              v-for="folder in folders || []"
              :key="folder.id"
              type="button"
              class="h-9 px-3 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-[color,background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
              :class="currentFolder === folder.id
                ? 'bg-[var(--accent)] text-white'
                : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]'"
              @click="currentFolder = folder.id"
            >
              {{ folder.name }}
            </button>
          </div>

          <button
            v-if="canScrollLeft || canScrollRight"
            type="button"
            class="w-8 h-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-page)] hover:bg-[var(--bg-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center shrink-0 transition-[color,background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 disabled:opacity-30 disabled:pointer-events-none"
            :disabled="!canScrollRight"
            aria-label="Geser daftar album ke kanan"
            @click="scrollAlbums(1)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-3">
        <div class="relative w-full sm:w-80">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Cari foto atau video..."
            aria-label="Cari foto atau video"
            class="w-full h-9 bg-[var(--bg-page)] border border-[var(--border-subtle)] focus:border-[var(--border-strong)] focus:outline-none rounded-lg pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors duration-150"
          >
          <svg class="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <select
          v-model="sortBy"
          aria-label="Urutkan dokumentasi"
          class="h-9 bg-[var(--bg-page)] border border-[var(--border-subtle)] focus:border-[var(--border-strong)] focus:outline-none rounded-lg px-3 text-sm text-[var(--text-primary)] transition-colors duration-150 w-full sm:w-auto"
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="name-asc">Nama A-Z</option>
          <option value="name-desc">Nama Z-A</option>
        </select>
      </div>
    </div>

    <div v-if="mediaPending" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="n in 8"
        :key="n"
        class="skeleton-shimmer aspect-[4/3] rounded-xl border border-[var(--border-subtle)]"
      />
    </div>

    <div
      v-else-if="!mediaResponse?.items?.length"
      class="text-center py-12 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl max-w-md mx-auto px-6 space-y-3"
    >
      <div class="w-12 h-12 rounded-xl bg-[var(--bg-raised)] text-[var(--text-muted)] flex items-center justify-center mx-auto">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 class="text-base font-medium text-[var(--text-primary)]">
        Tidak ada dokumentasi ditemukan
      </h2>
      <p class="text-sm text-[var(--text-secondary)]">
        Coba ubah kata kunci pencarian, sesuaikan filter media, atau pilih album kegiatan yang lain.
      </p>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <button
        v-for="(item, idx) in mediaResponse.items"
        :key="item.id"
        type="button"
        class="rounded-xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-[border-color,transform] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 cursor-pointer flex flex-col group text-left"
        @click="openLightbox(idx)"
      >
        <div class="relative aspect-[4/3] w-full overflow-hidden bg-[var(--bg-raised)]">
          <img
            :src="item.thumbnailUrl"
            :alt="item.title || item.name"
            loading="lazy"
            width="400"
            height="300"
            class="w-full h-full object-cover"
          >

          <template v-if="item.type === 'video'">
            <div class="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-150 flex items-center justify-center pointer-events-none">
              <div class="w-11 h-11 rounded-full bg-black/75 border border-white/25 text-white flex items-center justify-center pl-0.5">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            <span
              v-if="item.durationMillis"
              class="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-white text-[11px] font-mono tabular-nums"
            >
              {{ formatDuration(item.durationMillis) }}
            </span>
          </template>

          <template v-else>
            <div class="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center pointer-events-none">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </div>
          </template>
        </div>

        <div class="p-3 space-y-1 w-full">
          <h2 class="text-sm font-medium text-[var(--text-primary)] truncate">
            {{ item.name || item.title }}
          </h2>
          <p class="text-xs font-mono tabular-nums text-[var(--text-muted)]">
            {{ formatDate(item.createdTime) }}
          </p>
        </div>
      </button>
    </div>

    <nav
      v-if="mediaResponse && mediaResponse.pages > 1"
      class="flex justify-center pt-4"
      aria-label="Navigasi halaman"
    >
      <div class="flex items-center flex-wrap justify-center gap-1.5">
        <button
          type="button"
          class="h-9 min-w-9 px-3 rounded-lg text-xs font-mono tabular-nums transition-[color,background-color,border-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-40 disabled:pointer-events-none"
          :disabled="currentPage <= 1"
          @click="currentPage--"
        >
          &laquo;<span class="hidden sm:inline">&nbsp;Sebelumnya</span>
        </button>

        <template v-for="(p, i) in displayedPages" :key="i">
          <span
            v-if="p === '...'"
            class="h-9 px-2 inline-flex items-center text-xs font-mono text-[var(--text-muted)]"
          >
            ...
          </span>
          <button
            v-else
            type="button"
            class="h-9 min-w-9 px-3 rounded-lg text-xs font-mono tabular-nums transition-[color,background-color,border-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
            :class="p === currentPage
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'"
            :aria-current="p === currentPage ? 'page' : undefined"
            @click="currentPage = Number(p)"
          >
            {{ p }}
          </button>
        </template>

        <button
          type="button"
          class="h-9 min-w-9 px-3 rounded-lg text-xs font-mono tabular-nums transition-[color,background-color,border-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-40 disabled:pointer-events-none"
          :disabled="currentPage >= mediaResponse.pages"
          @click="currentPage++"
        >
          <span class="hidden sm:inline">Selanjutnya&nbsp;</span>&raquo;
        </button>
      </div>
    </nav>
  </div>
</template>
