<script setup lang="ts">

useSeoMeta({ title: 'Kelola Galeri - Admin Magyasaka' })

const client = useSupabaseClient()
const { data: albums, refresh } = useAsyncData('admin-albums', async () => {
  const { data, error } = await client.from('albums').select('*, photos(*)').order('tanggal_kegiatan', { ascending: false })
  if (error) throw error
  return (data || []) as any[]
})

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = ref({ nama: '', deskripsi: '', tanggal_kegiatan: '', is_featured: false })
const loading = ref(false)

function openCreate() {
  editing.value = null
  form.value = { nama: '', deskripsi: '', tanggal_kegiatan: '', is_featured: false }
  modalOpen.value = true
}

function openEdit(a: any) {
  editing.value = a
  form.value = {
    nama: a.nama || '',
    deskripsi: a.deskripsi || '',
    tanggal_kegiatan: a.tanggal_kegiatan || '',
    is_featured: a.is_featured || false
  }
  modalOpen.value = true
}

async function save() {
  loading.value = true
  try {
    const payload = {
      nama: form.value.nama,
      deskripsi: form.value.deskripsi,
      tanggal_kegiatan: form.value.tanggal_kegiatan || null,
      is_featured: form.value.is_featured
    }
    if (editing.value) {
      const { error } = await client.from('albums').update(payload as any).eq('id', editing.value.id)
      if (error) throw error
    } else {
      const { error } = await client.from('albums').insert(payload as any)
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
  if (!confirm('Hapus album ini?')) return
  const { error } = await client.from('albums').delete().eq('id', id)
  if (error) alert(error.message)
  else await refresh()
}

// Simple photo add
const photoModal = ref(false)
const activeAlbum = ref<any>(null)
const photoUrl = ref('')
const photoCaption = ref('')

function openPhotos(a: any) {
  activeAlbum.value = a
  photoUrl.value = ''
  photoCaption.value = ''
  photoModal.value = true
}

async function addPhoto() {
  if (!activeAlbum.value || !photoUrl.value) return
  const { error } = await client.from('photos').insert({ album_id: activeAlbum.value.id, url: photoUrl.value, caption: photoCaption.value } as any)
  if (error) alert(error.message)
  else {
    // Auto-set cover jika belum ada
    if (!activeAlbum.value.cover_url) {
      await client.from('albums').update({ cover_url: photoUrl.value } as any).eq('id', activeAlbum.value.id)
    }
    photoModal.value = false
    await refresh()
  }
}

async function removePhoto(id: string) {
  if (!confirm('Hapus foto ini?')) return
  const photo = activeAlbum.value.photos?.find((p: any) => p.id === id)
  const { error } = await client.from('photos').delete().eq('id', id)
  if (error) alert(error.message)
  else {
    await refresh()
    // Jika foto yang dihapus adalah cover_url, set ke URL berikutnya atau null
    if (activeAlbum.value.cover_url === photo?.url) {
      const next = activeAlbum.value.photos.find((p: any) => p.id !== id)
      await client.from('albums').update({ cover_url: next?.url || null }).eq('id', activeAlbum.value.id)
    }
  }
}

async function setCover(albumId: string, url: string) {
  const { error } = await client.from('albums').update({ cover_url: url } as any).eq('id', albumId)
  if (error) alert(error.message)
  else await refresh()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-lucide-image" class="text-primary" />
        Kelola Galeri
      </h2>
      <UButton label="Tambah Album" icon="i-lucide-plus" @click="openCreate" />
    </div>

    <div class="space-y-3">
      <UCard v-for="album in albums" :key="album.id">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 class="font-semibold">{{ album.nama }}</h3>
            <p class="text-xs text-muted">{{ album.tanggal_kegiatan }}</p>
            <p class="text-sm text-muted">{{ album.deskripsi }}</p>
          </div>
          <div class="flex gap-1">
            <UButton size="xs" variant="ghost" icon="i-lucide-images" @click="openPhotos(album)" />
            <UButton size="xs" variant="ghost" icon="i-lucide-edit" @click="openEdit(album)" />
            <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="remove(album.id)" />
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <div v-for="p in album.photos" :key="p.id" class="relative group">
            <img :src="p.url" class="w-20 h-20 object-cover rounded" />
            <button class="absolute bottom-0 left-0 bg-primary/80 text-white rounded-full px-1.5 py-0.5 text-[10px] hidden group-hover:block" @click="setCover(album.id, p.url)">✦ Thumbnail</button>
            <button class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs hidden group-hover:flex items-center justify-center" @click="removePhoto(p.id)">×</button>
          </div>
          <button class="w-20 h-20 border border-dashed border-default rounded flex items-center justify-center" @click="openPhotos(album)">
            <UIcon name="i-lucide-plus" />
          </button>
        </div>
      </UCard>
    </div>

    <UModal v-model:open="modalOpen">
      <template #content>
        <div class="p-6 sm:p-7 space-y-5 bg-elevated/95 backdrop-blur-md rounded-2xl border border-default/50 shadow-2xl">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-default/30">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-sm">
                <UIcon :name="editing ? 'i-lucide-folder-pen' : 'i-lucide-folder-plus'" class="text-xl" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-default leading-snug">{{ editing ? 'Edit' : 'Tambah' }} Album Galeri</h3>
                <p class="text-xs text-muted">Kelola koleksi foto dokumentasi kegiatan angkatan</p>
              </div>
            </div>
            <UButton variant="ghost" color="neutral" icon="i-lucide-x" size="xs" class="rounded-lg" @click="modalOpen = false" />
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Nama Album</label>
              <UInput v-model="form.nama" placeholder="Contoh: Makrab Magyasaka 2024" size="md" class="w-full shadow-sm" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Deskripsi Album</label>
              <UTextarea v-model="form.deskripsi" placeholder="Tuliskan cerita singkat tentang kegiatan ini..." :rows="3" size="md" class="w-full shadow-sm" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Tanggal Kegiatan</label>
              <UInput v-model="form.tanggal_kegiatan" type="date" size="md" class="w-full shadow-sm" />
            </div>

            <div class="p-3.5 rounded-xl bg-default/40 border border-default/30">
              <label class="flex items-center gap-3 text-sm cursor-pointer select-none">
                <UCheckbox v-model="form.is_featured" />
                <div>
                  <p class="font-medium text-default text-xs sm:text-sm">Tampilkan di Beranda (Album Unggulan)</p>
                  <p class="text-xs text-muted">Album ini akan disorot pada halaman beranda utama</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-default/30">
            <UButton variant="outline" color="neutral" label="Batal" size="md" class="rounded-xl px-4" @click="modalOpen = false" />
            <UButton :loading="loading" label="Simpan Album" color="primary" icon="i-lucide-check" size="md" class="rounded-xl px-5 shadow-sm" @click="save" />
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="photoModal">
      <template #content>
        <div class="p-6 sm:p-7 space-y-5 bg-elevated/95 backdrop-blur-md rounded-2xl border border-default/50 shadow-2xl">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-default/30">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-sm">
                <UIcon name="i-lucide-image-plus" class="text-xl" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-default leading-snug">Tambah Foto</h3>
                <p class="text-xs text-muted">Album: <span class="font-semibold text-primary">{{ activeAlbum?.nama }}</span></p>
              </div>
            </div>
            <UButton variant="ghost" color="neutral" icon="i-lucide-x" size="xs" class="rounded-lg" @click="photoModal = false" />
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">URL Foto</label>
              <UInput v-model="photoUrl" placeholder="https://... atau path storage" size="md" class="w-full shadow-sm" />
              <p class="text-xs text-muted mt-1.5">Gunakan URL foto langsung atau unggah ke Supabase Storage bucket <code>gallery</code>.</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Caption / Keterangan (Opsional)</label>
              <UInput v-model="photoCaption" placeholder="Keterangan singkat momen foto..." size="md" class="w-full shadow-sm" />
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-default/30">
            <UButton variant="outline" color="neutral" label="Batal" size="md" class="rounded-xl px-4" @click="photoModal = false" />
            <UButton label="Tambahkan Foto" color="primary" icon="i-lucide-plus" size="md" class="rounded-xl px-5 shadow-sm" @click="addPhoto" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
