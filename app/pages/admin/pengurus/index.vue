<script setup lang="ts">

useSeoMeta({ title: 'Kelola Pengurus - Admin Magyasaka' })

const client = useSupabaseClient()
const { data: officers, refresh } = useAsyncData('admin-officers', async () => {
  const { data, error } = await client.from('class_officers').select('*, member:members(*)').order('urutan')
  if (error) throw error
  return (data || []) as any[]
})

const { data: members } = useAsyncData('admin-members-list', async () => {
  const { data } = await client.from('members').select('*').order('nim')
  return (data || []) as any[]
})

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = ref({ member_id: '', jabatan: '', mata_kuliah: '', periode: '', urutan: 0 })
const loading = ref(false)

// Jabatan PJ butuh keterangan mata kuliah yang diampu.
const isPj = computed(() => /\bpj\b|penanggung\s*jawab/i.test(form.value.jabatan || ''))

// Jabatan hanya boleh salah satu dari empat posisi struktur kelas.
const JABATAN_ALLOWED = ['Ketua Kelas', 'Sekretaris', 'Bendahara', 'PJ']
const jabatanError = computed(() => {
  const value = form.value.jabatan.trim()
  if (!value) return ''
  const allowed = JABATAN_ALLOWED.some(j => j.toLowerCase() === value.toLowerCase())
  return allowed ? '' : 'Jabatan harus salah satu dari: Ketua Kelas, Sekretaris, Bendahara, atau PJ.'
})

// Satu anggota hanya boleh menjabat sekali; ganti role lewat Edit.
const memberTaken = computed(() => {
  if (!form.value.member_id) return false
  return (officers.value || []).some(
    (o: any) => o.member_id === form.value.member_id && o.id !== editing.value?.id
  )
})
const memberError = computed(() =>
  memberTaken.value
    ? 'Anggota ini sudah terdaftar sebagai pengurus. Ganti role lewat tombol Edit pada pengurus tersebut.'
    : ''
)

// Urutan 1 adalah slot Ketua dan hanya boleh dipakai satu pengurus.
const ketuaTaken = computed(() => {
  const ketua = (officers.value || []).find((o: any) => Number(o.urutan) === 1)
  return !!ketua && ketua.id !== editing.value?.id
})
const urutanError = computed(() => {
  const n = Number(form.value.urutan)
  if (n > 4) return 'Urutan maksimal 4 (PJ Mata Kuliah).'
  if (n === 1 && ketuaTaken.value) return 'Urutan 1 sudah dipakai Ketua. Gunakan 2 atau lebih.'
  return ''
})

function openCreate() {
  editing.value = null
  // Lanjutkan nomor urut (maksimal 4 = PJ); pengurus baru tidak menempati slot Ketua.
  const next = Math.min(4, Math.max(0, ...(officers.value || []).map((o: any) => Number(o.urutan) || 0)) + 1)
  form.value = { member_id: '', jabatan: '', mata_kuliah: '', periode: '', urutan: next }
  modalOpen.value = true
}

function openEdit(o: any) {
  editing.value = o
  form.value = { member_id: o.member_id, jabatan: o.jabatan, mata_kuliah: o.mata_kuliah || '', periode: o.periode, urutan: o.urutan }
  modalOpen.value = true
}

async function save() {
  if (!form.value.member_id) return alert('Pilih anggota mahasiswa.')
  if (memberError.value) return alert(memberError.value)
  if (!form.value.jabatan.trim()) return alert('Jabatan wajib diisi.')
  if (jabatanError.value) return alert(jabatanError.value)
  if (urutanError.value) return alert(urutanError.value)
  // Simpan label jabatan dalam bentuk baku (mis. "ketua kelas" → "Ketua Kelas").
  form.value.jabatan = JABATAN_ALLOWED.find(j => j.toLowerCase() === form.value.jabatan.trim().toLowerCase()) || form.value.jabatan.trim()
  loading.value = true
  try {
    const payload = {
      member_id: form.value.member_id,
      jabatan: form.value.jabatan || '',
      mata_kuliah: isPj.value ? (form.value.mata_kuliah.trim() || null) : null,
      periode: form.value.periode || '',
      urutan: form.value.urutan || 0
    }
    if (editing.value) {
      const { error } = await client.from('class_officers').update(payload).eq('id', editing.value.id)
      if (error) throw error
    } else {
      const { error } = await client.from('class_officers').insert(payload)
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
const selectedOfficer = ref<any>(null)
const deleteLoading = ref(false)

function confirmDelete(o: any) {
  selectedOfficer.value = o
  deleteModalOpen.value = true
}

async function executeDelete() {
  if (!selectedOfficer.value) return
  deleteLoading.value = true
  try {
    const { error } = await client.from('class_officers').delete().eq('id', selectedOfficer.value.id)
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

const memberOpts = computed(() => members.value?.map(m => ({
  label: `${m.nama} (${m.nim})`,
  value: m.id,
  disabled: (officers.value || []).some((o: any) => o.member_id === m.id && o.id !== editing.value?.id)
})) || [])
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-lucide-shield" class="text-primary" />
        Kelola Pengurus
      </h2>
      <UButton label="Tambah" icon="i-lucide-plus" @click="openCreate" />
    </div>

    <UCard>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-default">
              <th class="text-left py-2">Urutan</th>
              <th class="text-left py-2">Nama</th>
              <th class="text-left py-2">Jabatan</th>
              <th class="text-left py-2">Periode</th>
              <th class="text-right py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in officers" :key="o.id" class="border-b border-default/50">
              <td class="py-2">{{ o.urutan }}</td>
              <td class="py-2">{{ o.member?.nama }}</td>
              <td class="py-2">{{ o.jabatan }}<span v-if="o.mata_kuliah" class="text-muted"> · {{ o.mata_kuliah }}</span></td>
              <td class="py-2">{{ o.periode }}</td>
              <td class="py-2 text-right">
                <UButton size="xs" variant="ghost" icon="i-lucide-edit" @click="openEdit(o)" />
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="confirmDelete(o)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <UModal v-model:open="modalOpen">
      <template #content>
        <div class="p-6 sm:p-7 space-y-5 bg-elevated/95 backdrop-blur-md rounded-2xl border border-default/50 shadow-2xl">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-default/30">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-sm">
                <UIcon :name="editing ? 'i-lucide-shield-alert' : 'i-lucide-shield-plus'" class="text-xl" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-default leading-snug">{{ editing ? 'Edit' : 'Tambah' }} Pengurus Kelas</h3>
                <p class="text-xs text-muted">Tetapkan struktur organisasi dan posisi kepengurusan kelas</p>
              </div>
            </div>
            <UButton variant="ghost" color="neutral" icon="i-lucide-x" size="xs" class="rounded-lg" @click="modalOpen = false" />
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Nama Anggota Mahasiswa</label>
              <USelect v-model="form.member_id" :items="memberOpts" placeholder="Pilih Anggota Mahasiswa" size="md" class="w-full shadow-sm" :color="memberError ? 'error' : undefined" />
              <p v-if="memberError" class="text-xs text-error mt-1">{{ memberError }}</p>
              <p v-else class="text-xs text-muted mt-1">Anggota yang sudah menjadi pengurus ditandai nonaktif — ubah role lewat Edit.</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Jabatan / Posisi</label>
              <UInput v-model="form.jabatan" placeholder="Contoh: Ketua Kelas / Sekretaris / Bendahara / PJ" size="md" class="w-full shadow-sm" :color="jabatanError ? 'error' : undefined" />
              <p v-if="jabatanError" class="text-xs text-error mt-1">{{ jabatanError }}</p>
              <p v-else class="text-xs text-muted mt-1">Hanya: Ketua Kelas, Sekretaris, Bendahara, atau PJ.</p>
            </div>

            <div v-if="isPj">
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Mata Kuliah yang Di-PJ-kan</label>
              <UInput v-model="form.mata_kuliah" placeholder="Contoh: Jaringan Komputer" size="md" class="w-full shadow-sm" />
              <p class="text-xs text-muted mt-1">Tampil di halaman publik di bawah jabatan PJ.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Periode Kepengurusan</label>
                <UInput v-model="form.periode" placeholder="Contoh: 2023/2024" size="md" class="w-full shadow-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Urutan Tampilan</label>
                <UInput v-model="form.urutan" type="number" :min="ketuaTaken ? 2 : 1" max="4" placeholder="1–4" size="md" class="w-full shadow-sm" :color="urutanError ? 'error' : undefined" />
                <p v-if="urutanError" class="text-xs text-error mt-1">{{ urutanError }}</p>
                <p v-else class="text-xs text-muted mt-1">
                  1 = Ketua{{ ketuaTaken ? ' (sudah terisi)' : '' }}, 2 = Sekretaris, 3 = Bendahara, 4 = PJ Mata Kuliah
                </p>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-default/30">
            <UButton variant="outline" color="neutral" label="Batal" size="md" class="rounded-xl px-4" @click="modalOpen = false" />
            <UButton :loading="loading" label="Simpan Pengurus" color="primary" icon="i-lucide-check" size="md" class="rounded-xl px-5 shadow-sm" @click="save" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal Konfirmasi Hapus -->
    <ConfirmModal
      v-model:open="deleteModalOpen"
      title="Hapus Pengurus Kelas"
      :description="`Apakah Anda yakin ingin menghapus '${selectedOfficer?.member?.nama || ''}' dari jabatan ${selectedOfficer?.jabatan || ''}? Tindakan ini bersifat permanen.`"
      :loading="deleteLoading"
      @confirm="executeDelete"
    />
  </div>
</template>
