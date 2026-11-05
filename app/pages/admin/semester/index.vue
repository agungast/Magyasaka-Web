<script setup lang="ts">
import { ref } from 'vue'
import { useSeoMeta } from '#app'
import { useSupabaseClient, useAsyncData } from '#imports'

useSeoMeta({ title: 'Kelola Semester — Admin Magyasaka' })

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

async function remove(id: string) {
  if (!confirm('Hapus semester ini? Jadwal yang terkait akan tetap ada.')) return
  const { error } = await client.from('semesters').delete().eq('id', id)
  if (error) alert(error.message)
  else await refresh()
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
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="remove(s.id)" />
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
        <div class="p-4 space-y-3">
          <h3 class="font-semibold">{{ editing ? 'Edit' : 'Tambah' }} Semester</h3>
          <USelect v-model="form.nomor" :items="nomorOpts" placeholder="Nomor Semester (1–8)" />
          <div class="grid grid-cols-2 gap-2">
            <USelect v-model="form.tipe" :items="tipeOpts" />
            <p class="text-xs text-muted">Default: nomor genap = Genap, ganjil = Ganjil</p>
          </div>
          <USelect v-model="form.tahun_ajaran" :items="['2023/2024', '2024/2025', '2025/2026', '2026/2027']" />
          <div class="flex gap-2 justify-end">
            <UButton variant="ghost" label="Batal" @click="modalOpen = false" />
            <UButton :loading="loading" label="Simpan" @click="save" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
