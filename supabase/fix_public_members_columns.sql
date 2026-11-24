-- ============================================================
-- Fix Audit #6: tutup no_telepon dari akses publik
-- Jalankan di Supabase Dashboard → SQL Editor → Paste & Run
-- ============================================================
-- Masalah: policy SELECT members memakai USING (true), dan anon mendapat
-- GRANT SELECT untuk semua kolom. Siapa pun yang punya anon key bisa
-- memanggil /rest/v1/members?select=email,no_telepon dan mengunduh seluruh
-- kontak kelas. no_telepon tidak dipakai di halaman publik mana pun.
--
-- Keputusan: email TETAP dipublikasikan karena tombol "Kontak Email" di
-- kartu anggota memakainya. Hanya no_telepon yang dicabut.
--
-- Cara kerja: GRANT tingkat kolom menggantikan GRANT tingkat tabel untuk
-- anon. Pengurus (role authenticated) tidak tersentuh — mereka tetap bisa
-- SELECT * lewat hak default Supabase.
--
-- PENTING: jalankan file ini SEBELUM deploy frontend. useMembers() sudah
-- memilih kolom secara eksplisit (tanpa no_telepon), tetapi selector lama
-- yang masih memakai select=* akan gagal setelah grant ini aktif.

REVOKE SELECT ON public.members FROM anon;

GRANT SELECT (id, nim, nama, email, jurusan, angkatan, status, foto_url)
  ON public.members TO anon;

NOTIFY pgrst, 'reload schema';

-- ============================================================
-- VERIFIKASI SETELAH RUN:
-- 1. Tanpa login: buka /anggota dan /anggota/pengurus → data tetap tampil.
-- 2. Tanpa login, ganti URL network request members menjadi select=*
--    → ditolak (ini bukti no_telepon tidak lagi bisa diunduh).
-- 3. Login pengurus → halaman /admin/anggota tetap menampilkan dan
--    mengubah no_telepon seperti biasa.
-- 4. Kalau ada halaman publik yang error, cari select='*' pada members
--    dan ganti dengan daftar kolom di atas.
-- 5. Cek hak akses ( OUTPUT: hanya 8 baris, tanpa no_telepon ):
--    SELECT column_name FROM information_schema.column_privileges
--    WHERE table_schema = 'public' AND table_name = 'members'
--      AND grantee = 'anon' AND privilege_type = 'SELECT'
--    ORDER BY column_name;
-- ============================================================
