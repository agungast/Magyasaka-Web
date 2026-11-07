-- ============================================================
-- Migration: Fitur Semester (Semester 1–8, GANJIL/GENAP, Tahun Ajaran)
-- Jalankan di Supabase Dashboard → SQL Editor → Paste & Run
-- ============================================================
-- Catatan: file ini HANYA membuat skema. Tidak ada seed data.
-- Semester & jadwal real diisi lewat halaman admin.

-- 1. TABEL: semesters
CREATE TABLE IF NOT EXISTS public.semesters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nomor INTEGER NOT NULL CHECK (nomor BETWEEN 1 AND 8),
  tipe TEXT NOT NULL CHECK (tipe IN ('Ganjil', 'Genap')),
  tahun_ajaran TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (nomor, tipe, tahun_ajaran)
);

-- 2. Tambahkan kolom semester_id ke schedules (nullable)
ALTER TABLE public.schedules
  ADD COLUMN IF NOT EXISTS semester_id UUID REFERENCES public.semesters(id) ON DELETE SET NULL;

-- 3. Enable RLS + policies
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.semesters FOR SELECT USING (true);

CREATE POLICY "Auth insert" ON public.semesters FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON public.semesters FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON public.semesters FOR DELETE USING (auth.role() = 'authenticated');
