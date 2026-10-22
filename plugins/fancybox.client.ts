import { Fancybox } from '@fancyapps/ui'

export default defineNuxtPlugin((nuxtApp) => {
  // Set default Fancybox options
  Fancybox.defaults = {
    ...Fancybox.defaults,
    Toolbar: {
      display: {
        left: ['infobar'],
        middle: [
          'zoomIn',
          'zoomOut',
          'toggle1to1',
          'rotateCCW',
          'rotateCW',
          'flipX',
          'flipY'
        ],
        right: ['slideshow', 'thumbs', 'download', 'close']
      }
    },
    Thumbs: {
      showOnStart: false
    },
    Images: {
      zoom: true
    },
    Hash: false,
    dragToClose: true,
    animated: true
  }

  return {
    provide: {
      fancybox: Fancybox
    }
  }
})
