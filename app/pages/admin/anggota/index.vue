<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Kelola Anggota — Admin Magyasaka' })

const client = useSupabaseClient()
const { data: items, refresh } = await useAsyncData('admin-members', async () => {
  const { data, error } = await client.from('members').select('*').order('nim')
  if (error) throw error
  return data || []
})

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = ref({ nim: '', nama: '', email: '', no_telepon: '', jurusan: 'Teknik Rekayasa Komputer', angkatan: 2023, status: 'aktif' })
const loading = ref(false)

function openCreate() {
  editing.value = null
  form.value = { nim: '', nama: '', email: '', no_telepon: '', jurusan: 'Teknik Rekayasa Komputer', angkatan: 2023, status: 'aktif' }
  modalOpen.value = true
}

function openEdit(m: any) {
  editing.value = m
  form.value = { ...m }
  modalOpen.value = true
}

async function save() {
  loading.value = true
  try {
    if (editing.value) {
      const { error } = await client.from('members').update(form.value).eq('id', editing.value.id)
      if (error) throw error
    } else {
      const { error } = await client.from('members').insert(form.value)
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
  if (!confirm('Hapus anggota ini?')) return
  const { error } = await client.from('members').delete().eq('id', id)
  if (error) alert(error.message)
  else await refresh()
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
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="remove(m.id)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <UModal v-model:open="modalOpen">
      <template #content>
        <div class="p-4 space-y-3">
          <h3 class="font-semibold">{{ editing ? 'Edit' : 'Tambah' }} Anggota</h3>
          <UInput v-model="form.nim" placeholder="NIM" />
          <UInput v-model="form.nama" placeholder="Nama Lengkap" />
          <UInput v-model="form.email" placeholder="Email" />
          <UInput v-model="form.no_telepon" placeholder="No Telepon" />
          <USelect v-model="form.status" :items="statusOpts" />
          <div class="flex gap-2 justify-end">
            <UButton variant="ghost" label="Batal" @click="modalOpen = false" />
            <UButton :loading="loading" label="Simpan" @click="save" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
