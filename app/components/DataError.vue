<script setup lang="ts">
const emit = defineEmits<{
  (e: 'retry'): void
}>()
</script>

<template>
  <div class="text-center py-16" role="alert">
    <UIcon name="i-lucide-circle-alert" class="text-5xl text-muted mb-3" />
    <h2 class="font-semibold text-lg mb-1">Gagal memuat data</h2>
    <p class="text-muted text-sm mb-4">Periksa koneksi internet lalu coba lagi.</p>
    <UButton
      label="Coba lagi"
      icon="i-lucide-refresh-cw"
      variant="outline"
      size="sm"
      @click="emit('retry')"
    />
  </div>
</template>
