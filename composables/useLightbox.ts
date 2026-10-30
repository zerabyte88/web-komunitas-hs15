import type { DriveMediaItem } from '~/types/drive'

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

// Opens photos and videos in Fancybox; the phone "back" button closes the lightbox instead of leaving the page.
export async function openMediaLightbox(items: DriveMediaItem[], startIndex: number) {
  if (!items.length) return

  const [{ Fancybox }] = await Promise.all([
    import('@fancyapps/ui'),
    import('@fancyapps/ui/dist/fancybox/fancybox.css'),
    import('~/assets/css/lightbox.css')
  ])

  const isMobile = window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)').matches

  const slides = items.map(item => ({
    src: item.type === 'video' ? `/api/drive/video/${item.id}` : item.previewUrl,
    thumb: item.thumbnailUrl,
    type: item.type === 'video' ? 'html5video' : 'image',
    videoFormat: item.type === 'video' ? item.mimeType : undefined,
    width: item.width,
    height: item.height,
    caption: `
      <div class="gallery-caption-box">
        <div class="gallery-caption-title">${escapeHtml(item.name || item.title)}</div>
        <div class="gallery-caption-date">${new Date(item.createdTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
    `,
    downloadSrc: item.downloadUrl,
    itemData: item
  }))

  history.pushState({ ...history.state, lightbox: true }, '')
  let closedByBack = false
  const onPopState = () => {
    closedByBack = true
    Fancybox.close()
  }
  window.addEventListener('popstate', onPopState, { once: true })

  const handleVideoError = (container: HTMLElement, item: DriveMediaItem) => {
    const content = container.querySelector('.fancybox__content')
    if (!content || content.querySelector('.video-fallback-card')) return

    const fileName = escapeHtml(item.name || item.title || 'Video')
    const downloadUrl = escapeHtml(item.downloadUrl || `/api/drive/video/${item.id}`)

    content.innerHTML = `
      <div class="video-fallback-card">
        <div class="video-fallback-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        </div>
        <div class="video-fallback-title">Format Tidak Didukung</div>
        <div class="video-fallback-desc">
          Browser tidak dapat memutar video ini secara langsung.
        </div>
        <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" class="video-fallback-btn" download>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Unduh Video</span>
        </a>
      </div>
    `
  }

  const syncSlideUi = (fb: any) => {
    const slide = fb?.getSlide?.()
    const isVideo = slide?.type === 'iframe' || slide?.type === 'html5video'
    const container = fb?.container as HTMLElement | undefined
    if (!container) return
    container.classList.toggle('is-video-slide', !!isVideo)

    if (isVideo && slide?.itemData) {
      const videoEl = container.querySelector('video')
      if (videoEl && !videoEl.hasAttribute('data-error-handled')) {
        videoEl.setAttribute('data-error-handled', '1')
        videoEl.addEventListener('error', () => {
          handleVideoError(container, slide.itemData)
        }, { once: true })
      }
    }

    const ccw = container.querySelector('[data-panzoom-action="rotateCCW"]')
    if (ccw && !ccw.hasAttribute('data-custom-icon')) {
      ccw.setAttribute('data-custom-icon', '1')
      ccw.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>'
    }
    const cw = container.querySelector('[data-panzoom-action="rotateCW"]')
    if (cw && !cw.hasAttribute('data-custom-icon')) {
      cw.setAttribute('data-custom-icon', '1')
      cw.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>'
    }
  }

  Fancybox.show(slides as any, {
    startIndex,
    dragToClose: true,
    animated: true,
    Hash: false,
    hideClass: false,
    closeButton: false,
    commonCaption: true,
    Html: { videoAutoplay: true },
    Carousel: {},
    Thumbs: false,
    Toolbar: {
      enabled: true,
      absolute: true,
      display: isMobile
        ? { left: [], middle: [], right: ['download', 'close'] }
        : {
            left: [],
            middle: [],
            right: ['zoomIn', 'zoomOut', 'rotateCCW', 'rotateCW', 'download', 'close']
          }
    },
    on: {
      'Carousel.ready': syncSlideUi,
      'Carousel.change': syncSlideUi,
      destroy: () => {
        window.removeEventListener('popstate', onPopState)
        if (!closedByBack && history.state?.lightbox) history.back()
      }
    }
  } as any)
}

