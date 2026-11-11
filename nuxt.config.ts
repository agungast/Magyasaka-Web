// https://nuxt.com/docs/api/configuration/nuxt-config
/// <reference types="nuxt" />
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
      { name: 'Schibsted Grotesk', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Geist Mono', provider: 'google', weights: [400, 500] }
    ]
  },

  routeRules: {},

  supabase: {
    redirect: false,
    clientOptions: {
      auth: {
        persistSession: true,
        detectSessionInUrl: true
      }
    },
    types: '~/types/database.ts'
  },

  app: {
    head: {
      title: 'Portal Magyasaka',
      meta: [
        { name: 'description', content: 'Portal & Dashboard resmi Magyasaka 2023' },
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

  vite: {
    optimizeDeps: {
      // Jangan pre-bundle: worker internal @ffmpeg/ffmpeg di-resolve Vite saat runtime.
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
    }
  },

  experimental: {
    typescriptPlugin: true
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      // Formatting is handled by the editor/formatter; lint stays on real problems.
      stylistic: false
    }
  },

  hooks: {
    'app:templates'(app) {
      const uiCss = app.templates.find((t: any) => t.filename === 'ui.css')
      if (uiCss && uiCss.getContents) {
        const orig = uiCss.getContents
        uiCss.getContents = async (data: any) => {
          const res = await orig(data)
          return typeof res === 'string'
            ? res.replace(/@source\s+"[A-Za-z]:\/[^"]*\/app\/\*\*\/\*";/g, '@source "../app/**/*";')
            : res
        }
      }
    }
  }
})