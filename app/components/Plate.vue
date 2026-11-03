<script setup lang="ts">
withDefaults(defineProps<{
  ratio?: string
}>(), {
  ratio: 'aspect-video'
})
</script>

<template>
  <div class="plate" :class="ratio">
    <MagyasakaCrest
      :size="64"
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-ink-300/60"
    />
    <div class="relative z-10 w-full h-full">
      <slot />
    </div>
  </div>
</template>
