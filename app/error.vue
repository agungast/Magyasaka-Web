<script setup lang="ts">
import { computed } from 'vue'
import { reloadNuxtApp } from '#app'

const props = defineProps<{
  error: { statusCode?: number; statusMessage?: string; message?: string }
}>()

const isNotFound = computed(() => props.error?.statusCode === 404)
</script>

<template>
  <UContainer class="py-20 text-center">
    <UIcon
      :name="isNotFound ? 'i-lucide-file-x' : 'i-lucide-circle-alert'"
      class="text-6xl text-muted mb-6"
    />
    <h1 class="text-4xl font-bold mb-3">
      {{ isNotFound ? 'Halaman Tidak Ditemukan' : 'Terjadi Kesalahan' }}
    </h1>
    <p class="text-muted mb-6">
      {{ isNotFound
        ? 'Halaman yang Anda cari mungkin sudah dipindahkan atau tidak tersedia.'
        : (error.statusMessage || error.message || 'Terjadi kesalahan saat memuat halaman.') }}
    </p>
    <div class="flex flex-wrap gap-3 justify-center">
      <UButton to="/" label="Kembali ke Beranda" />
      <UButton
        v-if="isNotFound"
        to="/galeri"
        label="Lihat Galeri"
        variant="outline"
      />
      <UButton
        label="Coba lagi"
        icon="i-lucide-refresh-cw"
        variant="outline"
        @click="reloadNuxtApp()"
      />
    </div>
  </UContainer>
</template>
