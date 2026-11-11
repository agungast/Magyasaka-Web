<script setup lang="ts">
// ------------------------------------------------------------
//  IMPORTS – semua simbol yang dipakai dalam script setup
//  Nuxt‑4 menyediakan auto‑imports, tetapi TypeScript/Volar
//  memerlukan deklarasi eksplisit agar diagnostics berfungsi.
// ------------------------------------------------------------
import { ref, reactive } from 'vue'
import { useSeoMeta, useAsyncData } from '#app'
import { UButton, UCard, UModal, UInput, USelect, UIcon } from '#components'
import { useAvatarUpload } from '~/composables/useAvatarUpload'
import { useGalleryUpload } from '~/composables/useGalleryUpload'

useSeoMeta({ title: 'Kelola Anggota - Admin Magyasaka' })

const client = useSupabaseClient()
const toast = useToast()
const { data: items, refresh } = await useAsyncData('admin-members', async () => {
  const { data, error } = await client.from('members').select('*').order('nim')
  if (error) throw error
  return (data || []) as any[]
})

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = reactive({ nim: '', nama: '', email: '', no_telepon: '', jurusan: 'Teknologi Rekayasa Komputer', angkatan: 2023, status: 'aktif', foto_url: '' as string | null })
const loading = ref(false)

// NIM: hanya angka, otomatis diformat X.XX.XX.X.XX (8 digit).
const NIM_GROUPS = [1, 2, 2, 1, 2]
function onNimInput(value: string | number) {
  const digits = String(value).replace(/\D/g, '').slice(0, 8)
  let out = ''
  let i = 0
  for (const len of NIM_GROUPS) {
    if (i >= digits.length) break
    out += (out ? '.' : '') + digits.slice(i, i + len)
    i += len
  }
  form.nim = out
}

const nimError = computed(() =>
  form.nim && !/^\d\.\d{2}\.\d{2}\.\d\.\d{2}$/.test(form.nim)
    ? 'NIM harus 8 digit dengan format X.XX.XX.X.XX'
    : ''
)

const emailError = computed(() =>
  form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)
    ? 'Format email tidak valid, contoh: nama@email.com'
    : ''
)

function openCreate() {
  editing.value = null
  Object.assign(form, { nim: '', nama: '', email: '', no_telepon: '', jurusan: 'Teknologi Rekayasa Komputer', angkatan: 2023, status: 'aktif', foto_url: '' })
  modalOpen.value = true
}

function openEdit(m: any) {
  editing.value = m
  Object.assign(form, { ...m })
  modalOpen.value = true
}

async function save() {
  form.email = form.email.trim()
  form.nim = form.nim.trim()
  if (!form.nim) return toast.add({ title: 'NIM wajib diisi', description: 'Nomor Induk Mahasiswa tidak boleh kosong.', color: 'warning', icon: 'i-lucide-triangle-alert' })
  if (nimError.value) return toast.add({ title: 'Format NIM tidak valid', description: nimError.value, color: 'warning', icon: 'i-lucide-triangle-alert' })
  if (emailError.value) return toast.add({ title: 'Format email tidak valid', description: emailError.value, color: 'warning', icon: 'i-lucide-triangle-alert' })
  loading.value = true
  try {
    if (editing.value) {
        const { error } = await (client.from('members') as any).update(form as any).eq('id' as any, editing.value!.id as any)
        if (error) throw error
      } else {
        const { error } = await (client.from('members') as any).insert(form as any)
        if (error) throw error
    }
    modalOpen.value = false
    await refresh()
  } catch (e: any) {
    toast.add({ title: 'Gagal menyimpan', description: e.message, color: 'error', icon: 'i-lucide-circle-x' })
  } finally {
    loading.value = false
  }
}

const deleteModalOpen = ref(false)
const selectedMember = ref<any>(null)
const deleteLoading = ref(false)

function confirmDelete(m: any) {
  selectedMember.value = m
  deleteModalOpen.value = true
}

async function executeDelete() {
  if (!selectedMember.value) return
  deleteLoading.value = true
  try {
    const { error } = await (client.from('members') as any).delete().eq('id' as any, selectedMember.value.id as any)
    if (error) toast.add({ title: 'Gagal menghapus', description: error.message, color: 'error', icon: 'i-lucide-circle-x' })
    else {
      deleteModalOpen.value = false
      await refresh()
    }
  } catch (e: any) {
    toast.add({ title: 'Gagal menghapus', description: e.message, color: 'error', icon: 'i-lucide-circle-x' })
  } finally {
    deleteLoading.value = false
  }
}

const statusOpts = ['aktif', 'tidak aktif', 'cuti'].map(s => ({ label: s, value: s }))

// --- Upload foto profil ---
function initials(name: string) {
  return (name || '').split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'
}

const fileInput = ref<HTMLInputElement | null>(null)
const { upload: uploadAvatar, uploading: avatarUploading, error: avatarError } = useAvatarUpload()
const { removeFromStorage } = useGalleryUpload()

async function onPhotoChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const url = await uploadAvatar(file)
  if (url) form.foto_url = url
  target.value = ''
}

async function removePhoto() {
  if (form.foto_url) await removeFromStorage(form.foto_url)
  form.foto_url = ''
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-lucide-users" class="text-primary" />
        Kelola Anggota
      </h2>
      <UButton label="Tambah" icon="i-lucide-plus" @click="openCreate" />
    </div>

    <UCard>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-default">
              <th class="text-left py-2">NIM</th>
              <th class="text-left py-2">Nama</th>
              <th class="text-left py-2">Email</th>
              <th class="text-left py-2">Status</th>
              <th class="text-right py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in items" :key="m.id" class="border-b border-default/50">
              <td class="py-2">{{ m.nim }}</td>
              <td class="py-2">
                <div class="flex items-center gap-2">
                  <img v-if="m.foto_url" :src="m.foto_url" :alt="m.nama" class="w-8 h-8 rounded-full object-cover shrink-0" />
                  <div v-else class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-linear-to-br from-slate-500 to-slate-700 shrink-0">{{ initials(m.nama) }}</div>
                  <span class="truncate">{{ m.nama }}</span>
                </div>
              </td>
              <td class="py-2">{{ m.email }}</td>
              <td class="py-2">{{ m.status }}</td>
              <td class="py-2 text-right">
                <UButton size="xs" variant="ghost" icon="i-lucide-edit" @click="openEdit(m)" />
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="confirmDelete(m)" />
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
                <UIcon :name="editing ? 'i-lucide-user-pen' : 'i-lucide-user-plus'" class="text-xl" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-default leading-snug">{{ editing ? 'Edit' : 'Tambah' }} Anggota</h3>
                <p class="text-xs text-muted">Lengkapi biodata anggota mahasiswa kelas di bawah ini</p>
              </div>
            </div>
            <UButton variant="ghost" color="neutral" icon="i-lucide-x" size="xs" class="rounded-lg" @click="modalOpen = false" />
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <!-- Foto Profil -->
            <div class="flex items-center gap-4">
              <div class="relative shrink-0">
                <img v-if="form.foto_url" :src="form.foto_url" :alt="form.nama" class="w-20 h-20 rounded-full object-cover border-2 border-default/50" />
                <div v-else class="w-20 h-20 rounded-full flex items-center justify-center font-display font-bold text-xl text-white bg-linear-to-br from-slate-500 to-slate-700 border-2 border-default/50">
                  {{ initials(form.nama) }}
                </div>
                <div v-if="avatarUploading" class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <UIcon name="i-lucide-loader-circle" class="animate-spin text-white text-xl" />
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onPhotoChange" />
                <UButton label="Unggah Foto" icon="i-lucide-upload" size="xs" variant="outline" :loading="avatarUploading" :disabled="avatarUploading" @click="fileInput?.click()" />
                <UButton v-if="form.foto_url" label="Hapus Foto" icon="i-lucide-trash-2" size="xs" variant="ghost" color="error" @click="removePhoto" />
                <p v-if="avatarError" class="text-xs text-error">{{ avatarError }}</p>
                <p v-else class="text-xs text-muted">JPG, PNG, atau HEIC</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">NIM</label>
                <UInput
                  :model-value="form.nim"
                  inputmode="numeric"
                  maxlength="12"
                  placeholder="Contoh: 4.33.23.0.00"
                  size="md"
                  class="w-full shadow-sm"
                  :color="nimError ? 'error' : undefined"
                  @update:model-value="onNimInput"
                />
                <p v-if="nimError" class="text-xs text-error mt-1">{{ nimError }}</p>
                <p v-else class="text-xs text-muted mt-1">Hanya angka, otomatis diformat X.XX.XX.X.XX</p>
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <UInput v-model="form.nama" placeholder="Nama mahasiswa" size="md" class="w-full shadow-sm" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Email</label>
              <UInput
                v-model="form.email"
                type="email"
                placeholder="nama@email.com"
                size="md"
                class="w-full shadow-sm"
                :color="emailError ? 'error' : undefined"
              />
              <p v-if="emailError" class="text-xs text-error mt-1">{{ emailError }}</p>
              <p v-else class="text-xs text-muted mt-1">Opsional, contoh: nama@email.com</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Status Keanggotaan</label>
              <USelect v-model="form.status" :items="statusOpts" size="md" class="w-full shadow-sm" />
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-default/30">
            <UButton variant="outline" color="neutral" label="Batal" size="md" class="rounded-xl px-4" @click="modalOpen = false" />
            <UButton :loading="loading" label="Simpan Anggota" color="primary" icon="i-lucide-check" size="md" class="rounded-xl px-5 shadow-sm" @click="save" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal Konfirmasi Hapus -->
    <ConfirmModal
      v-model:open="deleteModalOpen"
      title="Hapus Anggota Mahasiswa"
      :description="`Apakah Anda yakin ingin menghapus data anggota ${selectedMember?.nama || ''} (${selectedMember?.nim || ''})? Data yang dihapus tidak dapat dipulihkan.`"
      :loading="deleteLoading"
      @confirm="executeDelete"
    />
  </div>
</template>
