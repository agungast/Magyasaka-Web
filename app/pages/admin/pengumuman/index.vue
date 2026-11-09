<script setup lang="ts">

useSeoMeta({ title: 'Kelola Pengumuman - Admin Magyasaka' })

const client = useSupabaseClient()
const { data: items, refresh } = useAsyncData('admin-announcements', async () => {
  const { data, error } = await client.from('announcements').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as any[]
})

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = ref({ judul: '', konten: '', kategori: 'umum', is_pinned: false, penulis: '' })
const loading = ref(false)

function openCreate() {
  editing.value = null
  form.value = { judul: '', konten: '', kategori: 'umum', is_pinned: false, penulis: '' }
  modalOpen.value = true
}

function openEdit(a: any) {
  editing.value = a
  form.value = { judul: a.judul, konten: a.konten, kategori: (a.kategori || 'umum').toLowerCase(), is_pinned: a.is_pinned, penulis: a.penulis || '' }
  modalOpen.value = true
}

async function save() {
  loading.value = true
  try {
    const payload = {
      ...form.value,
      // Pastikan kategori selalu lowercase agar sesuai CHECK constraint di database
      kategori: (form.value.kategori || 'umum').toLowerCase()
    }
    if (editing.value) {
      const { error } = await client.from('announcements').update(payload).eq('id', editing.value.id)
      if (error) throw error
    } else {
      const { error } = await client.from('announcements').insert(payload)
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
const selectedAnnouncement = ref<any>(null)
const deleteLoading = ref(false)

function confirmDelete(a: any) {
  selectedAnnouncement.value = a
  deleteModalOpen.value = true
}

async function executeDelete() {
  if (!selectedAnnouncement.value) return
  deleteLoading.value = true
  try {
    const { error } = await client.from('announcements').delete().eq('id', selectedAnnouncement.value.id)
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

const kategoriOpts = [
  { label: 'Umum', value: 'umum' },
  { label: 'Akademik', value: 'akademik' },
  { label: 'Kegiatan', value: 'kegiatan' },
  { label: 'Penting', value: 'penting' }
]
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-lucide-megaphone" class="text-primary" />
        Kelola Pengumuman
      </h2>
      <UButton label="Tambah" icon="i-lucide-plus" @click="openCreate" />
    </div>

    <UCard>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-default">
              <th class="text-left py-2">Judul</th>
              <th class="text-left py-2">Kategori</th>
              <th class="text-left py-2">Pinned</th>
              <th class="text-right py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in items" :key="a.id" class="border-b border-default/50">
              <td class="py-2">
                <p class="font-medium">{{ a.judul }}</p>
                <p class="text-xs text-muted line-clamp-1">{{ a.konten }}</p>
              </td>
              <td class="py-2 capitalize">{{ a.kategori }}</td>
              <td class="py-2">{{ a.is_pinned ? 'Ya' : 'Tidak' }}</td>
              <td class="py-2 text-right">
                <UButton size="xs" variant="ghost" icon="i-lucide-edit" @click="openEdit(a)" />
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="confirmDelete(a)" />
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
                <UIcon :name="editing ? 'i-lucide-megaphone' : 'i-lucide-volume-2'" class="text-xl" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-default leading-snug">{{ editing ? 'Edit' : 'Tambah' }} Pengumuman</h3>
                <p class="text-xs text-muted">Publikasikan informasi penting untuk seluruh mahasiswa kelas</p>
              </div>
            </div>
            <UButton variant="ghost" color="neutral" icon="i-lucide-x" size="xs" class="rounded-lg" @click="modalOpen = false" />
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Judul Pengumuman</label>
              <UInput v-model="form.judul" placeholder="Tuliskan judul informasi..." size="md" class="w-full shadow-sm" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Isi Pengumuman</label>
              <UTextarea v-model="form.konten" placeholder="Tuliskan isi detail pengumuman..." :rows="4" size="md" class="w-full shadow-sm" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Kategori</label>
                <USelect v-model="form.kategori" :items="kategoriOpts" size="md" class="w-full shadow-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Penulis / Sumber</label>
                <UInput v-model="form.penulis" placeholder="Contoh: Ketua Kelas / Sekretaris" size="md" class="w-full shadow-sm" />
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-default/40 border border-default/30">
              <label class="flex items-center gap-3 text-sm cursor-pointer select-none">
                <UCheckbox v-model="form.is_pinned" />
                <div>
                  <p class="font-medium text-default text-xs sm:text-sm">Sematkan di Beranda Utama (Highlight / Pinned)</p>
                  <p class="text-xs text-muted">Pengumuman akan ditampilkan di banner sorotan teratas beranda</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-default/30">
            <UButton variant="outline" color="neutral" label="Batal" size="md" class="rounded-xl px-4" @click="modalOpen = false" />
            <UButton :loading="loading" label="Simpan Pengumuman" color="primary" icon="i-lucide-check" size="md" class="rounded-xl px-5 shadow-sm" @click="save" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal Konfirmasi Hapus -->
    <ConfirmModal
      v-model:open="deleteModalOpen"
      title="Hapus Pengumuman"
      :description="`Apakah Anda yakin ingin menghapus pengumuman '${selectedAnnouncement?.judul || ''}'? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.`"
      :loading="deleteLoading"
      @confirm="executeDelete"
    />
  </div>
</template>
