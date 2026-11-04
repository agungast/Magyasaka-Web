<script setup lang="ts">

useSeoMeta({ title: 'Kelola Galeri — Admin Magyasaka' })

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
      // @ts-ignore
      const { error } = await client.from('albums').update(payload as any).eq('id', editing.value.id)
      if (error) throw error
    } else {
      // @ts-ignore
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
  // @ts-ignore
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
  // @ts-ignore
  const { error } = await client.from('photos').insert({ album_id: activeAlbum.value.id, url: photoUrl.value, caption: photoCaption.value } as any)
  if (error) alert(error.message)
  else {
    // Auto-set cover jika belum ada
    if (!activeAlbum.value.cover_url) {
      // @ts-ignore
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
      // @ts-ignore
      await client.from('albums').update({ cover_url: next?.url || null }).eq('id', activeAlbum.value.id)
    }
  }
}

async function setCover(albumId: string, url: string) {
  // @ts-ignore
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
        <div class="p-4 space-y-3">
          <h3 class="font-semibold">{{ editing ? 'Edit' : 'Tambah' }} Album</h3>
          <UInput v-model="form.nama" placeholder="Nama Album" />
          <UTextarea v-model="form.deskripsi" placeholder="Deskripsi" :rows="3" />
          <UInput v-model="form.tanggal_kegiatan" type="date" />
          <label class="flex items-center gap-2 text-sm">
            <UCheckbox v-model="form.is_featured" />
            Tampilkan di beranda (unggulan)
          </label>
          <div class="flex gap-2 justify-end">
            <UButton variant="ghost" label="Batal" @click="modalOpen = false" />
            <UButton :loading="loading" label="Simpan" @click="save" />
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="photoModal">
      <template #content>
        <div class="p-4 space-y-3">
          <h3 class="font-semibold">Tambah Foto ke {{ activeAlbum?.nama }}</h3>
          <UInput v-model="photoUrl" placeholder="URL Foto (atau upload ke storage)" />
          <UInput v-model="photoCaption" placeholder="Caption (opsional)" />
          <p class="text-xs text-muted">Untuk upload file, gunakan Supabase Storage bucket "gallery" lalu masukkan URL-nya.</p>
          <div class="flex gap-2 justify-end">
            <UButton variant="ghost" label="Batal" @click="photoModal = false" />
            <UButton label="Tambah" @click="addPhoto" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
