import { defineNuxtConfig } from 'nuxt/config'

const driveJsonCacheRule = {
  cache: { maxAge: 60 * 15, staleMaxAge: 60 * 60 * 24 },
  headers: { 'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=86400' }
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  srcDir: '.',

  modules: [
    '@nuxtjs/tailwindcss'
  ],

  features: {
    inlineStyles: true
  },

  routeRules: {
    '/api/drive/files': driveJsonCacheRule,
    '/api/drive/folders': driveJsonCacheRule,
    '/api/drive/stats': driveJsonCacheRule
  },

  css: [
    '~/assets/css/main.css'
  ],

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: {
        lang: 'id'
      },
      title: 'HS15 - Arsip Dokumentasi',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Website galeri dan arsip digital komunitas HS15.' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap'
        },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/img/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/img/favicon-16x16.png' },
        { rel: 'apple-touch-icon', href: '/img/apple-touch-icon.png' }
      ],
      script: [
        {
          innerHTML: `(function(){try{var t=localStorage.getItem('hs15-theme');var isD=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var d=document.documentElement;if(isD){d.classList.add('dark');d.classList.remove('light');d.setAttribute('data-theme','hs15dark');}else{d.classList.remove('dark');d.classList.add('light');d.setAttribute('data-theme','hs15light');}}catch(e){}})();`
        }
      ]
    }
  },

  runtimeConfig: {
    googleDriveApiKey: process.env.GOOGLE_DRIVE_API_KEY || '',
    googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || ''
  }
})
