<script setup lang="ts">

useSeoMeta({ title: 'Kelola Jadwal - Admin Magyasaka' })

const client = useSupabaseClient()
const { data: items, refresh } = useAsyncData('admin-schedules', async () => {
  const { data, error } = await client.from('schedules').select('*').order('hari').order('jam_mulai')
  if (error) throw error
  return (data || []) as any[]
})

const { data: semesters } = useSemesters()

// Urutkan semester terbaru di paling atas, semester lama di paling bawah
const sortedSemesters = computed(() => {
  if (!semesters.value) return []
  return [...semesters.value].sort((a: any, b: any) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
    if (timeA !== timeB) return timeB - timeA
    return (b.nomor || 0) - (a.nomor || 0)
  })
})

const semesterOpts = computed(() =>
  sortedSemesters.value.map((s: any) => ({ label: semesterLabel(s), value: s.id }))
)

const latestSemesterId = computed(() => {
  return sortedSemesters.value[0]?.id || null
})

const warnaOpts = [
  { label: 'Biru', value: '#6366f1' },
  { label: 'Hijau', value: '#10b981' },
  { label: 'Merah', value: '#ef4444' },
  { label: 'Kuning', value: '#f59e0b' },
  { label: 'Ungu', value: '#8b5cf6' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Oranye', value: '#f97316' }
]

const hariOpts = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(h => ({ label: h, value: h }))

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = ref({ semester_id: null as string | null, mata_kuliah: '', dosen: '', hari: 'Senin', jam_mulai: '08:00', jam_selesai: '10:30', ruangan: '', kode_mk: '', sks: 3, warna: '#6366f1' })
const loading = ref(false)

function openCreate() {
  editing.value = null
  form.value = { semester_id: latestSemesterId.value, mata_kuliah: '', dosen: '', hari: 'Senin', jam_mulai: '08:00', jam_selesai: '10:30', ruangan: '', kode_mk: '', sks: 3, warna: '#6366f1' }
  modalOpen.value = true
}

function semesterName(id: string | null) {
  const sem = semesters.value?.find((s: any) => s.id === id)
  return sem ? `Sem ${sem.nomor} ${sem.tipe}` : '—'
}

function openEdit(s: any) {
  editing.value = s
  form.value = { ...s }
  modalOpen.value = true
}

async function save() {
  loading.value = true
  try {
    if (editing.value) {
      const { error } = await client.from('schedules').update(form.value as any).eq('id', editing.value.id)
      if (error) throw error
    } else {
      const { error } = await client.from('schedules').insert(form.value as any)
      if (error) throw error
    }
    modalOpen.value = false
    await refresh()
  } catch (e: any) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}

async function remove(id: string) {
  if (!confirm('Hapus jadwal ini?')) return
  const { error } = await client.from('schedules').delete().eq('id', id)
  if (error) alert(error.message)
  else await refresh()
}

</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-lucide-calendar" class="text-primary" />
        Kelola Jadwal
      </h2>
      <UButton label="Tambah" icon="i-lucide-plus" @click="openCreate" />
    </div>

    <UCard>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-default">
              <th class="text-left py-2">Mata Kuliah</th>
              <th class="text-left py-2">Semester</th>
              <th class="text-left py-2">Hari</th>
              <th class="text-left py-2">Jam</th>
              <th class="text-left py-2">Ruangan</th>
              <th class="text-left py-2">Warna</th>
              <th class="text-right py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in items" :key="s.id" class="border-b border-default/50">
              <td class="py-2">
                <p class="font-medium">{{ s.mata_kuliah }}</p>
                <p class="text-xs text-muted">{{ s.dosen }}</p>
              </td>
              <td class="py-2 text-xs text-muted">{{ semesterName(s.semester_id) }}</td>
              <td class="py-2">{{ s.hari }}</td>
              <td class="py-2">{{ s.jam_mulai.slice(0, 5) }} - {{ s.jam_selesai.slice(0, 5) }}</td>
              <td class="py-2">{{ s.ruangan }}</td>
              <td class="py-2">
                <span class="inline-block w-3 h-3 rounded-full" :style="{ backgroundColor: s.warna }" aria-label="warna" />
              </td>
              <td class="py-2 text-right">
                <UButton size="xs" variant="ghost" icon="i-lucide-edit" @click="openEdit(s)" />
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="remove(s.id)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <UModal v-model:open="modalOpen">
      <template #content>
        <div class="p-6 sm:p-7 space-y-5 bg-elevated/95 backdrop-blur-md rounded-2xl border border-default/50 shadow-2xl max-h-[85vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-default/30">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-sm">
                <UIcon :name="editing ? 'i-lucide-calendar-clock' : 'i-lucide-calendar-plus'" class="text-xl" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-default leading-snug">{{ editing ? 'Edit' : 'Tambah' }} Jadwal Kuliah</h3>
                <p class="text-xs text-muted">Atur jadwal mata kuliah per semester dan jam perkuliahan</p>
              </div>
            </div>
            <UButton variant="ghost" color="neutral" icon="i-lucide-x" size="xs" class="rounded-lg" @click="modalOpen = false" />
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Semester</label>
                <USelect v-model="form.semester_id" :items="semesterOpts" placeholder="Pilih Semester" size="md" class="w-full shadow-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Hari</label>
                <USelect v-model="form.hari" :items="hariOpts" placeholder="Pilih Hari" size="md" class="w-full shadow-sm" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Mata Kuliah</label>
                <UInput v-model="form.mata_kuliah" placeholder="Contoh: Pemrograman Web Lanjut" size="md" class="w-full shadow-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Kode MK</label>
                <UInput v-model="form.kode_mk" placeholder="TRK201" size="md" class="w-full shadow-sm" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Dosen Pengampu</label>
                <UInput v-model="form.dosen" placeholder="Nama dosen beserta gelar" size="md" class="w-full shadow-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Jumlah SKS</label>
                <UInput v-model="form.sks" type="number" min="1" max="6" size="md" class="w-full shadow-sm" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Jam Mulai</label>
                <UInput v-model="form.jam_mulai" type="time" size="md" class="w-full shadow-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Jam Selesai</label>
                <UInput v-model="form.jam_selesai" type="time" size="md" class="w-full shadow-sm" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Ruangan / Lab</label>
                <UInput v-model="form.ruangan" placeholder="Contoh: Lab Jaringan 2" size="md" class="w-full shadow-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Warna Aksen</label>
                <USelect v-model="form.warna" :items="warnaOpts" placeholder="Pilih Warna" size="md" class="w-full shadow-sm" />
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-default/30">
            <UButton variant="outline" color="neutral" label="Batal" size="md" class="rounded-xl px-4" @click="modalOpen = false" />
            <UButton :loading="loading" label="Simpan Jadwal" color="primary" icon="i-lucide-check" size="md" class="rounded-xl px-5 shadow-sm" @click="save" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
