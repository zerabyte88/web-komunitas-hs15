<script setup lang="ts">
const { isDark } = useTheme()
const { getStats, getMedia } = useGoogleDrive()

const [{ data: stats, pending: statsPending }, { data: recentPhotos, pending: photosPending }] = await Promise.all([
  getStats(),
  getMedia({
    type: 'photo',
    limit: 4,
    sort: 'newest'
  })
])

const formatDate = (dateStr: string) => {
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

const openLightbox = (index: number) => openMediaLightbox(recentPhotos.value?.items ?? [], index)
</script>

<template>
  <div class="space-y-12 sm:space-y-16 py-2">
    <!-- Editorial Masthead Section -->
    <header class="space-y-6">
      <!-- Archival Docket Top Strip -->
      <div 
        class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b transition-colors"
        :class="isDark ? 'border-white/15' : 'border-slate-300'"
      >
        <div class="flex items-center gap-2.5 text-xs font-semibold tracking-wider uppercase">
          <span class="inline-block w-2 h-2 rounded-full bg-crimson-500" />
          <span :class="isDark ? 'text-neutral-200' : 'text-slate-800'">Dokumentasi</span>
          <span :class="isDark ? 'text-neutral-500' : 'text-slate-400'">/</span>
          <span :class="isDark ? 'text-neutral-300' : 'text-slate-600'">Wilayah Kalimantan Selatan</span>
        </div>

        <!-- Integrated Live Archive Docket Bar -->
        <div 
          class="inline-flex items-center gap-2 sm:gap-3 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-colors"
          :class="isDark 
            ? 'bg-neutral-900/70 border-neutral-800 text-neutral-300' 
            : 'bg-white/90 border-slate-200 text-slate-700 shadow-sm'"
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
          <span class="font-bold text-crimson-500">
            <span v-if="statsPending" class="loading loading-dots loading-xs" />
            <span v-else>{{ stats?.folders ?? 0 }}</span>
          </span>
          <span>Album</span>
        </div>
      </div>

      <!-- Main Editorial Headline & Manifesto -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end pt-2">
        <div class="lg:col-span-8 space-y-4">
          <h1 
            class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]"
            :class="isDark ? 'text-white' : 'text-slate-900'"
          >
            Rekam Jejak Touring dan <span class="text-crimson-500">Momen Kebersamaan.</span>
          </h1>
          <p 
            class="text-base sm:text-lg leading-relaxed max-w-2xl"
            :class="isDark ? 'text-neutral-200' : 'text-slate-700'"
          >
          Dokumentasi ini didedikasikan untuk mengarsipkan setiap momen perjalanan touring dan pertemuan Komunitas HS15. Website ini menangkap esensi perjalanan di jalanan Kalimantan, dinamika di titik peristirahatan, serta nilai solidaritas yang menyatukan kami.
          </p>
        </div>

        <!-- Regional Route Footnotes -->
        <div 
          class="lg:col-span-4 lg:border-l lg:pl-6 space-y-2.5"
          :class="isDark ? 'lg:border-white/15' : 'lg:border-slate-300'"
        >
          <span class="text-[11px] font-bold uppercase tracking-wider text-crimson-500">Lintas Perjalanan</span>
          <div class="flex flex-wrap gap-1.5 text-xs">
            <span 
              v-for="route in ['Banjarmasin', 'Banjarbaru', 'Pelaihari']"
              :key="route"
              class="px-2.5 py-1 rounded-lg border backdrop-blur-sm"
              :class="isDark 
                ? 'border-white/15 bg-black/40 text-neutral-200' 
                : 'border-slate-300 bg-white/70 text-slate-700 shadow-sm'"
            >
              {{ route }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Navigation Entrance: Unified Archival Portal -->
    <section class="space-y-4">

      <div class="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 border hover:border-crimson-500/60">
        <div class="space-y-5">

          <!-- Title & Description -->
          <div class="space-y-2 max-w-2xl">
            <h2 class="text-2xl font-extrabold" :class="isDark ? 'text-white' : 'text-slate-900'">
              Galeri Foto &amp; Video Kegiatan
            </h2>
            <p class="text-sm leading-relaxed" :class="isDark ? 'text-neutral-300' : 'text-slate-600'">
              Koleksi potret dan rekaman video dari setiap agenda touring, titik henti, perjalanan di jalanan Kalimantan, serta momen kebersamaan anggota HS15.
            </p>
          </div>

          <!-- Features / Metadata List -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-medium" :class="isDark ? 'text-neutral-300' : 'text-slate-700'">
            <div class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-crimson-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ stats?.photos ?? 0 }} Foto Tersedia</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-crimson-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ stats?.videos ?? 0 }} Video Tersedia</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-crimson-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Filter Foto &amp; Video</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-crimson-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Filter per Album &amp; Unduh</span>
            </div>
          </div>
        </div>

        <!-- Bottom Action Bar with Quick Filters -->
        <div 
          class="mt-8 pt-5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          :class="isDark ? 'border-neutral-800' : 'border-slate-100'"
        >
          <NuxtLink
            to="/gallery"
            class="inline-flex items-center gap-2 text-sm font-bold text-crimson-500 hover:text-crimson-400 transition-colors group"
          >
            <span>Buka Galeri</span>
            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </NuxtLink>

        </div>
      </div>
    </section>

    <!-- Regional & Community Grounding Section -->
    <section 
      class="glass-panel rounded-3xl p-6 sm:p-8 md:p-10 border transition-colors space-y-6"
      :class="isDark ? 'border-neutral-800' : 'border-slate-200'"
    >
      <div class="max-w-3xl space-y-2">
        <span class="text-xs font-bold uppercase tracking-wider text-crimson-500">Mengenal Kami</span>
        <h2 class="text-2xl sm:text-3xl font-black tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
          HS15 - Komunitas Keliling Banjar
        </h2>
        <p class="text-sm sm:text-base leading-relaxed" :class="isDark ? 'text-neutral-300' : 'text-slate-600'">
          Komunitas HS15 bukan sebatas kelompok pengendara roda dua, melainkan komunitas berkumpul untuk menyusuri alam, merekam perjalanan, dan menjaga silaturahmi sesama anggota di setiap sudut banua.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div class="space-y-2">
          <div class="text-xs font-bold uppercase tracking-wide" :class="isDark ? 'text-white' : 'text-slate-900'">
            Rute Aspal &amp; Alam
          </div>
          <p class="text-xs sm:text-sm leading-relaxed" :class="isDark ? 'text-neutral-400' : 'text-slate-500'">
            Menyusuri jalur perkotaan dan pedesaan hingga tantangan jalan berpasir dan bebatuan.
          </p>
        </div>

        <div class="space-y-2">
          <div class="text-xs font-bold uppercase tracking-wide" :class="isDark ? 'text-white' : 'text-slate-900'">
            Dokumentasi Lapangan
          </div>
          <p class="text-xs sm:text-sm leading-relaxed" :class="isDark ? 'text-neutral-400' : 'text-slate-500'">
            Setiap foto dan video merekam perjalanan, cuaca, medan, canda tawa, dan persaudaraan.
          </p>
        </div>

        <div class="space-y-2">
          <div class="text-xs font-bold uppercase tracking-wide" :class="isDark ? 'text-white' : 'text-slate-900'">
            Penyimpanan Terbuka &amp; Terarsip
          </div>
          <p class="text-xs sm:text-sm leading-relaxed" :class="isDark ? 'text-neutral-400' : 'text-slate-500'">
            Memastikan seluruh anggota dapat mengakses file dokumentasi orisinal dengan mudah dan cepat.
          </p>
        </div>
      </div>
    </section>

    <!-- Recent Highlights (Sorotan Dokumentasi Terkini) -->
    <section class="space-y-6 pt-2">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div class="space-y-1">
          <span class="text-xs font-bold uppercase tracking-wider text-crimson-500">Sorotan Terbaru</span>
          <h2 
            class="text-2xl sm:text-3xl font-black tracking-tight"
            :class="isDark ? 'text-white' : 'text-slate-900'"
          >
            Sorotan Dokumentasi Terkini
          </h2>
          <p 
            class="text-xs sm:text-sm"
            :class="isDark ? 'text-neutral-300' : 'text-slate-600'"
          >
            Cuplikan beberapa dokumentasi terbaru.
          </p>
        </div>
      </div>

      <!-- Loading Skeleton State -->
      <div v-if="photosPending" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div 
          v-for="n in 4" 
          :key="n"
          class="rounded-2xl overflow-hidden glass-card aspect-[4/3] skeleton-shimmer"
        />
      </div>

      <!-- Photos Grid -->
      <div v-else-if="recentPhotos?.items?.length" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
            <span class="text-[10px] text-white/80 mt-0.5">
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
        <p class="text-sm">Belum ada arsip yang dimuat.</p>
      </div>
    </section>
  </div>
</template>