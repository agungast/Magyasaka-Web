// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import { getDefaultAttributes } from 'eslint-plugin-better-tailwindcss/api/defaults'

// Formatting is handled by the editor/formatter; lint stays on real problems.
const formattingRules = [
  'vue/max-attributes-per-line',
  'vue/singleline-html-element-content-newline',
  'vue/html-self-closing',
  'vue/block-tag-newline',
  'vue/html-indent',
  'vue/attributes-order',
  'nuxt/nuxt-config-keys-order'
]

// Classes defined in app/assets/css/main.css, which the plugin cannot see.
const customClasses = [
  'accent',
  'accent-plain',
  'accent-text',
  'card-hover',
  'crest',
  'plate',
  'hero-plate',
  'hero-enter',
  'lightbox-overlay',
  'dark'
]

export default withNuxt(
  {
    ignores: ['.github/**']
  },
  betterTailwindcss.configs['correctness-error'],
  {
    settings: {
      'better-tailwindcss': {
        entryPoint: 'app/assets/css/main.css',
        ignore: [`^(${customClasses.join('|')})$`],
        attributes: [
          ...getDefaultAttributes(),
          ['^v-bind:ui$', [{ match: 'objectValues' }]]
        ]
      }
    }
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'vue/multi-word-component-names': 'off'
    }
  }
).onResolved((configs) => {
  for (const config of configs) {
    for (const rule of formattingRules) {
      if (config.rules?.[rule]) config.rules[rule] = 'off'
    }
  }
})
