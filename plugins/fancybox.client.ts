import { Fancybox } from '@fancyapps/ui'

export default defineNuxtPlugin(() => {
  Fancybox.defaults = {
    ...Fancybox.defaults,
    Images: { zoom: true },
    Hash: false,
    dragToClose: true,
    animated: true
  }
})
