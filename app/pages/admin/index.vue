<script setup lang="ts">
import { useSeoMeta } from '#app'

declare const definePageMeta: (meta: any) => void

definePageMeta({
  middleware: 'auth'
})

useSeoMeta({ title: 'Dashboard Admin - Magyasaka' })
</script>

<template>
  <div>
    <UCard>
      <div class="text-center py-6">
        <UIcon name="i-lucide-layout-dashboard" class="text-4xl text-primary mb-2" />
        <h2 class="font-semibold">Selamat datang di Panel Admin</h2>
        <p class="text-sm text-muted mt-1">Pilih menu di atas untuk mengelola konten</p>
      </div>
    </UCard>
  </div>
</template>
