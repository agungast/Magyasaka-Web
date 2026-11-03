// Middleware untuk proteksi halaman admin
export default defineNuxtRouteMiddleware((to) => {
  if (to.query.preview === '1') return

  const user = useSupabaseUser()

  if (!user.value) {
    return navigateTo('/login')
  }
})
