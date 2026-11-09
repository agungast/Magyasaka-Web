// ------------------------------------------------------------
//  IMPORTS – semua simbol yang dipakai dalam script setup
//  Nuxt‑4 menyediakan auto‑imports, tetapi TypeScript/Volar
//  memerlukan deklarasi eksplisit agar diagnostics berfungsi.
// ------------------------------------------------------------
import { ref, reactive } from 'vue'
import { useSeoMeta, useSupabaseClient, useAsyncData } from '#app'
import { UButton, UCard, UModal, UInput, USelect, UIcon } from '#components'

<script setup lang="ts">

useSeoMeta({ title: 'Kelola Anggota - Admin Magyasaka' })

const client = useSupabaseClient()
const { data: items, refresh } = await useAsyncData('admin-members', async () => {
  const { data, error } = await client.from('members').select('*').order('nim')
  if (error) throw error
  return (data || []) as any[]
})

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = reactive({ nim: '', nama: '', email: '', no_telepon: '', jurusan: 'Teknologi Rekayasa Komputer', angkatan: 2023, status: 'aktif' })
const loading = ref(false)

function openCreate() {
  editing.value = null
  Object.assign(form, { nim: '', nama: '', email: '', no_telepon: '', jurusan: 'Teknologi Rekayasa Komputer', angkatan: 2023, status: 'aktif' })
  modalOpen.value = true
}

function openEdit(m: any) {
  editing.value = m
  Object.assign(form, { ...m })
  modalOpen.value = true
}

async function save() {
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
    alert(e.message)
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

const statusOpts = ['aktif', 'tidak aktif', 'cuti'].map(s => ({ label: s, value: s }))
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
              <td class="py-2">{{ m.nama }}</td>
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
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">NIM</label>
                <UInput v-model="form.nim" placeholder="Contoh: 2311521001" size="md" class="w-full shadow-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <UInput v-model="form.nama" placeholder="Nama mahasiswa" size="md" class="w-full shadow-sm" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Email</label>
                <UInput v-model="form.email" type="email" placeholder="nama@email.com" size="md" class="w-full shadow-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">No. Telepon / WhatsApp</label>
                <UInput v-model="form.no_telepon" placeholder="08xxxxxxxxxx" size="md" class="w-full shadow-sm" />
              </div>
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
