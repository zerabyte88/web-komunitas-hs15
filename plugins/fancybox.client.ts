import { Fancybox } from '@fancyapps/ui'

export default defineNuxtPlugin(() => {
  Fancybox.defaults = {
    ...Fancybox.defaults,
    Hash: false,
    dragToClose: true,
    animated: true
  }
})
