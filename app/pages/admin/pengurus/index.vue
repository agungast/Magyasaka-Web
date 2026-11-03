<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Kelola Pengurus — Admin Magyasaka' })

const client = useSupabaseClient()
const { data: officers, refresh } = await useAsyncData('admin-officers', async () => {
  const { data, error } = await client.from('class_officers').select('*, member:members(*)').order('urutan')
  if (error) throw error
  return data || []
})

const { data: members } = await useAsyncData('admin-members-list', async () => {
  const { data } = await client.from('members').select('*').order('nim')
  return data || []
})

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = ref({ member_id: '', jabatan: '', periode: '2023/2024', urutan: 0 })
const loading = ref(false)

function openCreate() {
  editing.value = null
  form.value = { member_id: '', jabatan: '', periode: '2023/2024', urutan: 0 }
  modalOpen.value = true
}

function openEdit(o: any) {
  editing.value = o
  form.value = { member_id: o.member_id, jabatan: o.jabatan, periode: o.periode, urutan: o.urutan }
  modalOpen.value = true
}

async function save() {
  loading.value = true
  try {
    if (editing.value) {
      const { error } = await client.from('class_officers').update(form.value).eq('id', editing.value.id)
      if (error) throw error
    } else {
      const { error } = await client.from('class_officers').insert(form.value)
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
  if (!confirm('Hapus pengurus ini?')) return
  const { error } = await client.from('class_officers').delete().eq('id', id)
  if (error) alert(error.message)
  else await refresh()
}

const memberOpts = computed(() => members.value?.map(m => ({ label: `${m.nama} (${m.nim})`, value: m.id })) || [])
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-lucide-shield" class="text-primary" />
        Kelola Pengurus
      </h2>
      <UButton label="Tambah" icon="i-lucide-plus" @click="openCreate" />
    </div>

    <UCard>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-default">
              <th class="text-left py-2">Urutan</th>
              <th class="text-left py-2">Nama</th>
              <th class="text-left py-2">Jabatan</th>
              <th class="text-left py-2">Periode</th>
              <th class="text-right py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in officers" :key="o.id" class="border-b border-default/50">
              <td class="py-2">{{ o.urutan }}</td>
              <td class="py-2">{{ o.member?.nama }}</td>
              <td class="py-2">{{ o.jabatan }}</td>
              <td class="py-2">{{ o.periode }}</td>
              <td class="py-2 text-right">
                <UButton size="xs" variant="ghost" icon="i-lucide-edit" @click="openEdit(o)" />
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="remove(o.id)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <UModal v-model:open="modalOpen">
      <template #content>
        <div class="p-4 space-y-3">
          <h3 class="font-semibold">{{ editing ? 'Edit' : 'Tambah' }} Pengurus</h3>
          <USelect v-model="form.member_id" :items="memberOpts" placeholder="Pilih Anggota" />
          <UInput v-model="form.jabatan" placeholder="Jabatan" />
          <UInput v-model="form.periode" placeholder="Periode" />
          <UInput v-model="form.urutan" type="number" placeholder="Urutan" />
          <div class="flex gap-2 justify-end">
            <UButton variant="ghost" label="Batal" @click="modalOpen = false" />
            <UButton :loading="loading" label="Simpan" @click="save" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
