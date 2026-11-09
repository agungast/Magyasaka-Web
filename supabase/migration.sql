-- ============================================================
-- Portal & Dashboard Kelas TRK 2023
-- Supabase Migration SQL
-- ============================================================
-- Jalankan SQL ini di Supabase Dashboard → SQL Editor

-- ============================================================
-- 1. TABEL: members (Daftar Anggota Mahasiswa)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nim TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  email TEXT,
  no_telepon TEXT,
  foto_url TEXT,
  jurusan TEXT DEFAULT 'Teknik Rekayasa Komputer',
  angkatan INTEGER DEFAULT 2023,
  status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'tidak aktif', 'cuti')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. TABEL: class_officers (Struktur Pengurus Kelas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.class_officers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  jabatan TEXT NOT NULL,
  periode TEXT DEFAULT '2023/2024',
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. TABEL: announcements (Pengumuman Kelas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judul TEXT NOT NULL,
  konten TEXT NOT NULL,
  kategori TEXT DEFAULT 'umum' CHECK (kategori IN ('umum', 'akademik', 'kegiatan', 'penting')),
  is_pinned BOOLEAN DEFAULT FALSE,
  penulis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. TABEL: semesters (Semester) — baru
-- ============================================================
CREATE TABLE IF NOT EXISTS public.semesters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nomor INTEGER NOT NULL CHECK (nomor BETWEEN 1 AND 8),
  tipe TEXT NOT NULL CHECK (tipe IN ('Ganjil', 'Genap')),
  tahun_ajaran TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. TABEL: schedules (Jadwal Kuliah) — tambah semester_id
-- ============================================================
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  semester_id UUID REFERENCES public.semesters(id) ON DELETE SET NULL,
  mata_kuliah TEXT NOT NULL,
  dosen TEXT,
  hari TEXT NOT NULL CHECK (hari IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat')),
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  ruangan TEXT,
  kode_mk TEXT,
  sks INTEGER DEFAULT 3,
  warna TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. TABEL: assignments (Tugas & Ujian)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judul TEXT NOT NULL,
  deskripsi TEXT,
  mata_kuliah TEXT NOT NULL,
  tipe TEXT DEFAULT 'tugas' CHECK (tipe IN ('tugas', 'uts', 'uas', 'tubes', 'praktikum')),
  deadline TIMESTAMPTZ,
  tanggal_ujian TIMESTAMPTZ,
  ruangan_ujian TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. TABEL: albums (Album Galeri Kegiatan)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  deskripsi TEXT,
  tanggal_kegiatan DATE,
  cover_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. TABEL: photos (Foto dalam Album)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. TABEL: projects (Karya Proyek Kelas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  deskripsi TEXT,
  detail TEXT,
  thumbnail_url TEXT,
  repo_url TEXT,
  demo_url TEXT,
  teknologi TEXT[],
  anggota TEXT[],
  is_highlighted BOOLEAN DEFAULT FALSE,
  kategori TEXT DEFAULT 'akademik',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (anyone can view)
CREATE POLICY "Public read access" ON public.members FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.class_officers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.semesters FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.projects FOR SELECT USING (true);

-- Pengurus hanya boleh tulis: but signup publik di dashboard Supabase
-- Harus di-disable: Authentication → Providers → Allow new users to sign up OFF
-- Tulis diganti menjadi cek email dari pengurus kelas, misalkan:
--   CREATE POLICY "Pengurus insert" ON public.members FOR INSERT WITH CHECK (auth.jwt()->>'email' IN ('konteks@magyasaka.id'));
-- tapi karena email tidak dikonfigurasi di repo, abaikan ini -- meninggal semata-mata
-- auth.role()='authenticated'.  Default yang dipakai masih diizinkan; pastikan signup ditutup
-- di dashboard setelah pengurus didelegasikan email eksplisit.

-- Authenticated users (pengurus) can insert, update, delete
CREATE POLICY "Auth insert" ON public.members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON public.members FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON public.members FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert" ON public.class_officers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON public.class_officers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON public.class_officers FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert" ON public.announcements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON public.announcements FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON public.announcements FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert" ON public.schedules FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON public.schedules FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON public.schedules FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert" ON public.assignments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON public.assignments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON public.assignments FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert" ON public.albums FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON public.albums FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON public.albums FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert" ON public.photos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON public.photos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON public.photos FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON public.projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON public.projects FOR DELETE USING (auth.role() = 'authenticated');

-- Semester: admin boleh tulis
CREATE POLICY "Auth insert" ON public.semesters FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON public.semesters FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON public.semesters FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 11. STORAGE BUCKETS
-- ============================================================
-- Buat di Supabase Dashboard → Storage:
-- 1. Bucket: "gallery" (public) — untuk foto galeri kegiatan
-- 2. Bucket: "avatars" (public) — untuk foto profil anggota
-- 3. Bucket: "projects" (public) — untuk thumbnail proyek
