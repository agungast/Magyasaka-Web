<script setup lang="ts">

useSeoMeta({ title: 'Kelola Jadwal — Admin Magyasaka' })

const client = useSupabaseClient()
const { data: items, refresh } = useAsyncData('admin-schedules', async () => {
  const { data, error } = await client.from('schedules').select('*').order('hari').order('jam_mulai')
  if (error) throw error
  return (data || []) as any[]
})

const { data: semesters } = useSemesters()
const semesterOpts = computed(() =>
  (semesters.value || []).map((s: any) => ({ label: semesterLabel(s), value: s.id }))
)
const latestSemesterId = computed(() => {
  const latest = [...(semesters.value || [])]
    .sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''))[0]
  return latest?.id || null
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
        <div class="p-4 space-y-3">
          <h3 class="font-semibold">{{ editing ? 'Edit' : 'Tambah' }} Jadwal</h3>
          <USelect v-model="form.semester_id" :items="semesterOpts" placeholder="Pilih Semester" />
          <div class="grid grid-cols-3 gap-2">
            <USelect v-model="form.mata_kuliah" placeholder="Mata Kuliah" />
            <USelect v-model="form.dosen" placeholder="Dosen" />
            <UInput v-model="form.sks" type="number" placeholder="SKS" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <UInput v-model="form.jam_mulai" type="time" />
            <UInput v-model="form.jam_selesai" type="time" />
          </div>
          <UInput v-model="form.ruangan" placeholder="Ruangan" />
          <UInput v-model="form.kode_mk" placeholder="Kode MK" />
          <USelect v-model="form.warna" :items="warnaOpts" placeholder="Warna Mata Kuliah" />
          <p class="text-xs text-muted">Contoh: biru = jam 1, hijau = jam 2, merah = jam 3</p>
          <div class="flex gap-2 justify-end">
            <UButton variant="ghost" label="Batal" @click="modalOpen = false" />
            <UButton :loading="loading" label="Simpan" @click="save" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
