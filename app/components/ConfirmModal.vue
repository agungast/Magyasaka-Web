<script setup lang="ts">
withDefaults(defineProps<{  open: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}>(), {
  title: 'Konfirmasi Hapus',
  description: 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.',
  confirmText: 'Ya, Hapus',
  cancelText: 'Batal',
  loading: false
})

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <UModal :open="open" @update:open="emit('update:open', $event)">
    <template #content>
      <div class="p-6 sm:p-7 space-y-5 bg-elevated/95 backdrop-blur-md rounded-2xl border border-default/50 shadow-2xl">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl bg-error/10 border border-error/20 text-error flex items-center justify-center shrink-0 shadow-sm">
            <UIcon name="i-lucide-trash-2" class="text-2xl" />
          </div>
          <div class="flex-1 min-w-0 pt-0.5">
            <h3 class="font-bold text-lg text-default leading-snug">{{ title }}</h3>
            <p class="text-sm text-muted mt-1.5 leading-relaxed">{{ description }}</p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-default/30">
          <UButton
            variant="outline"
            color="neutral"
            :label="cancelText"
            size="md"
            class="rounded-xl px-4"
            :disabled="loading"
            @click="emit('update:open', false)"
          />
          <UButton
            color="error"
            :label="confirmText"
            icon="i-lucide-trash-2"
            size="md"
            class="rounded-xl px-5 shadow-sm"
            :loading="loading"
            @click="emit('confirm')"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
