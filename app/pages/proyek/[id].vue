<script setup lang="ts">
import { computed } from 'vue'
import { useSeoMeta } from '#app'
import { useRoute } from 'vue-router'
import { useProject } from '~/composables/useData'
import { isVideoUrl } from '~/composables/useGalleryUpload'
// Fase 3: Detail Proyek
const route = useRoute()
const projectId = route.params.id as string

const { data: project } = useProject(projectId)

useSeoMeta({
  title: computed(() => `${project.value?.nama || 'Proyek'} - Magyasaka`)
})

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
    <UButton
      to="/proyek"
      label="Kembali ke Daftar Proyek"
      icon="i-lucide-arrow-left"
      variant="link"
      size="sm"
      class="mb-6"
    />

    <div v-if="project" class="max-w-3xl">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-2 mb-3">
          <UBadge
            :label="project.kategori"
            class="accent-text"
            :style="{ '--accent': kategoriColors[project.kategori] || '#6366f1' }"
            variant="outline"
          />
          <UBadge
            v-if="project.is_highlighted"
            label="⭐ Proyek Unggulan"
            class="accent"
            :style="{ '--accent': 'var(--ui-color-warning-500)' }"
            variant="outline"
          />
        </div>
        <h1 class="text-3xl md:text-4xl font-bold mb-3">{{ project.nama }}</h1>
        <p class="text-lg text-muted">{{ project.deskripsi }}</p>
      </div>

      <!-- Thumbnail -->
      <div v-if="project.thumbnail_url" class="mb-8">
        <img :src="project.thumbnail_url" :alt="project.nama" class="w-full rounded-xl shadow-lg" />
      </div>

      <!-- Screenshot -->
      <div v-if="project.screenshots?.length" class="mb-8">
        <h3 class="flex items-center gap-2 text-base font-semibold mb-3">
          <UIcon name="i-lucide-images" class="text-primary" />
          Screenshot Proyek
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            v-for="shot in project.screenshots"
            :key="shot"
            :href="shot"
            target="_blank"
            rel="noopener"
            class="rounded-xl overflow-hidden border border-default/50 shadow-sm hover:shadow-md transition-shadow"
          >
            <img :src="shot" :alt="`Screenshot ${project.nama}`" class="w-full h-48 object-cover" />
          </a>
        </div>
      </div>

      <!-- Demo Video -->
      <div v-if="project.demo_url && isVideoUrl(project.demo_url)" class="mb-8">
        <h3 class="flex items-center gap-2 text-base font-semibold mb-3">
          <UIcon name="i-lucide-video" class="text-primary" />
          Video Demo
        </h3>
        <video :src="project.demo_url" controls class="w-full rounded-xl shadow-lg bg-black" />
      </div>

      <!-- Detail -->
      <UCard class="mb-8">
        <div class="max-w-none">
          <h3 class="flex items-center gap-2 text-base font-semibold">
            <UIcon name="i-lucide-file-text" class="text-primary" />
            Deskripsi Lengkap
          </h3>
          <p class="text-muted whitespace-pre-wrap">{{ project.detail }}</p>
        </div>
      </UCard>

      <!-- Tech Stack -->
      <UCard class="mb-8">
        <h3 class="flex items-center gap-2 text-base font-semibold mb-4">
          <UIcon name="i-lucide-layers" class="text-primary" />
          Teknologi
        </h3>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="tech in project.teknologi"
            :key="tech"
            :label="tech"
            variant="outline"
            size="md"
          />
        </div>
      </UCard>

      <!-- Team -->
      <UCard class="mb-8">
        <h3 class="flex items-center gap-2 text-base font-semibold mb-4">
          <UIcon name="i-lucide-users" class="text-primary" />
          Tim Pengembang
        </h3>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="name in project.anggota"
            :key="name"
            class="flex items-center gap-2 bg-elevated/50 rounded-lg px-3 py-2"
          >
            <div class="w-8 h-8 rounded-full bg-elevated border border-default flex items-center justify-center text-xs font-bold text-default">
              {{ name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) }}
            </div>
            <span class="text-sm font-medium">{{ name }}</span>
          </div>
        </div>
      </UCard>

      <!-- Links -->
      <!-- @ts-ignore -->
      <div v-if="project.repo_url || project.website_url || (project.demo_url && !isVideoUrl(project.demo_url))" class="flex flex-wrap gap-3">
        <UButton
          v-if="project.website_url"
          :to="project.website_url"
          target="_blank"
          label="Website"
          icon="i-lucide-globe"
          variant="outline"
        />
        <UButton
          v-if="project.demo_url && !isVideoUrl(project.demo_url)"
          :to="project.demo_url"
          target="_blank"
          label="Live Demo"
          icon="i-lucide-external-link"
        />
        <UButton
          v-if="project.repo_url"
          :to="project.repo_url"
          target="_blank"
          :label="project.repo_url.includes('github.com') ? 'Source Code' : 'Link Karya'"
          :icon="project.repo_url.includes('github.com') ? 'i-simple-icons-github' : 'i-lucide-link'"
          variant="outline"
        />
      </div>
    </div>

    <div v-else class="py-20 text-center text-muted">Proyek ini tidak ditemukan.</div>
  </UContainer>
</template>
