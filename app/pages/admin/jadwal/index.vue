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

// Filter tabel berdasarkan semester & hari
// "Semua Semester" dihilangkan agar jadwal dari berbagai semester tidak menumpuk
// di tabel. Default: semester yang paling baru ditambahkan (created_at terbaru).
const filterSemesterId = ref<string | null>(null)
const filterHari = ref('all')

const filterHariOpts = [
  { label: 'Semua Hari', value: 'all' },
  ...hariOpts
]

const filteredItems = computed(() =>
  (items.value || []).filter((s: any) =>
    (filterSemesterId.value !== null && s.semester_id === filterSemesterId.value)
    && (filterHari.value === 'all' || s.hari === filterHari.value)
  )
)

// Pilih otomatis semester terbaru saat data semester tersedia
watchEffect(() => {
  if (filterSemesterId.value || !sortedSemesters.value.length) return
  filterSemesterId.value = sortedSemesters.value[0]?.id || null
})

// Pengaturan waktu perkuliahan (Jam & Menit)
const hourOptions = Array.from({ length: 16 }, (_, i) => {
  const h = String(i + 7).padStart(2, '0') // 07 hingga 22
  return { label: h, value: h }
})

const minuteOptions = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => ({
  label: m,
  value: m
}))

const timePresets = [
  { label: 'Pagi 1', start: '07:00', end: '11:50' },
  { label: 'Pagi 2', start: '07:00', end: '08:30' },
  { label: 'Siang 1', start: '12:30', end: '14:00' },
  { label: 'Siang 2', start: '12:30', end: '17:30' },
  { label: 'Sore', start: '16:00', end: '21:00' }
]

function applyPreset(start: string, end: string) {
  form.value.jam_mulai = start
  form.value.jam_selesai = end
}

const startHour = computed({
  get: () => form.value.jam_mulai?.slice(0, 2) || '07',
  set: (v) => {
    const m = form.value.jam_mulai?.slice(3, 5) || '00'
    form.value.jam_mulai = `${v}:${m}`
  }
})

const startMinute = computed({
  get: () => form.value.jam_mulai?.slice(3, 5) || '00',
  set: (v) => {
    const h = form.value.jam_mulai?.slice(0, 2) || '07'
    form.value.jam_mulai = `${h}:${v}`
  }
})

const endHour = computed({
  get: () => form.value.jam_selesai?.slice(0, 2) || '11',
  set: (v) => {
    const m = form.value.jam_selesai?.slice(3, 5) || '50'
    form.value.jam_selesai = `${v}:${m}`
  }
})

const endMinute = computed({
  get: () => form.value.jam_selesai?.slice(3, 5) || '30',
  set: (v) => {
    const h = form.value.jam_selesai?.slice(0, 2) || '10'
    form.value.jam_selesai = `${h}:${v}`
  }
})

const durationText = computed(() => {
  const [h1 = 0, m1 = 0] = (form.value.jam_mulai || '07:00').split(':').map(Number)
  const [h2 = 0, m2 = 0] = (form.value.jam_selesai || '11:50').split(':').map(Number)
  const totalMin = (h2 * 60 + m2) - (h1 * 60 + m1)
  if (isNaN(totalMin) || totalMin <= 0) return ''
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  if (hours > 0 && mins > 0) return `${hours} jam ${mins} mnt`
  if (hours > 0) return `${hours} jam`
  return `${mins} mnt`
})

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = ref({ semester_id: null as string | null, mata_kuliah: '', dosen: '', hari: 'Senin', jam_mulai: '07:00', jam_selesai: '10:30', ruangan: '', kode_mk: '', sks: 3, warna: '#6366f1' })
const loading = ref(false)

function openCreate() {
  editing.value = null
  form.value = { semester_id: latestSemesterId.value, mata_kuliah: '', dosen: '', hari: 'Senin', jam_mulai: '07:00', jam_selesai: '10:30', ruangan: '', kode_mk: '', sks: 3, warna: '#6366f1' }
  modalOpen.value = true
}

function semesterName(id: string | null) {
  const sem = semesters.value?.find((s: any) => s.id === id)
  return sem ? `Sem ${sem.nomor} ${sem.tipe}` : '—'
}

function openEdit(s: any) {
  editing.value = s
  form.value = {
    ...s,
    jam_mulai: s.jam_mulai?.slice(0, 5) || '07:00',
    jam_selesai: s.jam_selesai?.slice(0, 5) || '11:50'
  }
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

const deleteModalOpen = ref(false)
const selectedSchedule = ref<any>(null)
const deleteLoading = ref(false)

function confirmDelete(s: any) {
  selectedSchedule.value = s
  deleteModalOpen.value = true
}

async function executeDelete() {
  if (!selectedSchedule.value) return
  deleteLoading.value = true
  try {
    const { error } = await client.from('schedules').delete().eq('id', selectedSchedule.value.id)
    if (error) alert(error.message)
    else {
      deleteModalOpen.value = false
      await refresh()
    }
  } catch (e: any) {
    alert(e.message)
  } finally {
    deleteLoading.value = false
  }
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

    <!-- Tab filter semester: dari semester terbaru (kiri) ke lama (kanan) -->
    <div v-if="sortedSemesters.length" class="flex gap-1 overflow-x-auto pb-2 mb-4">
      <UButton
        v-for="sem in sortedSemesters"
        :key="sem.id"
        :label="`Sem ${sem.nomor} ${sem.tipe}`"
        :color="filterSemesterId === sem.id ? 'primary' : 'neutral'"
        :variant="filterSemesterId === sem.id ? 'solid' : 'ghost'"
        size="sm"
        @click="filterSemesterId = sem.id"
      />
    </div>

    <UCard>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div class="flex flex-col sm:flex-row gap-2 flex-1">
          <USelect v-model="filterHari" :items="filterHariOpts" size="sm" class="sm:w-44" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted">{{ filteredItems.length }} jadwal</span>
          <UButton
            v-if="filterHari !== 'all'"
            label="Reset"
            icon="i-lucide-x"
            size="xs"
            variant="ghost"
            color="neutral"
            @click="filterHari = 'all'"
          />
        </div>
      </div>
      <!-- Mobile: kartu per jadwal -->
      <div class="space-y-3 md:hidden">
        <div v-for="s in filteredItems" :key="s.id" class="rounded-lg border border-default p-3">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="font-medium break-words">{{ s.mata_kuliah }}</p>
              <p class="text-xs text-muted break-words">{{ s.dosen }}</p>
            </div>
            <div class="flex shrink-0">
              <UButton size="xs" variant="ghost" icon="i-lucide-edit" aria-label="Edit" @click="openEdit(s)" />
              <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" aria-label="Hapus" @click="confirmDelete(s)" />
            </div>
          </div>
          <dl class="mt-2 space-y-1 text-xs">
            <div class="flex items-center justify-between gap-3">
              <dt class="shrink-0 text-muted">Semester</dt>
              <dd class="text-right">{{ semesterName(s.semester_id) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="shrink-0 text-muted">Hari</dt>
              <dd class="text-right">{{ s.hari }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="shrink-0 text-muted">Jam</dt>
              <dd class="text-right">{{ s.jam_mulai.slice(0, 5) }} - {{ s.jam_selesai.slice(0, 5) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="shrink-0 text-muted">Ruangan</dt>
              <dd class="text-right break-words">{{ s.ruangan }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="shrink-0 text-muted">Warna</dt>
              <dd><span class="inline-block w-3 h-3 rounded-full" :style="{ backgroundColor: s.warna }" aria-label="warna" /></dd>
            </div>
          </dl>
        </div>
        <p v-if="!filteredItems.length" class="py-6 text-center text-sm text-muted">Tidak ada jadwal untuk filter ini.</p>
      </div>

      <!-- Desktop: tabel -->
      <div class="hidden overflow-x-auto md:block">
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
            <tr v-for="s in filteredItems" :key="s.id" class="border-b border-default/50">
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
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="confirmDelete(s)" />
              </td>
            </tr>
            <tr v-if="!filteredItems.length">
              <td colspan="7" class="py-6 text-center text-muted">Tidak ada jadwal untuk filter ini.</td>
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

            <!-- Custom Time Picker Section -->
            <div class="p-4 rounded-xl bg-default/40 border border-default/30 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-clock" class="text-primary text-base" />
                  <label class="text-xs font-semibold text-muted uppercase tracking-wider">Waktu Perkuliahan</label>
                </div>
                <span v-if="durationText" class="text-xs text-primary font-medium bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                  Durasi: {{ durationText }}
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- Jam Mulai -->
                <div class="p-3 rounded-xl bg-elevated/80 border border-default/30 shadow-xs">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-1.5">
                      <div class="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
                      <span class="text-xs font-semibold text-default">Jam Mulai</span>
                    </div>
                    <span class="text-[11px] font-mono text-muted">{{ form.jam_mulai }} WIB</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <USelect v-model="startHour" :items="hourOptions" size="md" class="flex-1 text-center font-mono" />
                    <span class="text-muted font-bold text-base select-none">:</span>
                    <USelect v-model="startMinute" :items="minuteOptions" size="md" class="flex-1 text-center font-mono" />
                  </div>
                </div>

                <!-- Jam Selesai -->
                <div class="p-3 rounded-xl bg-elevated/80 border border-default/30 shadow-xs">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-1.5">
                      <div class="w-2 h-2 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50" />
                      <span class="text-xs font-semibold text-default">Jam Selesai</span>
                    </div>
                    <span class="text-[11px] font-mono text-muted">{{ form.jam_selesai }} WIB</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <USelect v-model="endHour" :items="hourOptions" size="md" class="flex-1 text-center font-mono" />
                    <span class="text-muted font-bold text-base select-none">:</span>
                    <USelect v-model="endMinute" :items="minuteOptions" size="md" class="flex-1 text-center font-mono" />
                  </div>
                </div>
              </div>

              <!-- Pilihan Cepat Slot Perkuliahan -->
              <div class="pt-1">
                <span class="text-[11px] font-medium text-muted block mb-1.5">Pilihan Cepat Sesi Kuliah:</span>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="preset in timePresets"
                    :key="preset.label"
                    type="button"
                    :class="[
                      'text-xs px-2.5 py-1 rounded-lg border transition-all select-none',
                      form.jam_mulai === preset.start && form.jam_selesai === preset.end
                        ? 'bg-primary/15 border-primary/40 text-primary font-semibold shadow-xs'
                        : 'border-default/30 bg-elevated/50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary text-muted'
                    ]"
                    @click="applyPreset(preset.start, preset.end)"
                  >
                    {{ preset.label }} ({{ preset.start }} - {{ preset.end }})
                  </button>
                </div>
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

    <!-- Modal Konfirmasi Hapus -->
    <ConfirmModal
      v-model:open="deleteModalOpen"
      title="Hapus Jadwal Kuliah"
      :description="`Apakah Anda yakin ingin menghapus jadwal mata kuliah '${selectedSchedule?.mata_kuliah || ''}' pada hari ${selectedSchedule?.hari || ''}? Tindakan ini tidak dapat dibatalkan.`"
      :loading="deleteLoading"
      @confirm="executeDelete"
    />
  </div>
</template>
