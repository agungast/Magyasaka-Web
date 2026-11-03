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
-- 4. TABEL: schedules (Jadwal Kuliah)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
-- 5. TABEL: assignments (Tugas & Ujian)
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
-- 6. TABEL: albums (Album Galeri Kegiatan)
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
-- 7. TABEL: photos (Foto dalam Album)
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
-- 8. TABEL: projects (Karya Proyek Kelas)
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
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (anyone can view)
CREATE POLICY "Public read access" ON public.members FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.class_officers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.projects FOR SELECT USING (true);

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

-- ============================================================
-- 10. STORAGE BUCKETS
-- ============================================================
-- Buat di Supabase Dashboard → Storage:
-- 1. Bucket: "gallery" (public) — untuk foto galeri kegiatan
-- 2. Bucket: "avatars" (public) — untuk foto profil anggota
-- 3. Bucket: "projects" (public) — untuk thumbnail proyek

-- ============================================================
-- 11. SEED DATA (Contoh Data Awal)
-- ============================================================

-- Contoh pengumuman
INSERT INTO public.announcements (judul, konten, kategori, is_pinned, penulis) VALUES
('Selamat Datang di Portal TRK 2023! 🎉', 'Portal resmi kelas Teknik Rekayasa Komputer angkatan 2023 telah resmi diluncurkan. Gunakan portal ini untuk mengakses informasi akademik, jadwal kuliah, dan berbagai informasi penting lainnya.', 'penting', true, 'Ketua Kelas'),
('Jadwal UTS Semester Ganjil', 'Jadwal Ujian Tengah Semester telah dirilis. Silakan cek di halaman Jadwal Ujian untuk detail lengkap tanggal, waktu, dan ruangan.', 'akademik', true, 'Sekretaris'),
('Gathering Angkatan TRK 2023', 'Akan diadakan gathering angkatan pada akhir bulan ini. Stay tuned untuk informasi lebih lanjut!', 'kegiatan', false, 'Ketua Kelas');

-- Contoh jadwal kuliah
INSERT INTO public.schedules (mata_kuliah, dosen, hari, jam_mulai, jam_selesai, ruangan, kode_mk, sks, warna) VALUES
('Algoritma & Pemrograman', 'Dr. Ahmad Fauzi, M.T.', 'Senin', '08:00', '10:30', 'Lab Komputer 1', 'TRK201', 3, '#6366f1'),
('Matematika Diskrit', 'Prof. Siti Rahayu, Ph.D.', 'Senin', '13:00', '15:30', 'R.301', 'TRK202', 3, '#8b5cf6'),
('Arsitektur Komputer', 'Dr. Budi Santoso, M.Kom.', 'Selasa', '08:00', '10:30', 'R.205', 'TRK203', 3, '#ec4899'),
('Jaringan Komputer', 'Ir. Maya Dewi, M.T.', 'Selasa', '13:00', '15:30', 'Lab Jaringan', 'TRK204', 3, '#f59e0b'),
('Basis Data', 'Dr. Rudi Hartono, M.Cs.', 'Rabu', '08:00', '10:30', 'Lab Komputer 2', 'TRK205', 3, '#10b981'),
('Sistem Operasi', 'Dr. Eko Prasetyo, M.T.', 'Rabu', '13:00', '15:30', 'R.302', 'TRK206', 3, '#f43f5e'),
('Pemrograman Web', 'Dra. Rina Kusuma, M.Kom.', 'Kamis', '08:00', '10:30', 'Lab Komputer 1', 'TRK207', 3, '#0ea5e9'),
('Statistika & Probabilitas', 'Dr. Hendra Wijaya, M.Si.', 'Jumat', '08:00', '10:30', 'R.201', 'TRK208', 3, '#a855f7');

-- Contoh tugas
INSERT INTO public.assignments (judul, deskripsi, mata_kuliah, tipe, deadline) VALUES
('Tugas Sorting Algorithm', 'Implementasikan 3 algoritma sorting (Bubble, Merge, Quick) dalam bahasa Python', 'Algoritma & Pemrograman', 'tugas', NOW() + INTERVAL '7 days'),
('Laporan Praktikum Jaringan', 'Buat laporan konfigurasi jaringan LAN sederhana', 'Jaringan Komputer', 'praktikum', NOW() + INTERVAL '5 days'),
('UTS Matematika Diskrit', 'Ujian Tengah Semester Matematika Diskrit', 'Matematika Diskrit', 'uts', NOW() + INTERVAL '14 days'),
('Project Website Personal', 'Buat website portfolio personal menggunakan HTML, CSS, dan JavaScript', 'Pemrograman Web', 'tugas', NOW() + INTERVAL '21 days');

-- Contoh anggota
INSERT INTO public.members (nim, nama, email) VALUES
('2023001', 'Ahmad Rizki Pratama', 'ahmad.rizki@student.ac.id'),
('2023002', 'Siti Nurhaliza', 'siti.nur@student.ac.id'),
('2023003', 'Budi Setiawan', 'budi.setiawan@student.ac.id'),
('2023004', 'Dewi Lestari', 'dewi.lestari@student.ac.id'),
('2023005', 'Eko Prasetyo', 'eko.prasetyo@student.ac.id'),
('2023006', 'Fitri Handayani', 'fitri.handa@student.ac.id'),
('2023007', 'Galih Ramadhan', 'galih.ramadhan@student.ac.id'),
('2023008', 'Hana Pertiwi', 'hana.pertiwi@student.ac.id'),
('2023009', 'Irfan Maulana', 'irfan.maulana@student.ac.id'),
('2023010', 'Jasmine Putri', 'jasmine.putri@student.ac.id');

-- Contoh pengurus
INSERT INTO public.class_officers (member_id, jabatan, urutan) VALUES
((SELECT id FROM public.members WHERE nim = '2023001'), 'Ketua Kelas', 1),
((SELECT id FROM public.members WHERE nim = '2023002'), 'Wakil Ketua', 2),
((SELECT id FROM public.members WHERE nim = '2023003'), 'Sekretaris', 3),
((SELECT id FROM public.members WHERE nim = '2023004'), 'Bendahara', 4),
((SELECT id FROM public.members WHERE nim = '2023005'), 'Koordinator Akademik', 5);

-- Contoh album
INSERT INTO public.albums (nama, deskripsi, tanggal_kegiatan, is_featured) VALUES
('Ospek TRK 2023', 'Dokumentasi kegiatan Orientasi Studi dan Pengenalan Kampus angkatan 2023', '2023-08-15', true),
('Study Tour Bandung', 'Kunjungan industri dan wisata edukasi ke Bandung', '2024-03-20', true),
('Gathering Semester 1', 'Acara kebersamaan kelas di akhir semester pertama', '2024-01-10', false);

-- Contoh proyek
INSERT INTO public.projects (nama, deskripsi, detail, teknologi, anggota, is_highlighted, kategori) VALUES
('SmartCampus IoT', 'Sistem monitoring ruang kelas berbasis IoT untuk efisiensi energi kampus', 'Proyek ini mengimplementasikan sensor suhu, kelembaban, dan cahaya di ruang kelas untuk mengoptimalkan penggunaan AC dan lampu secara otomatis.', ARRAY['Arduino', 'MQTT', 'Node.js', 'React'], ARRAY['Ahmad Rizki', 'Budi Setiawan', 'Eko Prasetyo'], true, 'IoT'),
('EduTrack App', 'Aplikasi tracking progress belajar mahasiswa dengan gamifikasi', 'Platform web dan mobile yang memungkinkan mahasiswa melacak progres belajar mereka, mendapatkan badge pencapaian, dan berkolaborasi dalam study group.', ARRAY['Flutter', 'Firebase', 'Dart'], ARRAY['Siti Nurhaliza', 'Dewi Lestari', 'Hana Pertiwi'], true, 'Mobile App'),
('NetSecure Scanner', 'Tool scanning keamanan jaringan untuk audit keamanan dasar', 'CLI tool berbasis Python yang melakukan port scanning, vulnerability assessment dasar, dan menghasilkan laporan keamanan jaringan.', ARRAY['Python', 'Nmap', 'Scapy'], ARRAY['Galih Ramadhan', 'Irfan Maulana'], false, 'Security');
