<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Kelola Jadwal — Admin Magyasaka' })

const client = useSupabaseClient()
const { data: items, refresh } = await useAsyncData('admin-schedules', async () => {
  const { data, error } = await client.from('schedules').select('*').order('hari').order('jam_mulai')
  if (error) throw error
  return data || []
})

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = ref({ mata_kuliah: '', dosen: '', hari: 'Senin', jam_mulai: '08:00', jam_selesai: '10:30', ruangan: '', kode_mk: '', sks: 3, warna: '#6366f1' })
const loading = ref(false)

function openCreate() {
  editing.value = null
  form.value = { mata_kuliah: '', dosen: '', hari: 'Senin', jam_mulai: '08:00', jam_selesai: '10:30', ruangan: '', kode_mk: '', sks: 3, warna: '#6366f1' }
  modalOpen.value = true
}

function openEdit(s: any) {
  editing.value = s
  form.value = { ...s }
  modalOpen.value = true
}

async function save() {
  loading.value = true
  try {
    if (editing.value) {
      const { error } = await client.from('schedules').update(form.value).eq('id', editing.value.id)
      if (error) throw error
    } else {
      const { error } = await client.from('schedules').insert(form.value)
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
  if (!confirm('Hapus jadwal ini?')) return
  const { error } = await client.from('schedules').delete().eq('id', id)
  if (error) alert(error.message)
  else await refresh()
}

const hariOpts = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(h => ({ label: h, value: h }))
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-lucide-calendar" class="text-primary" />
        Kelola Jadwal
      </h2>
      <UButton label="Tambah" icon="i-lucide-plus" @click="openCreate" />
    </div>

    <UCard>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-default">
              <th class="text-left py-2">Mata Kuliah</th>
              <th class="text-left py-2">Hari</th>
              <th class="text-left py-2">Jam</th>
              <th class="text-left py-2">Ruangan</th>
              <th class="text-left py-2">SKS</th>
              <th class="text-right py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in items" :key="s.id" class="border-b border-default/50">
              <td class="py-2">
                <p class="font-medium">{{ s.mata_kuliah }}</p>
                <p class="text-xs text-muted">{{ s.dosen }}</p>
              </td>
              <td class="py-2">{{ s.hari }}</td>
              <td class="py-2">{{ s.jam_mulai }} - {{ s.jam_selesai }}</td>
              <td class="py-2">{{ s.ruangan }}</td>
              <td class="py-2">{{ s.sks }}</td>
              <td class="py-2 text-right">
                <UButton size="xs" variant="ghost" icon="i-lucide-edit" @click="openEdit(s)" />
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="remove(s.id)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <UModal v-model:open="modalOpen">
      <template #content>
        <div class="p-4 space-y-3">
          <h3 class="font-semibold">{{ editing ? 'Edit' : 'Tambah' }} Jadwal</h3>
          <UInput v-model="form.mata_kuliah" placeholder="Mata Kuliah" />
          <UInput v-model="form.dosen" placeholder="Dosen" />
          <div class="grid grid-cols-2 gap-2">
            <USelect v-model="form.hari" :items="hariOpts" />
            <UInput v-model="form.sks" type="number" placeholder="SKS" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <UInput v-model="form.jam_mulai" type="time" />
            <UInput v-model="form.jam_selesai" type="time" />
          </div>
          <UInput v-model="form.ruangan" placeholder="Ruangan" />
          <UInput v-model="form.kode_mk" placeholder="Kode MK" />
          <UInput v-model="form.warna" type="color" />
          <div class="flex gap-2 justify-end">
            <UButton variant="ghost" label="Batal" @click="modalOpen = false" />
            <UButton :loading="loading" label="Simpan" @click="save" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
