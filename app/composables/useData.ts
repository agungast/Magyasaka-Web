// Composable untuk mengambil data dari Supabase
// Jika Supabase belum terkonfigurasi, mengembalikan array kosong / null.
import { computed } from 'vue'

function isSupabaseConfigured() {
  let configured = false
  try {
    const url = useRuntimeConfig().public?.supabase?.url
    configured = !!url && typeof url === 'string' && !url.includes('your-project') && !url.includes('example')
  } catch { /* runtime config belum tersedia */ }
  if (configured) return true
  if (import.meta.dev) return false
  throw new Error('Supabase belum dikonfigurasi: set SUPABASE_URL dan SUPABASE_KEY.')
}

export function useAnnouncements(immediate = true) {
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
    return []
  }, { lazy: true, immediate })
}

export function useSchedules(immediate = true) {
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
    return []
  }, { lazy: true, immediate })
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
    return []
  }, { lazy: true })
}

export function semesterLabel(semester: { nomor: number; tipe: string; tahun_ajaran: string }) {
  return `Semester ${semester.nomor} ${semester.tipe} ${semester.tahun_ajaran}`
}

// Semester aktif = yang terakhir ditambahkan (created_at terbaru, then nomor terbesar).
export function useActiveSemester() {
  const { data: semesters, status: semestersStatus } = useSemesters()
  const sortedSemesters = computed(() => {
    if (!semesters.value) return []
    return [...semesters.value].sort((a: any, b: any) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
      if (timeA !== timeB) return timeB - timeA
      return (b.nomor || 0) - (a.nomor || 0)
    })
  })
  const activeSemester = computed(() => sortedSemesters.value[0] || null)
  return { semesters, sortedSemesters, activeSemester, semestersStatus }
}

export function useAssignments(immediate = true) {
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
    return []
  }, { lazy: true, immediate })
}

export function useMembers(immediate = true) {
  return useAsyncData('members', async () => {
    if (isSupabaseConfigured()) {
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('members')
        .select('id, nim, nama, email, jurusan, angkatan, status, foto_url')
        .order('nim')
      if (error) throw error
      return data
    }
    return []
  }, { lazy: true, immediate })
}

export function useOfficers() {
  return useAsyncData('officers', async () => {
    if (isSupabaseConfigured()) {
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('class_officers')
        .select('*, member:members(id, nim, nama, jurusan, angkatan, status, foto_url)')
        .order('urutan')
      if (error) throw error
      return data
    }
    return []
  }, { lazy: true })
}

export function useAlbums() {
  return useAsyncData('albums', async () => {
    if (isSupabaseConfigured()) {
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('albums')
        .select('*, photos(id, url)')
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

export function useProjects(immediate = true) {
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
  }, { lazy: true, immediate })
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