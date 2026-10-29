import { Fancybox } from '@fancyapps/ui'
import type { DriveMediaItem } from '~/types/drive'

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

// Opens photos and videos in Fancybox; the phone "back" button closes the lightbox instead of leaving the page.
export function openMediaLightbox(items: DriveMediaItem[], startIndex: number) {
  if (!items.length) return

  const isMobile = window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)').matches

  const slides = items.map(item => ({
    src: item.type === 'video' ? `/api/drive/video/${item.id}` : item.previewUrl,
    thumb: item.thumbnailUrl,
    type: item.type === 'video' ? 'html5video' : 'image',
    videoFormat: item.type === 'video' ? (item.mimeType || 'video/mp4') : undefined,
    width: item.width,
    height: item.height,
    caption: `
      <div class="gallery-caption-box">
        <div class="gallery-caption-title">${escapeHtml(item.name || item.title)}</div>
        <div class="gallery-caption-date">${new Date(item.createdTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
    `,
    downloadSrc: item.downloadUrl
  }))

  history.pushState({ ...history.state, lightbox: true }, '')
  let closedByBack = false
  const onPopState = () => {
    closedByBack = true
    Fancybox.close()
  }
  window.addEventListener('popstate', onPopState, { once: true })

  const syncSlideUi = (fb: any) => {
    const slide = fb?.getSlide?.()
    const isVideo = slide?.type === 'iframe' || slide?.type === 'html5video'
    fb?.container?.classList.toggle('is-video-slide', !!isVideo)
  }

  Fancybox.show(slides as any, {
    startIndex,
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

