<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSeoMeta } from '#app'
import { useMembers } from '~/composables/useData'

// Fase 2: Daftar Anggota + Pencarian
useSeoMeta({ title: 'Anggota Kelas - Magyasaka' })

const { data: members } = useMembers()

const searchQuery = ref('')
const sortBy = ref('nim')

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
  return [...items].sort((a: any, b: any) => {
    if (sortBy.value === 'nim') return a.nim.localeCompare(b.nim)
    return a.nama.localeCompare(b.nama)
  })
})

const totalMembers = computed(() => members.value?.length || 0)

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}
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

    <!-- Search & Filter -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="flex-1">
        <UInput
          v-model="searchQuery"
          placeholder="Cari nama atau NIM..."
          icon="i-lucide-search"
          size="md"
        />
      </div>
      <UButtonGroup>
        <UButton
          :color="sortBy === 'nim' ? 'primary' : 'neutral'"
          :variant="sortBy === 'nim' ? 'solid' : 'outline'"
          label="NIM"
          icon="i-lucide-hash"
          size="sm"
          @click="sortBy = 'nim'"
        />
        <UButton
          :color="sortBy === 'nama' ? 'primary' : 'neutral'"
          :variant="sortBy === 'nama' ? 'solid' : 'outline'"
          label="Nama"
          icon="i-lucide-text"
          size="sm"
          @click="sortBy = 'nama'"
        />
      </UButtonGroup>
    </div>

    <!-- Members Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <UCard
        v-for="member in filteredMembers"
        :key="member.id"
        class="card-hover"
      >
        <div class="flex items-center gap-3">
          <!-- Avatar -->
          <div
            class="w-12 h-12 rounded-full bg-elevated border border-default flex items-center justify-center shrink-0 font-display font-bold text-sm"
          >
            {{ getInitials(member.nama) }}
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="font-semibold text-sm truncate">{{ member.nama }}</h2>
            <p class="text-xs text-muted">NIM: {{ member.nim }}</p>
            <p v-if="member.email" class="text-xs text-muted break-all">{{ member.email }}</p>
          </div>
          <UBadge
            :label="member.status || 'aktif'"
            :color="member.status === 'aktif' ? 'success' : 'warning'"
            variant="subtle"
            size="xs"
          />
        </div>
      </UCard>
    </div>

    <div v-if="filteredMembers.length === 0" class="text-center py-16">
      <UIcon name="i-lucide-user-x" class="text-5xl text-muted mb-3" />
      <h2 class="font-semibold text-lg mb-1">Tidak ditemukan</h2>
      <p class="text-muted text-sm">Tidak ada anggota dengan pencarian "{{ searchQuery }}"</p>
    </div>
  </UContainer>
</template>
