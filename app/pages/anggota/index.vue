<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSeoMeta } from '#app'
import { useMembers } from '~/composables/useData'

// Fase 2: Daftar Anggota + Pencarian
useSeoMeta({ title: 'Anggota Kelas - Magyasaka' })

const { data: members, error, refresh } = useMembers()

const searchQuery = ref('')
const sortBy = ref<'nim' | 'nama'>('nim')
const sortDirection = ref<'asc' | 'desc'>('asc')

const sortOptions = [
  { label: 'NIM (A–Z)', field: 'nim', direction: 'asc' },
  { label: 'NIM (Z–A)', field: 'nim', direction: 'desc' },
  { label: 'Nama (A–Z)', field: 'nama', direction: 'asc' },
  { label: 'Nama (Z–A)', field: 'nama', direction: 'desc' }
] as const

const activeSort = computed(() =>
  sortOptions.find(o => o.field === sortBy.value && o.direction === sortDirection.value) ?? sortOptions[0]
)

const sortItems = computed(() =>
  sortOptions.map(o => ({
    type: 'checkbox' as const,
    label: o.label,
    checked: o === activeSort.value,
    onSelect: () => {
      sortBy.value = o.field
      sortDirection.value = o.direction
    }
  }))
)

const filteredMembers = computed(() => {
  let items = members.value || []
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter((m: any) =>
      m.nama.toLowerCase().includes(q) ||
      m.nim.toLowerCase().includes(q) ||
      (m.email && m.email.toLowerCase().includes(q))
    )
  }
  const dir = sortDirection.value === 'asc' ? 1 : -1
  return [...items].sort((a: any, b: any) => {
    if (sortBy.value === 'nim') return a.nim.localeCompare(b.nim, undefined, { numeric: true }) * dir
    return a.nama.localeCompare(b.nama) * dir
  })
})

const totalMembers = computed(() => members.value?.length || 0)
</script>

<template>
  <UContainer class="py-8">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <UIcon name="i-lucide-users" class="text-primary" />
          Anggota Kelas
        </h1>
        <p class="text-muted mt-1">{{ totalMembers }} mahasiswa Magyasaka</p>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          to="/anggota/pengurus"
          label="Lihat Pengurus"
          icon="i-lucide-shield"
          variant="outline"
          size="sm"
        />
      </div>
    </div>

    <DataError v-if="error" @retry="refresh()" />

    <template v-else>
    <!-- Search & Filter -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <div class="flex-1">
        <UInput
          v-model="searchQuery"
          placeholder="Cari nama atau NIM..."
          icon="i-lucide-search"
          size="md"
        />
      </div>
      <div class="self-start">
        <UDropdownMenu :items="sortItems" :content="{ align: 'end' }">
          <UButton
            :label="activeSort.label"
            icon="i-lucide-arrow-up-down"
            trailing-icon="i-lucide-chevron-down"
            color="neutral"
            variant="outline"
            size="sm"
            aria-label="Urutkan anggota"
          />
        </UDropdownMenu>
      </div>
    </div>

    <!-- Members Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <MemberCard
        v-for="member in filteredMembers"
        :key="member.id"
        :member="member"
      />
    </div>

    <div v-if="filteredMembers.length === 0" class="text-center py-16">
      <UIcon name="i-lucide-user-x" class="text-5xl text-muted mb-3" />
      <h2 class="font-semibold text-lg mb-1">Tidak ditemukan</h2>
      <p class="text-muted text-sm">Tidak ada anggota dengan pencarian "{{ searchQuery }}"</p>
    </div>
    </template>
  </UContainer>
</template>
