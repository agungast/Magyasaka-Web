-- ============================================================
-- Fix Audit #1: keamanan tulis data — allowlist email pengurus
-- Jalankan di Supabase Dashboard → SQL Editor → Paste & Run
-- ============================================================
-- Masalah: policy tulis lama hanya cek auth.role() = 'authenticated',
-- sehingga SIAPA PUN yang punya akun bisa mengubah/menghapus semua
-- data. Aman hanya selama "Allow new users to sign up" mati di
-- dashboard — satu salah klik = semua data terbuka.
--
-- Perbaikan: hanya email pengurus di daftar bawah yang boleh menulis.
-- Menambah/menghapus pengurus = ubah daftar email di bagian 1,
-- lalu jalankan ulang bagian 1 saja.

-- ============================================================
-- 1. FUNGSI ALLOWLIST (satu-satunya tempat daftar email)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_pengurus()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(auth.jwt()->>'email', '') IN (
    -- Daftar email pengurus Magyasaka (login dibuat manual di dashboard
    -- Supabase → Authentication → Users, Auto Confirm User dicentang).
    -- Menambah/menghapus pengurus = ubah daftar ini lalu jalankan ulang
    -- bagian 1 saja.
    'admin1@magyasaka.co.id',
    'ketua@magyasaka.co.id',
    'sekretaris1@magyasaka.co.id',
    'sekretaris2@magyasaka.co.id',
    'bendahara1@magyasaka.co.id',
    'bendahara2@magyasaka.co.id'
  );
$$;

-- ============================================================
-- 2. HAPUS policy tulis lama (semua 9 tabel)
-- ============================================================
DROP POLICY IF EXISTS "Auth insert" ON public.members;
DROP POLICY IF EXISTS "Auth update" ON public.members;
DROP POLICY IF EXISTS "Auth delete" ON public.members;

DROP POLICY IF EXISTS "Auth insert" ON public.class_officers;
DROP POLICY IF EXISTS "Auth update" ON public.class_officers;
DROP POLICY IF EXISTS "Auth delete" ON public.class_officers;

DROP POLICY IF EXISTS "Auth insert" ON public.announcements;
DROP POLICY IF EXISTS "Auth update" ON public.announcements;
DROP POLICY IF EXISTS "Auth delete" ON public.announcements;

DROP POLICY IF EXISTS "Auth insert" ON public.semesters;
DROP POLICY IF EXISTS "Auth update" ON public.semesters;
DROP POLICY IF EXISTS "Auth delete" ON public.semesters;

DROP POLICY IF EXISTS "Auth insert" ON public.schedules;
DROP POLICY IF EXISTS "Auth update" ON public.schedules;
DROP POLICY IF EXISTS "Auth delete" ON public.schedules;

DROP POLICY IF EXISTS "Auth insert" ON public.assignments;
DROP POLICY IF EXISTS "Auth update" ON public.assignments;
DROP POLICY IF EXISTS "Auth delete" ON public.assignments;

DROP POLICY IF EXISTS "Auth insert" ON public.albums;
DROP POLICY IF EXISTS "Auth update" ON public.albums;
DROP POLICY IF EXISTS "Auth delete" ON public.albums;

DROP POLICY IF EXISTS "Auth insert" ON public.photos;
DROP POLICY IF EXISTS "Auth update" ON public.photos;
DROP POLICY IF EXISTS "Auth delete" ON public.photos;

DROP POLICY IF EXISTS "Auth insert" ON public.projects;
DROP POLICY IF EXISTS "Auth update" ON public.projects;
DROP POLICY IF EXISTS "Auth delete" ON public.projects;

-- ============================================================
-- 3. POLICY BARU: hanya pengurus yang boleh tulis
--    (baca publik tidak berubah — policy SELECT lama tetap)
-- ============================================================
CREATE POLICY "Pengurus insert" ON public.members FOR INSERT WITH CHECK (public.is_pengurus());
CREATE POLICY "Pengurus update" ON public.members FOR UPDATE USING (public.is_pengurus());
CREATE POLICY "Pengurus delete" ON public.members FOR DELETE USING (public.is_pengurus());

CREATE POLICY "Pengurus insert" ON public.class_officers FOR INSERT WITH CHECK (public.is_pengurus());
CREATE POLICY "Pengurus update" ON public.class_officers FOR UPDATE USING (public.is_pengurus());
CREATE POLICY "Pengurus delete" ON public.class_officers FOR DELETE USING (public.is_pengurus());

CREATE POLICY "Pengurus insert" ON public.announcements FOR INSERT WITH CHECK (public.is_pengurus());
CREATE POLICY "Pengurus update" ON public.announcements FOR UPDATE USING (public.is_pengurus());
CREATE POLICY "Pengurus delete" ON public.announcements FOR DELETE USING (public.is_pengurus());

CREATE POLICY "Pengurus insert" ON public.semesters FOR INSERT WITH CHECK (public.is_pengurus());
CREATE POLICY "Pengurus update" ON public.semesters FOR UPDATE USING (public.is_pengurus());
CREATE POLICY "Pengurus delete" ON public.semesters FOR DELETE USING (public.is_pengurus());

CREATE POLICY "Pengurus insert" ON public.schedules FOR INSERT WITH CHECK (public.is_pengurus());
CREATE POLICY "Pengurus update" ON public.schedules FOR UPDATE USING (public.is_pengurus());
CREATE POLICY "Pengurus delete" ON public.schedules FOR DELETE USING (public.is_pengurus());

CREATE POLICY "Pengurus insert" ON public.assignments FOR INSERT WITH CHECK (public.is_pengurus());
CREATE POLICY "Pengurus update" ON public.assignments FOR UPDATE USING (public.is_pengurus());
CREATE POLICY "Pengurus delete" ON public.assignments FOR DELETE USING (public.is_pengurus());

CREATE POLICY "Pengurus insert" ON public.albums FOR INSERT WITH CHECK (public.is_pengurus());
CREATE POLICY "Pengurus update" ON public.albums FOR UPDATE USING (public.is_pengurus());
CREATE POLICY "Pengurus delete" ON public.albums FOR DELETE USING (public.is_pengurus());

CREATE POLICY "Pengurus insert" ON public.photos FOR INSERT WITH CHECK (public.is_pengurus());
CREATE POLICY "Pengurus update" ON public.photos FOR UPDATE USING (public.is_pengurus());
CREATE POLICY "Pengurus delete" ON public.photos FOR DELETE USING (public.is_pengurus());

CREATE POLICY "Pengurus insert" ON public.projects FOR INSERT WITH CHECK (public.is_pengurus());
CREATE POLICY "Pengurus update" ON public.projects FOR UPDATE USING (public.is_pengurus());
CREATE POLICY "Pengurus delete" ON public.projects FOR DELETE USING (public.is_pengurus());

-- ============================================================
-- VERIFIKASI SETELAH RUN:
-- 1. Login sebagai pengurus (email di daftar) → admin CRUD tetap jalan.
-- 2. Login sebagai user LAIN → tulis/hapus ditolak:
--    "new row violates row-level-security policy"
-- 3. Halaman publik tetap tampil (policy SELECT tidak disentuh).
-- 4. Matikan juga "Allow new users to sign up" di
--    Authentication → Providers → Email (lapisan kedua).
-- ============================================================
