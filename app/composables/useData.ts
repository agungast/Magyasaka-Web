// Composable untuk mengambil data dari Supabase
// Jika Supabase belum terkonfigurasi, menggunakan mock data

// Mock data untuk development tanpa Supabase
const mockAnnouncements = [
  {
    id: '1',
    judul: 'Selamat Datang di Portal Magyasaka!',
    konten: 'Portal resmi Magyasaka 2023 telah resmi diluncurkan. Gunakan portal ini untuk mengakses informasi akademik, jadwal kuliah, dan berbagai informasi penting lainnya.',
    kategori: 'penting',
    is_pinned: true,
    penulis: 'Ketua Kelas',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    judul: 'Jadwal UTS Semester Ganjil',
    konten: 'Jadwal Ujian Tengah Semester telah dirilis. Silakan cek di halaman Jadwal Ujian untuk detail lengkap tanggal, waktu, dan ruangan.',
    kategori: 'akademik',
    is_pinned: true,
    penulis: 'Sekretaris',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    judul: 'Gathering Angkatan Magyasaka',
    konten: 'Akan diadakan gathering angkatan pada akhir bulan ini. Stay tuned untuk informasi lebih lanjut!',
    kategori: 'kegiatan',
    is_pinned: false,
    penulis: 'Ketua Kelas',
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
]

const mockSemesters = [
  { id: '1', nomor: 1, tipe: 'GASAL', tahun_ajaran: '2023/2024', created_at: '2023-08-01T00:00:00.000Z' }
]

const mockSchedules = [
  { id: '1', semester_id: '1', mata_kuliah: 'Algoritma & Pemrograman', dosen: 'Dr. Ahmad Fauzi, M.T.', hari: 'Senin', jam_mulai: '08:00', jam_selesai: '10:30', ruangan: 'Lab Komputer 1', kode_mk: 'TRK201', sks: 3, warna: '#6366f1' },
  { id: '2', semester_id: '1', mata_kuliah: 'Matematika Diskrit', dosen: 'Prof. Siti Rahayu, Ph.D.', hari: 'Senin', jam_mulai: '13:00', jam_selesai: '15:30', ruangan: 'R.301', kode_mk: 'TRK202', sks: 3, warna: '#8b5cf6' },
  { id: '3', semester_id: '1', mata_kuliah: 'Arsitektur Komputer', dosen: 'Dr. Budi Santoso, M.Kom.', hari: 'Selasa', jam_mulai: '08:00', jam_selesai: '10:30', ruangan: 'R.205', kode_mk: 'TRK203', sks: 3, warna: '#ec4899' },
  { id: '4', semester_id: '1', mata_kuliah: 'Jaringan Komputer', dosen: 'Ir. Maya Dewi, M.T.', hari: 'Selasa', jam_mulai: '13:00', jam_selesai: '15:30', ruangan: 'Lab Jaringan', kode_mk: 'TRK204', sks: 3, warna: '#f59e0b' },
  { id: '5', semester_id: '1', mata_kuliah: 'Basis Data', dosen: 'Dr. Rudi Hartono, M.Cs.', hari: 'Rabu', jam_mulai: '08:00', jam_selesai: '10:30', ruangan: 'Lab Komputer 2', kode_mk: 'TRK205', sks: 3, warna: '#10b981' },
  { id: '6', semester_id: '1', mata_kuliah: 'Sistem Operasi', dosen: 'Dr. Eko Prasetyo, M.T.', hari: 'Rabu', jam_mulai: '13:00', jam_selesai: '15:30', ruangan: 'R.302', kode_mk: 'TRK206', sks: 3, warna: '#f43f5e' },
  { id: '7', semester_id: '1', mata_kuliah: 'Pemrograman Web', dosen: 'Dra. Rina Kusuma, M.Kom.', hari: 'Kamis', jam_mulai: '08:00', jam_selesai: '10:30', ruangan: 'Lab Komputer 1', kode_mk: 'TRK207', sks: 3, warna: '#0ea5e9' },
  { id: '8', semester_id: '1', mata_kuliah: 'Statistika & Probabilitas', dosen: 'Dr. Hendra Wijaya, M.Si.', hari: 'Jumat', jam_mulai: '08:00', jam_selesai: '10:30', ruangan: 'R.201', kode_mk: 'TRK208', sks: 3, warna: '#a855f7' }
]

const mockAssignments = [
  { id: '1', judul: 'Tugas Sorting Algorithm', deskripsi: 'Implementasikan 3 algoritma sorting (Bubble, Merge, Quick) dalam bahasa Python', mata_kuliah: 'Algoritma & Pemrograman', tipe: 'tugas', deadline: new Date(Date.now() + 7 * 86400000).toISOString(), is_completed: false, created_at: null, updated_at: null },
  { id: '2', judul: 'Laporan Praktikum Jaringan', deskripsi: 'Buat laporan konfigurasi jaringan LAN sederhana', mata_kuliah: 'Jaringan Komputer', tipe: 'praktikum', deadline: new Date(Date.now() + 5 * 86400000).toISOString(), is_completed: false, created_at: null, updated_at: null },
  { id: '3', judul: 'UTS Matematika Diskrit', deskripsi: 'Ujian Tengah Semester Matematika Diskrit', mata_kuliah: 'Matematika Diskrit', tipe: 'uts', tanggal_ujian: new Date(Date.now() + 14 * 86400000).toISOString(), ruangan_ujian: 'R.301', is_completed: false, created_at: null, updated_at: null },
  { id: '4', judul: 'Project Website Personal', deskripsi: 'Buat website portfolio personal menggunakan HTML, CSS, dan JavaScript', mata_kuliah: 'Pemrograman Web', tipe: 'tugas', deadline: new Date(Date.now() + 21 * 86400000).toISOString(), is_completed: false, tanggal_ujian: null, ruangan_ujian: null, created_at: null, updated_at: null }
]

const mockMembers = [
  { id: '1', nim: '2023001', nama: 'Ahmad Rizki Pratama', email: 'ahmad.rizki@student.ac.id', jurusan: 'Teknik Rekayasa Komputer', angkatan: 2023, status: 'aktif', foto_url: null, no_telepon: null, created_at: null, updated_at: null },
  { id: '2', nim: '2023002', nama: 'Siti Nurhaliza', email: 'siti.nur@student.ac.id', jurusan: 'Teknik Rekayasa Komputer', angkatan: 2023, status: 'aktif', foto_url: null, no_telepon: null, created_at: null, updated_at: null },
  { id: '3', nim: '2023003', nama: 'Budi Setiawan', email: 'budi.setiawan@student.ac.id', jurusan: 'Teknik Rekayasa Komputer', angkatan: 2023, status: 'aktif', foto_url: null, no_telepon: null, created_at: null, updated_at: null },
  { id: '4', nim: '2023004', nama: 'Dewi Lestari', email: 'dewi.lestari@student.ac.id', jurusan: 'Teknik Rekayasa Komputer', angkatan: 2023, status: 'aktif', foto_url: null, no_telepon: null, created_at: null, updated_at: null },
  { id: '5', nim: '2023005', nama: 'Eko Prasetyo', email: 'eko.prasetyo@student.ac.id', jurusan: 'Teknik Rekayasa Komputer', angkatan: 2023, status: 'aktif', foto_url: null, no_telepon: null, created_at: null, updated_at: null },
  { id: '6', nim: '2023006', nama: 'Fitri Handayani', email: 'fitri.handa@student.ac.id', jurusan: 'Teknik Rekayasa Komputer', angkatan: 2023, status: 'aktif', foto_url: null, no_telepon: null, created_at: null, updated_at: null },
  { id: '7', nim: '2023007', nama: 'Galih Ramadhan', email: 'galih.ramadhan@student.ac.id', jurusan: 'Teknik Rekayasa Komputer', angkatan: 2023, status: 'aktif', foto_url: null, no_telepon: null, created_at: null, updated_at: null },
  { id: '8', nim: '2023008', nama: 'Hana Pertiwi', email: 'hana.pertiwi@student.ac.id', jurusan: 'Teknik Rekayasa Komputer', angkatan: 2023, status: 'aktif', foto_url: null, no_telepon: null, created_at: null, updated_at: null },
  { id: '9', nim: '2023009', nama: 'Irfan Maulana', email: 'irfan.maulana@student.ac.id', jurusan: 'Teknik Rekayasa Komputer', angkatan: 2023, status: 'aktif', foto_url: null, no_telepon: null, created_at: null, updated_at: null },
  { id: '10', nim: '2023010', nama: 'Jasmine Putri', email: 'jasmine.putri@student.ac.id', jurusan: 'Teknik Rekayasa Komputer', angkatan: 2023, status: 'aktif', foto_url: null, no_telepon: null, created_at: null, updated_at: null }
]

const mockOfficers = [
  { id: '1', jabatan: 'Ketua Kelas', urutan: 1, mata_kuliah: null, member: mockMembers[0] },
  { id: '2', jabatan: 'Wakil Ketua', urutan: 2, mata_kuliah: null, member: mockMembers[1] },
  { id: '3', jabatan: 'Sekretaris', urutan: 3, mata_kuliah: null, member: mockMembers[2] },
  { id: '4', jabatan: 'Bendahara', urutan: 4, mata_kuliah: null, member: mockMembers[3] },
  { id: '5', jabatan: 'Koordinator Akademik', urutan: 5, mata_kuliah: null, member: mockMembers[4] }
]

function isSupabaseConfigured() {
  try {
    const config = useRuntimeConfig()
    const url = config.public?.supabase?.url
    return !!url && typeof url === 'string' && !url.includes('your-project') && !url.includes('example')
  } catch {
    return false
  }
}

export function useAnnouncements() {
  return useAsyncData('announcements', async () => {
    if (isSupabaseConfigured()) {
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
    return mockAnnouncements
  }, { lazy: true })
}

export function useSchedules() {
  return useAsyncData('schedules', async () => {
    if (isSupabaseConfigured()) {
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('schedules')
        .select('*')
        .order('hari')
        .order('jam_mulai')
      if (error) throw error
      return data
    }
    return mockSchedules
  }, { lazy: true })
}

export function useSemesters() {
  return useAsyncData('semesters', async () => {
    if (isSupabaseConfigured()) {
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('semesters')
        .select('*')
        .order('nomor')
      if (error) throw error
      return data
    }
    return mockSemesters
  }, { lazy: true })
}

export function semesterLabel(semester: { nomor: number; tipe: string; tahun_ajaran: string }) {
  return `Semester ${semester.nomor} ${semester.tipe} ${semester.tahun_ajaran}`
}

export function useAssignments() {
  return useAsyncData('assignments', async () => {
    if (isSupabaseConfigured()) {
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('assignments')
        .select('*')
        .order('deadline', { ascending: true })
      if (error) throw error
      return data
    }
    return mockAssignments
  }, { lazy: true })
}

export function useMembers() {
  return useAsyncData('members', async () => {
    if (isSupabaseConfigured()) {
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('members')
        .select('*')
        .order('nim')
      if (error) throw error
      return data
    }
    return mockMembers
  }, { lazy: true })
}

export function useOfficers() {
  return useAsyncData('officers', async () => {
    if (isSupabaseConfigured()) {
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('class_officers')
        .select('*, member:members(*)')
        .order('urutan')
      if (error) throw error
      return data
    }
    return mockOfficers
  }, { lazy: true })
}

export function useAlbums() {
  return useAsyncData('albums', async () => {
    if (isSupabaseConfigured()) {
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('albums')
        .select('*, photos(*)')
        .order('tanggal_kegiatan', { ascending: false })
      if (error) throw error
      return data
    }
    return []
  }, { lazy: true })
}

export function useAlbum(id: string) {
  return useAsyncData(`album-${id}`, async () => {
    if (isSupabaseConfigured()) {
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('albums')
        .select('*, photos(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    }
    return null
  }, { lazy: true })
}

export function useProjects() {
  return useAsyncData('projects', async () => {
    if (isSupabaseConfigured()) {
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('projects')
        .select('*')
        .order('is_highlighted', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
    return []
  }, { lazy: true })
}

export function useProject(id: string) {
  return useAsyncData(`project-${id}`, async () => {
    if (isSupabaseConfigured()) {
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as any
    }
    return null
  }, { lazy: true })
}
