<script setup lang="ts">
// Fase 3: Galeri Kegiatan
useSeoMeta({ title: 'Galeri Kegiatan — Magyasaka' })

const { data: albums } = useAlbums()

const featuredAlbums = computed(() =>
  albums.value?.filter((a: any) => a.is_featured) || []
)

const allAlbums = computed(() => albums.value || [])

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function getPhotoCount(album: any) {
  return album.photos?.length || 0
}
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-8">
      <h1 class="text-2xl md:text-3xl font-bold flex items-center gap-2">
        <UIcon name="i-lucide-image" class="text-primary" />
        Galeri Kegiatan
      </h1>
      <p class="text-muted mt-1">Dokumentasi momen berharga angkatan Magyasaka</p>
    </div>

    <!-- Album Terbaru / Featured -->
    <section v-if="featuredAlbums.length > 0" class="mb-12">
      <div class="flex items-center gap-2 mb-6">
        <UIcon name="i-lucide-sparkles" class="text-amber-500 text-xl" />
        <h2 class="text-lg font-semibold">Album Pilihan</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NuxtLink
          v-for="album in featuredAlbums"
          :key="album.id"
          :to="`/galeri/${album.id}`"
          class="group"
        >
          <UCard class="card-hover overflow-hidden h-full">
            <!-- Cover placeholder -->
            <Plate class="mb-4">
              <div v-if="album.cover_url" class="w-full h-full">
                <img :src="album.cover_url" :alt="album.nama" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-full h-full flex items-center justify-center">
                <span class="text-xs text-muted">{{ getPhotoCount(album) }} foto</span>
              </div>
            </Plate>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-display font-bold text-base group-hover:text-primary transition-colors">{{ album.nama }}</h3>
                <UBadge label="Unggulan" icon="i-lucide-star" color="warning" variant="subtle" size="xs" />
              </div>
              <p class="text-sm text-muted line-clamp-2 mb-2">{{ album.deskripsi }}</p>
              <div class="flex items-center gap-3 text-xs text-muted">
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-calendar" />
                  {{ formatDate(album.tanggal_kegiatan) }}
                </span>
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-image" />
                  {{ getPhotoCount(album) }} foto
                </span>
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </section>

    <!-- Semua Album -->
    <section>
      <div class="flex items-center gap-2 mb-6">
        <UIcon name="i-lucide-folder" class="text-primary text-xl" />
        <h2 class="text-lg font-semibold">Semua Album</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink
          v-for="album in allAlbums"
          :key="album.id"
          :to="`/galeri/${album.id}`"
          class="group"
        >
          <UCard class="card-hover h-full">
            <Plate class="mb-3">
              <div v-if="album.cover_url" class="w-full h-full">
                <img :src="album.cover_url" :alt="album.nama" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-lucide-camera" class="text-3xl text-muted" />
              </div>
            </Plate>
            <h3 class="font-display font-semibold text-sm group-hover:text-primary transition-colors mb-1">{{ album.nama }}</h3>
            <p class="text-xs text-muted line-clamp-2 mb-2">{{ album.deskripsi }}</p>
            <div class="flex items-center gap-3 text-xs text-muted">
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-calendar" />
                {{ formatDate(album.tanggal_kegiatan) }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-image" />
                {{ getPhotoCount(album) }}
              </span>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </section>

    <div v-if="allAlbums.length === 0" class="text-center py-16">
      <UIcon name="i-lucide-image-off" class="text-5xl text-muted mb-3" />
      <h3 class="font-semibold text-lg mb-1">Belum ada album</h3>
      <p class="text-muted text-sm">Album kegiatan akan ditampilkan di sini</p>
    </div>
  </UContainer>
</template>
