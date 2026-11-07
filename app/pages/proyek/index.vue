<script setup lang="ts">
import { computed } from 'vue'
import { useSeoMeta } from '#app'
import { useProjects } from '~/composables/useData'
// Fase 3: Katalog Proyek Kelas
useSeoMeta({ title: 'Proyek Kelas - Magyasaka' })

const { data: projects } = useProjects()

const highlightedProjects = computed(() =>
  projects.value?.filter((p: any) => p.is_highlighted) || []
)

const allProjects = computed(() => (projects.value || []))

const kategoriColors: Record<string, string> = {
  IoT: '#10b981',
  'Mobile App': '#6366f1',
  Security: '#f43f5e',
  Web: '#0ea5e9',
  AI: '#a855f7',
  akademik: '#f59e0b'
}
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-8">
      <h1 class="text-2xl md:text-3xl font-bold flex items-center gap-2">
        <UIcon name="i-lucide-folder-code" class="text-primary" />
        Proyek Kelas
      </h1>
      <p class="text-muted mt-1">Karya dan proyek akademik mahasiswa Magyasaka</p>
    </div>

    <!-- Sorotan Terbaik -->
    <section v-if="highlightedProjects.length > 0" class="mb-12">
      <div class="flex items-center gap-2 mb-6">
        <UIcon name="i-lucide-trophy" class="text-amber-500 text-xl" />
        <h2 class="text-lg font-semibold">Sorotan Terbaik</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NuxtLink
          v-for="project in highlightedProjects"
          :key="project.id"
          :to="`/proyek/${project.id}`"
          class="group"
        >
          <UCard class="card-hover h-full border-2 border-amber-500/20 hover:border-amber-500/40">
            <div class="flex items-start gap-2 mb-3">
              <UBadge
                label="⭐ Unggulan"
                class="accent"
                :style="{ '--accent': 'var(--ui-color-warning-500)' }"
                variant="outline"
                size="xs"
              />
              <UBadge
                :label="project.kategori || 'umum'"
                class="accent-text"
                :style="{ '--accent': kategoriColors[project.kategori || 'umum'] || '#6366f1' }"
                variant="outline"
                size="xs"
              />
            </div>
            <h3 class="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{{ project.nama }}</h3>
            <p class="text-sm text-muted line-clamp-3 mb-4">{{ project.deskripsi }}</p>
            <div class="flex flex-wrap gap-1.5 mb-3">
              <UBadge
                v-for="tech in project.teknologi"
                :key="tech"
                :label="tech"
                variant="outline"
                size="xs"
              />
            </div>
            <div class="flex items-center gap-1 text-xs text-muted">
              <UIcon name="i-lucide-users" />
              <span>{{ project.anggota?.join(', ') }}</span>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </section>

    <!-- Semua Proyek -->
    <section>
      <div class="flex items-center gap-2 mb-6">
        <UIcon name="i-lucide-grid-3x3" class="text-primary text-xl" />
        <h2 class="text-lg font-semibold">Semua Proyek</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink
          v-for="project in allProjects"
          :key="project.id"
          :to="`/proyek/${project.id}`"
          class="group"
        >
          <UCard class="card-hover h-full">
            <!-- Thumbnail placeholder -->
            <Plate class="mb-3">
              <div v-if="project.thumbnail_url" class="w-full h-full">
                <img :src="project.thumbnail_url" :alt="project.nama" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-lucide-code-2" class="text-3xl text-muted" />
              </div>
            </Plate>
            <div class="flex items-center gap-2 mb-2">
              <UBadge
                :label="project.kategori || 'umum'"
                class="accent-text"
                :style="{ '--accent': kategoriColors[project.kategori || 'umum'] || '#6366f1' }"
                variant="outline"
                size="xs"
              />
              <UBadge
                v-if="project.is_highlighted"
                label="⭐ Proyek Unggulan"
                class="accent"
                :style="{ '--accent': 'var(--ui-color-warning-500)' }"
                variant="outline"
                size="xs"
              />
            </div>
            <h3 class="font-semibold text-sm group-hover:text-primary transition-colors mb-1">{{ project.nama }}</h3>
            <p class="text-xs text-muted line-clamp-2 mb-2">{{ project.deskripsi }}</p>
            <div class="flex flex-wrap gap-1">
              <UBadge
                v-for="tech in (project.teknologi || []).slice(0, 3)"
                :key="tech"
                :label="tech"
                variant="outline"
                size="xs"
              />
              <UBadge
                v-if="(project.teknologi || []).length > 3"
                :label="`+${(project.teknologi || []).length - 3}`"
                variant="outline"
                size="xs"
              />
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </section>

    <div v-if="allProjects.length === 0" class="text-center py-16">
      <UIcon name="i-lucide-package-open" class="text-5xl text-muted mb-3" />
      <h3 class="font-semibold text-lg mb-1">Belum ada proyek</h3>
      <p class="text-muted text-sm">Proyek kelas akan ditampilkan di sini</p>
    </div>
  </UContainer>
</template>
