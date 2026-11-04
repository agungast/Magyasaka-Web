<script setup lang="ts">

useSeoMeta({ title: 'Kelola Proyek — Admin Magyasaka' })

const client = useSupabaseClient()
const { data: items, refresh } = useAsyncData('admin-projects', async () => {
  const { data, error } = await client.from('projects').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as any[]
})

const modalOpen = ref(false)
const editing = ref<any>(null)
const form = ref({ nama: '', deskripsi: '', detail: '', thumbnail_url: '', repo_url: '', demo_url: '', teknologi: '', anggota: '', is_highlighted: false, kategori: 'akademik' })
const loading = ref(false)

function openCreate() {
  editing.value = null
  form.value = { nama: '', deskripsi: '', detail: '', thumbnail_url: '', repo_url: '', demo_url: '', teknologi: '', anggota: '', is_highlighted: false, kategori: 'akademik' }
  modalOpen.value = true
}

function openEdit(p: any) {
  editing.value = p
  form.value = {
    nama: p.nama,
    deskripsi: p.deskripsi,
    detail: p.detail,
    thumbnail_url: p.thumbnail_url || '',
    repo_url: p.repo_url || '',
    demo_url: p.demo_url || '',
    teknologi: Array.isArray(p.teknologi) ? p.teknologi.join(', ') : p.teknologi || '',
    anggota: Array.isArray(p.anggota) ? p.anggota.join(', ') : p.anggota || '',
    is_highlighted: p.is_highlighted,
    kategori: p.kategori
  }
  modalOpen.value = true
}

async function save() {
  loading.value = true
  try {
    const payload = {
      nama: form.value.nama,
      deskripsi: form.value.deskripsi,
      detail: form.value.detail,
      thumbnail_url: form.value.thumbnail_url || null,
      repo_url: form.value.repo_url || null,
      demo_url: form.value.demo_url || null,
      teknologi: form.value.teknologi ? form.value.teknologi.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      anggota: form.value.anggota ? form.value.anggota.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      is_highlighted: form.value.is_highlighted,
      kategori: form.value.kategori
    }
    if (editing.value) {
      // @ts-ignore
      const { error } = await client.from('projects').update(payload).eq('id', editing.value.id)
      if (error) throw error
    } else {
      // @ts-ignore
      const { error } = await client.from('projects').insert(payload)
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
  if (!confirm('Hapus proyek ini?')) return
  const { error } = await client.from('projects').delete().eq('id', id)
  if (error) alert(error.message)
  else await refresh()
}

const kategoriOpts = ['akademik', 'IoT', 'Mobile App', 'Web', 'Security', 'AI'].map(k => ({ label: k, value: k }))
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-lucide-folder-code" class="text-primary" />
        Kelola Proyek
      </h2>
      <UButton label="Tambah" icon="i-lucide-plus" @click="openCreate" />
    </div>

    <UCard>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-default">
              <th class="text-left py-2">Nama</th>
              <th class="text-left py-2">Kategori</th>
              <th class="text-left py-2">Unggulan</th>
              <th class="text-right py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in items" :key="p.id" class="border-b border-default/50">
              <td class="py-2">{{ p.nama }}</td>
              <td class="py-2">{{ p.kategori }}</td>
              <td class="py-2">{{ p.is_highlighted ? 'Ya' : 'Tidak' }}</td>
              <td class="py-2 text-right">
                <UButton size="xs" variant="ghost" icon="i-lucide-edit" @click="openEdit(p)" />
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="remove(p.id)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <UModal v-model:open="modalOpen">
      <template #content>
        <div class="p-4 space-y-3 max-h-[80vh] overflow-auto">
          <h3 class="font-semibold">{{ editing ? 'Edit' : 'Tambah' }} Proyek</h3>
          <UInput v-model="form.nama" placeholder="Nama Proyek" />
          <USelect v-model="form.kategori" :items="kategoriOpts" />
          <UTextarea v-model="form.deskripsi" placeholder="Deskripsi Singkat" :rows="2" />
          <UTextarea v-model="form.detail" placeholder="Deskripsi Lengkap" :rows="4" />
          <UInput v-model="form.thumbnail_url" placeholder="Thumbnail URL" />
          <UInput v-model="form.repo_url" placeholder="Repo URL" />
          <UInput v-model="form.demo_url" placeholder="Demo URL" />
          <UInput v-model="form.teknologi" placeholder="Teknologi (pisahkan koma, contoh: Vue,Nuxt)" />
          <UInput v-model="form.anggota" placeholder="Anggota (pisahkan koma)" />
          <label class="flex items-center gap-2 text-sm">
            <UCheckbox v-model="form.is_highlighted" />
            Jadikan sorotan terbaik
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
