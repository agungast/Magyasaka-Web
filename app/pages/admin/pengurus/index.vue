<script setup lang="ts">

useSeoMeta({ title: 'Kelola Pengurus - Admin Magyasaka' })

const client = useSupabaseClient()
const { data: officers, refresh } = useAsyncData('admin-officers', async () => {
  const { data, error } = await client.from('class_officers').select('*, member:members(*)').order('urutan')
  if (error) throw error
  return (data || []) as any[]
})

const { data: members } = useAsyncData('admin-members-list', async () => {
  const { data } = await client.from('members').select('*').order('nim')
  return (data || []) as any[]
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
    const payload = {
      member_id: form.value.member_id,
      jabatan: form.value.jabatan || '',
      periode: form.value.periode || '2023/2024',
      urutan: form.value.urutan || 0
    }
    if (editing.value) {
      const { error } = await client.from('class_officers').update(payload).eq('id', editing.value.id)
      if (error) throw error
    } else {
      const { error } = await client.from('class_officers').insert(payload)
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
        <div class="p-6 sm:p-7 space-y-5 bg-elevated/95 backdrop-blur-md rounded-2xl border border-default/50 shadow-2xl">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-default/30">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-sm">
                <UIcon :name="editing ? 'i-lucide-shield-alert' : 'i-lucide-shield-plus'" class="text-xl" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-default leading-snug">{{ editing ? 'Edit' : 'Tambah' }} Pengurus Kelas</h3>
                <p class="text-xs text-muted">Tetapkan struktur organisasi dan posisi kepengurusan kelas</p>
              </div>
            </div>
            <UButton variant="ghost" color="neutral" icon="i-lucide-x" size="xs" class="rounded-lg" @click="modalOpen = false" />
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Nama Anggota Mahasiswa</label>
              <USelect v-model="form.member_id" :items="memberOpts" placeholder="Pilih Anggota Mahasiswa" size="md" class="w-full shadow-sm" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Jabatan / Posisi</label>
              <UInput v-model="form.jabatan" placeholder="Contoh: Ketua Kelas / Bendahara Umum" size="md" class="w-full shadow-sm" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Periode Kepengurusan</label>
                <UInput v-model="form.periode" placeholder="Contoh: 2023/2024" size="md" class="w-full shadow-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Urutan Tampilan</label>
                <UInput v-model="form.urutan" type="number" min="0" placeholder="1, 2, 3..." size="md" class="w-full shadow-sm" />
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-default/30">
            <UButton variant="outline" color="neutral" label="Batal" size="md" class="rounded-xl px-4" @click="modalOpen = false" />
            <UButton :loading="loading" label="Simpan Pengurus" color="primary" icon="i-lucide-check" size="md" class="rounded-xl px-5 shadow-sm" @click="save" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
