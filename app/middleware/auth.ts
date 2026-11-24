// Middleware untuk proteksi halaman admin
import { isPengurusEmail } from '~/utils/pengurus'

export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()

  // Navigasi client bisa terjadi sebelum Supabase selesai memulihkan sesi,
  // sehingga state user masih kosong walau sesi di cookie/localStorage valid.
  // Cek sesi dulu agar tidak sempat dialihkan ke /login (layar login berkedip).
  if (!user.value && import.meta.client) {
    const { data } = await useSupabaseClient().auth.getSession()
    if (data.session?.user) user.value = data.session.user
  }

  // Punya akun saja tidak cukup: akun di luar allowlist pengurus tidak boleh
  // membuka panel admin meski RLS sudah menahan semua tulisan.
  if (!isPengurusEmail(user.value?.email)) {
    if (user.value) await useSupabaseClient().auth.signOut()
    return navigateTo('/login')
  }
})
