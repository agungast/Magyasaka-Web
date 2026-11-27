<script setup lang="ts">
import { computed, ref } from 'vue'

interface Member {
  id: string
  nim: string
  nama: string
  email?: string | null
  status?: string | null
  foto_url?: string | null
  jurusan?: string | null
}

const props = defineProps<{ member: Member }>()

// --- Inisial nama (fallback avatar) ---
const initials = computed(() =>
  props.member.nama
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
)

// --- Copy email ke clipboard ---
const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null

async function copyEmail() {
  const email = props.member.email
  if (!email) return
  try {
    await navigator.clipboard.writeText(email)
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => (copied.value = false), 1600)
  } catch {
    copied.value = false
  }
}

const isActive = computed(() => (props.member.status || 'aktif').toLowerCase() === 'aktif')
const statusLabel = computed(() => (props.member.status || 'aktif').toLowerCase())
</script>

<template>
  <UCard class="card-hover">
    <!-- Body: avatar + nama + NIM -->
    <div class="flex items-center gap-3">
      <!-- Avatar: foto bila ada, fallback inisial dengan gradasi slate -->
      <div class="shrink-0">
        <img
          v-if="member.foto_url"
          :src="member.foto_url"
          :alt="member.nama"
          class="w-12 h-12 rounded-full object-cover border-2 border-default/50"
        >
        <div
          v-else
          class="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-sm text-white bg-linear-to-br from-slate-500 to-slate-700 border-2 border-default/50"
        >
          {{ initials }}
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <h2 class="font-semibold text-sm line-clamp-2" :title="member.nama">{{ member.nama }}</h2>
        <p class="font-mono tracking-wide text-xs text-muted mt-0.5">{{ member.nim || '-' }}</p>
      </div>
    </div>

    <!-- Footer: garis pemisah tipis + aksi salin email + label status -->
    <div class="mt-3 pt-3 border-t border-default/40 flex items-center justify-between gap-2">
      <UButton
        v-if="member.email"
        :label="copied ? 'Tersalin!' : 'Kontak Email'"
        :icon="copied ? 'i-lucide-check-check' : 'i-lucide-mail'"
        :color="copied ? 'success' : 'neutral'"
        :variant="copied ? 'soft' : 'ghost'"
        size="sm"
        @click="copyEmail"
      />
      <span v-else class="text-xs text-muted/60">Email tidak tersedia</span>

      <!-- Badge status "aktif": chip success statis, tanpa kedip -->
      <span
        v-if="isActive"
        class="accent inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
        :style="{ '--accent': 'var(--ui-color-success-500)' }"
      >
        <span class="inline-flex rounded-full h-1.5 w-1.5" :style="{ backgroundColor: 'var(--ui-color-success-500)' }" />
        Aktif
      </span>
      <UBadge
        v-else
        :label="statusLabel"
        color="warning"
        variant="subtle"
        size="xs"
      />
    </div>
  </UCard>
</template>
