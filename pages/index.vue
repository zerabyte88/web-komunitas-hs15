<script setup lang="ts">
import { openMediaLightbox } from '~/composables/useLightbox'

const { isDark } = useTheme()
const { getStats, getMedia } = useGoogleDrive()

const { data: stats, pending: statsPending } = getStats()
const { data: recentPhotos, pending: photosPending } = getMedia({
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
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end">
        <div class="lg:col-span-8 space-y-4">
          <h1 
            class="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.15]"
            :class="isDark ? 'text-white' : 'text-slate-900'"
          >
            Rekam Jejak Touring dan <span class="text-crimson-500">Momen Kebersamaan</span>
          </h1>
          <p 
            class="text-base sm:text-lg leading-relaxed max-w-2xl"
            :class="isDark ? 'text-neutral-200' : 'text-slate-700'"
          >
            Dokumentasi ini didedikasikan untuk mengarsipkan setiap momen perjalanan touring dan pertemuan Komunitas HS15. Menangkap esensi perjalanan di jalanan Kalimantan, dinamika di titik peristirahatan, serta nilai solidaritas yang menyatukan kami.
          </p>
        </div>

        <!-- Regional Route Footnotes & Stats Pill -->
        <div 
          class="lg:col-span-4 lg:border-l lg:pl-6 space-y-4"
          :class="isDark ? 'lg:border-neutral-800' : 'lg:border-slate-300'"
        >
          <!-- Live Archive Docket Bar -->
          <div>
            <div 
              class="inline-flex items-center gap-2 sm:gap-3 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-colors home-stats-pill"
              :class="isDark 
                ? 'bg-neutral-900/90 border-neutral-800 text-neutral-300' 
                : 'bg-white border-slate-200 text-slate-700 shadow-sm'"
            >
              <span class="font-semibold text-crimson-500 tabular-nums">
                <span v-if="statsPending" class="loading loading-dots loading-xs" />
                <span v-else>{{ stats?.photos ?? 0 }}</span>
              </span>
              <span>Foto</span>
              <span :class="isDark ? 'text-neutral-600' : 'text-slate-300'">·</span>
              <span class="font-semibold text-crimson-500 tabular-nums">
                <span v-if="statsPending" class="loading loading-dots loading-xs" />
                <span v-else>{{ stats?.videos ?? 0 }}</span>
              </span>
              <span>Video</span>
              <span :class="isDark ? 'text-neutral-600' : 'text-slate-300'">·</span>
              <span class="font-semibold text-crimson-500 tabular-nums">
                <span v-if="statsPending" class="loading loading-dots loading-xs" />
                <span v-else>{{ stats?.folders ?? 0 }}</span>
              </span>
              <span>Album</span>
            </div>
          </div>

          <div class="space-y-2">
            <span class="text-[11px] font-medium text-crimson-500">Lintas rute banua</span>
            <div class="flex flex-wrap items-center gap-1.5 text-xs">
              <span 
                v-for="route in ['Banjarmasin', 'Banjarbaru', 'Pelaihari']"
                :key="route"
                class="px-2.5 py-1 rounded-lg border text-xs font-medium home-route-badge transition-colors"
                :class="isDark 
                  ? 'border-neutral-800 bg-neutral-900/90 text-neutral-300' 
                  : 'border-slate-200 bg-white/95 text-slate-700 shadow-sm'"
              >
                {{ route }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Regional & Community Grounding Section (Mengenal HS15) -->
    <section 
      class="rounded-2xl p-6 sm:p-8 md:p-10 border transition-colors space-y-6"
      :class="isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white/95 border-slate-200 shadow-sm'"
    >
      <div class="max-w-3xl space-y-2">
        <span class="text-xs font-medium text-crimson-500">Mengenal HS15</span>
        <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
          HS15 - Komunitas Keliling Banjar
        </h2>
        <p class="text-sm sm:text-base leading-relaxed" :class="isDark ? 'text-neutral-300' : 'text-slate-600'">
          Komunitas HS15 bukan sebatas kelompok touring, melainkan wadah berkumpul untuk menyusuri alam, merekam perjalanan, dan menjaga silaturahmi sesama anggota di setiap sudut banua.
        </p>
      </div>

      <div 
        class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t"
        :class="isDark ? 'border-neutral-800' : 'border-slate-100'"
      >
        <div class="space-y-2">
          <h3 class="text-sm font-semibold home-subheading" :class="isDark ? 'text-white' : 'text-slate-900'">
            Rute aspal &amp; alam
          </h3>
          <p class="text-xs sm:text-sm leading-relaxed" :class="isDark ? 'text-neutral-400' : 'text-slate-500'">
            Menyusuri jalur perkotaan dan pedesaan hingga tantangan jalan berpasir dan bebatuan.
          </p>
        </div>

        <div class="space-y-2">
          <h3 class="text-sm font-semibold home-subheading" :class="isDark ? 'text-white' : 'text-slate-900'">
            Dokumentasi lapangan
          </h3>
          <p class="text-xs sm:text-sm leading-relaxed" :class="isDark ? 'text-neutral-400' : 'text-slate-500'">
            Setiap foto dan video merekam rute perjalanan, kondisi cuaca, medan lintasan, serta kebersamaan anggota.
          </p>
        </div>

        <div class="space-y-2">
          <h3 class="text-sm font-semibold home-subheading" :class="isDark ? 'text-white' : 'text-slate-900'">
            Arsip terbuka &amp; terstruktur
          </h3>
          <p class="text-xs sm:text-sm leading-relaxed" :class="isDark ? 'text-neutral-400' : 'text-slate-500'">
            Memastikan seluruh anggota dan penikmat touring dapat menelusuri berkas dokumentasi asli dengan mudah.
          </p>
        </div>
      </div>
    </section>

    <!-- Recent Highlights (Sorotan Dokumentasi Terkini) -->
    <section class="space-y-6 pt-2">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div class="space-y-1">
          <span class="text-xs font-medium text-crimson-500">Sorotan dokumentasi</span>
          <h2 
            class="text-2xl sm:text-3xl font-semibold tracking-tight"
            :class="isDark ? 'text-white' : 'text-slate-900'"
          >
            Sorotan Dokumentasi Terkini
          </h2>
          <p 
            class="text-xs sm:text-sm"
            :class="isDark ? 'text-neutral-400' : 'text-slate-600'"
          >
            Cuplikan dokumentasi ekspedisi dan agenda perjalanan terbaru.
          </p>
        </div>

        <!-- Integrated CTA to Gallery -->
        <NuxtLink
          to="/gallery"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 group shrink-0 border"
          :class="isDark 
            ? 'bg-neutral-900/90 border-neutral-800 text-neutral-200 hover:text-white hover:border-neutral-700' 
            : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-sm'"
        >
          <span>Lihat Semua Galeri</span>
          <svg class="w-4 h-4 text-crimson-500 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </NuxtLink>
      </div>

      <!-- Loading Skeleton State -->
      <div v-if="photosPending" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div 
          v-for="n in 4" 
          :key="n"
          class="rounded-xl overflow-hidden aspect-[4/3] skeleton-shimmer border"
          :class="isDark ? 'border-neutral-800' : 'border-slate-200'"
        />
      </div>

      <!-- Photos Grid -->
      <div v-else-if="recentPhotos?.items?.length" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          v-for="(photo, idx) in recentPhotos.items"
          :key="photo.id"
          class="group relative rounded-xl overflow-hidden aspect-[4/3] cursor-pointer border transition-colors duration-200"
          :class="isDark 
            ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700' 
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'"
          @click="openLightbox(idx)"
        >
          <img
            :src="photo.thumbnailUrl"
            :alt="photo.title || photo.name"
            loading="lazy"
            width="400"
            height="300"
            class="w-full h-full object-cover"
          >

          <!-- Calm Bottom Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3 sm:p-3.5 flex flex-col justify-end">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-medium text-white truncate drop-shadow-sm">
                {{ photo.name || photo.title }}
              </span>
              <span class="p-1 rounded-md bg-white/20 text-white shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </span>
            </div>
            <span class="text-[11px] text-neutral-300 tabular-nums mt-0.5">
              {{ formatDate(photo.createdTime) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div 
        v-else 
        class="rounded-2xl p-8 text-center border"
        :class="isDark ? 'bg-neutral-900/90 border-neutral-800 text-neutral-400' : 'bg-white/95 border-slate-200 text-slate-500 shadow-sm'"
      >
        <p class="text-sm">Belum ada arsip yang dimuat.</p>
      </div>
    </section>
  </div>
</template>
