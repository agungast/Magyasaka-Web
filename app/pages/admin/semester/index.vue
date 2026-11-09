<script setup lang="ts">
import { ref } from 'vue'
import { useSeoMeta } from '#app'
import { useSupabaseClient, useAsyncData } from '#imports'

useSeoMeta({ title: 'Kelola Semester - Admin Magyasaka' })

const client = useSupabaseClient()
const { data: semesters, refresh } = useAsyncData('admin-semesters', async () => {
  const { data, error } = await client.from('semesters').select('*').order('nomor')
  if (error) throw error
  return (data || []) as any[]
}, { lazy: true })

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = ref<{ nomor?: number; tipe: string; tahun_ajaran: string }>({
  nomor: 1,
  tipe: 'Ganjil',
  tahun_ajaran: ''
})
const loading = ref(false)

const nomorOpts = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ label: `Sem ${n}`, value: n }))
const tipeOpts = ['Ganjil', 'Genap']

// Tahun ajaran: Sem 1 = 2023/2024, Sem 2 = 2024/2025, …  (formulasi: `${2022 + n}/${2023 + n}`)
function defaultTahun(nomor: number): string {
  return `${2022 + nomor}/${2023 + nomor}`
}

function nomorToTip(nomor: number): string {
  return nomor % 2 === 0 ? 'Genap' : 'Ganjil'
}

function openCreate() {
  editing.value = null
  form.value = {
    nomor: 1,
    tipe: nomorToTip(1),
    tahun_ajaran: defaultTahun(1)
  }
  modalOpen.value = true
}

async function save() {
  if (!form.value.nomor || !form.value.tahun_ajaran) return alert('Semester dan tahun ajaran wajib.')
  loading.value = true
  try {
    const payload = {
      nomor: form.value.nomor,
      tipe: form.value.tipe,
      tahun_ajaran: form.value.tahun_ajaran
    }
    if (editing.value) {
      await client.from('semesters').update(payload).eq('id', editing.value.id)
    } else {
      await client.from('semesters').insert(payload)
    }
    modalOpen.value = false
    await refresh()
  } catch {
    alert('Gagal menyimpan semester.')
  } finally {
    loading.value = false
  }
}

const deleteModalOpen = ref(false)
const selectedSemester = ref<any>(null)
const deleteLoading = ref(false)

function confirmDelete(s: any) {
  selectedSemester.value = s
  deleteModalOpen.value = true
}

async function executeDelete() {
  if (!selectedSemester.value) return
  deleteLoading.value = true
  try {
    const { error } = await client.from('semesters').delete().eq('id', selectedSemester.value.id)
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
        <UIcon name="i-lucide-calendar-days" class="text-primary" />
        Kelola Semester
      </h2>
      <UButton label="Tambah Semester" icon="i-lucide-plus" @click="openCreate" />
    </div>

    <UCard>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-default">
              <th class="text-left py-2">Nomor</th>
              <th class="text-left py-2">Tipe</th>
              <th class="text-left py-2">Tahun Ajaran</th>
              <th class="text-right py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in semesters" :key="s.id" class="border-b border-default/50">
              <td class="py-2">{{ s.nomor }}</td>
              <td class="py-2">{{ s.tipe }}</td>
              <td class="py-2 text-muted">{{ s.tahun_ajaran }}</td>
              <td class="py-2 text-right">
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="confirmDelete(s)" />
              </td>
            </tr>
            <tr v-if="!semesters?.length">
              <td colspan="4" class="py-4 text-center text-muted">Belum ada semester. Tambahkan dari formulir di atas.</td>
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
                <UIcon :name="editing ? 'i-lucide-calendar-cog' : 'i-lucide-calendar-plus'" class="text-xl" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-default leading-snug">{{ editing ? 'Edit' : 'Tambah' }} Semester</h3>
                <p class="text-xs text-muted">Kelola data periode semester perkuliahan dan tahun ajaran</p>
              </div>
            </div>
            <UButton variant="ghost" color="neutral" icon="i-lucide-x" size="xs" class="rounded-lg" @click="modalOpen = false" />
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Nomor Semester</label>
                <USelect v-model="form.nomor" :items="nomorOpts" placeholder="Pilih Semester" size="md" class="w-full shadow-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Tipe Perkuliahan</label>
                <USelect v-model="form.tipe" :items="tipeOpts" size="md" class="w-full shadow-sm" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Tahun Ajaran</label>
              <USelect v-model="form.tahun_ajaran" :items="['2023/2024', '2024/2025', '2025/2026', '2026/2027', '2027/2028']" size="md" class="w-full shadow-sm" />
              <p class="text-xs text-muted mt-1.5">Format tahun akademik perkuliahan angkatan</p>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-default/30">
            <UButton variant="outline" color="neutral" label="Batal" size="md" class="rounded-xl px-4" @click="modalOpen = false" />
            <UButton :loading="loading" label="Simpan Semester" color="primary" icon="i-lucide-check" size="md" class="rounded-xl px-5 shadow-sm" @click="save" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal Konfirmasi Hapus -->
    <ConfirmModal
      v-model:open="deleteModalOpen"
      title="Hapus Semester"
      :description="`Apakah Anda yakin ingin menghapus data Semester ${selectedSemester?.nomor || ''} ${selectedSemester?.tipe || ''} (${selectedSemester?.tahun_ajaran || ''})? Jadwal kuliah yang terkait akan tetap tersimpan.`"
      :loading="deleteLoading"
      @confirm="executeDelete"
    />
  </div>
</template>
