import type { DriveMediaItem } from '~/types/drive'

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

const getDriveViewUrl = (id: string) =>
  `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`

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

  // Push history state so mobile back closes the lightbox instead of leaving the page
  history.pushState({ ...history.state, lightbox: true }, '')
  let closedByBack = false
  const onPopState = () => {
    closedByBack = true
    Fancybox.close()
  }
  window.addEventListener('popstate', onPopState, { once: true })

  const handleVideoError = (root: HTMLElement, item: DriveMediaItem) => {
    const content = root.querySelector('.fancybox__content') as HTMLElement | null
    if (!content || content.querySelector('.video-fallback-card')) return

    const videoEl = root.querySelector('video')
    if (videoEl) {
      videoEl.pause()
      videoEl.removeAttribute('src')
      videoEl.querySelectorAll('source').forEach(sourceEl => sourceEl.removeAttribute('src'))
      videoEl.load()
    }

    const driveViewUrl = escapeHtml(getDriveViewUrl(item.id))
    const downloadUrl = escapeHtml(item.downloadUrl || `/api/drive/video/${item.id}`)

    content.classList.add('is-fallback-card')
    content.innerHTML = `
      <div class="video-fallback-card">
        <div class="video-fallback-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        </div>
        <div class="video-fallback-title">Video Tidak Dapat Diputar Langsung</div>
        <div class="video-fallback-desc">
          Perangkat atau browser ini tidak mendukung resolusi atau codec video asli. Buka lewat Google Drive untuk kualitas adaptif, atau unduh videonya.
        </div>
        <div class="video-fallback-actions">
          <a href="${driveViewUrl}" target="_blank" rel="noopener noreferrer" class="video-fallback-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>Putar di Google Drive</span>
          </a>
          <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" class="video-fallback-btn-secondary" download>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Unduh Video</span>
          </a>
        </div>
      </div>
    `
  }

  const syncSlideUi = (fb: any) => {
    const slide = fb?.getSlide?.()
    const isVideo = slide?.type === 'iframe' || slide?.type === 'html5video'
    const container = fb?.container as HTMLElement | undefined
    if (!container) return
    container.classList.toggle('is-video-slide', !!isVideo)

    if (slide?.type === 'html5video' && slide?.itemData) {
      const slideRoot = (slide?.el as HTMLElement | undefined) || container
      const videoEl = slideRoot.querySelector('video')
      if (videoEl && !videoEl.hasAttribute('data-error-handled')) {
        videoEl.setAttribute('data-error-handled', '1')
        let handled = false
        const onFail = () => {
          if (handled) return
          handled = true
          handleVideoError(slideRoot, slide.itemData)
        }
        const checkVideoTrack = () => {
          if (videoEl.readyState >= 2 && videoEl.videoWidth === 0 && videoEl.videoHeight === 0) {
            onFail()
          }
        }
        if (videoEl.error) {
          onFail()
        } else {
          videoEl.addEventListener('error', onFail, { once: true })
          videoEl.querySelector('source')?.addEventListener('error', onFail, { once: true })
          videoEl.addEventListener('loadeddata', checkVideoTrack, { once: true })
          videoEl.addEventListener('playing', checkVideoTrack, { once: true })
          checkVideoTrack()
        }
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
      items: {
        driveView: {
          tpl: '<button class="f-button is-drive-view-btn" title="Putar di Google Drive" aria-label="Putar di Google Drive"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></button>',
          click: (toolbar: any) => {
            const slide = toolbar?.instance?.getSlide?.() ?? Fancybox.getSlide?.()
            const item = slide?.itemData as DriveMediaItem | undefined
            if (!item || item.type !== 'video') return
            window.open(getDriveViewUrl(item.id), '_blank', 'noopener,noreferrer')
          }
        }
      },
      display: isMobile
        ? { left: [], middle: [], right: ['driveView', 'download', 'close'] }
        : {
            left: [],
            middle: [],
            right: ['zoomIn', 'zoomOut', 'rotateCCW', 'rotateCW', 'driveView', 'download', 'close']
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
