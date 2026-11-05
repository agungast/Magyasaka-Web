-- ============================================================
-- Migration: Fitur Semester (Semester 1–8, GASAL/GENAP, Tahun Ajaran)
-- Jalankan di Supabase Dashboard → SQL Editor → Paste & Run
-- ============================================================

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

-- 4. Seed: Semester 1 (Ganjil 2023/2024)
INSERT INTO public.semesters (nomor, tipe, tahun_ajaran) VALUES
  (1, 'Ganjil', '2023/2024')
ON CONFLICT DO NOTHING;

-- 5. Seed: Jadwal kuliah terkait semester 1
INSERT INTO public.schedules (semester_id, mata_kuliah, dosen, hari, jam_mulai, jam_selesai, ruangan, kode_mk, sks, warna) VALUES
  ((SELECT id FROM public.semesters WHERE nomor = 1 AND tipe = 'Ganjil' AND tahun_ajaran = '2023/2024' LIMIT 1),
   'Algoritma & Pemrograman', 'Dr. Ahmad Fauzi, M.T.', 'Senin', '08:00', '10:30', 'Lab Komputer 1', 'TRK201', 3, '#6366f1'),
  ((SELECT id FROM public.semesters WHERE nomor = 1 AND tipe = 'Ganjil' AND tahun_ajaran = '2023/2024' LIMIT 1),
   'Matematika Diskrit', 'Prof. Siti Rahayu, Ph.D.', 'Senin', '13:00', '15:30', 'R.301', 'TRK202', 3, '#8b5cf6'),
  ((SELECT id FROM public.semesters WHERE nomor = 1 AND tipe = 'Ganjil' && tahun_ajaran = '2023/2024' LIMIT 1),
   'Arsitektur Komputer', 'Dr. Budi Santoso, M.Kom.', 'Selasa', '08:00', '10:30', 'R.205', 'TRK203', 3, '#ec4899'),
  ((SELECT id FROM public.semesters WHERE nomor = 1 AND tipe = 'Ganjil' AND tahun_ajaran = '2023/2024' LIMIT 1),
   'Jaringan Komputer', 'Ir. Maya Dewi, M.T.', 'Selasa', '13:00', '15:30', 'Lab Jaringan', 'TRK204', 3, '#f59e0b'),
  ((SELECT id FROM public.semesters WHERE nomor = 1 AND tipe = 'Ganjil' AND tahun_ajaran = '2023/2024' LIMIT 1),
   'Basis Data', 'Dr. Rudi Hartono, M.Cs.', 'Rabu', '08:00', '10:30', 'Lab Komputer 2', 'TRK205', 3, '#10b981'),
  ((SELECT id FROM public.semesters WHERE nomor = 1 AND tipe = 'Ganjil' AND tahun_ajaran = '2023/2024' LIMIT 1),
   'Sistem Operasi', 'Dr. Eko Prasetyo, M.T.', 'Rabu', '13:00', '15:30', 'R.302', 'TRK206', 3, '#f43f5e'),
  ((SELECT id FROM public.semesters WHERE nomor = 1 AND tipe = 'Ganjil' AND tahun_ajaran = '2023/2024' LIMIT 1),
   'Pemrograman Web', 'Dra. Rina Kusuma, M.Kom.', 'Kamis', '08:00', '10:30', 'Lab Komputer 1', 'TRK207', 3, '#0ea5e9'),
  ((SELECT id FROM public.semesters WHERE nomor = 1 AND tipe = 'Ganjil' AND tahun_ajaran = '2023/2024' LIMIT 1),
   'Statistika & Probabilitas', 'Dr. Hendra Wijaya, M.Si.', 'Jumat', '08:00', '10:30', 'R.201', 'TRK208', 3, '#a855f7')
ON CONFLICT DO NOTHING;