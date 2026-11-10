<script setup lang="ts">

import { useGalleryUpload, isMediaFile, isImageFile, isVideoUrl, type UploadItem } from '~/composables/useGalleryUpload'

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

const deleteModalOpen = ref(false)
const deleteTitle = ref('Hapus Data')
const deleteDesc = ref('Apakah Anda yakin ingin menghapus data ini?')
const deleteLoading = ref(false)
let pendingDeleteAction: (() => Promise<void>) | null = null

function confirmDeleteAlbum(a: any) {
  deleteTitle.value = 'Hapus Album Galeri'
  deleteDesc.value = `Apakah Anda yakin ingin menghapus album "${a.nama}" beserta seluruh foto di dalamnya? Tindakan ini bersifat permanen.`
  pendingDeleteAction = async () => {
    const { error } = await client.from('albums').delete().eq('id', a.id)
    if (error) alert(error.message)
    else await refresh()
  }
  deleteModalOpen.value = true
}

function confirmDeletePhoto(p: any) {
  deleteTitle.value = 'Hapus Foto'
  deleteDesc.value = 'Apakah Anda yakin ingin menghapus foto ini dari album? Tindakan ini bersifat permanen.'
  pendingDeleteAction = async () => {
    const { error } = await client.from('photos').delete().eq('id', p.id)
    if (error) alert(error.message)
    else {
      await removeFromStorage(p.url)
      await refresh()
      if (activeAlbum.value?.cover_url === p.url) {
        const remaining = activeAlbum.value.photos?.filter((x: any) => x.id !== p.id) || []
        const newCover = remaining[0]?.url || null
        await client.from('albums').update({ cover_url: newCover } as any).eq('id', activeAlbum.value.id)
        await refresh()
      }
    }
  }
  deleteModalOpen.value = true
}

async function executeDelete() {
  if (!pendingDeleteAction) return
  deleteLoading.value = true
  try {
    await pendingDeleteAction()
    deleteModalOpen.value = false
  } catch (e: any) {
    alert(e.message)
  } finally {
    deleteLoading.value = false
  }
}

// Unggah foto/video langsung dari browser (kompres ke WebP) ke Supabase Storage.
const { uploadOne, removeFromStorage } = useGalleryUpload()
const photoModal = ref(false)
const activeAlbum = ref<any>(null)
const uploadItems = ref<UploadItem[]>([])
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const folderInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
// Atribut non-standar untuk input pemilih folder (webkitdirectory).
const folderInputAttrs = { webkitdirectory: '', directory: '' }

function openPhotos(a: any) {
  activeAlbum.value = a
  uploadItems.value = []
  uploading.value = false
  photoModal.value = true
}

function addFiles(files: FileList | File[] | null) {
  if (!files) return
  for (const f of Array.from(files)) {
    if (isMediaFile(f)) uploadItems.value.push({ file: f, status: 'pending', progress: 0 })
  }
}

function onFileChange(e: Event) {
  const t = e.target as HTMLInputElement
  addFiles(t.files)
  t.value = ''
}
function onFolderChange(e: Event) {
  const t = e.target as HTMLInputElement
  addFiles(t.files)
  t.value = ''
}
function onDrop(e: DragEvent) {
  dragOver.value = false
  if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
}
function removeItem(i: number) {
  uploadItems.value.splice(i, 1)
}

const doneCount = computed(() => uploadItems.value.filter(i => i.status === 'done').length)
const errorCount = computed(() => uploadItems.value.filter(i => i.status === 'error').length)
const pendingCount = computed(() => uploadItems.value.filter(i => i.status === 'pending' || i.status === 'error').length)

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
function statusText(item: UploadItem) {
  return item.status === 'error' ? (item.error || 'Gagal')
    : item.status === 'compressing' ? 'Mengompres'
    : item.status === 'uploading' ? 'Mengunggah'
    : item.status === 'done' ? 'Selesai'
    : 'Menunggu'
}

async function startUpload() {
  if (!activeAlbum.value || uploading.value) return
  const batch = uploadItems.value.filter(i => i.status === 'pending' || i.status === 'error')
  if (!batch.length) return
  uploading.value = true
  const imageUrls: string[] = []
  for (const item of batch) {
    try {
      const url = await uploadOne(item, activeAlbum.value.id)
      if (isImageFile(item.file)) imageUrls.push(url)
    } catch {
      /* status sudah di-set ke error oleh uploadOne */
    }
  }
  // Simpan foto yang berhasil ke tabel photos
  const doneInBatch = batch.filter(i => i.status === 'done' && i.url)
  if (doneInBatch.length) {
    const rows = doneInBatch.map(i => ({ album_id: activeAlbum.value.id, url: i.url as string, caption: null }))
    const { error } = await client.from('photos').insert(rows as any)
    if (error) alert(error.message)
    // Auto-set cover dari foto pertama bila album belum punya cover
    if (!activeAlbum.value.cover_url && imageUrls.length) {
      await client.from('albums').update({ cover_url: imageUrls[0] } as any).eq('id', activeAlbum.value.id)
    }
    await refresh()
  }
  uploading.value = false
}

async function setCover(albumId: string, url: string) {
  const { error } = await client.from('albums').update({ cover_url: url } as any).eq('id', albumId)
  if (error) alert(error.message)
  else await refresh()
}

// Lightbox: admin bisa melihat foto/video ukuran penuh dari album.
const lightboxOpen = ref(false)
const lightboxPhotos = ref<any[]>([])
const lightboxIndex = ref(0)

function openLightbox(photos: any[], index: number | string) {
  lightboxPhotos.value = photos || []
  lightboxIndex.value = Number(index)
  lightboxOpen.value = true
}
function closeLightbox() {
  lightboxOpen.value = false
}
function nextPhoto() {
  if (lightboxIndex.value < lightboxPhotos.value.length - 1) lightboxIndex.value++
}
function prevPhoto() {
  if (lightboxIndex.value > 0) lightboxIndex.value--
}

if (import.meta.client) {
  useEventListener(document, 'keydown', (e: KeyboardEvent) => {
    if (!lightboxOpen.value) return
    if (e.key === 'ArrowRight') nextPhoto()
    if (e.key === 'ArrowLeft') prevPhoto()
    if (e.key === 'Escape') closeLightbox()
  })
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
            <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="confirmDeleteAlbum(album)" />
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <div v-for="(p, pi) in album.photos" :key="p.id" class="relative group">
            <video v-if="isVideoUrl(p.url)" :src="p.url" class="w-20 h-20 object-cover rounded cursor-zoom-in" preload="metadata" muted @click="openLightbox(album.photos, pi)" />
            <img v-else :src="p.url" class="w-20 h-20 object-cover rounded cursor-zoom-in" @click="openLightbox(album.photos, pi)" />
            <button v-if="!isVideoUrl(p.url)" class="absolute bottom-0 left-0 bg-primary/80 text-white rounded-full px-1.5 py-0.5 text-[10px] hidden group-hover:block" @click="setCover(album.id, p.url)">✦ Thumbnail</button>
            <button class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs hidden group-hover:flex items-center justify-center" @click="confirmDeletePhoto(p)">×</button>
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
              <DateTimeField v-model="form.tanggal_kegiatan" date-only placeholder="Pilih tanggal kegiatan" />
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
        <div class="p-6 sm:p-7 space-y-5 bg-elevated/95 backdrop-blur-md rounded-2xl border border-default/50 shadow-2xl max-h-[85vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-default/30">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-sm">
                <UIcon name="i-lucide-image-up" class="text-xl" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-default leading-snug">Unggah Foto / Video</h3>
                <p class="text-xs text-muted">Album: <span class="font-semibold text-primary">{{ activeAlbum?.nama }}</span></p>
              </div>
            </div>
            <UButton variant="ghost" color="neutral" icon="i-lucide-x" size="xs" class="rounded-lg" @click="photoModal = false" />
          </div>

          <!-- Dropzone -->
          <div
            :class="['border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer', dragOver ? 'border-primary bg-primary/5' : 'border-default hover:border-primary/50']"
            @click="fileInput?.click()"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="onDrop"
          >
            <UIcon name="i-lucide-cloud-upload" class="text-3xl text-muted mb-2" />
            <p class="text-sm text-default font-medium">Seret & lepas foto/video di sini, atau klik untuk memilih</p>
            <p class="text-xs text-muted mt-1">Foto (termasuk HEIC/HEIF) dikompres ke WebP, video dikompres ke MP4. Bisa pilih banyak sekaligus.</p>
            <input ref="fileInput" type="file" multiple accept="image/*,video/*,.heic,.heif" class="hidden" @change="onFileChange" />
          </div>

          <!-- Pilih folder -->
          <div class="flex items-center gap-2">
            <UButton label="Pilih Folder" icon="i-lucide-folder-up" variant="outline" size="sm" @click="folderInput?.click()" />
            <p class="text-xs text-muted">Unggah seluruh isi folder sekaligus</p>
            <input ref="folderInput" type="file" multiple class="hidden" v-bind="folderInputAttrs" @change="onFolderChange" />
          </div>

          <!-- Daftar file -->
          <div v-if="uploadItems.length" class="space-y-2 max-h-64 overflow-y-auto">
            <div v-for="(item, i) in uploadItems" :key="i" class="flex items-center gap-3 p-2 rounded-lg bg-default/40 border border-default/30">
              <UIcon :name="isImageFile(item.file) ? 'i-lucide-image' : 'i-lucide-video'" class="text-muted shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium truncate">{{ item.file.name }}</p>
                <p class="text-[11px] text-muted">{{ formatSize(item.file.size) }} · {{ statusText(item) }}</p>
              </div>
              <UBadge v-if="item.status === 'done'" label="Selesai" color="success" variant="subtle" size="xs" />
              <UBadge v-else-if="item.status === 'error'" :label="item.error || 'Gagal'" color="error" variant="subtle" size="xs" />
              <UBadge v-else-if="item.status === 'compressing'" label="Mengompres" color="warning" variant="subtle" size="xs" />
              <UBadge v-else-if="item.status === 'uploading'" label="Mengunggah" color="info" variant="subtle" size="xs" />
              <UButton v-if="item.status === 'pending' || item.status === 'error'" icon="i-lucide-x" size="xs" variant="ghost" color="neutral" @click="removeItem(i)" />
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-4 border-t border-default/30">
            <p class="text-xs text-muted">{{ uploadItems.length }} item · {{ doneCount }} selesai <span v-if="errorCount">· {{ errorCount }} gagal</span></p>
            <div class="flex items-center gap-2">
              <UButton variant="outline" color="neutral" label="Tutup" size="md" class="rounded-xl px-4" @click="photoModal = false" />
              <UButton :loading="uploading" :disabled="!pendingCount" label="Unggah" color="primary" icon="i-lucide-upload" size="md" class="rounded-xl px-5 shadow-sm" @click="startUpload" />
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Lightbox: lihat foto/video ukuran penuh -->
    <Teleport to="body">
      <div
        v-if="lightboxOpen && lightboxPhotos.length"
        class="lightbox-overlay"
        @click.self="closeLightbox"
      >
        <button class="absolute top-4 right-4 z-10 text-white/70 hover:text-white p-2" @click="closeLightbox">
          <UIcon name="i-lucide-x" class="text-2xl" />
        </button>

        <button v-if="lightboxIndex > 0" class="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2" @click="prevPhoto">
          <UIcon name="i-lucide-chevron-left" class="text-3xl" />
        </button>

        <button v-if="lightboxIndex < lightboxPhotos.length - 1" class="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2" @click="nextPhoto">
          <UIcon name="i-lucide-chevron-right" class="text-3xl" />
        </button>

        <div class="max-w-4xl max-h-[80vh] flex items-center justify-center p-4" @click.stop>
          <video
            v-if="isVideoUrl(lightboxPhotos[lightboxIndex]?.url || '')"
            :src="lightboxPhotos[lightboxIndex]?.url"
            controls
            autoplay
            class="max-w-full max-h-[80vh] rounded-lg"
          />
          <img
            v-else-if="lightboxPhotos[lightboxIndex]?.url"
            :src="lightboxPhotos[lightboxIndex]?.url"
            :alt="lightboxPhotos[lightboxIndex]?.caption || ''"
            class="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
          <div v-else class="w-96 h-96 bg-elevated/20 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-image" class="text-6xl text-white/30" />
          </div>
        </div>

        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
          {{ lightboxIndex + 1 }} / {{ lightboxPhotos.length }}
        </div>
      </div>
    </Teleport>

    <!-- Modal Konfirmasi Hapus -->
    <ConfirmModal
      v-model:open="deleteModalOpen"
      :title="deleteTitle"
      :description="deleteDesc"
      :loading="deleteLoading"
      @confirm="executeDelete"
    />
  </div>
</template>
