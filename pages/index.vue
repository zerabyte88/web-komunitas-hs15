<script setup lang="ts">
import { openMediaLightbox } from '~/composables/useLightbox'

const { getStats, getMedia } = useGoogleDrive()

const { data: stats, pending: statsPending } = getStats()
const { data: recentMedia, pending: mediaPending } = getMedia({
  limit: 4,
  sort: 'newest'
})

const missionItems = [
  {
    title: 'Mengembangkan Keterampilan',
    description: 'Menyediakan kesempatan bagi anggota untuk mengembangkan keterampilan outdoor, seperti navigasi, survival, dan kepemimpinan.'
  },
  {
    title: 'Membangun Karakter',
    description: 'Membangun karakter anggota melalui kegiatan yang menantang dan membangun kepercayaan diri.'
  },
  {
    title: 'Meningkatkan Kesadaran Lingkungan',
    description: 'Meningkatkan kesadaran anggota tentang pentingnya pelestarian lingkungan dan konservasi alam.'
  },
  {
    title: 'Menyediakan Pengalaman Berkualitas',
    description: 'Menyediakan pengalaman berkemah yang berkualitas dan aman bagi anggota.'
  },
  {
    title: 'Membangun Komunitas',
    description: 'Membangun komunitas yang solid dan peduli antar anggota, serta mempromosikan nilai-nilai kebersamaan dan gotong royong.'
  }
]

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

const formatDuration = (ms?: number) => {
  if (!ms) return ''
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const openLightbox = (index: number) => openMediaLightbox(recentMedia.value?.items ?? [], index)
</script>

<template>
  <div class="space-y-16 sm:space-y-20 py-4 sm:py-8">
    <section class="space-y-8">
      <div class="space-y-4 max-w-3xl">
        <h1 class="anim-fade-up text-3xl sm:text-5xl font-medium tracking-[-0.02em] leading-[1.08] text-[var(--text-primary)]" style="--delay: 0ms">
          Arsip perjalanan Komunitas HS15
        </h1>
        <p class="anim-fade-up text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed" style="--delay: 50ms">
          Jejak foto dan video perjalanan Komunitas HS15, tersimpan terbuka untuk anggota dan siapa saja yang ingin melihatnya.
        </p>
        <div class="anim-fade-up flex flex-wrap items-center gap-x-6 gap-y-3 pt-2" style="--delay: 100ms">
          <NuxtLink
            to="/gallery"
            class="inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            Buka Galeri
          </NuxtLink>
          <p class="font-mono text-xs sm:text-sm text-[var(--text-secondary)] tabular-nums">
            <span v-if="statsPending" class="text-[var(--text-muted)]">Memuat arsip...</span>
            <span v-else>{{ stats?.photos ?? 0 }} foto · {{ stats?.videos ?? 0 }} video · {{ stats?.folders ?? 0 }} album</span>
          </p>
        </div>
      </div>

      <BackgroundSlideshow class="anim-fade-up" style="--delay: 150ms" />
    </section>

    <section v-reveal class="border-t border-[var(--border-subtle)] pt-10 sm:pt-12">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div class="lg:col-span-5 space-y-8">
          <div class="space-y-3">
            <h2 class="text-xl sm:text-2xl font-medium tracking-[-0.015em] text-[var(--text-primary)]">
              Tentang Kami
            </h2>
            <p class="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              HS15 adalah komunitas asal Kalimantan Selatan yang bergerak di bidang perjalanan alam, touring, dan kegiatan berkemah. Lewat setiap agenda lapangan, kami belajar keterampilan outdoor, menjaga kelestarian alam, dan mempererat kebersamaan antar anggota.
            </p>
          </div>

          <div class="space-y-3 border-t border-[var(--border-subtle)] pt-6">
            <h2 class="text-xl sm:text-2xl font-medium tracking-[-0.015em] text-[var(--text-primary)]">
              Visi
            </h2>
            <p class="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              Menjadi wadah bagi masyarakat untuk mengembangkan keterampilan, membangun karakter, dan meningkatkan kesadaran melalui semua kegiatan HS15 yang berkualitas dan berkelanjutan.
            </p>
          </div>
        </div>

        <div class="lg:col-span-7 space-y-4 border-t lg:border-t-0 border-[var(--border-subtle)] pt-8 lg:pt-0">
          <h2 class="text-xl sm:text-2xl font-medium tracking-[-0.015em] text-[var(--text-primary)]">
            Misi
          </h2>
          <ol class="divide-y divide-[var(--border-subtle)]">
            <li
              v-for="(item, idx) in missionItems"
              :key="item.title"
              class="py-3.5 first:pt-0 last:pb-0 flex items-baseline gap-3 sm:gap-4"
            >
              <span class="font-mono text-xs text-[var(--text-muted)] tabular-nums shrink-0 w-4">
                {{ idx + 1 }}.
              </span>
              <div class="space-y-1">
                <h3 class="text-sm sm:text-base font-medium text-[var(--text-primary)]">
                  {{ item.title }}
                </h3>
                <p class="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {{ item.description }}
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <section v-reveal class="border-t border-[var(--border-subtle)] pt-10 sm:pt-12 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div class="space-y-1">
          <h2 class="text-xl sm:text-2xl font-medium tracking-[-0.015em] text-[var(--text-primary)]">
            Dokumentasi terbaru
          </h2>
          <p class="text-sm text-[var(--text-secondary)]">
            Cuplikan foto dan video perjalanan serta agenda komunitas terkini.
          </p>
        </div>

        <NuxtLink
          to="/gallery"
          class="group inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150 ease-[var(--ease-out)] shrink-0"
        >
          <span>Lihat semua galeri</span>
          <svg class="w-4 h-4 transition-transform duration-150 ease-[var(--ease-out)] group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14m-6-6l6 6-6 6" />
          </svg>
        </NuxtLink>
      </div>

      <div v-if="mediaPending" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="n in 4"
          :key="n"
          class="rounded-xl overflow-hidden aspect-[4/3] skeleton-shimmer border border-[var(--border-subtle)]"
        />
      </div>

      <div v-else-if="recentMedia?.items?.length" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          v-for="(item, idx) in recentMedia.items"
          :key="item.id"
          type="button"
          class="group relative rounded-xl overflow-hidden aspect-[4/3] text-left cursor-pointer border border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-surface)] hover:-translate-y-0.5 transition-[border-color,transform] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          @click="openLightbox(idx)"
        >
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
              class="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-white text-[11px] font-mono tabular-nums z-10"
            >
              {{ formatDuration(item.durationMillis) }}
            </span>
          </template>

          <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 p-3 flex flex-col justify-end">
            <span class="text-xs font-medium text-white truncate">
              {{ item.name || item.title }}
            </span>
            <span class="text-[11px] font-mono tabular-nums text-white/75 mt-0.5">
              {{ formatDate(item.createdTime) }}
            </span>
          </div>
        </button>
      </div>

      <div
        v-else
        class="rounded-xl p-8 text-center border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm text-[var(--text-secondary)]"
      >
        Belum ada arsip yang dimuat.
      </div>
    </section>

    <section v-reveal class="border-t border-[var(--border-subtle)] pt-10 sm:pt-12">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div class="lg:col-span-5 space-y-4">
          <h2 class="text-xl sm:text-2xl font-medium tracking-[-0.015em] text-[var(--text-primary)]">
            Titik kumpul
          </h2>

          <address class="not-italic text-sm text-[var(--text-secondary)] leading-relaxed">
            <span class="font-mono text-xs text-[var(--text-muted)] block mb-1">MHWP+MJG</span>
            Jl. Pangeran, Pangeran, Kec. Banjarmasin Utara, Kota Banjarmasin, Kalimantan Selatan 70123
          </address>

          <div class="pt-1">
            <a
              href="https://www.google.com/maps/search/?api=1&query=WARKOP+EDON+STMIK+MHWP%2BMJG+Jl.+Pangeran+Banjarmasin"
              target="_blank"
              rel="noopener noreferrer"
              class="group inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:bg-[var(--bg-raised)] text-sm font-medium text-[var(--text-primary)] transition-[background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <span>Buka di Google Maps</span>
              <svg class="w-4 h-4 text-[var(--text-muted)] transition-transform duration-150 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 17L17 7M7 7h10v10" />
              </svg>
            </a>
          </div>
        </div>

        <div class="lg:col-span-7">
          <div class="rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] aspect-[16/10] sm:aspect-[16/9]">
            <iframe
              title="Lokasi Warkop Edon STMIK di Google Maps"
              src="https://maps.google.com/maps?q=WARKOP%20EDON%20STMIK%20MHWP%2BMJG%20Jl.%20Pangeran%20Banjarmasin&t=&z=16&ie=UTF8&iwloc=&output=embed"
              class="w-full h-full border-0"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
