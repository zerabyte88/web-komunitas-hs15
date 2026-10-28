<script setup lang="ts">
import { Fancybox } from '@fancyapps/ui'

const { isDark } = useTheme()
const { getStats, getMedia } = useGoogleDrive()

const { data: stats, pending: statsPending } = await getStats()
const { data: recentPhotos, pending: photosPending } = await getMedia({
  type: 'photo',
  limit: 4,
  sort: 'newest'
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return ''
  }
}

const openLightbox = (index: number) => {
  if (!recentPhotos.value?.items?.length) return

  const galleryItems = recentPhotos.value.items.map(item => ({
    src: item.previewUrl,
    thumb: item.thumbnailUrl,
    caption: `
      <div class="gallery-caption-box">
        <div class="gallery-caption-title">${item.name}</div>
        <div class="gallery-caption-date">${formatDate(item.createdTime)}</div>
      </div>
    `,
    downloadSrc: item.downloadUrl
  }))

  Fancybox.show(galleryItems, {
    startIndex: index,
    Toolbar: {
      display: {
        left: [],
        middle: ['zoomIn', 'zoomOut', 'toggle1to1', 'rotateCCW', 'rotateCW'],
        right: ['slideshow', 'thumbs', 'download', 'close']
      }
    }
  })
}
</script>

<template>
  <div class="space-y-12 sm:space-y-16 py-2">
    <!-- Editorial Masthead Section -->
    <header class="space-y-6">
      <!-- Archival Docket Top Strip -->
      <div 
        class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b transition-colors"
        :class="isDark ? 'border-neutral-800' : 'border-slate-200'"
      >
        <div class="flex items-center gap-2.5 text-xs font-semibold tracking-wider uppercase">
          <span class="inline-block w-2 h-2 rounded-full bg-crimson-500" />
          <span :class="isDark ? 'text-neutral-300' : 'text-slate-700'">Arsip Dokumentasi Komunitas</span>
          <span :class="isDark ? 'text-neutral-600' : 'text-slate-400'">/</span>
          <span :class="isDark ? 'text-neutral-400' : 'text-slate-500'">Wilayah Kalimantan Selatan</span>
        </div>

        <!-- Integrated Live Archive Docket Bar -->
        <div 
          class="inline-flex items-center gap-2 sm:gap-3 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-colors"
          :class="isDark 
            ? 'bg-neutral-900/60 border-neutral-800 text-neutral-300' 
            : 'bg-white border-slate-200 text-slate-700 shadow-sm'"
        >
          <span class="font-bold text-crimson-500">
            <span v-if="statsPending" class="loading loading-dots loading-xs" />
            <span v-else>{{ stats?.photos ?? 0 }}</span>
          </span>
          <span>Foto</span>
          <span :class="isDark ? 'text-neutral-600' : 'text-slate-300'">·</span>
          <span class="font-bold text-crimson-500">
            <span v-if="statsPending" class="loading loading-dots loading-xs" />
            <span v-else>{{ stats?.videos ?? 0 }}</span>
          </span>
          <span>Video</span>
          <span :class="isDark ? 'text-neutral-600' : 'text-slate-300'">·</span>
          <span class="font-bold" :class="isDark ? 'text-neutral-200' : 'text-slate-800'">
            <span v-if="statsPending" class="loading loading-dots loading-xs" />
            <span v-else>{{ stats?.folders ?? 0 }}</span>
          </span>
          <span>Album Touring</span>
        </div>
      </div>

      <!-- Main Editorial Headline & Manifesto -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end pt-2">
        <div class="lg:col-span-8 space-y-4">
          <h1 
            class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]"
            :class="isDark ? 'text-white' : 'text-slate-900'"
          >
            Jejak Roda Dua di Sepanjang Aspal &amp; Alam <span class="text-crimson-500">Tanah Banjar</span>.
          </h1>
          <p 
            class="text-base sm:text-lg leading-relaxed max-w-2xl"
            :class="isDark ? 'text-neutral-300' : 'text-slate-600'"
          >
            Koleksi dokumentasi visual terbuka dari perjalanan touring dan agenda perkumpulan Komunitas HS15. Mengabadikan setiap kilometer jalanan, persinggahan rest point, dan kebersamaan di bumi Kalimantan Selatan.
          </p>
        </div>

        <!-- Regional Route Footnotes -->
        <div class="lg:col-span-4 lg:border-l lg:pl-6 space-y-2.5" :class="isDark ? 'border-neutral-800' : 'border-slate-200'">
          <span class="text-[11px] font-bold uppercase tracking-wider text-crimson-500">Lintas Penjelajahan</span>
          <div class="flex flex-wrap gap-1.5 text-xs">
            <span 
              v-for="route in ['Banjarmasin', 'Banjarbaru', 'Martapura', 'Kiram & Meratus', 'Tanah Laut', 'Banua Enam']"
              :key="route"
              class="px-2.5 py-1 rounded-lg border transition-colors"
              :class="isDark 
                ? 'bg-neutral-900/70 border-neutral-800 text-neutral-300' 
                : 'bg-slate-100 border-slate-200 text-slate-700'"
            >
              {{ route }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Navigation Entrances: Dual Archival Portals -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl sm:text-2xl font-black tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
            Pintu Masuk Arsip
          </h2>
          <p class="text-xs sm:text-sm" :class="isDark ? 'text-neutral-400' : 'text-slate-500'">
            Pilih direktori dokumentasi yang ingin Anda telusuri.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Portal 1: Galeri Foto -->
        <NuxtLink
          to="/photos"
          class="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 border hover:border-crimson-500/60"
        >
          <div class="space-y-5">
            <!-- Header Badge & Icon -->
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-crimson-500/15 text-crimson-400 border border-crimson-500/25">
                <span>Dokumentasi Foto Resolusi Penuh</span>
              </span>
              <div class="w-12 h-12 rounded-2xl bg-crimson-500/10 text-crimson-500 flex items-center justify-center border border-crimson-500/20 group-hover:scale-110 group-hover:bg-crimson-500 group-hover:text-white transition-all duration-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <!-- Title & Description -->
            <div class="space-y-2">
              <h3 class="text-2xl font-extrabold group-hover:text-crimson-500 transition-colors" :class="isDark ? 'text-white' : 'text-slate-900'">
                Galeri Foto Kegiatan
              </h3>
              <p class="text-sm leading-relaxed" :class="isDark ? 'text-neutral-300' : 'text-slate-600'">
                Koleksi potret berkualitas tinggi dari setiap agenda touring, titik henti santai, potret convoy, serta momen kebersamaan anggota HS15.
              </p>
            </div>

            <!-- Features / Metadata List -->
            <div class="grid grid-cols-2 gap-2 pt-2 text-xs font-medium" :class="isDark ? 'text-neutral-400' : 'text-slate-500'">
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-crimson-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Tinjau Lightbox Cepat</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-crimson-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Filter per Album Rute</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-crimson-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Unduh Berkas Asli</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-crimson-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ stats?.photos ?? 0 }} Foto Tersedia</span>
              </div>
            </div>
          </div>

          <!-- Bottom Action Bar -->
          <div 
            class="mt-8 pt-4 border-t flex items-center justify-between text-sm font-bold text-crimson-500 group-hover:text-crimson-400 transition-colors"
            :class="isDark ? 'border-neutral-800' : 'border-slate-100'"
          >
            <span>Masuk ke Galeri Foto</span>
            <div class="flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </NuxtLink>

        <!-- Portal 2: Galeri Video -->
        <NuxtLink
          to="/videos"
          class="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 border hover:border-crimson-500/60"
        >
          <div class="space-y-5">
            <!-- Header Badge & Icon -->
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-crimson-500/15 text-crimson-400 border border-crimson-500/25">
                <span>Dokumentasi Audio-Visual &amp; Vlog</span>
              </span>
              <div class="w-12 h-12 rounded-2xl bg-crimson-500/10 text-crimson-500 flex items-center justify-center border border-crimson-500/20 group-hover:scale-110 group-hover:bg-crimson-500 group-hover:text-white transition-all duration-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <!-- Title & Description -->
            <div class="space-y-2">
              <h3 class="text-2xl font-extrabold group-hover:text-crimson-500 transition-colors" :class="isDark ? 'text-white' : 'text-slate-900'">
                Galeri Video Touring
              </h3>
              <p class="text-sm leading-relaxed" :class="isDark ? 'text-neutral-300' : 'text-slate-600'">
                Rekaman visual dinamis saat berkendara di aspal, dokumentasi jalur perbukitan, serta video cuplikan perjalanan touring resmi komunitas.
              </p>
            </div>

            <!-- Features / Metadata List -->
            <div class="grid grid-cols-2 gap-2 pt-2 text-xs font-medium" :class="isDark ? 'text-neutral-400' : 'text-slate-500'">
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-crimson-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Pemutar Video Langsung</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-crimson-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Pilah Kategori Rute</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-crimson-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Tampilan Penuh HD</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-crimson-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ stats?.videos ?? 0 }} Video Tersedia</span>
              </div>
            </div>
          </div>

          <!-- Bottom Action Bar -->
          <div 
            class="mt-8 pt-4 border-t flex items-center justify-between text-sm font-bold text-crimson-500 group-hover:text-crimson-400 transition-colors"
            :class="isDark ? 'border-neutral-800' : 'border-slate-100'"
          >
            <span>Masuk ke Galeri Video</span>
            <div class="flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Regional & Community Grounding Section -->
    <section 
      class="glass-panel rounded-3xl p-6 sm:p-8 md:p-10 border transition-colors space-y-6"
      :class="isDark ? 'border-neutral-800' : 'border-slate-200'"
    >
      <div class="max-w-3xl space-y-2">
        <span class="text-xs font-bold uppercase tracking-wider text-crimson-500">Mengenal Komunitas</span>
        <h2 class="text-2xl sm:text-3xl font-black tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
          HS15: Menjelajah Bumi Kalimantan Selatan
        </h2>
        <p class="text-sm sm:text-base leading-relaxed" :class="isDark ? 'text-neutral-300' : 'text-slate-600'">
          Komunitas Keliling Banjar bukan sebatas kelompok pengendara roda dua, melainkan ruang berkumpul untuk menyusuri rute nyata, merekam dinamika jalanan, dan menjaga silaturahmi di setiap sudut banua.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div class="space-y-2">
          <div class="text-xs font-bold uppercase tracking-wide" :class="isDark ? 'text-white' : 'text-slate-900'">
            Rute Aspal &amp; Pegunungan
          </div>
          <p class="text-xs sm:text-sm leading-relaxed" :class="isDark ? 'text-neutral-400' : 'text-slate-500'">
            Menyusuri jalur perkotaan Banjarbaru dan Martapura hingga tantangan kontur jalan perbukitan Kiram dan lereng Pegunungan Meratus.
          </p>
        </div>

        <div class="space-y-2">
          <div class="text-xs font-bold uppercase tracking-wide" :class="isDark ? 'text-white' : 'text-slate-900'">
            Dokumentasi Lapangan Nyata
          </div>
          <p class="text-xs sm:text-sm leading-relaxed" :class="isDark ? 'text-neutral-400' : 'text-slate-500'">
            Tanpa rekayasa panggung, setiap foto dan video merekam cuaca, medan aspal, canda tawa di warung kopi, dan persaudaraan tanpa sekat.
          </p>
        </div>

        <div class="space-y-2">
          <div class="text-xs font-bold uppercase tracking-wide" :class="isDark ? 'text-white' : 'text-slate-900'">
            Penyimpanan Terbuka &amp; Terarsip
          </div>
          <p class="text-xs sm:text-sm leading-relaxed" :class="isDark ? 'text-neutral-400' : 'text-slate-500'">
            Terhubung langsung ke Google Drive API, memastikan seluruh anggota dapat mengakses file dokumentasi orisinal dalam resolusi penuh.
          </p>
        </div>
      </div>
    </section>

    <!-- Recent Highlights (Sorotan Dokumentasi Terkini) -->
    <section class="space-y-6 pt-2">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div class="space-y-1">
          <span class="text-xs font-bold uppercase tracking-wider text-crimson-500">Pembaruan Terbaru</span>
          <h2 class="text-2xl sm:text-3xl font-black tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
            Sorotan Dokumentasi Terkini
          </h2>
          <p class="text-xs sm:text-sm" :class="isDark ? 'text-neutral-400' : 'text-slate-500'">
            Empat potret terbaru dari arsip kegiatan. Klik untuk memperbesar dalam resolusi tinggi.
          </p>
        </div>

        <NuxtLink 
          to="/photos" 
          class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-crimson-500 hover:text-crimson-400 transition-colors group shrink-0"
        >
          <span>Buka Semua Foto</span>
          <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>

      <!-- Loading Skeleton State -->
      <div v-if="photosPending" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          v-for="n in 4" 
          :key="n"
          class="rounded-2xl overflow-hidden glass-card aspect-[4/3] skeleton-shimmer"
        />
      </div>

      <!-- Photos Grid -->
      <div v-else-if="recentPhotos?.items?.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(photo, idx) in recentPhotos.items"
          :key="photo.id"
          class="group relative rounded-2xl overflow-hidden glass-card aspect-[4/3] cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
          @click="openLightbox(idx)"
        >
          <img
            :src="photo.thumbnailUrl"
            :alt="photo.title || photo.name"
            loading="lazy"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          >
          
          <!-- Subtle Top Folder Badge -->
          <div class="absolute top-2.5 left-2.5 z-10">
            <span class="inline-block px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white/90 border border-white/10">
              {{ photo.folderName || 'Umum' }}
            </span>
          </div>

          <!-- Bottom Gradient Caption Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3.5 flex flex-col justify-end">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-bold text-white truncate drop-shadow-sm">
                {{ photo.name || photo.title }}
              </span>
              <span class="p-1 rounded-md bg-white/20 text-white shrink-0">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </span>
            </div>
            <span class="text-[10px] text-neutral-300 mt-0.5">
              {{ formatDate(photo.createdTime) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div 
        v-else 
        class="glass-card rounded-2xl p-8 text-center border"
        :class="isDark ? 'border-neutral-800 text-neutral-400' : 'border-slate-200 text-slate-500'"
      >
        <p class="text-sm">Belum ada foto arsip yang dimuat.</p>
      </div>
    </section>
  </div>
</template>