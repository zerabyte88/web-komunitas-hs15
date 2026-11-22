import type { DriveMediaItem } from '~/types/drive'

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

const getDrivePreviewUrl = (id: string) =>
  `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`

const isHighResVideo = (item: DriveMediaItem) =>
  Math.max(item.width ?? 0, item.height ?? 0) > 1920

export async function openMediaLightbox(items: DriveMediaItem[], startIndex: number) {
  if (!items.length) return

  const [{ Fancybox }] = await Promise.all([
    import('@fancyapps/ui'),
    import('@fancyapps/ui/dist/fancybox/fancybox.css'),
    import('~/assets/css/lightbox.css')
  ])

  const isMobile = window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)').matches

  const slides = items.map(item => {
    const useAdaptiveIframe = item.type === 'video' && isMobile && isHighResVideo(item)
    return {
      src: item.type === 'video'
        ? (useAdaptiveIframe ? getDrivePreviewUrl(item.id) : `/api/drive/video/${item.id}`)
        : item.previewUrl,
      thumb: item.thumbnailUrl,
      type: item.type === 'video' ? (useAdaptiveIframe ? 'iframe' : 'html5video') : 'image',
      videoFormat: item.type === 'video' && !useAdaptiveIframe ? item.mimeType : undefined,
      preload: useAdaptiveIframe ? false : undefined,
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
    }
  })

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
    if (!content || content.querySelector('.video-preview-fallback')) return

    const previewUrl = escapeHtml(getDrivePreviewUrl(item.id))
    const title = escapeHtml(item.name || item.title)
    const ratio = item.width && item.height ? `${item.width} / ${item.height}` : '16 / 9'

    content.innerHTML = `
      <iframe
        class="video-preview-fallback"
        src="${previewUrl}"
        title="${title}"
        allow="autoplay; fullscreen"
        allowfullscreen
        style="display:block;width:min(92vw,960px);aspect-ratio:${ratio};max-height:calc(100dvh - 96px);border:0;background:#000;"
      ></iframe>
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
        const onFail = () => handleVideoError(slideRoot, slide.itemData)
        if (videoEl.error) {
          onFail()
        } else {
          videoEl.addEventListener('error', onFail, { once: true })
          const sourceEl = videoEl.querySelector('source')
          sourceEl?.addEventListener('error', onFail, { once: true })
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
