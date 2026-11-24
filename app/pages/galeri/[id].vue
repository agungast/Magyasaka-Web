<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useEventListener } from '@vueuse/core'
import { useSeoMeta } from '#app'
import { useAlbum } from '~/composables/useData'
import { isVideoUrl } from '~/composables/useGalleryUpload'
// Fase 3: Detail Album + Lightbox
const route = useRoute()
const albumId = route.params.id as string

const { data: album, status: albumStatus } = useAlbum(albumId)

// Lazy: jangan tampilkan "Album ini tidak ditemukan" / "Belum ada foto"
// selama data album masih dimuat.
const loading = computed(() => albumStatus.value === 'pending' || albumStatus.value === 'idle')

useSeoMeta({
  title: computed(() => `${album.value?.nama || 'Album'} - Galeri Magyasaka`)
})

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}

function closeLightbox() {
  lightboxOpen.value = false
}

function nextPhoto() {
  if (album.value?.photos && lightboxIndex.value < album.value.photos.length - 1) {
    lightboxIndex.value++
  }
}

function prevPhoto() {
  if (lightboxIndex.value > 0) {
    lightboxIndex.value--
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Keyboard navigation for lightbox
if (import.meta.client) {
  useEventListener(document, 'keydown', (e: KeyboardEvent) => {
    if (!lightboxOpen.value) return
    if (e.key === 'ArrowRight') nextPhoto()
    if (e.key === 'ArrowLeft') prevPhoto()
    if (e.key === 'Escape') closeLightbox()
  })
}
</script>

<template>
  <UContainer class="py-8">
    <UButton
      to="/galeri"
      label="Kembali ke Galeri"
      icon="i-lucide-arrow-left"
      variant="link"
      size="sm"
      class="mb-6"
    />

    <div v-if="loading" class="mb-8 space-y-3">
      <USkeleton class="h-8 w-1/2 rounded-lg" />
      <USkeleton class="h-4 w-2/3" />
      <USkeleton class="h-4 w-1/3" />
    </div>

    <div v-else-if="album" class="mb-8">
      <h1 class="text-2xl md:text-3xl font-bold">{{ album.nama }}</h1>
      <p class="text-muted mt-1">{{ album.deskripsi }}</p>
      <div class="flex items-center gap-4 mt-3 text-sm text-muted">
        <span class="flex items-center gap-1">
          <UIcon name="i-lucide-calendar" />
          {{ formatDate(album.tanggal_kegiatan || '') }}
        </span>
        <span class="flex items-center gap-1">
          <UIcon name="i-lucide-image" />
          {{ album.photos?.length || 0 }} foto
        </span>
      </div>
    </div>

    <div v-else class="py-20 text-center text-muted">Album ini tidak ditemukan.</div>

    <!-- Photo Grid -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <USkeleton v-for="i in 8" :key="i" class="aspect-square rounded-lg" />
    </div>

    <div v-else-if="album?.photos?.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <button
        v-for="(photo, index) in album.photos"
        :key="photo.id"
        class="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
        @click="openLightbox(index)"
      >
        <Plate ratio="h-full w-full">
          <div v-if="photo.url" class="w-full h-full">
            <video v-if="isVideoUrl(photo.url)" :src="photo.url" class="w-full h-full object-cover" preload="metadata" muted />
            <img v-else :src="photo.url" :alt="photo.caption || `Foto ${index + 1}`" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-lucide-image" class="text-2xl text-muted" />
          </div>
        </Plate>
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <UIcon name="i-lucide-maximize-2" class="text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>
    </div>

    <div v-else class="text-center py-16">
      <UIcon name="i-lucide-image-off" class="text-5xl text-muted mb-3" />
      <h3 class="font-semibold text-lg mb-1">Belum ada foto</h3>
      <p class="text-muted text-sm">Foto akan ditambahkan oleh pengurus</p>
    </div>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <div
        v-if="lightboxOpen && album?.photos?.length"
        class="lightbox-overlay"
        @click.self="closeLightbox"
      >
        <button
          class="absolute top-4 right-4 z-10 text-white/70 hover:text-white p-2"
          @click="closeLightbox"
        >
          <UIcon name="i-lucide-x" class="text-2xl" />
        </button>

        <button
          v-if="lightboxIndex > 0"
          class="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
          @click="prevPhoto"
        >
          <UIcon name="i-lucide-chevron-left" class="text-3xl" />
        </button>

        <button
          v-if="album.photos && lightboxIndex < album.photos.length - 1"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
          @click="nextPhoto"
        >
          <UIcon name="i-lucide-chevron-right" class="text-3xl" />
        </button>

        <div class="max-w-4xl max-h-[80vh] flex items-center justify-center p-4">
          <div v-if="album && album.photos && album.photos[lightboxIndex]?.url">
            <video
              v-if="isVideoUrl(album?.photos?.[lightboxIndex]?.url || '')"
              :src="album?.photos?.[lightboxIndex]?.url"
              controls
              autoplay
              class="max-w-full max-h-[80vh] rounded-lg"
            />
            <img
              v-else
              :src="album?.photos?.[lightboxIndex]?.url"
              :alt="album?.photos?.[lightboxIndex]?.caption || ''"
              class="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
          <div v-else class="w-96 h-96 bg-elevated/20 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-image" class="text-6xl text-white/30" />
          </div>
        </div>

        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
          {{ lightboxIndex + 1 }} / {{ album?.photos?.length || 0 }}
          <span v-if="album && album.photos && album.photos[lightboxIndex]?.caption" class="ml-2">— {{ album?.photos?.[lightboxIndex]?.caption }}</span>
        </div>
      </div>
    </Teleport>
  </UContainer>
</template>
