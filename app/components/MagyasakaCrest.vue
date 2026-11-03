<script setup lang="ts">
import crestUrl from '~/assets/images/magyasaka-crest-light.png'

const props = withDefaults(defineProps<{
  size?: number
  label?: string
}>(), {
  size: 32,
  label: 'Lambang Magyasaka'
})
</script>

<template>
  <span
    class="crest"
    role="img"
    :aria-label="props.label"
    :style="{ '--crest-size': `${props.size}px`, '--crest-url': `url(${crestUrl})` }"
  />
</template>
