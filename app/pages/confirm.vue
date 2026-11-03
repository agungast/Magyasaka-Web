<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Konfirmasi Login — Magyasaka' })

const user = useSupabaseUser()
const router = useRouter()

watch(user, (val) => {
  if (val) {
    router.push('/admin')
  }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <UIcon name="i-lucide-loader-2" class="text-4xl animate-spin text-primary mb-3" />
      <p class="text-muted">Memproses login...</p>
    </div>
  </div>
</template>
