// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@vueuse/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  fonts: {
    families: [
      { name: 'Outfit', provider: 'google', weights: [400, 500, 600, 700, 800] },
      { name: 'Plus Jakarta Sans', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Geist Mono', provider: 'google', weights: [400, 500] }
    ]
  },

  routeRules: {
    '/': { prerender: true },
    '/admin/**': { ssr: false },
    '/login': { ssr: false },
    '/confirm': { ssr: false }
  },

  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/confirm'
    }
  },

  app: {
    head: {
      title: 'Portal TRK 2023 — Magyasaka',
      meta: [
        { name: 'description', content: 'Portal & Dashboard resmi Kelas Teknik Rekayasa Komputer Angkatan 2023' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#05080c' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/favicon-64.png' },
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ],
      htmlAttrs: {
        lang: 'id'
      }
    }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
