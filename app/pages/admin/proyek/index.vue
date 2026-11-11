<script setup lang="ts">

import { useGalleryUpload, isImageFile, isVideoFile, isVideoUrl, type UploadItem } from '~/composables/useGalleryUpload'

useSeoMeta({ title: 'Kelola Proyek - Admin Magyasaka' })

const client = useSupabaseClient()
const { data: items, refresh } = useAsyncData('admin-projects', async () => {
  const { data, error } = await client.from('projects').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as any[]
})

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = ref({ nama: '', deskripsi: '', detail: '', thumbnail_url: '', screenshots: [] as string[], repo_url: '', website_url: '', demo_url: '', teknologi: '', anggota: '', is_highlighted: false, kategori: 'akademik' })
const loading = ref(false)

function openCreate() {
  editing.value = null
  form.value = { nama: '', deskripsi: '', detail: '', thumbnail_url: '', screenshots: [], repo_url: '', website_url: '', demo_url: '', teknologi: '', anggota: '', is_highlighted: false, kategori: 'akademik' }
  modalOpen.value = true
}

function openEdit(p: any) {
  editing.value = p
  form.value = {
    nama: p.nama,
    deskripsi: p.deskripsi,
    detail: p.detail,
    thumbnail_url: p.thumbnail_url || '',
    screenshots: Array.isArray(p.screenshots) ? p.screenshots : [],
    repo_url: p.repo_url || '',
    website_url: p.website_url || '',
    demo_url: p.demo_url || '',
    teknologi: Array.isArray(p.teknologi) ? p.teknologi.join(', ') : p.teknologi || '',
    anggota: Array.isArray(p.anggota) ? p.anggota.join(', ') : p.anggota || '',
    is_highlighted: p.is_highlighted,
    kategori: p.kategori
  }
  modalOpen.value = true
}

async function save() {
  loading.value = true
  try {
    const payload = {
      nama: form.value.nama,
      deskripsi: form.value.deskripsi,
      detail: form.value.detail,
      thumbnail_url: form.value.thumbnail_url || null,
      screenshots: form.value.screenshots,
      repo_url: form.value.repo_url || null,
      website_url: form.value.website_url || null,
      demo_url: form.value.demo_url || null,
      teknologi: form.value.teknologi ? form.value.teknologi.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      anggota: form.value.anggota ? form.value.anggota.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      is_highlighted: form.value.is_highlighted,
      kategori: form.value.kategori
    }
    if (editing.value) {
      const { error } = await client.from('projects').update(payload).eq('id', editing.value.id)
      if (error) throw error
    } else {
      const { error } = await client.from('projects').insert(payload)
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
const selectedProject = ref<any>(null)
const deleteLoading = ref(false)

function confirmDelete(p: any) {
  selectedProject.value = p
  deleteModalOpen.value = true
}

async function executeDelete() {
  if (!selectedProject.value) return
  deleteLoading.value = true
  try {
    const { error } = await client.from('projects').delete().eq('id', selectedProject.value.id)
    if (error) alert(error.message)
    else {
      if (selectedProject.value.thumbnail_url) await removeFromStorage(selectedProject.value.thumbnail_url)
      if (selectedProject.value.demo_url) await removeFromStorage(selectedProject.value.demo_url)
      for (const url of selectedProject.value.screenshots || []) await removeFromStorage(url)
      deleteModalOpen.value = false
      await refresh()
    }
  } catch (e: any) {
    alert(e.message)
  } finally {
    deleteLoading.value = false
  }
}

// Upload thumbnail (foto) dan video demo langsung dari browser.
const { uploadOne, removeFromStorage } = useGalleryUpload()
const thumbInput = ref<HTMLInputElement | null>(null)
const demoInput = ref<HTMLInputElement | null>(null)
const thumbUploading = ref(false)
const demoUploading = ref(false)

function projectFolder() {
  return `projects/${editing.value?.id || Date.now()}`
}

async function uploadThumb(e: Event) {
  const t = e.target as HTMLInputElement
  const file = t.files?.[0]
  t.value = ''
  if (!file || !isImageFile(file)) return
  thumbUploading.value = true
  try {
    const item: UploadItem = { file, status: 'pending', progress: 0 }
    form.value.thumbnail_url = await uploadOne(item, projectFolder())
  } catch (err: any) {
    alert(err?.message || 'Gagal mengunggah thumbnail')
  } finally {
    thumbUploading.value = false
  }
}

async function uploadDemo(e: Event) {
  const t = e.target as HTMLInputElement
  const file = t.files?.[0]
  t.value = ''
  if (!file || !isVideoFile(file)) return
  demoUploading.value = true
  try {
    const item: UploadItem = { file, status: 'pending', progress: 0 }
    form.value.demo_url = await uploadOne(item, projectFolder())
  } catch (err: any) {
    alert(err?.message || 'Gagal mengunggah video demo')
  } finally {
    demoUploading.value = false
  }
}

// Beberapa screenshot sekaligus (capture web, proses, hasil karya).
const screensInput = ref<HTMLInputElement | null>(null)
const screensUploading = ref(false)

async function uploadScreens(e: Event) {
  const t = e.target as HTMLInputElement
  const files = Array.from(t.files || [])
  t.value = ''
  const images = files.filter(isImageFile)
  if (!images.length) return
  screensUploading.value = true
  try {
    for (const file of images) {
      const item: UploadItem = { file, status: 'pending', progress: 0 }
      form.value.screenshots.push(await uploadOne(item, projectFolder()))
    }
  } catch (err: any) {
    alert(err?.message || 'Gagal mengunggah screenshot')
  } finally {
    screensUploading.value = false
  }
}

function removeScreenshot(i: number) {
  form.value.screenshots.splice(i, 1)
}

const kategoriOpts = ['akademik', 'IoT', 'Mobile App', 'Web', 'Security', 'AI'].map(k => ({ label: k, value: k }))
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-lucide-folder-code" class="text-primary" />
        Kelola Proyek
      </h2>
      <UButton label="Tambah" icon="i-lucide-plus" @click="openCreate" />
    </div>

    <UCard>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-default">
              <th class="text-left py-2">Nama</th>
              <th class="text-left py-2">Kategori</th>
              <th class="text-left py-2">Unggulan</th>
              <th class="text-right py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in items" :key="p.id" class="border-b border-default/50">
              <td class="py-2">{{ p.nama }}</td>
              <td class="py-2">{{ p.kategori }}</td>
              <td class="py-2">{{ p.is_highlighted ? 'Ya' : 'Tidak' }}</td>
              <td class="py-2 text-right">
                <UButton size="xs" variant="ghost" icon="i-lucide-edit" @click="openEdit(p)" />
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="confirmDelete(p)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <UModal v-model:open="modalOpen" :ui="{ content: 'max-w-4xl' }">
      <template #content>
        <div class="p-6 sm:p-7 space-y-5 bg-elevated/95 backdrop-blur-md rounded-2xl border border-default/50 shadow-2xl max-h-[85vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-default/30">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-sm">
                <UIcon :name="editing ? 'i-lucide-folder-pen' : 'i-lucide-folder-plus'" class="text-xl" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-default leading-snug">{{ editing ? 'Edit' : 'Tambah' }} Proyek Karya</h3>
                <p class="text-xs text-muted">Showcase portofolio karya mahasiswa kelas Magyasaka</p>
              </div>
            </div>
            <UButton variant="ghost" color="neutral" icon="i-lucide-x" size="xs" class="rounded-lg" @click="modalOpen = false" />
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Nama Proyek</label>
                <UInput v-model="form.nama" placeholder="Contoh: Sistem Monitoring IoT Smart Farm" size="md" class="w-full shadow-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Kategori</label>
                <USelect v-model="form.kategori" :items="kategoriOpts" size="md" class="w-full shadow-sm" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Deskripsi Singkat</label>
              <UTextarea v-model="form.deskripsi" placeholder="Penjelasan singkat 1-2 kalimat untuk kartu proyek..." :rows="2" size="md" class="w-full shadow-sm" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Deskripsi Lengkap / Detail</label>
              <UTextarea v-model="form.detail" placeholder="Detail arsitektur, fitur utama, dan tujuan proyek..." :rows="4" size="md" class="w-full shadow-sm" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Thumbnail (Gambar Sampul)</label>
              <div v-if="form.thumbnail_url" class="relative group rounded-xl overflow-hidden border border-default/50">
                <img :src="form.thumbnail_url" alt="Thumbnail proyek" class="w-full h-40 object-cover" />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <UButton size="xs" color="neutral" icon="i-lucide-refresh-cw" label="Ganti" @click="thumbInput?.click()" />
                  <UButton size="xs" color="error" icon="i-lucide-trash-2" label="Hapus" @click="form.thumbnail_url = ''" />
                </div>
              </div>
              <button
                v-else
                type="button"
                class="w-full border-2 border-dashed border-default hover:border-primary/50 rounded-xl p-6 text-center transition-colors disabled:opacity-60"
                :disabled="thumbUploading"
                @click="thumbInput?.click()"
              >
                <UIcon :name="thumbUploading ? 'i-lucide-loader-2' : 'i-lucide-image-up'" :class="['text-2xl text-muted mb-1', thumbUploading ? 'animate-spin' : '']" />
                <p class="text-sm text-default font-medium">{{ thumbUploading ? 'Mengompres & mengunggah...' : 'Pilih gambar sampul' }}</p>
                <p class="text-xs text-muted mt-1">JPG, PNG, WebP, HEIC — otomatis dikompres ke WebP.</p>
              </button>
              <input ref="thumbInput" type="file" accept="image/*,.heic,.heif" class="hidden" @change="uploadThumb" />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider">Screenshot Proyek (Opsional)</label>
                <span class="text-[11px] text-muted">{{ form.screenshots.length }} foto</span>
              </div>
              <div v-if="form.screenshots.length" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div v-for="(shot, i) in form.screenshots" :key="shot" class="relative group rounded-xl overflow-hidden border border-default/50">
                  <img :src="shot" alt="Screenshot proyek" class="w-full h-24 object-cover" />
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <UButton size="xs" color="error" icon="i-lucide-trash-2" @click="removeScreenshot(i)" />
                  </div>
                </div>
              </div>
              <button
                type="button"
                class="w-full border-2 border-dashed border-default hover:border-primary/50 rounded-xl p-4 text-center transition-colors disabled:opacity-60"
                :disabled="screensUploading"
                @click="screensInput?.click()"
              >
                <UIcon :name="screensUploading ? 'i-lucide-loader-2' : 'i-lucide-images'" :class="['text-2xl text-muted mb-1', screensUploading ? 'animate-spin' : '']" />
                <p class="text-sm text-default font-medium">{{ screensUploading ? 'Mengompres & mengunggah...' : 'Tambah screenshot' }}</p>
                <p class="text-xs text-muted mt-1">Capture website, proses pembuatan, atau hasil karya. Bisa pilih banyak sekaligus.</p>
              </button>
              <input ref="screensInput" type="file" accept="image/*,.heic,.heif" multiple class="hidden" @change="uploadScreens" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Repository / Link Karya (Opsional)</label>
                <UInput v-model="form.repo_url" placeholder="https://github.com/..." size="md" class="w-full shadow-sm" />
                <p class="text-xs text-muted mt-1">GitHub, Figma, Drive, atau tautan karya lainnya.</p>
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Link Website (Opsional)</label>
                <UInput v-model="form.website_url" placeholder="https://..." size="md" class="w-full shadow-sm" />
                <p class="text-xs text-muted mt-1">Isi jika proyek sudah di-hosting.</p>
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Live Demo URL (Opsional)</label>
                <UInput v-model="form.demo_url" placeholder="https://..." size="md" class="w-full shadow-sm" />
                <p class="text-xs text-muted mt-1">Atau unggah video demo di bawah.</p>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Video Demo (Opsional)</label>
              <div v-if="form.demo_url && isVideoUrl(form.demo_url)" class="rounded-xl overflow-hidden border border-default/50 bg-default/40">
                <video :src="form.demo_url" controls class="w-full max-h-56 object-contain" />
                <div class="flex items-center justify-between gap-2 p-2">
                  <span class="text-xs text-muted">Video demo terpasang</span>
                  <UButton size="xs" color="error" variant="soft" icon="i-lucide-trash-2" label="Hapus video" @click="form.demo_url = ''" />
                </div>
              </div>
              <div v-else class="flex flex-col sm:flex-row sm:items-center gap-2">
                <UButton :loading="demoUploading" :label="demoUploading ? 'Mengompres & mengunggah...' : 'Unggah Video Demo'" icon="i-lucide-video" variant="outline" size="sm" @click="demoInput?.click()" />
                <p class="text-xs text-muted">Atau isi link demo di atas. Video otomatis dikompres ke MP4.</p>
              </div>
              <input ref="demoInput" type="file" accept="video/*" class="hidden" @change="uploadDemo" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Teknologi / Stack</label>
                <UInput v-model="form.teknologi" placeholder="Vue, Nuxt, Tailwind, Supabase" size="md" class="w-full shadow-sm" />
                <p class="text-xs text-muted mt-1">Pisahkan dengan koma</p>
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Anggota Tim Pengembang</label>
                <UInput v-model="form.anggota" placeholder="Nama 1, Nama 2, Nama 3" size="md" class="w-full shadow-sm" />
                <p class="text-xs text-muted mt-1">Pisahkan dengan koma</p>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-default/40 border border-default/30">
              <label class="flex items-center gap-3 text-sm cursor-pointer select-none">
                <UCheckbox v-model="form.is_highlighted" />
                <div>
                  <p class="font-medium text-default text-xs sm:text-sm">Jadikan Karya Sorotan Terbaik (Highlight Proyek)</p>
                  <p class="text-xs text-muted">Proyek ini akan tampil di bagian unggulan beranda dan puncak daftar proyek</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-default/30">
            <UButton variant="outline" color="neutral" label="Batal" size="md" class="rounded-xl px-4" @click="modalOpen = false" />
            <UButton :loading="loading" label="Simpan Proyek" color="primary" icon="i-lucide-check" size="md" class="rounded-xl px-5 shadow-sm" @click="save" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal Konfirmasi Hapus -->
    <ConfirmModal
      v-model:open="deleteModalOpen"
      title="Hapus Proyek Karya"
      :description="`Apakah Anda yakin ingin menghapus proyek '${selectedProject?.nama || ''}'? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.`"
      :loading="deleteLoading"
      @confirm="executeDelete"
    />
  </div>
</template>
