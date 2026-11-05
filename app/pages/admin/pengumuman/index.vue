<script setup lang="ts">

useSeoMeta({ title: 'Kelola Pengumuman — Admin Magyasaka' })

const client = useSupabaseClient()
const { data: items, refresh } = useAsyncData('admin-announcements', async () => {
  const { data, error } = await client.from('announcements').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as any[]
})

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = ref({ judul: '', konten: '', kategori: 'umum', is_pinned: false, penulis: '' })
const loading = ref(false)

function openCreate() {
  editing.value = null
  form.value = { judul: '', konten: '', kategori: 'umum', is_pinned: false, penulis: '' }
  modalOpen.value = true
}

function openEdit(a: any) {
  editing.value = a
  form.value = { judul: a.judul, konten: a.konten, kategori: a.kategori, is_pinned: a.is_pinned, penulis: a.penulis || '' }
  modalOpen.value = true
}

async function save() {
  loading.value = true
  try {
    if (editing.value) {
      const { error } = await client.from('announcements').update(form.value).eq('id', editing.value.id)
      if (error) throw error
    } else {
      const { error } = await client.from('announcements').insert(form.value)
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
  if (!confirm('Hapus pengumuman ini?')) return
  const { error } = await client.from('announcements').delete().eq('id', id)
  if (error) alert(error.message)
  else await refresh()
}

const kategoriOpts = [
  { label: 'Umum', value: 'umum' },
  { label: 'Akademik', value: 'akademik' },
  { label: 'Kegiatan', value: 'kegiatan' },
  { label: 'Penting', value: 'penting' }
]
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-lucide-megaphone" class="text-primary" />
        Kelola Pengumuman
      </h2>
      <UButton label="Tambah" icon="i-lucide-plus" @click="openCreate" />
    </div>

    <UCard>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-default">
              <th class="text-left py-2">Judul</th>
              <th class="text-left py-2">Kategori</th>
              <th class="text-left py-2">Pinned</th>
              <th class="text-right py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in items" :key="a.id" class="border-b border-default/50">
              <td class="py-2">
                <p class="font-medium">{{ a.judul }}</p>
                <p class="text-xs text-muted line-clamp-1">{{ a.konten }}</p>
              </td>
              <td class="py-2">{{ a.kategori }}</td>
              <td class="py-2">{{ a.is_pinned ? 'Ya' : 'Tidak' }}</td>
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
        <div class="p-4 space-y-3">
          <h3 class="font-semibold">{{ editing ? 'Edit' : 'Tambah' }} Pengumuman</h3>
          <UInput v-model="form.judul" placeholder="Judul" />
          <UTextarea v-model="form.konten" placeholder="Konten" :rows="4" />
          <USelect v-model="form.kategori" :items="kategoriOpts" />
          <UInput v-model="form.penulis" placeholder="Penulis" />
          <label class="flex items-center gap-2 text-sm">
            <UCheckbox v-model="form.is_pinned" />
            Pin di beranda
          </label>
          <div class="flex gap-2 justify-end">
            <UButton variant="ghost" label="Batal" @click="modalOpen = false" />
            <UButton :loading="loading" label="Simpan" @click="save" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
