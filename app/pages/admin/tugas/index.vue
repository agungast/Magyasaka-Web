<script setup lang="ts">

import { ref } from 'vue'
import { useSeoMeta } from '#app'
import { useSupabaseClient, useAsyncData } from '#imports'

useSeoMeta({ title: 'Kelola Tugas & Ujian - Admin Magyasaka' })

const client = useSupabaseClient()
const { data: items, refresh } = useAsyncData('admin-assignments', async () => {
  const { data, error } = await client.from('assignments').select('*').order('deadline', { ascending: true })
  if (error) throw error
  return data || []
})

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = ref({ judul: '', deskripsi: '', mata_kuliah: '', tipe: 'tugas', deadline: '', tanggal_ujian: '', ruangan_ujian: '' })
const loading = ref(false)

function openCreate() {
  editing.value = null
  form.value = { judul: '', deskripsi: '', mata_kuliah: '', tipe: 'tugas', deadline: '', tanggal_ujian: '', ruangan_ujian: '' }
  modalOpen.value = true
}

function openEdit(a: any) {
  editing.value = a
  form.value = {
    ...a,
    deadline: a.deadline ? a.deadline.slice(0, 16) : '',
    tanggal_ujian: a.tanggal_ujian ? a.tanggal_ujian.slice(0, 16) : '',
    ruangan_ujian: a.ruangan_ujian || ''
  }
  modalOpen.value = true
}

async function save() {
  loading.value = true
  try {
    const payload = {
      judul: form.value.judul,
      deskripsi: form.value.deskripsi,
      mata_kuliah: form.value.mata_kuliah,
      tipe: form.value.tipe,
      deadline: form.value.deadline || null,
      tanggal_ujian: form.value.tanggal_ujian || null,
      ruangan_ujian: form.value.ruangan_ujian || null
    }
    if (editing.value) {
      const { error } = await client.from('assignments').update(payload).eq('id', editing.value.id)
      if (error) throw error
    } else {
      const { error } = await client.from('assignments').insert(payload)
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
  if (!confirm('Hapus tugas/ujian ini?')) return
  const { error } = await client.from('assignments').delete().eq('id', id)
  if (error) alert(error.message)
  else await refresh()
}

const tipeOpts = ['tugas', 'uts', 'uas', 'tubes', 'praktikum'].map(t => ({ label: t.toUpperCase(), value: t }))
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-lucide-clipboard-list" class="text-primary" />
        Kelola Tugas & Ujian
      </h2>
      <UButton label="Tambah" icon="i-lucide-plus" @click="openCreate" />
    </div>

    <UCard>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-default">
              <th class="text-left py-2">Judul</th>
              <th class="text-left py-2">Mata Kuliah</th>
              <th class="text-left py-2">Tipe</th>
              <th class="text-left py-2">Deadline</th>
              <th class="text-right py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in items" :key="a.id" class="border-b border-default/50">
              <td class="py-2">{{ a.judul }}</td>
              <td class="py-2">{{ a.mata_kuliah }}</td>
              <td class="py-2">{{ a.tipe }}</td>
              <td class="py-2">{{ a.deadline ? new Date(a.deadline).toLocaleDateString('id-ID') : '-' }}</td>
              <td class="py-2 text-right">
                <UButton size="xs" variant="ghost" icon="i-lucide-edit" @click="openEdit(a)" />
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="remove(a.id)" />
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
                <UIcon :name="editing ? 'i-lucide-clipboard-pen' : 'i-lucide-clipboard-plus'" class="text-xl" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-default leading-snug">{{ editing ? 'Edit' : 'Tambah' }} Tugas / Ujian</h3>
                <p class="text-xs text-muted">Kelola tugas kuliah, kuis, praktikum, serta jadwal UTS/UAS</p>
              </div>
            </div>
            <UButton variant="ghost" color="neutral" icon="i-lucide-x" size="xs" class="rounded-lg" @click="modalOpen = false" />
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Judul Tugas / Ujian</label>
              <UInput v-model="form.judul" placeholder="Contoh: Laporan Akhir Praktikum Jaringan" size="md" class="w-full shadow-sm" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Mata Kuliah</label>
                <UInput v-model="form.mata_kuliah" placeholder="Contoh: Jaringan Komputer" size="md" class="w-full shadow-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Tipe Aktivitas</label>
                <USelect v-model="form.tipe" :items="tipeOpts" size="md" class="w-full shadow-sm" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Deskripsi / Petunjuk Pengerjaan</label>
              <UTextarea v-model="form.deskripsi" placeholder="Tuliskan instruksi pengerjaan, format file, atau link submit..." :rows="3" size="md" class="w-full shadow-sm" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Deadline Pengumpulan (Tugas)</label>
                <UInput v-model="form.deadline" type="datetime-local" size="md" class="w-full shadow-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Jadwal Pelaksanaan (Ujian/Kuis)</label>
                <UInput v-model="form.tanggal_ujian" type="datetime-local" size="md" class="w-full shadow-sm" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Ruangan Ujian / Lokasi (Opsional)</label>
              <UInput v-model="form.ruangan_ujian" placeholder="Contoh: Ruang 301 / Lab Komputer 1" size="md" class="w-full shadow-sm" />
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-default/30">
            <UButton variant="outline" color="neutral" label="Batal" size="md" class="rounded-xl px-4" @click="modalOpen = false" />
            <UButton :loading="loading" label="Simpan Tugas" color="primary" icon="i-lucide-check" size="md" class="rounded-xl px-5 shadow-sm" @click="save" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
