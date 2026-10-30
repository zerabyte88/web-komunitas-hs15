import { defineNuxtConfig } from 'nuxt/config'

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

  css: [
    '~/assets/css/main.css'
  ],

  app: {
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
