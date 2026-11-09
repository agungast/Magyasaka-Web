-- ============================================================
-- Fix: constraint assignments_tipe_check
-- Jalankan di Supabase Dashboard → SQL Editor → Paste & Run
-- ============================================================
-- Penyebab error "violates check constraint assignments_tipe_check":
-- constraint di database live masih versi lama (daftar nilai tipe
-- berbeda dari kode aplikasi), bukan bug di halaman admin.

-- 1. Lepas constraint lama
ALTER TABLE public.assignments
  DROP CONSTRAINT IF EXISTS assignments_tipe_check;

-- 2. Normalisasi data lama yang nilainya tidak dipakai aplikasi
UPDATE public.assignments
SET tipe = 'tugas'
WHERE tipe IS NOT NULL
  AND tipe NOT IN ('tugas', 'uts', 'uas', 'tubes', 'praktikum');

-- 3. Pasang constraint sesuai pilihan di halaman admin
ALTER TABLE public.assignments
  ADD CONSTRAINT assignments_tipe_check
  CHECK (tipe IN ('tugas', 'uts', 'uas', 'tubes', 'praktikum'));

-- 4. Pastikan default kolom benar
ALTER TABLE public.assignments
  ALTER COLUMN tipe SET DEFAULT 'tugas';
