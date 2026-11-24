// Daftar email pengurus — HARUS sama dengan public.is_pengurus() di
// supabase/fix_write_policies.sql. Tambah pengurus = 1 baris di sini +
// 1 baris di fungsi SQL itu.
// shortcut: allowlist statis dipakai karena hanya ada 6 akun; kalau pengurus
// bisa mendaftar sendiri, pindahkan ke tabel peran di database.
export const namaPengurus: Record<string, string> = {
  'admin1@magyasaka.co.id': 'Admin 1',
  'ketua@magyasaka.co.id': 'Ketua',
  'sekretaris1@magyasaka.co.id': 'Sekretaris 1',
  'sekretaris2@magyasaka.co.id': 'Sekretaris 2',
  'bendahara1@magyasaka.co.id': 'Bendahara 1',
  'bendahara2@magyasaka.co.id': 'Bendahara 2'
}

export function isPengurusEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return Object.prototype.hasOwnProperty.call(namaPengurus, email.trim().toLowerCase())
}
