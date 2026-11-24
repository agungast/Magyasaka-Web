<script setup lang="ts">
import { useSeoMeta } from '#app'
import { useOfficers } from '~/composables/useData'

// Fase 2: Struktur Pengurus Kelas
useSeoMeta({ title: 'Pengurus Kelas - Magyasaka' })

const { data: officers } = useOfficers()

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

const jabatanIcon: Record<string, string> = {
  'Ketua Kelas': 'i-lucide-crown',
  'Wakil Ketua': 'i-lucide-award',
  'Sekretaris': 'i-lucide-pen-tool',
  'Bendahara': 'i-lucide-wallet',
  'Koordinator Akademik': 'i-lucide-book-open',
  'PJ': 'i-lucide-book-open'
}

const jabatanColor: Record<string, string> = {
  'Ketua Kelas': '#f59e0b',
  'Wakil Ketua': '#6366f1',
  'Sekretaris': '#ec4899',
  'Bendahara': '#10b981',
  'Koordinator Akademik': '#0ea5e9',
  'PJ': '#a855f7'
}
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-8">
      <UButton
        to="/anggota"
        label="Kembali ke Daftar Anggota"
        icon="i-lucide-arrow-left"
        variant="link"
        size="sm"
        class="mb-4"
      />
      <h1 class="text-2xl md:text-3xl font-bold flex items-center gap-2">
        <UIcon name="i-lucide-shield" class="text-primary" />
        Struktur Pengurus Kelas
      </h1>
      <p class="text-muted mt-1">Kelompok Pengurus Magyasaka</p>
    </div>

    <!-- Organization Chart -->
    <div class="max-w-4xl mx-auto">
      <!-- Ketua -->
      <div v-if="officers?.[0]" class="flex justify-center mb-8">
        <UCard class="card-hover w-full max-w-sm text-center border-2 border-amber-500/30">
          <div class="flex flex-col items-center">
            <img
              v-if="officers[0].member?.foto_url"
              :src="officers[0].member.foto_url"
              :alt="officers[0].member?.nama || officers[0].jabatan"
              class="w-20 h-20 rounded-full object-cover border-2 border-default/40 mb-3"
            />
            <div
              v-else
              :style="{ backgroundColor: jabatanColor[officers[0].jabatan] + '20', color: jabatanColor[officers[0].jabatan] }"
              class="w-20 h-20 rounded-full flex items-center justify-center font-bold text-xl mb-3"
            >
              {{ getInitials(officers[0].member?.nama || officers[0].jabatan) }}
            </div>
            <UIcon :name="jabatanIcon[officers[0].jabatan] || 'i-lucide-user'" :style="{ color: jabatanColor[officers[0].jabatan] }" class="text-2xl mb-1" />
            <h2 class="font-bold text-base">{{ officers[0].member?.nama || '-' }}</h2>
            <p class="text-sm text-muted">{{ officers[0].jabatan }}</p>
            <p class="text-xs text-muted mt-1">NIM: {{ officers[0].member?.nim || '-' }}</p>
          </div>
        </UCard>
      </div>

      <!-- Connector line -->
      <div class="flex justify-center mb-8">
        <div class="w-0.5 h-8 bg-default/30" />
      </div>

      <!-- Other officers -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UCard
          v-for="officer in officers?.slice(1)"
          :key="officer.id"
          class="card-hover text-center border-2"
          :style="{ borderColor: (jabatanColor[officer.jabatan] || '#6366f1') + '4D' }"
        >
          <div class="flex flex-col items-center">
            <img
              v-if="officer.member?.foto_url"
              :src="officer.member.foto_url"
              :alt="officer.member?.nama || officer.jabatan"
              class="w-16 h-16 rounded-full object-cover border-2 border-default/40 mb-3"
            />
            <div
              v-else
              class="accent w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg mb-3"
              :style="{ '--accent': jabatanColor[officer.jabatan] || '#6366f1' }"
            >
              {{ getInitials(officer.member?.nama || officer.jabatan) }}
            </div>
            <UIcon :name="jabatanIcon[officer.jabatan] || 'i-lucide-user'" class="text-xl mb-1 text-muted" />
            <h2 class="font-semibold text-sm">{{ officer.member?.nama || '-' }}</h2>
            <p class="text-xs text-muted">{{ officer.jabatan }}</p>
            <p v-if="officer.mata_kuliah" class="text-xs text-muted mt-0.5 inline-flex items-center gap-1">
              <UIcon name="i-lucide-book-open" class="text-[11px]" />
              PJ {{ officer.mata_kuliah }}
            </p>
            <p class="text-xs text-muted mt-1">NIM: {{ officer.member?.nim || '-' }}</p>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
