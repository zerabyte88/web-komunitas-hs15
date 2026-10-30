import type { DriveMediaItem } from '~/types/drive'

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

// Detect if a video format is reliably playable via native HTML5 <video> in browsers.
// Formats like .mkv, .avi, .3gp, .mov, or raw TS streams often lack browser decoder support
// and need to be served via Google Drive's transcoded preview player.
function isNativePlayableVideo(item: DriveMediaItem): boolean {
  if (item.type !== 'video') return false
  const name = (item.name || item.title || '').toLowerCase()
  const mime = (item.mimeType || '').toLowerCase()

  // Strict allowlist for universal HTML5 browser playback
  const isMp4 = name.endsWith('.mp4') || mime === 'video/mp4'
  const isWebm = name.endsWith('.webm') || mime === 'video/webm'
  const isOgg = name.endsWith('.ogv') || mime === 'video/ogg'

  return isMp4 || isWebm || isOgg
}

// Opens photos and videos in Fancybox; the phone "back" button closes the lightbox instead of leaving the page.
export async function openMediaLightbox(items: DriveMediaItem[], startIndex: number) {
  if (!items.length) return

  const [{ Fancybox }] = await Promise.all([
    import('@fancyapps/ui'),
    import('@fancyapps/ui/dist/fancybox/fancybox.css'),
    import('~/assets/css/lightbox.css')
  ])

  const isMobile = window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)').matches

  const slides = items.map(item => {
    const isVideo = item.type === 'video'
    const isNativeVideo = isVideo && isNativePlayableVideo(item)

    // For web-native formats (.mp4, .webm), stream directly via HTML5 video.
    // For non-standard formats (.mkv, .avi, .mov, etc.), fallback to Google Drive's transcoded preview player.
    let src = item.previewUrl
    let type: 'image' | 'html5video' | 'iframe' = 'image'

    if (isVideo) {
      if (isNativeVideo) {
        src = `/api/drive/video/${item.id}`
        type = 'html5video'
      } else {
        src = `https://drive.google.com/file/d/${item.id}/preview`
        type = 'iframe'
      }
    }

    return {
      src,
      thumb: item.thumbnailUrl,
      type,
      videoFormat: isNativeVideo ? (item.mimeType || 'video/mp4') : undefined,
      width: item.width,
      height: item.height,
      caption: `
        <div class="gallery-caption-box">
          <div class="gallery-caption-title">${escapeHtml(item.name || item.title)}</div>
          <div class="gallery-caption-date">${new Date(item.createdTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      `,
      downloadSrc: item.downloadUrl
    }
  })

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
    const container = fb?.container as HTMLElement | undefined
    if (!container) return
    container.classList.toggle('is-video-slide', !!isVideo)

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

