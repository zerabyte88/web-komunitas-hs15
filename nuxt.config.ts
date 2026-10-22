// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  srcDir: '.',

  modules: [
    '@nuxtjs/tailwindcss'
  ],

  css: [
    '~/assets/css/main.css',
    '@fancyapps/ui/dist/fancybox/fancybox.css'
  ],

  app: {
    head: {
      title: 'HS15 - Arsip Dokumentasi Komunitas Keliling Banjar',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Website galeri dan arsip digital foto dan video kegiatan komunitas HS15 - Komunitas Keliling Banjar didukung Google Drive API.' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/img/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/img/favicon-16x16.png' },
        { rel: 'apple-touch-icon', href: '/img/apple-touch-icon.png' }
      ]
    }
  },

  runtimeConfig: {
    googleDriveApiKey: process.env.GOOGLE_DRIVE_API_KEY || '',
    googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || ''
  }
})
