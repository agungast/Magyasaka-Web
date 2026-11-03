export default defineAppConfig({
  ui: {
    colors: {
      primary: 'azure',
      neutral: 'ink'
    },
    badge: {
      variants: {
        // Nuxt UI's xs badge is 8px and sm is 10px: unreadable at label size.
        size: {
          xs: {
            base: 'text-[11px]/4 px-1.5 py-0.5 gap-1 rounded-sm'
          },
          sm: {
            base: 'text-[12px]/4 px-2 py-0.5 gap-1 rounded-sm'
          }
        }
      }
    }
  }
})
