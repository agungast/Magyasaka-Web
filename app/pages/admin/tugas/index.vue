<script setup lang="ts">

import { ref } from 'vue'
import { useSeoMeta } from '#app'
import { useSupabaseClient, useAsyncData } from '#imports'

useSeoMeta({ title: 'Kelola Tugas & Ujian — Admin Magyasaka' })

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
        <div class="p-4 space-y-3 max-h-[80vh] overflow-auto">
          <h3 class="font-semibold">{{ editing ? 'Edit' : 'Tambah' }} Tugas/Ujian</h3>
          <UInput v-model="form.judul" placeholder="Judul" />
          <UInput v-model="form.mata_kuliah" placeholder="Mata Kuliah" />
          <USelect v-model="form.tipe" :items="tipeOpts" />
          <UTextarea v-model="form.deskripsi" placeholder="Deskripsi" :rows="3" />
          <UInput v-model="form.deadline" type="datetime-local" label="Deadline" />
          <UInput v-model="form.tanggal_ujian" type="datetime-local" label="Tanggal Ujian" />
          <UInput v-model="form.ruangan_ujian" placeholder="Ruangan Ujian" />
          <div class="flex gap-2 justify-end">
            <UButton variant="ghost" label="Batal" @click="modalOpen = false" />
            <UButton :loading="loading" label="Simpan" @click="save" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
