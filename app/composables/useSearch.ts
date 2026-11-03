// Composable untuk pencarian global menggunakan Fuse.js
import Fuse from 'fuse.js'

interface SearchItem {
  title: string
  description: string
  category: 'jadwal' | 'tugas' | 'anggota' | 'pengumuman' | 'proyek' | 'galeri'
  url: string
  icon: string
}

export function useSearch() {
  const searchQuery = ref('')
  const searchResults = ref<SearchItem[]>([])
  const isSearchOpen = ref(false)

  const { data: announcements } = useAnnouncements()
  const { data: schedules } = useSchedules()
  const { data: assignments } = useAssignments()
  const { data: members } = useMembers()
  const { data: projects } = useProjects()

  const allItems = computed<SearchItem[]>(() => {
    const items: SearchItem[] = []

    // Pengumuman
    announcements.value?.forEach((a: any) => {
      items.push({
        title: a.judul,
        description: a.konten?.substring(0, 100) + '...',
        category: 'pengumuman',
        url: '/',
        icon: 'i-lucide-megaphone'
      })
    })

    // Jadwal
    schedules.value?.forEach((s: any) => {
      items.push({
        title: s.mata_kuliah,
        description: `${s.hari} ${s.jam_mulai}-${s.jam_selesai} • ${s.ruangan} • ${s.dosen}`,
        category: 'jadwal',
        url: '/jadwal',
        icon: 'i-lucide-calendar'
      })
    })

    // Tugas
    assignments.value?.forEach((t: any) => {
      items.push({
        title: t.judul,
        description: `${t.mata_kuliah} • ${t.tipe}`,
        category: 'tugas',
        url: '/tugas',
        icon: 'i-lucide-clipboard-list'
      })
    })

    // Anggota
    members.value?.forEach((m: any) => {
      items.push({
        title: m.nama,
        description: `NIM: ${m.nim} • ${m.email || ''}`,
        category: 'anggota',
        url: '/anggota',
        icon: 'i-lucide-user'
      })
    })

    // Proyek
    projects.value?.forEach((p: any) => {
      items.push({
        title: p.nama,
        description: p.deskripsi,
        category: 'proyek',
        url: `/proyek/${p.id}`,
        icon: 'i-lucide-folder-code'
      })
    })

    return items
  })

  const fuse = computed(() => {
    return new Fuse(allItems.value, {
      keys: ['title', 'description'],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2
    })
  })

  watch(searchQuery, (query) => {
    if (!query || query.length < 2) {
      searchResults.value = []
      return
    }
    const results = fuse.value.search(query)
    searchResults.value = results.map(r => r.item).slice(0, 10)
  })

  function openSearch() {
    isSearchOpen.value = true
  }

  function closeSearch() {
    isSearchOpen.value = false
    searchQuery.value = ''
    searchResults.value = []
  }

  return {
    searchQuery,
    searchResults,
    isSearchOpen,
    openSearch,
    closeSearch
  }
}
