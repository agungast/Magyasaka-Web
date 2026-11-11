// Middleware untuk proteksi halaman admin
export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()

  // Navigasi client bisa terjadi sebelum Supabase selesai memulihkan sesi,
  // sehingga state user masih kosong walau sesi di cookie/localStorage valid.
  // Cek sesi dulu agar tidak sempat dialihkan ke /login (layar login berkedip).
  if (!user.value && import.meta.client) {
    const { data } = await useSupabaseClient().auth.getSession()
    if (data.session?.user) {
      user.value = data.session.user
      return
    }
  }

  if (!user.value) {
    return navigateTo('/login')
  }
})
