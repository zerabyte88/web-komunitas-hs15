import { Fancybox } from '@fancyapps/ui'
import type { DriveMediaItem } from '~/types/drive'

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

// Opens photos and videos in Fancybox; the phone "back" button closes the lightbox instead of leaving the page.
export function openMediaLightbox(items: DriveMediaItem[], startIndex: number) {
  if (!items.length) return

  const isMobile = window.matchMedia('(max-width: 640px)').matches

  const slides = items.map(item => ({
    src: item.previewUrl,
    thumb: item.thumbnailUrl,
    type: item.type === 'video'
      ? (item.previewUrl.includes('drive.google.com') ? 'iframe' : 'html5video')
      : 'image',
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

  Fancybox.show(slides as any, {
    startIndex,
    Html: { videoAutoplay: true },
    Carousel: { Navigation: !isMobile },
    Thumbs: isMobile ? false : { showOnStart: false },
    Toolbar: {
      display: isMobile
        ? { left: ['infobar'], middle: [], right: ['download', 'close'] }
        : {
            left: ['infobar'],
            middle: ['zoomIn', 'zoomOut', 'toggle1to1', 'rotateCCW', 'rotateCW'],
            right: ['slideshow', 'thumbs', 'download', 'close']
          }
    },
    on: {
      destroy: () => {
        window.removeEventListener('popstate', onPopState)
        if (!closedByBack && history.state?.lightbox) history.back()
      }
    }
  } as any)
}

