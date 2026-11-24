<script setup lang="ts">
import { useSeoMeta } from '#app'
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { namaPengurus } from '~/utils/pengurus'

declare const definePageMeta: (meta: any) => void

definePageMeta({
  middleware: 'auth'
})

useSeoMeta({ title: 'Admin Dashboard - Magyasaka' })

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute()

function isActive(to: string) {
  if (to === '/admin') {
    return route.path === '/admin' || route.path === '/admin/'
  }
  return route.path === to || route.path.startsWith(to + '/')
}

async function logout() {
  await supabase.auth.signOut()
  router.push('/')
}

const namaLogin = computed(() => {
  const email = user.value?.email?.trim().toLowerCase()
  return email ? namaPengurus[email] ?? email : null
})

const menuItems = [
  { label: 'Dashboard', to: '/admin', icon: 'i-lucide-layout-dashboard' },
  { label: 'Pengumuman', to: '/admin/pengumuman', icon: 'i-lucide-megaphone' },
  { label: 'Jadwal', to: '/admin/jadwal', icon: 'i-lucide-calendar' },
  { label: 'Tugas & Ujian', to: '/admin/tugas', icon: 'i-lucide-clipboard-list' },
  { label: 'Anggota', to: '/admin/anggota', icon: 'i-lucide-users' },
  { label: 'Pengurus', to: '/admin/pengurus', icon: 'i-lucide-shield' },
  { label: 'Galeri', to: '/admin/galeri', icon: 'i-lucide-image' },
  { label: 'Semester', to: '/admin/semester', icon: 'i-lucide-calendar-days' },
  { label: 'Proyek', to: '/admin/proyek', icon: 'i-lucide-folder-code' }
]
</script>

<template>
  <UContainer class="py-8">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h1 class="font-display text-2xl md:text-3xl font-bold tracking-[-0.02em] flex items-center gap-3">
          <MagyasakaCrest :size="32" class="text-highlighted" />
          Panel Admin
        </h1>
        <p class="text-muted mt-1">Kelola konten Portal Magyasaka</p>
        <p v-if="namaLogin" class="text-xs text-muted mt-1">Login sebagai {{ namaLogin }}</p>
      </div>
      <UButton label="Keluar" icon="i-lucide-log-out" variant="outline" @click="logout" />
    </div>

    <!-- Mobile: grid 3 kolom (ikon di atas, label di bawah) supaya semua menu terlihat tanpa scroll -->
    <nav class="grid grid-cols-3 gap-2 mb-6 md:grid-cols-2 md:gap-2.5 md:mb-8 lg:grid-cols-3">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        :class="[
          'group flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-center transition-all duration-200 md:flex-row md:gap-3 md:px-3.5 md:py-2.5 md:text-left',
          isActive(item.to)
            ? 'bg-primary/15 border-primary/40 text-primary shadow-sm font-semibold'
            : 'bg-elevated/40 hover:bg-elevated/80 border-default/30 text-muted hover:text-default'
        ]"
      >
        <div
          :class="[
            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
            isActive(item.to)
              ? 'bg-primary text-inverted shadow-xs'
              : 'bg-default/20 text-muted group-hover:text-primary group-hover:bg-primary/10'
          ]"
        >
          <UIcon :name="item.icon" class="text-base" />
        </div>
        <span class="font-display text-xs leading-tight md:text-sm md:truncate">{{ item.label }}</span>
        <UIcon
          name="i-lucide-chevron-right"
          :class="[
            'ml-auto hidden text-sm transition-transform duration-200 shrink-0 md:block',
            isActive(item.to)
              ? 'text-primary translate-x-0.5'
              : 'text-muted/40 group-hover:text-muted group-hover:translate-x-0.5'
          ]"
        />
      </NuxtLink>
    </nav>

    <NuxtPage />
  </UContainer>
</template>
